package com.smartagri.controller;

import com.smartagri.dto.request.ContactMessageRequest;
import com.smartagri.dto.response.ApiResponse;
import com.smartagri.service.ContactService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Contact", description = "Contact form API")
public class ContactController {

    private final ContactService contactService;

    @PostMapping("/contact")
    public ResponseEntity<ApiResponse<Void>> contact(@Valid @RequestBody ContactMessageRequest request) {
        contactService.saveContactMessage(request);
        return ResponseEntity.ok(ApiResponse.success("Message received! We'll get back to you soon.", null));
    }
}
