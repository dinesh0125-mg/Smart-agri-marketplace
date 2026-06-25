package com.smartagri.service;

import com.smartagri.dto.response.FarmerDashboardResponse;
import com.smartagri.dto.response.FarmerResponse;
import com.smartagri.entity.Farmer;
import com.smartagri.enums.FarmerStatus;
import com.smartagri.enums.OrderStatus;
import com.smartagri.enums.PaymentStatus;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.repository.FarmerRepository;
import com.smartagri.repository.OrderRepository;
import com.smartagri.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmerRepository farmerRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Transactional(readOnly = true)
    public Page<FarmerResponse> getAllFarmers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return farmerRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<FarmerResponse> getPendingFarmers() {
        return farmerRepository.findByStatus(FarmerStatus.PENDING).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FarmerResponse getFarmerById(Long farmerId) {
        return toResponse(farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", farmerId)));
    }

    @Transactional(readOnly = true)
    public FarmerResponse getMyProfile(String email) {
        return toResponse(farmerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found")));
    }

    @Transactional
    public FarmerResponse approveFarmer(Long farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", farmerId));
        farmer.setStatus(FarmerStatus.APPROVED);
        farmerRepository.save(farmer);
        notificationService.sendNotification(farmer.getUser(),
                "Account Approved!",
                "Your farmer account has been approved. Start listing your products!");
        emailService.sendFarmerApprovalEmail(farmer.getUser().getEmail(), farmer.getUser().getFullName());
        return toResponse(farmer);
    }

    @Transactional
    public FarmerResponse rejectFarmer(Long farmerId) {
        Farmer farmer = farmerRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer", farmerId));
        farmer.setStatus(FarmerStatus.REJECTED);
        farmerRepository.save(farmer);
        notificationService.sendNotification(farmer.getUser(),
                "Account Review Update",
                "Your farmer account application was not approved. Contact support for details.");
        emailService.sendFarmerRejectionEmail(farmer.getUser().getEmail(), farmer.getUser().getFullName());
        return toResponse(farmer);
    }

    @Transactional(readOnly = true)
    public FarmerDashboardResponse getFarmerDashboard(String email) {
        Farmer farmer = farmerRepository.findByUser_Email(email)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        long totalProducts = productRepository.countByFarmer_FarmerId(farmer.getFarmerId());

        Pageable all = PageRequest.of(0, Integer.MAX_VALUE);
        Page<com.smartagri.entity.Order> ordersPage =
                orderRepository.findByFarmerId(farmer.getFarmerId(), all);

        long totalOrders = ordersPage.getTotalElements();
        long pendingOrders = ordersPage.getContent().stream()
                .filter(o -> OrderStatus.PENDING.equals(o.getOrderStatus())).count();

        BigDecimal earnings = ordersPage.getContent().stream()
                .filter(o -> PaymentStatus.SUCCESS.equals(o.getPaymentStatus()))
                .flatMap(o -> o.getOrderItems().stream())
                .filter(oi -> oi.getProduct().getFarmer().getFarmerId().equals(farmer.getFarmerId()))
                .map(oi -> oi.getPrice().multiply(BigDecimal.valueOf(oi.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return FarmerDashboardResponse.builder()
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .totalEarnings(earnings)
                .pendingOrders(pendingOrders)
                .build();
    }

    private FarmerResponse toResponse(Farmer f) {
        return FarmerResponse.builder()
                .farmerId(f.getFarmerId())
                .userId(f.getUser().getId())
                .fullName(f.getUser().getFullName())
                .email(f.getUser().getEmail())
                .phone(f.getUser().getPhone())
                .profileImage(f.getUser().getProfileImage())
                .farmName(f.getFarmName())
                .farmLocation(f.getFarmLocation())
                .description(f.getDescription())
                .experience(f.getExperience())
                .specialty(f.getSpecialty())
                .status(f.getStatus())
                .totalProducts(productRepository.countByFarmer_FarmerId(f.getFarmerId()))
                .build();
    }
}
