package com.SRVK.Hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequestDTO {
    private Long userId;
    private List<CartKeyProduct> selectedProducts;
    private List<CartKeyRental> selectedRentals;
    private String paymentMethod;
}


