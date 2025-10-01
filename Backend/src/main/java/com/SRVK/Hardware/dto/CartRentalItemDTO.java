package com.SRVK.Hardware.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CartRentalItemDTO {
    private Long userId;
    private Long rentalId;
    private String productName;
    private BigDecimal unitPrice; // daily rate
    private Integer quantity;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
}


