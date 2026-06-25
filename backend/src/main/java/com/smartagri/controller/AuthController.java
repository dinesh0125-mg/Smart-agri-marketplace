package com.smartagri.controller;

import com.smartagri.dto.request.*;
import com.smartagri.dto.response.*;
import com.smartagri.exception.DuplicateResourceException;
import com.smartagri.repository.UserRepository;
import com.smartagri.service.AuthService;
import com.smartagri.service.EmailService;
import com.smartagri.service.OtpService;
import com.smartagri.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Auth APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", authService.register(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/google")
    @Operation(summary = "Login or register via Google OAuth")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Google login successful",
                authService.googleLogin(request.getIdToken())));
    }

    @PostMapping("/otp/send")
    @Operation(summary = "Send OTP to phone number for login")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendPhoneOtp(@Valid @RequestBody OtpRequest request) {
        String otp = otpService.generatePhoneOtp(request.getPhone());
        // In development, return OTP in response for testing
        // In production, integrate SMS provider and remove OTP from response
        return ResponseEntity.ok(ApiResponse.success("OTP sent successfully",
                Map.of("message", "OTP sent to " + request.getPhone(), "otp", otp)));
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Verify phone OTP and login")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyPhoneOtp(@Valid @RequestBody OtpVerifyRequest request) {
        otpService.verifyPhoneOtp(request.getPhone(), request.getOtp());
        AuthResponse authResponse = authService.loginByPhone(request.getPhone());
        return ResponseEntity.ok(ApiResponse.success("Phone verification successful", authResponse));
    }

    @PostMapping("/register/otp/send")
    @Operation(summary = "Send email OTP for registration verification")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendRegistrationOtp(
            @Valid @RequestBody RegistrationOtpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        String otp = otpService.generateEmailOtp(request.getEmail());
        emailService.sendOtpEmail(request.getEmail(), "New User", otp);
        return ResponseEntity.ok(ApiResponse.success("Verification OTP sent to your email",
                Map.of("message", "OTP sent to " + request.getEmail())));
    }

    @PostMapping("/register/otp/verify")
    @Operation(summary = "Verify email OTP during registration")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> verifyRegistrationOtp(
            @Valid @RequestBody RegistrationOtpVerifyRequest request) {
        otpService.verifyEmailOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully",
                Map.of("verified", true)));
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed", authService.refreshToken(request)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and invalidate refresh token")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal UserDetails userDetails) {
        authService.logout(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Send password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change password for authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @GetMapping("/verify-email")
    @Operation(summary = "Verify email with token")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(userDetails.getUsername())));
    }
}
