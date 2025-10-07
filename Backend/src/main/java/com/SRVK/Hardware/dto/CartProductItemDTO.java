package com.SRVK.Hardware.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartProductItemDTO {
    private Long userId;
    private Long productId;
    private String productName;
    private BigDecimal unitPrice;
    private Integer quantity;
}


