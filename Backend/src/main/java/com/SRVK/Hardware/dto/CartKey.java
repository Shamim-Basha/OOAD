package com.SRVK.Hardware.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartKey {
    private Long userId;
    private Long productId; // or null
    private Long rentalId;  // or null
}