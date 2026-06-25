package com.smartagri.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String productName;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String unit;
    private String image;
    private Boolean organicCertified;
    private Boolean featured;
    private Integer discount;
    private LocalDateTime createdAt;
    private Long farmerId;
    private String farmerName;
    private String farmerLocation;
    private String farmerImage;
    private Long categoryId;
    private String categoryName;
    private Double averageRating;
    private long reviewCount;
}
