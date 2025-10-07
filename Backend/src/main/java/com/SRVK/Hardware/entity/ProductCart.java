package com.SRVK.Hardware.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_cart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCart {

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductCartKey implements Serializable {
        @Column(name = "user_id")
        private Long userId;

        @Column(name = "product_id")
        private Long productId;
    }

    @EmbeddedId
    private ProductCartKey id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("productId")
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;
}


