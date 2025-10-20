package com.SRVK.Hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {
    private Long userId;
    private List<Key> selectedProducts;
    private List<Key> selectedRentals;
    private String paymentMethod; // CARD, UPI, CASH
    private String paymentDetails; // JSON string or simple string
    
    // Payment details for CARD
    private String cardNumber;
    private String cardHolderName;
    private String expiryMonth;
    private String expiryYear;
    private String cvv;
    
    // Payment details for UPI
    private String upiId;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Key {
        private Long userId;
        private Long productId; // nullable when rental
        private Long rentalId;  // nullable when product
    }
}

