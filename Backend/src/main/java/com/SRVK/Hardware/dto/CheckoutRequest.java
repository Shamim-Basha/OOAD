package com.SRVK.Hardware.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckoutRequest {
    private Long userId;
    private List<CartKey> selectedProducts;
    private List<CartKey> selectedRentals;
    private String paymentMethod;
    private String paymentDetails; // opaque string for mock payments
}