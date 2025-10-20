package com.SRVK.Hardware.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "tools")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private BigDecimal dailyRate;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private boolean available;

    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 1;

    @Column(length = 2000)
    private String description;

    @Lob
    private byte[] image;

    // Helper method to check if tool has available stock
    public boolean hasAvailableStock() {
        return available && stockQuantity > 0;
    }

    // Helper method to check if tool has enough stock for rental
    public boolean hasEnoughStock(int requestedQuantity) {
        return available && stockQuantity >= requestedQuantity;
    }
}


