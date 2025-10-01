package com.SRVK.Hardware.dto;

import lombok.Data;

import java.util.List;

@Data
public class CheckoutRequestDTO {
    private Long userId;
    private List<Key> selectedProducts;
    private List<Key> selectedRentals;
    private String paymentMethod;
    private String paymentDetails;

    @Data
    public static class Key {
        private Long userId;
        private Long productId; // nullable when rental
        private Long rentalId;  // nullable when product
    }
}


