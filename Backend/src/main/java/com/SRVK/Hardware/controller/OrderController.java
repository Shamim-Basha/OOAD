package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.OrderResponseDTO;
import com.SRVK.Hardware.entity.Order;
import com.SRVK.Hardware.entity.OrderItem;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.repository.OrderRepository;
import com.SRVK.Hardware.repository.ToolRepository;
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
            List<OrderResponseDTO.Item> itemDtos = new ArrayList<>();
            
            for (OrderItem oi : order.getItems()) {
                String itemName = "";
                if (oi.getProduct() != null) {
                    itemName = oi.getProduct().getName();
                } else if (oi.getToolId() != null) {
                    Optional<Tool> toolOpt = toolRepository.findById(oi.getToolId());
                    if (toolOpt.isPresent()) {
                        itemName = toolOpt.get().getName();
                    }
                }
                
                OrderResponseDTO.Item itemDto = OrderResponseDTO.Item.builder()
                    .type(oi.getProduct() != null ? "PRODUCT" : "RENTAL")
                    .productId(oi.getProduct() != null ? oi.getProduct().getId() : null)
                    .rentalId(oi.getToolId())
                    .name(itemName)
                    .quantity(oi.getQuantity())
                    .unitPrice(oi.getUnitPrice())
                    .subtotal(oi.getSubtotal())
                    .rentalStart(oi.getRentalStart())
                    .rentalEnd(oi.getRentalEnd())
                    .build();
                    
                itemDtos.add(itemDto);
            }
            
            OrderResponseDTO orderDto = OrderResponseDTO.builder()
                .orderId(order.getId())
                .total(order.getTotalAmount())
                .items(itemDtos)
                .build();
                
            dtos.add(orderDto);
        }
        
        return ResponseEntity.ok(dtos);
    }
}