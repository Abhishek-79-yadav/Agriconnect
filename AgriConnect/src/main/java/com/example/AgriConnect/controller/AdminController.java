package com.example.AgriConnect.controller;

import com.example.AgriConnect.dto.response.FarmerPayoutResponse;
import com.example.AgriConnect.dto.response.OrderResponse;
import com.example.AgriConnect.entity.User;
import com.example.AgriConnect.entity.Product;
import com.example.AgriConnect.repository.UserRepository;
import com.example.AgriConnect.repository.ProductRepository;
import com.example.AgriConnect.service.OrderService;
import com.example.AgriConnect.service.PayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepo;
    private final ProductRepository productRepo;
    private final OrderService orderService;
    private final PayoutService payoutService;

    // All Users
    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepo.findAll();
    }

    // All Products
    @GetMapping("/products")
    public List<Product> getProducts() {
        return productRepo.findAll();
    }

    // All Orders
    @GetMapping("/orders")
    public List<OrderResponse> getOrders() {
        return orderService.getAllOrders();
    }

    // Delete User
    @DeleteMapping("/user/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepo.deleteById(id);
        return "User Deleted";
    }

    // Delete Product
    @DeleteMapping("/product/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productRepo.deleteById(id);
        return "Product Deleted";
    }

    // How much each farmer is owed (from paid orders) vs already paid out.
    @GetMapping("/payouts")
    public List<FarmerPayoutResponse> getPayouts() {
        return payoutService.getPayoutSummary();
    }

    // Mark one order line as paid out to its farmer (manual payout —
    // actual bank transfer happens outside the app for now).
    @PutMapping("/payouts/{orderItemId}/mark-paid")
    public String markPaidOut(@PathVariable Long orderItemId) {
        payoutService.markPaidOut(orderItemId);
        return "Marked as paid out";
    }
}
