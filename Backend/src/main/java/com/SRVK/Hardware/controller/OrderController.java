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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
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
    
    // ==================== ADMIN ENDPOINTS ====================
    
    /**
     * Get all orders (Admin only) - sorted by date descending (newest first)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
            List<OrderResponseDTO> dtos = new ArrayList<>();
            
            for (Order order : orders) {
                List<OrderResponseDTO.Item> items = new ArrayList<>();
                
                // Add product items
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
                
                // Add rental items linked to this order
                List<RentalOrder> rentalOrders = rentalOrderRepository.findByOrderId(order.getId());
                for (RentalOrder rental : rentalOrders) {
                    Tool tool = toolRepository.findById(rental.getToolId()).orElse(null);
                    items.add(OrderResponseDTO.Item.builder()
                        .type("RENTAL")
                        .productId(null)
                        .rentalId(rental.getId())
                        .name(tool != null ? tool.getName() : "Unknown Tool")
                        .quantity(rental.getQuantity())
                        .unitPrice(tool != null ? tool.getDailyRate() : BigDecimal.ZERO)
                        .subtotal(rental.getTotalCost())
                        .rentalStart(rental.getStartDate().atStartOfDay())
                        .rentalEnd(rental.getEndDate().atStartOfDay())
                        .build());
                }
                
                // Determine payment status for COD orders
                String displayPaymentStatus = order.getPaymentStatus();
                if ("CASH".equals(order.getPaymentMethod()) && 
                    !"PAID".equals(order.getPaymentStatus())) {
                    displayPaymentStatus = "COD";
                }
                
                OrderResponseDTO orderDto = OrderResponseDTO.builder()
                    .orderId(order.getId())
                    .userId(order.getUser().getId())
                    .userName(order.getUser().getUsername())
                    .userEmail(order.getUser().getEmail())
                    .total(order.getTotalAmount())
                    .items(items)
                    .paymentStatus(displayPaymentStatus)
                    .transactionId(order.getTransactionId())
                    .paymentMethod(order.getPaymentMethod())
                    .orderDate(order.getCreatedAt())
                    .deliveryStatus(order.getDeliveryStatus())
                    .deliveryAddress(order.getDeliveryAddress())
                    .deliveredAt(order.getDeliveredAt())
                    .build();
                    
                dtos.add(orderDto);
            }
            
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching orders: " + e.getMessage());
        }
    }
    
    /**
     * Get single order details (Admin)
     */
    @GetMapping("/admin/{orderId}")
    public ResponseEntity<?> getOrderById(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            List<OrderResponseDTO.Item> items = new ArrayList<>();
            
            // Add product items
            for (OrderItem oi : order.getItems()) {
                items.add(OrderResponseDTO.Item.builder()
                    .type("PRODUCT")
                    .productId(oi.getProduct().getId())
                    .name(oi.getProduct().getName())
                    .quantity(oi.getQuantity())
                    .unitPrice(oi.getUnitPrice())
                    .subtotal(oi.getSubtotal())
                    .build());
            }
            
            // Add rental items linked to this order
            List<RentalOrder> rentalOrders = rentalOrderRepository.findByOrderId(order.getId());
            for (RentalOrder rental : rentalOrders) {
                Tool tool = toolRepository.findById(rental.getToolId()).orElse(null);
                items.add(OrderResponseDTO.Item.builder()
                    .type("RENTAL")
                    .productId(null)
                    .rentalId(rental.getId())
                    .name(tool != null ? tool.getName() : "Unknown Tool")
                    .quantity(rental.getQuantity())
                    .unitPrice(tool != null ? tool.getDailyRate() : BigDecimal.ZERO)
                    .subtotal(rental.getTotalCost())
                    .rentalStart(rental.getStartDate().atStartOfDay())
                    .rentalEnd(rental.getEndDate().atStartOfDay())
                    .build());
            }
            
            // Determine payment status for COD orders
            String displayPaymentStatus = order.getPaymentStatus();
            if ("CASH".equals(order.getPaymentMethod()) && 
                !"PAID".equals(order.getPaymentStatus())) {
                displayPaymentStatus = "COD";
            }
            
            OrderResponseDTO orderDto = OrderResponseDTO.builder()
                .orderId(order.getId())
                .userId(order.getUser().getId())
                .userName(order.getUser().getUsername())
                .userEmail(order.getUser().getEmail())
                .total(order.getTotalAmount())
                .items(items)
                .paymentStatus(displayPaymentStatus)
                .transactionId(order.getTransactionId())
                .paymentMethod(order.getPaymentMethod())
                .orderDate(order.getCreatedAt())
                .deliveryStatus(order.getDeliveryStatus())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveredAt(order.getDeliveredAt())
                .build();
            
            return ResponseEntity.ok(orderDto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching order: " + e.getMessage());
        }
    }
    
    /**
     * Update delivery status (Admin only)
     */
    @PutMapping("/admin/{orderId}/delivery-status")
    public ResponseEntity<?> updateDeliveryStatus(
            @PathVariable Long orderId,
            @RequestBody DeliveryStatusUpdateRequest request) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            order.setDeliveryStatus(request.getDeliveryStatus());
            
            // If status is DELIVERED, set delivered timestamp
            if (Order.DELIVERY_DELIVERED.equals(request.getDeliveryStatus())) {
                order.setDeliveredAt(java.time.LocalDateTime.now());
            }
            
            if (request.getDeliveryAddress() != null) {
                order.setDeliveryAddress(request.getDeliveryAddress());
            }
            
            order.setUpdatedAt(java.time.LocalDateTime.now());
            orderRepository.save(order);
            
            return ResponseEntity.ok().body("{\"message\":\"Delivery status updated successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating delivery status: " + e.getMessage());
        }
    }
    
    /**
     * Update payment status from COD to PAID (Admin only)
     */
    @PutMapping("/admin/{orderId}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Order order = orderOpt.get();
            
            // Only allow updating from COD to PAID
            if (!"COD".equals(order.getPaymentStatus())) {
                return ResponseEntity.badRequest().body("Order payment status is not COD");
            }
            
            order.setPaymentStatus("PAID");
            order.setStatus(Order.STATUS_PAID);
            order.setPaymentDate(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            orderRepository.save(order);
            
            return ResponseEntity.ok().body("{\"message\":\"Payment status updated to PAID\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating payment status: " + e.getMessage());
        }
    }
    
    /**
     * Delete order (Admin only)
     */
    @DeleteMapping("/admin/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long orderId) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            orderRepository.deleteById(orderId);
            return ResponseEntity.ok().body("{\"message\":\"Order deleted successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting order: " + e.getMessage());
        }
    }
    
    // DTO for delivery status update
    @lombok.Data
    public static class DeliveryStatusUpdateRequest {
        private String deliveryStatus;
        private String deliveryAddress;
    }
}