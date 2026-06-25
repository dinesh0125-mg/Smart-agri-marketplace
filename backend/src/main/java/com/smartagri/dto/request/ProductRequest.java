package com.smartagri.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank
    private String productName;
    private String description;
    @NotNull @DecimalMin("0.01")
    private BigDecimal price;
    @Min(0)
    private Integer stock = 0;
    private String unit;
    private Long categoryId;
    private Boolean organicCertified = false;
    private Boolean featured = false;
    private Integer discount = 0;
    private String imageUrl;   // external URL (Unsplash / gallery) — used when no file is uploaded
}
