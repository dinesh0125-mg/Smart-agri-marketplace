package com.smartagri.controller;

import com.smartagri.dto.request.PaymentVerifyRequest;
import com.smartagri.dto.response.*;
import com.smartagri.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/buyer/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
@Tag(name = "Payments", description = "Razorpay payment APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-order/{orderId}")
    @Operation(summary = "Create Razorpay order for payment")
    public ResponseEntity<ApiResponse<PaymentOrderResponse>> createPaymentOrder(
            @PathVariable Long orderId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Payment order created",
                paymentService.createRazorpayOrder(orderId, userDetails.getUsername())));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Razorpay payment signature")
    public ResponseEntity<ApiResponse<Void>> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {
        paymentService.verifyAndCapturePayment(request);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", null));
    }

    @PostMapping("/failure")
    @Operation(summary = "Handle payment failure")
    public ResponseEntity<ApiResponse<Void>> handleFailure(@RequestParam String razorpayOrderId) {
        paymentService.handlePaymentFailure(razorpayOrderId);
        return ResponseEntity.ok(ApiResponse.success("Payment failure recorded", null));
    }
}
