package com.example.AgriConnect.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BootstrapSuperAdminRequest {

    @NotBlank
    @Size(min = 3, max = 50)
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 8)
    private String password;

    // Shared secret from an environment variable — required so this
    // endpoint (which is otherwise public, since no admin exists yet to
    // authenticate as) can't be used by a random visitor to seize the
    // very first super admin slot before you do.
    @NotBlank
    private String setupKey;
}
