package com.SRVK.Hardware.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {
    private Long orderId;
    private BigDecimal total;
    private List<Item> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
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


