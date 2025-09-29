package com.SRVK.Hardware.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class CartItemResponseDTO {
    private Long itemId;
    private Long productId;
    private int quantity;
    private boolean rental;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
}
