package com.example.AgriConnect.controller;

import com.example.AgriConnect.dto.response.UserResponse;
import com.example.AgriConnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
public class FarmerController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> profile(Authentication auth) {
        return ResponseEntity.ok(
                userService.getProfile(auth.getName())
        );
    }
}