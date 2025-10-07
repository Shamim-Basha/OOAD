package com.SRVK.Hardware.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCartItemDTO2 {
    private Long userId;
    private Long productId;
    private String name;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal subtotal;
}