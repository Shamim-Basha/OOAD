package com.SRVK.Hardware.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_cart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalCart {

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RentalCartKey implements Serializable {
        @Column(name = "user_id")
        private Long userId;

        @Column(name = "tool_id")
        private Long toolId;
    }

    @EmbeddedId
    private RentalCartKey id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("toolId")
    @JoinColumn(name = "tool_id", referencedColumnName = "id")
    private Tool tool;

    @Column(nullable = false)
    private Integer quantity;

    private LocalDate rentalStart;
    private LocalDate rentalEnd;

    @Column(name = "total_cost")
    private BigDecimal totalCost;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;
}


