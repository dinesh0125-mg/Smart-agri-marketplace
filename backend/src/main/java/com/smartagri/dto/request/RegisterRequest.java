package com.smartagri.dto.request;

import com.smartagri.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String fullName;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min = 6, max = 100)
    private String password;
    private String phone;
    @NotNull
    private Role role;
    private String farmName;
    private String farmLocation;
    private String description;
    private String experience;
    private String specialty;
}
