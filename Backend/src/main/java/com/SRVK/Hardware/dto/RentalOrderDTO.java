package com.SRVK.Hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalOrderDTO {
    private Long rentalOrderId;
    private Long toolId;
    private int quantity;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
    private BigDecimal totalCost;
    private String status;
}