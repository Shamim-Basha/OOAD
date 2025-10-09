package com.SRVK.Hardware.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a customer order, including both products and payment information.
 * This entity consolidates order and payment information that was previously split between
 * Order and Payment entities.
 */
@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    /**
     * Order status constants
     */
    public static final String STATUS_CREATED = "CREATED";
    public static final String STATUS_PAID = "PAID";
    public static final String STATUS_FAILED = "FAILED";
    
    /**
     * Payment method constants
     */
    public static final String PAYMENT_METHOD_CARD = "CARD";
    public static final String PAYMENT_METHOD_UPI = "UPI";
    public static final String PAYMENT_METHOD_CASH = "CASH";
    
    /**
     * Payment status constants
     */
    public static final String PAYMENT_STATUS_SUCCESS = "SUCCESS";
    public static final String PAYMENT_STATUS_FAILED = "FAILED";
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    /**
     * Order status: CREATED, PAID, FAILED
     */
    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Payment fields integrated from the previous Payment entity
     */
    @Column(name = "payment_amount")
    private BigDecimal paymentAmount;
    
    /**
     * Payment method: CARD, UPI, CASH
     */
    @Column(name = "payment_method")
    private String paymentMethod;
    
    /**
     * Payment status: SUCCESS, FAILED
     */
    @Column(name = "payment_status")
    private String paymentStatus;
    
    @Column(name = "transaction_id")
    private String transactionId;
    
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}


