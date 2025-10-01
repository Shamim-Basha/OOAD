package com.SRVK.Hardware.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartResponseDTO {
    private List<CartProductItemDTO> products;
    private List<CartRentalItemDTO> rentals;
}


