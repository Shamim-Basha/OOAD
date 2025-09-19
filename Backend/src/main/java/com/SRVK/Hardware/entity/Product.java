package com.SRVK.Hardware.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 50)
    private String name;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "subCategory", nullable = false, length = 50)
    private String subCategory;

    @Column(name = "description", nullable = false, length = 100)
    private String description;

    @Column(name = "price", nullable = false)
    private int price;

    @Lob
    @Column(columnDefinition ="MEDIUMBLOB")
    private byte[] image;
}
