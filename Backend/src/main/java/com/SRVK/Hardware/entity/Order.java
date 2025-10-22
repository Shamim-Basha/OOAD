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
     * Delivery status constants
     */
    public static final String DELIVERY_PENDING = "PENDING";
    public static final String DELIVERY_PROCESSING = "PROCESSING";
    public static final String DELIVERY_SHIPPED = "SHIPPED";
    public static final String DELIVERY_DELIVERED = "DELIVERED";
    public static final String DELIVERY_CANCELLED = "CANCELLED";
    
    /**
     * Payment method constants
     */
    public static final String PAYMENT_METHOD_CARD = "CARD";
    public static final String PAYMENT_METHOD_CASH = "CASH";
    
    /**giv e
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

    @Column(name = "created_at", nullable = false, columnDefinition = "datetime")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", columnDefinition = "datetime")
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
    
    @Column(name = "payment_date", columnDefinition = "datetime")
    private LocalDateTime paymentDate;
    
    /**
     * Delivery status: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED
     */
    @Column(name = "delivery_status")
    @Builder.Default
    private String deliveryStatus = DELIVERY_PENDING;
    
    @Column(name = "delivery_address")
    private String deliveryAddress;
    
    @Column(name = "delivered_at", columnDefinition = "datetime")
    private LocalDateTime deliveredAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    
    @Column(name = "order_type")
    @Builder.Default
    private String orderType = "PRODUCT"; // PRODUCT, RENTAL, or MIXED
}


