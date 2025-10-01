package com.SRVK.Hardware.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AddRentalCartRequest {
    private Long userId;
    private Long rentalId;
    private Integer quantity;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
}


