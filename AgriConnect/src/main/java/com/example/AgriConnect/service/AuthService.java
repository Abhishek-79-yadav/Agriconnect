package com.example.AgriConnect.service;

import com.example.AgriConnect.dto.request.RegisterRequest;
import com.example.AgriConnect.dto.request.RegisterBrandRequest;
import com.example.AgriConnect.dto.request.LoginRequest;
import com.example.AgriConnect.dto.response.AuthResponse;
import com.example.AgriConnect.dto.response.UserResponse;
import com.example.AgriConnect.entity.BrandProfile;
import com.example.AgriConnect.entity.RefreshToken;
import com.example.AgriConnect.entity.Role;
import com.example.AgriConnect.entity.User;
import com.example.AgriConnect.exception.ApiException;
import com.example.AgriConnect.repository.BrandProfileRepository;
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
    private final BrandProfileRepository brandProfileRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final EmailService emailService;

    @org.springframework.beans.factory.annotation.Value("${app.super-admin-setup-key}")
    private String superAdminSetupKey;

    // Roles a person is allowed to pick for themselves on public /api/auth/register.
    // ADMIN accounts must be created through a separate, protected admin-only
    // flow — never from an unauthenticated endpoint. BRAND has its OWN
    // dedicated endpoint (registerBrand, below) since it needs extra company
    // fields and starts disabled pending admin approval.
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

    /**
     * Company (BRAND) self-registration. Unlike FARMER/BUYER, a new BRAND
     * account is created disabled (enabled=false) and can't log in until an
     * admin approves it — see login() below and AdminController's
     * approve-brand endpoint. No tokens are issued here since the account
     * isn't usable yet.
     */
    public void registerBrand(RegisterBrandRequest req) {

        if (repo.findByEmail(req.getEmail()).isPresent()) {
            throw new ApiException("Email already exists");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .mobile(req.getMobile())
                .city(req.getCity())
                .state(req.getState())
                .role(Role.BRAND)
                .enabled(false)
                .build();

        repo.save(user);

        brandProfileRepo.save(BrandProfile.builder()
                .user(user)
                .companyName(req.getCompanyName())
                .gstNumber(req.getGstNumber())
                .category(req.getCategory())
                .build());
    }

    /**
     * One-time creation of the first SUPER_ADMIN account. Guarded two ways:
     * the caller must know app.super-admin-setup-key (an env var, not
     * committed to source), AND this only works while zero SUPER_ADMINs
     * exist yet — so even a leaked key is useless after the first run.
     * Change your password immediately after the first login.
     */
    public void bootstrapSuperAdmin(com.example.AgriConnect.dto.request.BootstrapSuperAdminRequest req) {

        if (superAdminSetupKey == null || superAdminSetupKey.isBlank()
                || !superAdminSetupKey.equals(req.getSetupKey())) {
            throw new ApiException("Invalid setup key");
        }

        if (repo.findAll().stream().anyMatch(u -> u.getRole() == Role.SUPER_ADMIN)) {
            throw new ApiException("A super admin already exists — use the admin panel to create further admins");
        }

        if (repo.findByEmail(req.getEmail()).isPresent()) {
            throw new ApiException("Email already exists");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(Role.SUPER_ADMIN)
                .build();

        repo.save(user);
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

        if (!user.isEnabled()) {
            if (user.getSuspensionReason() != null) {
                throw new ApiException("Your account has been suspended: " + user.getSuspensionReason());
            }
            throw new ApiException(user.getRole() == Role.BRAND
                    ? "Your company account is pending admin approval"
                    : "Your account has been disabled. Contact support.");
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