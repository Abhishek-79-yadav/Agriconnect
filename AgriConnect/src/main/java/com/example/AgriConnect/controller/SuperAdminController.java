package com.example.AgriConnect.controller;

import com.example.AgriConnect.dto.request.CreateAdminRequest;
import com.example.AgriConnect.entity.Role;
import com.example.AgriConnect.entity.User;
import com.example.AgriConnect.exception.ApiException;
import com.example.AgriConnect.repository.UserRepository;
import com.example.AgriConnect.service.AuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final AuditService auditService;

    @GetMapping("/admins")
    public List<User> getAdmins() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN || u.getRole() == Role.SUPER_ADMIN)
                .toList();
    }

    @PostMapping("/admins")
    public String createAdmin(@Valid @RequestBody CreateAdminRequest request) {

        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new ApiException("Email already exists");
        }

        User admin = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(encoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .build();

        userRepo.save(admin);
        auditService.log("Created admin account: " + request.getEmail());
        return "Admin created";
    }

    @DeleteMapping("/admins/{id}")
    public String removeAdmin(@PathVariable Long id) {

        User user = userRepo.findById(id)
                .orElseThrow(() -> new ApiException("User not found"));

        if (user.getRole() == Role.SUPER_ADMIN) {
            throw new ApiException("Cannot delete a super admin account");
        }

        if (user.getRole() != Role.ADMIN) {
            throw new ApiException("User is not an admin account");
        }

        userRepo.delete(user);
        auditService.log("Removed admin account: " + user.getEmail());
        return "Admin removed";
    }
}
