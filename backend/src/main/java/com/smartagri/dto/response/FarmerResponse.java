package com.smartagri.dto.response;

import com.smartagri.enums.FarmerStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerResponse {
    private Long farmerId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String profileImage;
    private String farmName;
    private String farmLocation;
    private String description;
    private String experience;
    private String specialty;
    private FarmerStatus status;
    private long totalProducts;
}
