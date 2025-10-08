package com.SRVK.Hardware.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartProductItemDTO {
    private Long userId;
    private Long productId;
    private String name; // Changed from productName to name
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal; // Added subtotal
    private byte[] image; // Product image bytes (base64-encoded by Jackson)
}


