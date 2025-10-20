package com.SRVK.Hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for order creation including payment information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long orderId;
    private Long userId;
    private String userName;
    private String userEmail;
    private BigDecimal total;
    private List<Item> items;
    private String paymentStatus;
    private String transactionId;
    private String paymentMethod;
    private LocalDateTime orderDate;
    private String deliveryStatus;
    private String deliveryAddress;
    private LocalDateTime deliveredAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private String type; // PRODUCT or RENTAL
        private Long productId;
        private Long rentalId;
        private String name;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private LocalDateTime rentalStart;
        private LocalDateTime rentalEnd;
    }
}

