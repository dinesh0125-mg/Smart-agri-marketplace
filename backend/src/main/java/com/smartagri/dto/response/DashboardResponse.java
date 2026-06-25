package com.smartagri.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long totalFarmers;
    private long totalBuyers;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long pendingFarmerApprovals;
    private List<Map<String, Object>> monthlyRevenue;
}
