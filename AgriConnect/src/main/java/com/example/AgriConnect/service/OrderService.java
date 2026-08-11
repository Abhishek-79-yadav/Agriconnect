package com.example.AgriConnect.service;

import com.example.AgriConnect.dto.response.OrderResponse;
import com.example.AgriConnect.entity.*;
import com.example.AgriConnect.exception.ApiException;
import com.example.AgriConnect.exception.ResourceNotFoundException;
import com.example.AgriConnect.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;

    @Transactional
    public OrderResponse checkout(String email, String paymentMethod) {

        User buyer = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException("User not found"));

        List<Cart> cartItems = cartRepository.findByBuyerId(buyer.getId());

        if (cartItems.isEmpty()) {
            throw new ApiException("Cart is empty");
        }

        boolean isCod = "COD".equalsIgnoreCase(paymentMethod);

        Order order = Order.builder()
                .buyer(buyer)
                // COD orders don't go through Razorpay, so there's nothing
                // left to "pay" online — mark them confirmed right away.
                // ONLINE orders stay PENDING until verifyPayment() confirms them.
                .status(isCod ? OrderStatus.CONFIRMED : OrderStatus.PENDING)
                .paid(false)
                .paymentMethod(isCod ? "COD" : "ONLINE")
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (Cart c : cartItems) {

            Product p = c.getProduct();

            if (p.getQuantity() < c.getQuantity()) {
                throw new ApiException("Out of stock: " + p.getProductName());
            }

            p.setQuantity(p.getQuantity() - c.getQuantity());

            BigDecimal itemTotal = p.getPrice()
                    .multiply(BigDecimal.valueOf(c.getQuantity()));

            total = total.add(itemTotal);

            OrderItem item = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .quantity(c.getQuantity())
                    .price(itemTotal.doubleValue())
                    .build();

            order.getItems().add(item);
        }

        order.setTotalPrice(total.doubleValue());

        Order saved = orderRepository.save(order);

        // COD is confirmed immediately, so the cart is genuinely done with.
        // ONLINE orders are NOT paid yet at this point — clearing the cart
        // here would lose it if the Razorpay payment fails or is
        // abandoned. That cart is cleared instead once verifyPayment()
        // actually confirms the payment succeeded.
        if (isCod) {
            cartRepository.deleteByBuyerId(buyer.getId());
        }

        // Notify every farmer whose product is in this order — dedupe so a
        // farmer with 3 items in one order gets one notification, not 3.
        saved.getItems().stream()
                .map(item -> item.getProduct().getFarmer())
                .distinct()
                .forEach(farmer -> notificationService.createNotification(
                        farmer,
                        "You have a new order (#" + saved.getId() + ") — check your Orders page."
                ));

        // Mapped to a DTO *inside* the transaction, while the Hibernate
        // session is still open — returning the raw entity risked lazy
        // fields blowing up during JSON serialization after the session
        // had already closed (which surfaced as a 500 even though the
        // order had actually been created and the cart already cleared).
        return mapToResponse(saved);
    }

    // BUYER ORDERS
    public List<OrderResponse> getBuyerOrders(String email) {
        User buyer = getUser(email);
        return orderRepository.findByBuyer_Id(buyer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // FARMER ORDERS
    public List<OrderResponse> getFarmerOrders(String email) {
        User farmer = getUser(email);
        return orderRepository.findFarmerOrders(farmer.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ADMIN: ALL ORDERS
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // FARMER (or ADMIN) UPDATES ORDER STATUS — BUYER MAY ONLY CANCEL
    @Transactional
    public OrderResponse updateStatus(Long orderId, String statusValue, String email) {

        User user = getUser(email);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        boolean isAdmin = user.getRole() == Role.ADMIN;

        boolean ownsAnItem = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getFarmer().getId().equals(user.getId()));

        boolean isBuyer = order.getBuyer().getId().equals(user.getId());

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(statusValue.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException("Invalid status: " + statusValue);
        }

        // The buyer can only ever cancel their own order (never move it
        // forward through the fulfillment stages — that's the farmer's
        // job), and only while it hasn't shipped yet.
        if (isBuyer && !isAdmin && !ownsAnItem) {
            if (newStatus != OrderStatus.CANCELLED) {
                throw new ApiException("You can only cancel your own order");
            }
            if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
                throw new ApiException("This order has already shipped and can no longer be cancelled");
            }
        } else if (!isAdmin && !ownsAnItem) {
            throw new ApiException("You can only update orders containing your own products");
        }

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new ApiException("This order is already " + order.getStatus() + " and can't be changed");
        }

        // checkout() deducted stock the moment the order was created —
        // give it back on cancellation so it isn't lost forever.
        if (newStatus == OrderStatus.CANCELLED) {
            order.getItems().forEach(item -> {
                Product p = item.getProduct();
                p.setQuantity(p.getQuantity() + item.getQuantity());
                productRepository.save(p);
            });
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order);
        return mapToResponse(saved);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    // MAPPER
    public OrderResponse mapToResponse(Order order) {

        List<OrderResponse.OrderItemResponse> items = order.getItems() == null
                ? List.of()
                : order.getItems().stream()
                    .map(i -> OrderResponse.OrderItemResponse.builder()
                            .productId(i.getProduct().getId())
                            .productName(i.getProduct().getProductName())
                            .quantity(i.getQuantity())
                            .price(i.getPrice())
                            .build())
                    .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus().name())
                .paid(order.isPaid())
                .paymentMethod(order.getPaymentMethod())
                .totalPrice(order.getTotalPrice())
                .buyerName(order.getBuyer().getName())
                .paymentId(order.getPaymentId())
                .createdAt(order.getCreatedAt())
                .items(items)
                .build();
    }
}
