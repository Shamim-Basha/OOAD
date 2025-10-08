package com.SRVK.Hardware.dto;

import lombok.Data;

@Data
public class AddProductCartRequest {
    private Long userId;
    private Long productId;
    private Integer quantity;
}


