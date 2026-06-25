package com.smartagri.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    private String fullName;
    private String phone;
    private String address;
    private String farmName;
    private String farmLocation;
    private String description;
    private String experience;
    private String specialty;
}
