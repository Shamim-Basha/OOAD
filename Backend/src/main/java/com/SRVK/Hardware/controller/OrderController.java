package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.OrderResponseDTO;
import com.SRVK.Hardware.entity.Order;
import com.SRVK.Hardware.entity.OrderItem;
import com.SRVK.Hardware.entity.RentalOrder;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.repository.OrderRepository;
import com.SRVK.Hardware.repository.RentalOrderRepository;
import com.SRVK.Hardware.repository.ToolRepository;
import com.SRVK.Hardware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
    private final ToolRepository toolRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getOrders(@PathVariable Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        List<Order> orders = orderRepository.findByUser(userOpt.get());
        List<OrderResponseDTO> dtos = new ArrayList<>();
        
        for (Order order : orders) {
            List<OrderResponseDTO.Item> items = new ArrayList<>();
            
            // Add product items from OrderItem
            for (OrderItem oi : order.getItems()) {
                items.add(OrderResponseDTO.Item.builder()
                    .type("PRODUCT")
                    .productId(oi.getProduct().getId())
                    .rentalId(null)
                    .name(oi.getProduct().getName())
                    .quantity(oi.getQuantity())
                    .unitPrice(oi.getUnitPrice())
                    .subtotal(oi.getSubtotal())
                    .rentalStart(null)
                    .rentalEnd(null)
                    .build());
            }
            
            // Get rental orders for this user from the separate rental system
            List<RentalOrder> userRentals = rentalOrderRepository.findByUserId(userId);
            
            // Add rental items
            for (RentalOrder rental : userRentals) {
                Tool tool = toolRepository.findById(rental.getToolId()).orElse(null);
                items.add(OrderResponseDTO.Item.builder()
                    .type("RENTAL")
                    .productId(null)
                    .rentalId(rental.getToolId())
                    .name(tool != null ? tool.getName() : "Unknown Tool")
                    .quantity(rental.getQuantity())
                    .unitPrice(tool != null ? tool.getDailyRate() : BigDecimal.ZERO)
                    .subtotal(rental.getTotalCost())
                    .rentalStart(rental.getStartDate().atStartOfDay())
                    .rentalEnd(rental.getEndDate().atStartOfDay())
                    .build());
            }
            
            OrderResponseDTO orderDto = OrderResponseDTO.builder()
                .orderId(order.getId())
                .total(order.getTotalAmount())
                .items(items)
                .paymentStatus(order.getPaymentStatus())
                .transactionId(order.getTransactionId())
                .paymentMethod(order.getPaymentMethod())
                .orderDate(order.getCreatedAt())
                .build();
                
            dtos.add(orderDto);
        }
        
        return ResponseEntity.ok(dtos);
    }
}