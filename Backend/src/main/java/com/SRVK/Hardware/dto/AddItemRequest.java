package com.SRVK.Hardware.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AddItemRequest {
    private Long userId;
    private Long productId;
    private int quantity;
    private boolean rental;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
}
