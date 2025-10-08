package com.SRVK.Hardware.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalCartItemDTO2 {
    private Long userId;
    private Long rentalId;
    private String name;
    private BigDecimal dailyRate;
    private Integer quantity;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
    private BigDecimal subtotal;
}