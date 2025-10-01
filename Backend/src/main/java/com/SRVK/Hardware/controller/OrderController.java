package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.order.OrderResponseDTO;
import com.SRVK.Hardware.entity.Order;
import com.SRVK.Hardware.repository.OrderRepository;
import com.SRVK.Hardware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getOrders(@PathVariable Long userId) {
        var user = userRepository.findById(userId).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("User not found");
        List<Order> orders = orderRepository.findByUser(user);
        var dtos = orders.stream().map(order -> OrderResponseDTO.builder()
                .orderId(order.getId())
                .total(order.getTotalAmount())
                .items(order.getItems().stream().map(oi -> OrderResponseDTO.Item.builder()
                        .type(oi.getProduct() != null ? "PRODUCT" : "RENTAL")
                        .productId(oi.getProduct() != null ? oi.getProduct().getId() : null)
                        .rentalId(oi.getRental() != null ? oi.getRental().getId() : null)
                        .name(oi.getProduct() != null ? oi.getProduct().getName() : oi.getRental().getName())
                        .quantity(oi.getQuantity())
                        .unitPrice(oi.getUnitPrice())
                        .subtotal(oi.getSubtotal())
                        .rentalStart(oi.getRentalStart())
                        .rentalEnd(oi.getRentalEnd())
                        .build()).collect(Collectors.toList()))
                .build()).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}


