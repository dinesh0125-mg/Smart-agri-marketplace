package com.smartagri.controller;

import com.smartagri.dto.request.ProductRequest;
import com.smartagri.dto.request.UpdateOrderStatusRequest;
import com.smartagri.dto.response.*;
import com.smartagri.entity.User;
import com.smartagri.repository.UserRepository;
import com.smartagri.service.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Tag(name = "Farmer", description = "Farmer profile, dashboard, and order APIs")
public class FarmerController {

    private final FarmerService farmerService;
    private final ProductService productService;
    private final OrderService orderService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    // ==========================================================
    // PUBLIC ENDPOINTS
    // ==========================================================

    @GetMapping("/farmers/public")
    public ResponseEntity<ApiResponse<Page<FarmerResponse>>> getAllFarmers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        farmerService.getAllFarmers(page, size)
                )
        );
    }

    @GetMapping("/farmers/public/{farmerId}")
    public ResponseEntity<ApiResponse<FarmerResponse>> getFarmer(
            @PathVariable Long farmerId) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        farmerService.getFarmerById(farmerId)
                )
        );
    }

    @GetMapping("/farmers/public/{farmerId}/products")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getFarmerProducts(
            @PathVariable Long farmerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        productService.getFarmerProducts(
                                farmerId,
                                page,
                                size
                        )
                )
        );
    }

    // ==========================================================
    // FARMER PRODUCT MANAGEMENT
    // ==========================================================

    @PostMapping(value = "/farmer/products",
        consumes = {"multipart/form-data"})
@PreAuthorize("hasAnyRole('FARMER','ADMIN')")
public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @ModelAttribute ProductRequest request,
        @RequestParam(value = "image", required = false)
        MultipartFile image) {

    System.out.println("========== CREATE PRODUCT ==========");
    System.out.println("User: " + userDetails.getUsername());
    System.out.println("Product: " + request.getProductName());
    System.out.println("Price: " + request.getPrice());
    System.out.println("CategoryId: " + request.getCategoryId());

    ProductResponse product = productService.createProduct(
            userDetails.getUsername(),
            request,
            image
    );

    return ResponseEntity.ok(
            ApiResponse.success(
                    "Product created successfully",
                    product
            )
    );
}

    @PutMapping(value = "/farmer/products/{productId}",
            consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @ModelAttribute ProductRequest request,
            @RequestParam(value = "image", required = false)
            MultipartFile image) {

        ProductResponse product = productService.updateProduct(
                productId,
                userDetails.getUsername(),
                request,
                image
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product updated successfully",
                        product
                )
        );
    }

    @DeleteMapping("/farmer/products/{productId}")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {

        productService.deleteProduct(
                productId,
                userDetails.getUsername(),
                false
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Product deleted successfully"
                )
        );
    }

    @GetMapping("/farmer/products")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getMyProducts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        FarmerResponse farmer =
                farmerService.getMyProfile(
                        userDetails.getUsername()
                );

        return ResponseEntity.ok(
                ApiResponse.success(
                        productService.getFarmerProducts(
                                farmer.getFarmerId(),
                                page,
                                size
                        )
                )
        );
    }

    // ==========================================================
    // FARMER DASHBOARD
    // ==========================================================

    @GetMapping("/farmer/dashboard")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<FarmerDashboardResponse>> getDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        farmerService.getFarmerDashboard(
                                userDetails.getUsername()
                        )
                )
        );
    }

    @GetMapping("/farmer/profile")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<FarmerResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        farmerService.getMyProfile(
                                userDetails.getUsername()
                        )
                )
        );
    }

    // ==========================================================
    // ORDERS
    // ==========================================================

    @GetMapping("/farmer/orders")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        orderService.getFarmerOrders(
                                userDetails.getUsername(),
                                page,
                                size
                        )
                )
        );
    }

    @PatchMapping("/farmer/orders/{orderId}/status")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Status updated",
                        orderService.updateOrderStatus(
                                orderId,
                                request
                        )
                )
        );
    }

    // ==========================================================
    // NOTIFICATIONS
    // ==========================================================

    @GetMapping("/farmer/notifications")
    @PreAuthorize("hasAnyRole('FARMER','ADMIN')")
    public ResponseEntity<ApiResponse<?>> getNotifications(
            @AuthenticationPrincipal UserDetails userDetails) {

        User user = userRepository
                .findByEmail(userDetails.getUsername())
                .orElseThrow();

        return ResponseEntity.ok(
                ApiResponse.success(
                        notificationService.getUserNotifications(
                                user.getId()
                        )
                )
        );
    }
}