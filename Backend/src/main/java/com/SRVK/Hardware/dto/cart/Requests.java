package com.SRVK.Hardware.dto.cart;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Requests {
    // Add to product cart
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddToProductCartRequest {
        private Long userId;
        private Long productId;
        private Integer quantity;
    }

    // Add to rental cart
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddToRentalCartRequest {
        private Long userId;
        private Long rentalId;
        private Integer quantity;
        private LocalDate rentalStart;
        private LocalDate rentalEnd;
    }

    // Update product cart
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateProductCartRequest {
        private Integer quantity;
    }

    // Update rental cart
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRentalCartRequest {
        private Integer quantity;
        private LocalDate rentalStart;
        private LocalDate rentalEnd;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartKey {
        private Long userId;
        private Long productId; // or null
        private Long rentalId;  // or null
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CheckoutRequest {
        private Long userId;
        private List<CartKey> selectedProducts;
        private List<CartKey> selectedRentals;
        private String paymentMethod;
        private String paymentDetails; // opaque string for mock payments
    }
}


