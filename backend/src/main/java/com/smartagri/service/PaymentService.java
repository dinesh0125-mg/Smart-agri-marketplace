package com.smartagri.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.smartagri.dto.request.PaymentVerifyRequest;
import com.smartagri.dto.response.PaymentOrderResponse;
import com.smartagri.entity.Order;
import com.smartagri.entity.Payment;
import com.smartagri.entity.User;
import com.smartagri.enums.OrderStatus;
import com.smartagri.enums.PaymentStatus;
import com.smartagri.exception.BadRequestException;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.exception.UnauthorizedException;
import com.smartagri.repository.OrderRepository;
import com.smartagri.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Value("${razorpay.key-id}") private String razorpayKeyId;
    @Value("${razorpay.key-secret}") private String razorpayKeySecret;
    @Value("${razorpay.currency}") private String currency;
    @Value("${razorpay.company-name}") private String companyName;

    @Transactional
    public PaymentOrderResponse createRazorpayOrder(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getBuyer().getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("Access denied");
        }

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Order already paid");
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay expects amount in paise (multiply by 100)
            long amountInPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", "order_" + orderId);
            orderRequest.put("notes", new JSONObject().put("orderId", orderId));

            com.razorpay.Order rzpOrder = client.orders.create(orderRequest);
            String rzpOrderId = rzpOrder.get("id");

            order.setRazorpayOrderId(rzpOrderId);
            orderRepository.save(order);

            // Create pending payment record
            Payment payment = Payment.builder()
                    .order(order)
                    .razorpayOrderId(rzpOrderId)
                    .amount(order.getTotalAmount())
                    .paymentStatus(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment);

            return PaymentOrderResponse.builder()
                    .razorpayOrderId(rzpOrderId)
                    .amount(order.getTotalAmount())
                    .currency(currency)
                    .keyId(razorpayKeyId)
                    .orderId(orderId)
                    .companyName(companyName)
                    .description("Payment for Order #ORD-" + orderId)
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            throw new BadRequestException("Payment gateway error: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyAndCapturePayment(PaymentVerifyRequest request) {
        // Verify signature
        if (!verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature())) {
            throw new BadRequestException("Payment verification failed: invalid signature");
        }

        Order order = orderRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found for payment"));

        // Update payment record
        Payment payment = paymentRepository.findByOrder_Id(order.getId())
                .orElseGet(() -> Payment.builder().order(order).build());

        payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
        payment.setRazorpayOrderId(request.getRazorpayOrderId());
        payment.setRazorpaySignature(request.getRazorpaySignature());
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        // Update order
        order.setPaymentStatus(PaymentStatus.SUCCESS);
        order.setOrderStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        User buyer = order.getBuyer().getUser();

        // Notify buyer
        notificationService.sendNotification(buyer,
                "Payment Successful",
                "Payment of ₹" + order.getTotalAmount() + " for Order #ORD-" + order.getId() + " was successful.");

        emailService.sendPaymentSuccessEmail(buyer.getEmail(), buyer.getFullName(),
                order.getId(), order.getTotalAmount());

        log.info("Payment verified and captured for order: {}", order.getId());
    }

    @Transactional
    public void handlePaymentFailure(String razorpayOrderId) {
        orderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);

            paymentRepository.findByOrder_Id(order.getId()).ifPresent(payment -> {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
            });

            notificationService.sendNotification(order.getBuyer().getUser(),
                    "Payment Failed",
                    "Payment for Order #ORD-" + order.getId() + " failed. Please try again.");
        });
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String payload = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            return false;
        }
    }
}