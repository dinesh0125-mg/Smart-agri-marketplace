package com.smartagri.service;

import com.smartagri.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final long PHONE_OTP_EXPIRY_SECONDS = 300;   // 5 minutes
    private static final long EMAIL_OTP_EXPIRY_SECONDS = 600;   // 10 minutes
    private static final long EMAIL_VERIFIED_WINDOW_SECONDS = 900; // 15 minutes
    private static final int MAX_ATTEMPTS = 3;

    private final SecureRandom secureRandom = new SecureRandom();
    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Instant> verifiedEmails = new ConcurrentHashMap<>();

    private record OtpEntry(String otp, Instant expiresAt, int attempts) {
        OtpEntry incrementAttempts() {
            return new OtpEntry(otp, expiresAt, attempts + 1);
        }
    }

    public String generatePhoneOtp(String phone) {
        String normalizedPhone = normalizePhone(phone);
        String otp = generateSecureOtp();
        otpStore.put("phone:" + normalizedPhone,
                new OtpEntry(otp, Instant.now().plusSeconds(PHONE_OTP_EXPIRY_SECONDS), 0));
        log.info("Phone OTP generated for: {}", normalizedPhone);
        return otp;
    }

    public String generateEmailOtp(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        String otp = generateSecureOtp();
        otpStore.put("email:" + normalizedEmail,
                new OtpEntry(otp, Instant.now().plusSeconds(EMAIL_OTP_EXPIRY_SECONDS), 0));
        log.info("Email OTP generated for: {}", normalizedEmail);
        return otp;
    }

    public boolean verifyPhoneOtp(String phone, String otp) {
        return verifyOtp("phone:" + normalizePhone(phone), otp);
    }

    public boolean verifyEmailOtp(String email, String otp) {
        boolean verified = verifyOtp("email:" + email.toLowerCase().trim(), otp);
        if (verified) {
            String normalizedEmail = email.toLowerCase().trim();
            verifiedEmails.put(normalizedEmail,
                    Instant.now().plusSeconds(EMAIL_VERIFIED_WINDOW_SECONDS));
            log.info("Email OTP verified and recorded for registration: {}", normalizedEmail);
        }
        return verified;
    }

    /**
     * Checks whether the given email was successfully OTP-verified within the
     * allowed registration window (15 minutes).
     */
    public boolean isEmailVerified(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        Instant expiry = verifiedEmails.get(normalizedEmail);
        if (expiry == null) {
            return false;
        }
        if (expiry.isBefore(Instant.now())) {
            verifiedEmails.remove(normalizedEmail);
            return false;
        }
        return true;
    }

    /**
     * Consumes (removes) the email verification record after successful
     * registration so it cannot be reused.
     */
    public void consumeEmailVerification(String email) {
        String normalizedEmail = email.toLowerCase().trim();
        verifiedEmails.remove(normalizedEmail);
        log.info("Email verification consumed after registration: {}", normalizedEmail);
    }

    private boolean verifyOtp(String key, String otp) {
        OtpEntry entry = otpStore.get(key);

        if (entry == null) {
            throw new BadRequestException("No OTP was requested. Please request a new OTP.");
        }

        if (entry.expiresAt().isBefore(Instant.now())) {
            otpStore.remove(key);
            throw new BadRequestException("OTP has expired. Please request a new OTP.");
        }

        if (entry.attempts() >= MAX_ATTEMPTS) {
            otpStore.remove(key);
            throw new BadRequestException("Too many failed attempts. Please request a new OTP.");
        }

        if (!entry.otp().equals(otp.trim())) {
            otpStore.put(key, entry.incrementAttempts());
            int remaining = MAX_ATTEMPTS - entry.attempts() - 1;
            throw new BadRequestException("Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        otpStore.remove(key);
        return true;
    }

    private String generateSecureOtp() {
        int otp = secureRandom.nextInt((int) Math.pow(10, OTP_LENGTH));
        return String.format("%0" + OTP_LENGTH + "d", otp);
    }

    private String normalizePhone(String phone) {
        return phone.replaceAll("[^0-9+]", "");
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void cleanExpired() {
        Instant now = Instant.now();
        otpStore.entrySet().removeIf(e -> e.getValue().expiresAt().isBefore(now));
        verifiedEmails.entrySet().removeIf(e -> e.getValue().isBefore(now));
    }
}
