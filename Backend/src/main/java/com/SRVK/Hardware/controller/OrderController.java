package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.OrderItemDTO;
import com.SRVK.Hardware.dto.OrderResponseDTO;
import com.SRVK.Hardware.dto.RentalOrderDTO;
import com.SRVK.Hardware.entity.Order;
import com.SRVK.Hardware.entity.OrderItem;
import com.SRVK.Hardware.entity.RentalOrder;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.repository.OrderRepository;
import com.SRVK.Hardware.repository.RentalOrderRepository;
import com.SRVK.Hardware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RentalOrderRepository rentalOrderRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getOrders(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        List<Order> orders = orderRepository.findByUser(userOpt.get());
        List<OrderResponseDTO> dtos = new ArrayList<>();
        
        for (Order order : orders) {
            List<OrderItemDTO> productItems = new ArrayList<>();
            List<RentalOrderDTO> rentalItems = new ArrayList<>();
            
            // OrderItem now only handles products, not rentals
            for (OrderItem oi : order.getItems()) {
                // Create product item DTO
                OrderItemDTO productItem = OrderItemDTO.builder()
                    .productId(oi.getProduct().getId())
                    .quantity(oi.getQuantity())
                    .unitPrice(oi.getUnitPrice())
                    .subtotal(oi.getSubtotal())
                    .build();
                
                productItems.add(productItem);
                
                // Note: Rental items are now handled separately through RentalOrderRepository
                // and are not part of the OrderItem entity
            }
            
            // Get rental orders for this user from the separate rental system
            List<RentalOrder> userRentals = rentalOrderRepository.findByUserId(userId);
            
            // Convert rental orders to DTOs
            for (RentalOrder rental : userRentals) {
                rentalItems.add(RentalOrderDTO.builder()
                    .rentalOrderId(rental.getId())
                    .toolId(rental.getToolId())
                    .quantity(rental.getQuantity())
                    .rentalStart(rental.getStartDate())
                    .rentalEnd(rental.getEndDate())
                    .totalCost(rental.getTotalCost())
                    .status(rental.getStatus().toString())
                    .build());
            }
            
            OrderResponseDTO orderDto = OrderResponseDTO.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .orderItems(productItems)
                .rentalOrders(rentalItems)
                .build();
                
            dtos.add(orderDto);
        }
        
        return ResponseEntity.ok(dtos);
    }
}