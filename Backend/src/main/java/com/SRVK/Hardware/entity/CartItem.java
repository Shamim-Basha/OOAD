package com.SRVK.Hardware.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cart_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // relation to cart
    @ManyToOne
    @JoinColumn(name = "cart_id")
    @JsonIgnore
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    // Tool support - store tool information directly since we can't easily modify the schema
    private Long toolId;
    private String toolName;
    private String toolDescription;
    private String toolCategory;
    private String toolImageUrl;

    private int quantity;

    private BigDecimal unitPrice;

    private BigDecimal subtotal;

    // Rental support (optional)
    private boolean rental;

    private LocalDate rentalStart;

    private LocalDate rentalEnd;

}
