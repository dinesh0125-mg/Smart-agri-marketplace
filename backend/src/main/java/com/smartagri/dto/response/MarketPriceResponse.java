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
public class MarketPriceResponse {
    private Long id;
    private String commodityName;
    private String emoji;
    private BigDecimal price;
    private BigDecimal change;
    private String unit;
    private LocalDateTime updatedAt;
}
