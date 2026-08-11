package com.example.AgriConnect.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long id;
    private String status;
    private boolean paid;
    private double totalPrice;
    private String buyerName;
    private String paymentId;
    private String paymentMethod;
    private String invoiceUrl;
    private String couponCode;
    private Double discount;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;

    @Data
    @Builder
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private Double quantity;
        private Double price;
    }
}