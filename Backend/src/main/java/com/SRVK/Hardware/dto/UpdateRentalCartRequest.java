package com.SRVK.Hardware.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateRentalCartRequest {
    private Integer quantity;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
}


