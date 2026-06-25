package com.smartagri.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MarketPriceRequest {
    @NotBlank private String commodityName;
    private String emoji;
    @NotNull private BigDecimal price;
    private BigDecimal change;
    private String unit;
}
