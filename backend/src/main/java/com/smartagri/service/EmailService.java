package com.smartagri.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}") private String fromEmail;
    @Value("${app.mail.from-name}") private String fromName;
    @Value("${app.frontend-url}") private String frontendUrl;
    @Value("${app.name}") private String appName;

    @Async
    public void sendVerificationEmail(String toEmail, String userName, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String html = buildEmailTemplate("Verify Your Email", userName,
            "<p>Thank you for registering with <strong>" + appName + "</strong>. " +
            "Please click the button below to verify your email address:</p>",
            link, "Verify Email");
        sendEmail(toEmail, "Verify your " + appName + " account", html);
    }

    @Async
    public void sendPasswordResetEmail(String toEmail, String userName, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String html = buildEmailTemplate("Reset Your Password", userName,
            "<p>We received a request to reset the password for your account. " +
            "Click the button below to set a new password. This link expires in 30 minutes.</p>",
            link, "Reset Password");
        sendEmail(toEmail, "Reset your " + appName + " password", html);
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String userName, String role) {
        String html = buildEmailTemplate("Welcome to " + appName + "!", userName,
            "<p>Your account has been successfully created as a <strong>" + role + "</strong>. " +
            "We're excited to have you on board!</p>" +
            "<p>Start exploring fresh farm produce from across India.</p>",
            frontendUrl, "Go to Marketplace");
        sendEmail(toEmail, "Welcome to " + appName, html);
    }

    @Async
    public void sendOtpEmail(String toEmail, String userName, String otp) {
        String html = buildEmailTemplate("Your Verification Code", userName,
            "<p>Your verification code for <strong>" + appName + "</strong> is:</p>" +
            "<div style=\"text-align:center;margin:24px 0;\">" +
            "<span style=\"font-size:32px;font-weight:800;letter-spacing:8px;color:#1B5E20;background:#E8F5E9;padding:16px 32px;border-radius:12px;display:inline-block;\">" + otp + "</span>" +
            "</div>" +
            "<p>This code is valid for 10 minutes. Do not share it with anyone.</p>",
            frontendUrl, "Go to Marketplace");
        sendEmail(toEmail, "Your verification code - " + appName, html);
    }

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String userName, Long orderId, BigDecimal amount) {
        String html = buildEmailTemplate("Order Confirmed!", userName,
            "<p>Your order <strong>#ORD-" + orderId + "</strong> has been placed successfully.</p>" +
            "<p>Order Amount: <strong>₹" + amount + "</strong></p>" +
            "<p>We'll notify you once your order is shipped.</p>",
            frontendUrl + "/orders", "View Order");
        sendEmail(toEmail, "Order #ORD-" + orderId + " Confirmed", html);
    }

    @Async
    public void sendPaymentSuccessEmail(String toEmail, String userName, Long orderId, BigDecimal amount) {
        String html = buildEmailTemplate("Payment Successful!", userName,
            "<p>We've received your payment of <strong>₹" + amount + "</strong> for order <strong>#ORD-" + orderId + "</strong>.</p>" +
            "<p>Your order is now being processed and will be delivered soon.</p>",
            frontendUrl + "/orders", "Track Order");
        sendEmail(toEmail, "Payment received for Order #ORD-" + orderId, html);
    }

    @Async
    public void sendOrderStatusUpdateEmail(String toEmail, String userName, Long orderId, String status) {
        String html = buildEmailTemplate("Order Status Update", userName,
            "<p>Your order <strong>#ORD-" + orderId + "</strong> status has been updated to: <strong>" + status + "</strong>.</p>",
            frontendUrl + "/orders", "View Order");
        sendEmail(toEmail, "Order #ORD-" + orderId + " is now " + status, html);
    }

    @Async
    public void sendFarmerApprovalEmail(String toEmail, String farmerName) {
        String html = buildEmailTemplate("Farmer Account Approved!", farmerName,
            "<p>Congratulations! Your farmer account on <strong>" + appName + "</strong> has been approved.</p>" +
            "<p>You can now start listing your products and selling directly to buyers across India.</p>",
            frontendUrl + "/my-products", "Start Selling");
        sendEmail(toEmail, "Your farmer account is approved!", html);
    }

    @Async
    public void sendFarmerRejectionEmail(String toEmail, String farmerName) {
        String html = buildEmailTemplate("Account Review Update", farmerName,
            "<p>We've reviewed your farmer account application and unfortunately it did not meet our requirements at this time.</p>" +
            "<p>Please contact our support team for more information.</p>",
            frontendUrl + "/contact", "Contact Support");
        sendEmail(toEmail, "Account Review Update - " + appName, html);
    }

    @Async
    public void sendContactNotification(String adminEmail, com.smartagri.dto.request.ContactMessageRequest request) {
        String body = "<p>You have received a new contact form message on <strong>" + appName + "</strong>.</p>" +
            "<table style=\"width:100%;border-collapse:collapse;margin-top:16px;\">" +
            "<tr><td style=\"padding:8px;background:#f5f5f5;font-weight:bold;width:120px;\">From</td>" +
            "<td style=\"padding:8px;border-bottom:1px solid #eee;\">" + request.getName() + "</td></tr>" +
            "<tr><td style=\"padding:8px;background:#f5f5f5;font-weight:bold;\">Email</td>" +
            "<td style=\"padding:8px;border-bottom:1px solid #eee;\"><a href=\"mailto:" + request.getEmail() + "\">" + request.getEmail() + "</a></td></tr>" +
            "<tr><td style=\"padding:8px;background:#f5f5f5;font-weight:bold;\">Subject</td>" +
            "<td style=\"padding:8px;border-bottom:1px solid #eee;\">" + request.getSubject() + "</td></tr>" +
            "<tr><td style=\"padding:8px;background:#f5f5f5;font-weight:bold;vertical-align:top;\">Message</td>" +
            "<td style=\"padding:8px;white-space:pre-wrap;\">" + request.getMessage() + "</td></tr>" +
            "</table>";
        String html = buildEmailTemplate("New Contact Form Message", "Admin", body,
            "mailto:" + request.getEmail(), "Reply to " + request.getName());
        sendEmail(adminEmail, "New Message: " + request.getSubject() + " - " + request.getName(), html);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildEmailTemplate(String title, String userName, String body, String ctaLink, String ctaText) {
        return """
            <!DOCTYPE html>
            <html><head><meta charset="UTF-8"></head>
            <body style="font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0;">
            <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
              <tr><td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="background:linear-gradient(135deg,#1B5E20,#4CAF50);padding:30px;text-align:center;">
                      <h1 style="color:#fff;margin:0;font-size:28px;">Smart Agriculture</h1>
                      <p style="color:#C8E6C9;margin:5px 0 0;">Marketplace</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:40px 30px;">
                      <h2 style="color:#1B5E20;margin-top:0;">""" + title + """
                      </h2>
                      <p style="color:#555;font-size:16px;">Hello, <strong>""" + userName + """
                      </strong>!</p>
                      <div style="color:#555;font-size:15px;line-height:1.6;">""" + body + """
                      </div>
                      <div style="text-align:center;margin:30px 0;">
                        <a href=\"""" + ctaLink + """
                          " style="background:linear-gradient(135deg,#2E7D32,#66BB6A);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:bold;display:inline-block;">""" + ctaText + """
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
                      <p style="color:#999;font-size:13px;margin:0;">© 2025 Smart Agriculture Marketplace. All rights reserved.</p>
                      <p style="color:#999;font-size:12px;">If you didn't create an account, you can safely ignore this email.</p>
                    </td>
                  </tr>
                </table>
              </td></tr>
            </table>
            </body></html>
            """;
    }
}
