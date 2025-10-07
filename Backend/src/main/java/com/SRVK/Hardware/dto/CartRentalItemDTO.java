package com.SRVK.Hardware.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartRentalItemDTO {
    private Long userId;
    /**
     * This represents the Tool ID from the RentalCart entity.
     * It's named 'rentalId' for frontend API compatibility, but it's actually the toolId.
     * The frontend expects this field to identify rental items in the cart.
     */
    private Long rentalId;
    private String name;
    private BigDecimal dailyRate;
    private Integer quantity;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
    private BigDecimal subtotal;
}


