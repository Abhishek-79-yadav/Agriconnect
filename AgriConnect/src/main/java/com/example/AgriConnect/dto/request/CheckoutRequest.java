package com.example.AgriConnect.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CheckoutRequest {

    // "ONLINE" (Razorpay) or "COD". Defaults to ONLINE if not sent.
    private String paymentMethod = "ONLINE";

    @NotBlank(message = "Delivery name is required")
    private String deliveryName;

    @NotBlank(message = "Delivery phone is required")
    private String deliveryPhone;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddressLine;

    @NotBlank(message = "Delivery city is required")
    private String deliveryCity;

    @NotBlank(message = "Delivery state is required")
    private String deliveryState;

    @NotBlank(message = "Delivery pincode is required")
    private String deliveryPincode;
}
