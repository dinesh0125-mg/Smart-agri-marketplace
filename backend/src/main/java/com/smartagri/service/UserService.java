package com.smartagri.service;

import com.smartagri.dto.request.UpdateProfileRequest;
import com.smartagri.dto.response.UserResponse;
import com.smartagri.entity.User;
import com.smartagri.enums.Role;
import com.smartagri.enums.UserStatus;
import com.smartagri.exception.ResourceNotFoundException;
import com.smartagri.repository.FarmerRepository;
import com.smartagri.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final CloudinaryService cloudinaryService;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public UserResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return authService.buildUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null)    user.setPhone(request.getPhone());
        if (request.getAddress() != null)  user.setAddress(request.getAddress());
        userRepository.save(user);

        if (Role.FARMER.equals(user.getRole())) {
            farmerRepository.findByUser_Id(user.getId()).ifPresent(farmer -> {
                if (request.getFarmName() != null)     farmer.setFarmName(request.getFarmName());
                if (request.getFarmLocation() != null) farmer.setFarmLocation(request.getFarmLocation());
                if (request.getDescription() != null)  farmer.setDescription(request.getDescription());
                if (request.getExperience() != null)   farmer.setExperience(request.getExperience());
                if (request.getSpecialty() != null)    farmer.setSpecialty(request.getSpecialty());
                farmerRepository.save(farmer);
            });
        }
        return authService.buildUserResponse(user);
    }

    @Transactional
    public UserResponse uploadProfileImage(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getProfileImage() != null) cloudinaryService.deleteImage(user.getProfileImage());
        user.setProfileImage(cloudinaryService.uploadImage(file, "profiles"));
        return authService.buildUserResponse(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable).map(u -> authService.buildUserResponse(u));
    }

    @Transactional
    public UserResponse blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setStatus(UserStatus.BLOCKED);
        return authService.buildUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setStatus(UserStatus.ACTIVE);
        return authService.buildUserResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        userRepository.delete(user);
    }
}
