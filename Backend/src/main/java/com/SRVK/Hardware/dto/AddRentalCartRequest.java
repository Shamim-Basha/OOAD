package com.SRVK.Hardware.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class AddRentalCartRequest {
    private Long userId;
    /**
     * This is actually the toolId, but we keep the name 'rentalId' for API compatibility with frontend.
     * In the RentalCart entity, this field maps to toolId in the composite key.
     */
    private Long rentalId; 
    private Integer quantity;
    private LocalDate rentalStart;
    private LocalDate rentalEnd;
}


