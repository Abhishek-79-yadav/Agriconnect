package com.example.AgriConnect.service;

import com.example.AgriConnect.dto.request.ChangePasswordRequest;
import com.example.AgriConnect.dto.request.UpdateProfileRequest;
import com.example.AgriConnect.dto.response.UserResponse;
import com.example.AgriConnect.entity.User;
import com.example.AgriConnect.exception.ApiException;
import com.example.AgriConnect.exception.ResourceNotFoundException;
import com.example.AgriConnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ENTITY ONLY (internal use)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToResponse(user);
    }

    public UserResponse getProfile(String email) {

        User user = getUserByEmail(email);

        return mapToResponse(user);
    }

    // UPDATE PROFILE
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {

        User user = getUserByEmail(email);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }
        if (request.getMobile() != null) {
            user.setMobile(request.getMobile());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getState() != null) {
            user.setState(request.getState());
        }

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    // CHANGE PASSWORD
    public void changePassword(String email, ChangePasswordRequest request) {

        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ApiException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // SINGLE MAPPER (reuse everywhere)
    private UserResponse mapToResponse(User user) {

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .state(user.getState())
                .build();
    }
}
