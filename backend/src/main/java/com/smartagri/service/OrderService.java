package com.smartagri.service;

import com.smartagri.dto.request.OrderRequest;
import com.smartagri.dto.request.UpdateOrderStatusRequest;
import com.smartagri.dto.response.*;
import com.smartagri.entity.*;
import com.smartagri.enums.*;
import com.smartagri.exception.*;
import com.smartagri.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final BuyerRepository buyerRepository;
    private final FarmerRepository farmerRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional
    public OrderResponse createOrder(String email, OrderRequest request) {
        Buyer buyer = buyerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));

        Cart cart = cartRepository.findByBuyer_BuyerId(buyer.getBuyerId())
                .orElseThrow(() -> new BadRequestException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot create order from empty cart");
        }

        Order order = Order.builder()
                .buyer(buyer)
                .deliveryAddress(request.getDeliveryAddress())
                .paymentStatus(PaymentStatus.PENDING)
                .orderStatus(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();
        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + product.getProductName());
            }
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            total = total.add(itemTotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .price(product.getPrice())
                    .build();
            order.getOrderItems().add(orderItem);

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(total);
        order = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        notificationService.sendNotification(buyer.getUser(),
                "Order Placed Successfully",
                "Your order #ORD-" + order.getId() + " has been placed. Total: ₹" + total);
        emailService.sendOrderConfirmationEmail(
                buyer.getUser().getEmail(), buyer.getUser().getFullName(), order.getId(), total);

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getBuyerOrders(String email, int page, int size) {
        Buyer buyer = buyerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Buyer profile not found"));
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByBuyer_BuyerIdOrderByCreatedAtDesc(buyer.getBuyerId(), pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (email != null) {
            boolean isBuyer = order.getBuyer().getUser().getEmail().equals(email);
            boolean isFarmerWithItem = order.getOrderItems().stream()
                    .anyMatch(oi -> oi.getProduct().getFarmer().getUser().getEmail().equals(email));
            boolean isAdmin = false; // checked at controller level via @PreAuthorize
            if (!isBuyer && !isFarmerWithItem) {
                throw new UnauthorizedException("Access denied");
            }
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (!order.getBuyer().getUser().getEmail().equals(email)) {
            throw new UnauthorizedException("Access denied");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING && order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Order cannot be cancelled at this stage: " + order.getOrderStatus());
        }

        order.getOrderItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        });

        order.setOrderStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        notificationService.sendNotification(order.getBuyer().getUser(),
                "Order Cancelled",
                "Your order #ORD-" + order.getId() + " has been cancelled.");
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        order.setOrderStatus(request.getOrderStatus());
        order = orderRepository.save(order);

        notificationService.sendNotification(order.getBuyer().getUser(),
                "Order Status Updated",
                "Your order #ORD-" + order.getId() + " is now: " + request.getOrderStatus().name());
        emailService.sendOrderStatusUpdateEmail(
                order.getBuyer().getUser().getEmail(),
                order.getBuyer().getUser().getFullName(),
                order.getId(), request.getOrderStatus().name());

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getFarmerOrders(String email, int page, int size) {
        Farmer farmer = farmerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return orderRepository.findByFarmerId(farmer.getFarmerId(), pageable).map(this::toResponse);
    }

    public OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getOrderItems().stream().map(item ->
                OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getProductName())
                        .productImage(item.getProduct().getImage())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .build()
        ).collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus())
                .orderStatus(order.getOrderStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .razorpayOrderId(order.getRazorpayOrderId())
                .createdAt(order.getCreatedAt())
                .buyerId(order.getBuyer().getBuyerId())
                .buyerName(order.getBuyer().getUser().getFullName())
                .orderItems(items)
                .build();
    }
}
