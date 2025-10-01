package com.SRVK.Hardware.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class OrderResponseDTO {
    private Long orderId;
    private BigDecimal total;
    private List<Item> items;

    @Data
    public static class Item {
        private String type;
        private Long productId;
        private Long rentalId;
        private String name;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private LocalDate rentalStart;
        private LocalDate rentalEnd;
    }
}


