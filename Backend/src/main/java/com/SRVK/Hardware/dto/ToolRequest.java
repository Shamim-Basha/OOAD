package com.SRVK.Hardware.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ToolRequest {
    private Long id;
    private String name;
    private BigDecimal dailyRate;
    private String category;
    private boolean available;
    private Integer totalStock;
    private Integer stockQuantity;
    private String description;
    private String image; // Base64 string
}
