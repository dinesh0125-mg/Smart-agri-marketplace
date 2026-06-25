package com.smartagri.dto.response;

import com.smartagri.enums.OrderStatus;
import com.smartagri.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long id;
    private BigDecimal totalAmount;
    private PaymentStatus paymentStatus;
    private OrderStatus orderStatus;
    private String deliveryAddress;
    private String razorpayOrderId;
    private LocalDateTime createdAt;
    private Long buyerId;
    private String buyerName;
    private List<OrderItemResponse> orderItems;
}
