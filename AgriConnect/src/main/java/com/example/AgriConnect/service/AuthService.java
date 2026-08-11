package com.example.AgriConnect.service;

import com.example.AgriConnect.dto.request.RegisterRequest;
import com.example.AgriConnect.dto.request.LoginRequest;
import com.example.AgriConnect.dto.response.AuthResponse;
import com.example.AgriConnect.dto.response.UserResponse;
import com.example.AgriConnect.entity.RefreshToken;
import com.example.AgriConnect.entity.Role;
import com.example.AgriConnect.entity.User;
import com.example.AgriConnect.exception.ApiException;
import com.example.AgriConnect.repository.PasswordResetOtpRepository;
import com.example.AgriConnect.repository.RefreshTokenRepository;
import com.example.AgriConnect.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.AgriConnect.entity.PasswordResetOtp;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.Set;

@Service
@Transactional
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository repo;
    private final PasswordResetOtpRepository otpRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final EmailService emailService;

    // Roles a person is allowed to pick for themselves on public /api/auth/register.
    // ADMIN and BRAND accounts must be created through a separate, protected
    // admin-only flow — never from an unauthenticated endpoint.
    private static final Set<Role> SELF_REGISTERABLE_ROLES = Set.of(Role.FARMER, Role.BUYER);

    public AuthResponse register(RegisterRequest req) {

        if (repo.findByEmail(req.getEmail()).isPresent()) {
            throw new ApiException("Email already exists");
        }

        Role requestedRole = req.getRole() != null ? req.getRole() : Role.BUYER;

        if (!SELF_REGISTERABLE_ROLES.contains(requestedRole)) {
            throw new ApiException("Cannot self-register with role " + requestedRole
                    + ". Only FARMER or BUYER accounts can be created here.");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .mobile(req.getMobile())
                .role(requestedRole)
                .build();

        repo.save(user);

        return issueTokens(user);
    }

    public UserResponse getProfile(String email){

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .mobile(user.getMobile())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest req) {

        User user = repo.findByEmail(req.getEmail())
                .orElseThrow(() -> new ApiException("User not found"));

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApiException("Invalid credentials");
        }

        return issueTokens(user);
    }

    /**
     * Generates a fresh access+refresh token pair for the user, persists the refresh
     * token (replacing any previous one for that email so old refresh tokens stop
     * working after a new login), and returns them wrapped in AuthResponse.
     */
    private AuthResponse issueTokens(User user) {

        String accessToken = jwt.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwt.generateRefreshToken(user.getEmail());

        refreshTokenRepo.deleteByEmail(user.getEmail());

        RefreshToken tokenRecord = new RefreshToken();
        tokenRecord.setToken(refreshToken);
        tokenRecord.setEmail(user.getEmail());
        tokenRecord.setExpiryDate(jwt.extractExpiry(refreshToken));
        refreshTokenRepo.save(tokenRecord);

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );
    }

    /**
     * Exchanges a valid, non-blacklisted, DB-registered refresh token for a new
     * access token. Rotates the refresh token too (old one is invalidated) so a
     * leaked refresh token has a short window of usefulness.
     */
    public AuthResponse refreshToken(String refreshToken) {

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ApiException("Refresh token is required");
        }

        if (tokenBlacklistService.isBlacklisted(refreshToken)) {
            throw new ApiException("Refresh token has been revoked");
        }

        if (!jwt.isValidRefreshToken(refreshToken)) {
            throw new ApiException("Invalid or expired refresh token");
        }

        RefreshToken storedToken = refreshTokenRepo.findByToken(refreshToken)
                .orElseThrow(() -> new ApiException("Refresh token not recognized"));

        if (storedToken.getExpiryDate().before(new Date())) {
            refreshTokenRepo.deleteByEmail(storedToken.getEmail());
            throw new ApiException("Refresh token expired, please login again");
        }

        User user = repo.findByEmail(storedToken.getEmail())
                .orElseThrow(() -> new ApiException("User not found"));

        // Rotate: old refresh token can never be reused again.
        tokenBlacklistService.blacklist(refreshToken);

        return issueTokens(user);
    }

    /**
     * Logs the user out by blacklisting the current access token (so it can't be
     * reused for the rest of its natural lifetime) and revoking their refresh token.
     */
    public void logout(String accessToken, String refreshToken) {

        if (accessToken != null && !accessToken.isBlank()) {
            tokenBlacklistService.blacklist(accessToken);
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            tokenBlacklistService.blacklist(refreshToken);
            refreshTokenRepo.findByToken(refreshToken)
                    .ifPresent(t -> refreshTokenRepo.deleteByEmail(t.getEmail()));
        }
    }

    public void forgotPassword(String email) {

        repo.findByEmail(email)
                .orElseThrow(
                        () -> new ApiException("User not found")
                );

        String otp =
                String.valueOf(
                        (int)((Math.random()*900000)+100000)
                );

        PasswordResetOtp resetOtp =
                PasswordResetOtp.builder()
                        .email(email)
                        .otp(otp)
                        .expiryTime(
                                LocalDateTime.now().plusMinutes(5)
                        )
                        .used(false)
                        .build();

        otpRepo.save(resetOtp);

        emailService.sendPasswordResetMail(
                email,
                otp
        );
    }

    public void resetPassword(
            String email,
            String otp,
            String newPassword
    ) {

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        PasswordResetOtp resetOtp =
                otpRepo.findByEmailAndOtp(email, otp)
                        .orElseThrow(
                                () -> new ApiException("Invalid OTP")
                        );

        if(resetOtp.isUsed()) {
            throw new ApiException("OTP already used");
        }

        if(resetOtp.getExpiryTime()
                .isBefore(LocalDateTime.now())) {

            throw new ApiException("OTP Expired");
        }

        user.setPassword(
                encoder.encode(newPassword)
        );

        repo.save(user);

        resetOtp.setUsed(true);

        otpRepo.save(resetOtp);
    }
}