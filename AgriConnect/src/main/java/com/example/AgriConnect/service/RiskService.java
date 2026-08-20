package com.example.AgriConnect.service;

import com.example.AgriConnect.dto.response.RiskFlagResponse;
import com.example.AgriConnect.entity.Order;
import com.example.AgriConnect.entity.OrderStatus;
import com.example.AgriConnect.entity.User;
import com.example.AgriConnect.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RiskService {

    private final OrderRepository orderRepo;

    // Deliberately simple, explainable rules rather than a black-box score —
    // easy to extend with more rules later (repeated failed payments, brand
    // accounts with many rejected listings, etc.) without changing the shape
    // callers rely on.
    private static final int CANCELLATION_THRESHOLD = 3;

    public List<RiskFlagResponse> getFlags() {
        List<Order> allOrders = orderRepo.findAll();

        Map<Long, List<Order>> cancelledByBuyerId = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CANCELLED)
                .collect(Collectors.groupingBy(o -> o.getBuyer().getId()));

        return cancelledByBuyerId.entrySet().stream()
                .filter(e -> e.getValue().size() >= CANCELLATION_THRESHOLD)
                .map(e -> {
                    User buyer = e.getValue().get(0).getBuyer();
                    return RiskFlagResponse.builder()
                            .userId(buyer.getId())
                            .name(buyer.getName())
                            .email(buyer.getEmail())
                            .role(buyer.getRole().name())
                            .flagReason("High cancellation rate")
                            .metricValue(e.getValue().size())
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getMetricValue(), a.getMetricValue()))
                .toList();
    }
}
