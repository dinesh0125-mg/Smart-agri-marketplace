package com.smartagri.service;

import com.smartagri.dto.request.*;
import com.smartagri.dto.response.*;
import com.smartagri.entity.*;
import com.smartagri.enums.*;
import com.smartagri.exception.*;
import com.smartagri.repository.*;
import com.smartagri.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final BuyerRepository buyerRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final OtpService otpService;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;
    @Value("${app.email-verification.expiry-hours}")
    private int emailVerificationExpiryHours;
    @Value("${app.password-reset.expiry-minutes}")
    private int passwordResetExpiryMinutes;
    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!otpService.isEmailVerified(request.getEmail())) {
            throw new BadRequestException(
                    "Email not verified. Please complete OTP verification before registering.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()
                && userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered: " + request.getPhone());
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .emailVerificationTokenExpiry(LocalDateTime.now().plusHours(emailVerificationExpiryHours))
                .build();

        user = userRepository.save(user);

        // Create role-specific profile
        if (request.getRole() == Role.FARMER) {
            Farmer farmer = Farmer.builder()
                    .user(user)
                    .farmName(request.getFarmName())
                    .farmLocation(request.getFarmLocation())
                    .description(request.getDescription())
                    .experience(request.getExperience())
                    .specialty(request.getSpecialty())
                    .status(FarmerStatus.PENDING)
                    .build();
            farmerRepository.save(farmer);
        } else if (request.getRole() == Role.BUYER) {
            Buyer buyer = Buyer.builder().user(user).build();
            buyerRepository.save(buyer);
        }

        // Send emails asynchronously
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName(), user.getRole().name());
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verificationToken);

        // Send welcome notification
        notificationService.sendNotification(user, "Welcome to Smart Agriculture!",
                "Your account has been created successfully. Start exploring fresh farm products!");

        otpService.consumeEmailVerification(request.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(buildUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(()
                        -> new ResourceNotFoundException("User not found"));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new UnauthorizedException(
                    "Your account has been blocked. Contact support."
            );
        }

        UserDetails userDetails
                = userDetailsService.loadUserByUsername(
                        user.getEmail()
                );

        String accessToken
                = jwtUtil.generateToken(userDetails);

        // Create or update refresh token
        String refreshToken
                = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(buildUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(String idToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenInfo = restTemplate.getForObject(url, Map.class);

            if (tokenInfo == null || !tokenInfo.containsKey("email")) {
                throw new UnauthorizedException("Invalid Google token");
            }

            String email = (String) tokenInfo.get("email");
            String name = (String) tokenInfo.getOrDefault("name", "Google User");
            String picture = (String) tokenInfo.getOrDefault("picture", null);

            // Verify audience matches our client ID
            if (googleClientId != null && !googleClientId.isBlank()) {
                String aud = (String) tokenInfo.get("aud");
                if (!googleClientId.equals(aud)) {
                    throw new UnauthorizedException("Google token audience mismatch");
                }
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Create new user
                user = User.builder()
                        .fullName(name)
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(Role.BUYER)
                        .status(UserStatus.ACTIVE)
                        .emailVerified(true)
                        .profileImage(picture)
                        .build();
                user = userRepository.save(user);

                Buyer buyer = Buyer.builder().user(user).build();
                buyerRepository.save(buyer);

                notificationService.sendNotification(user, "Welcome to Smart Agriculture!",
                        "Your account has been created via Google. Start exploring fresh farm products!");
            }

            if (user.getStatus() == UserStatus.BLOCKED) {
                throw new UnauthorizedException("Your account has been blocked. Contact support.");
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            String accessToken = jwtUtil.generateToken(userDetails);
            String refreshToken = createRefreshToken(user);

            return AuthResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .user(buildUserResponse(user))
                    .build();

        } catch (UnauthorizedException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google login failed: {}", e.getMessage());
            throw new UnauthorizedException("Google authentication failed. Please try again.");
        }
    }

    @Transactional
    public AuthResponse loginByPhone(String phone) {
        String normalizedPhone = phone.replaceAll("[^0-9+]", "");

        User user = userRepository.findByPhone(normalizedPhone).orElse(null);

        if (user == null) {
            // Create new user with phone
            user = User.builder()
                    .fullName("User " + normalizedPhone.substring(Math.max(0, normalizedPhone.length() - 4)))
                    .email(normalizedPhone + "@phone.smartagri.local")
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .phone(normalizedPhone)
                    .role(Role.BUYER)
                    .status(UserStatus.ACTIVE)
                    .emailVerified(false)
                    .build();
            user = userRepository.save(user);

            Buyer buyer = Buyer.builder().user(user).build();
            buyerRepository.save(buyer);

            notificationService.sendNotification(user, "Welcome to Smart Agriculture!",
                    "Your account has been created via phone verification. Start exploring fresh farm products!");
        }

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new UnauthorizedException("Your account has been blocked. Contact support.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(buildUserResponse(user))
                .build();
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token expired. Please login again.");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(token.getUser().getEmail());
        String accessToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(token.getToken())
                .user(buildUserResponse(token.getUser()))
                .build();
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user
                -> refreshTokenRepository.deleteByUser(user));
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with email: " + request.getEmail()));

        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(LocalDateTime.now().plusMinutes(passwordResetExpiryMinutes));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetToken);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token"));

        if (user.getPasswordResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (user.getEmailVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpiry(null);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);
    }

    private String createRefreshToken(User user) {

        RefreshToken token
                = refreshTokenRepository
                        .findByUser(user)
                        .orElse(new RefreshToken());

        token.setUser(user);
        token.setToken(UUID.randomUUID().toString());
        token.setExpiryDate(
                Instant.now().plusMillis(refreshExpiration)
        );

        return refreshTokenRepository
                .save(token)
                .getToken();
    }

    public UserResponse buildUserResponse(User user) {
        FarmerResponse farmerProfile = null;
        if (user.getRole() == Role.FARMER) {
            farmerProfile = farmerRepository.findByUser_Id(user.getId())
                    .map(f -> FarmerResponse.builder()
                    .farmerId(f.getFarmerId())
                    .farmName(f.getFarmName())
                    .farmLocation(f.getFarmLocation())
                    .description(f.getDescription())
                    .experience(f.getExperience())
                    .specialty(f.getSpecialty())
                    .status(f.getStatus())
                    .build())
                    .orElse(null);
        }
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .address(user.getAddress())
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .farmerProfile(farmerProfile)
                .build();
    }
}
