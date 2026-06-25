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
public class FarmerDashboardResponse {
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalEarnings;
    private long pendingOrders;
}
