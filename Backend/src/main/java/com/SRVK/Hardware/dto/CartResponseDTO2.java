package com.SRVK.Hardware.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartResponseDTO2 {
    private List<ProductCartItemDTO2> products;
    private List<RentalCartItemDTO2> rentals;
}