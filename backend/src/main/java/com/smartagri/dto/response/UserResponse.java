package com.smartagri.dto.response;

import com.smartagri.enums.Role;
import com.smartagri.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private String profileImage;
    private String address;
    private UserStatus status;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private FarmerResponse farmerProfile;
}
