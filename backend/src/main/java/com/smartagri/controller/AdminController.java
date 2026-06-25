package com.smartagri.controller;

import com.smartagri.dto.request.UpdateOrderStatusRequest;
import com.smartagri.dto.response.*;
import com.smartagri.entity.ContactMessage;
import com.smartagri.service.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Panel", description = "Admin-only management APIs")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final FarmerService farmerService;
    private final OrderService orderService;
    private final ProductService productService;
    private final ContactService contactService;

    // ─── DASHBOARD ──────────────────────────────────────────────────

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    // ─── USER MANAGEMENT ────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(page, size)));
    }

    @PatchMapping("/users/{userId}/block")
    public ResponseEntity<ApiResponse<UserResponse>> blockUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User blocked", userService.blockUser(userId)));
    }

    @PatchMapping("/users/{userId}/activate")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("User activated", userService.activateUser(userId)));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    // ─── FARMER MANAGEMENT ──────────────────────────────────────────

    @GetMapping("/farmers")
    public ResponseEntity<ApiResponse<Page<FarmerResponse>>> getAllFarmers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(farmerService.getAllFarmers(page, size)));
    }

    @GetMapping("/farmers/pending")
    public ResponseEntity<ApiResponse<List<FarmerResponse>>> getPendingFarmers() {
        return ResponseEntity.ok(ApiResponse.success(farmerService.getPendingFarmers()));
    }

    @PatchMapping("/farmers/{farmerId}/approve")
    public ResponseEntity<ApiResponse<FarmerResponse>> approveFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(ApiResponse.success("Farmer approved",
                farmerService.approveFarmer(farmerId)));
    }

    @PatchMapping("/farmers/{farmerId}/reject")
    public ResponseEntity<ApiResponse<FarmerResponse>> rejectFarmer(@PathVariable Long farmerId) {
        return ResponseEntity.ok(ApiResponse.success("Farmer rejected",
                farmerService.rejectFarmer(farmerId)));
    }

    // ─── PRODUCT MANAGEMENT ─────────────────────────────────────────

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.getAllProducts(page, size, "createdAt", "desc")));
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long productId) {
        productService.deleteProduct(productId, null, true);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    // ─── ORDER MANAGEMENT ───────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(page, size)));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long orderId) {
        // null email = admin bypass
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(orderId, null)));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order status updated",
                orderService.updateOrderStatus(orderId, request)));
    }

    // ─── CONTACT MESSAGES ───────────────────────────────────────────

    @GetMapping("/contact-messages")
    public ResponseEntity<ApiResponse<List<ContactMessage>>> getContactMessages() {
        return ResponseEntity.ok(ApiResponse.success(contactService.getAllMessages()));
    }
}
