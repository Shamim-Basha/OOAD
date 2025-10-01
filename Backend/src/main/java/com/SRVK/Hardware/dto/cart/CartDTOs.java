package com.SRVK.Hardware.dto.cart;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDTOs {
    private List<ProductCartItemDTO> products;
    private List<RentalCartItemDTO> rentals;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductCartItemDTO {
        private Long userId;
        private Long productId;
        private String name;
        private BigDecimal unitPrice;
        private Integer quantity;
        private BigDecimal subtotal;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RentalCartItemDTO {
        private Long userId;
        private Long rentalId;
        private String name;
        private BigDecimal dailyRate;
        private Integer quantity;
        private LocalDate rentalStart;
        private LocalDate rentalEnd;
        private BigDecimal subtotal;
    }
}


