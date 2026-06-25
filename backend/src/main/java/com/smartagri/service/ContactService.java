package com.smartagri.service;

import com.smartagri.dto.request.ContactMessageRequest;
import com.smartagri.entity.ContactMessage;
import com.smartagri.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final EmailService emailService;

    @Value("${spring.mail.username}")
    private String adminEmail;

    @Transactional
    public void saveContactMessage(ContactMessageRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();
        contactMessageRepository.save(message);

        // Send notification email to admin
        emailService.sendContactNotification(adminEmail, request);
    }

    @Transactional(readOnly = true)
    public List<ContactMessage> getAllMessages() {
        return contactMessageRepository.findAll();
    }
}
