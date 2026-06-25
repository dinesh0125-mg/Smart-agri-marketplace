package com.smartagri.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    private Long cartItemId;
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal price;
    private String unit;
    private Integer quantity;
    private BigDecimal subtotal;
    private Boolean organicCertified;
    private String farmerName;
    private String farmerLocation;
}
