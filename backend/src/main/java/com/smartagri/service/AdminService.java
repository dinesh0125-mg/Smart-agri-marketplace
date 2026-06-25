package com.smartagri.service;

import com.smartagri.dto.response.DashboardResponse;
import com.smartagri.enums.FarmerStatus;
import com.smartagri.enums.Role;
import com.smartagri.repository.FarmerRepository;
import com.smartagri.repository.OrderRepository;
import com.smartagri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final FarmerRepository farmerRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        long totalFarmers = userRepository.countByRole(Role.FARMER);
        long totalBuyers  = userRepository.countByRole(Role.BUYER);
        long totalOrders  = orderRepository.count();

        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long pendingApprovals = farmerRepository.countByStatus(FarmerStatus.PENDING);

        int year = LocalDate.now().getYear();
        List<Object[]> monthlyData = orderRepository.getMonthlyRevenue(year);

        Map<Integer, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] row : monthlyData) {
            revenueMap.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        }

        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        List<Map<String, Object>> monthlyRevenue = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", months[i - 1]);
            entry.put("revenue", revenueMap.getOrDefault(i, BigDecimal.ZERO));
            monthlyRevenue.add(entry);
        }

        return DashboardResponse.builder()
                .totalFarmers(totalFarmers)
                .totalBuyers(totalBuyers)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .pendingFarmerApprovals(pendingApprovals)
                .monthlyRevenue(monthlyRevenue)
                .build();
    }
}
