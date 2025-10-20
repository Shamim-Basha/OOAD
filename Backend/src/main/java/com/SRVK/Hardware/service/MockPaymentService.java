package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.PaymentRequestDTO;
import com.SRVK.Hardware.dto.PaymentResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mock Payment Service that simulates a payment gateway
 * Supports CARD and CASH payment methods
 */
@Service
@Slf4j
public class MockPaymentService implements PaymentService {
    
    @Override
    public PaymentResult charge(BigDecimal amount, String method, String details) {
        log.info("Processing payment of {} via {} with details: {}", amount, method, details != null ? "provided" : "none");
        
        // Validate payment method
        if (method == null || method.trim().isEmpty()) {
            log.error("Payment method is required");
            return new PaymentResult(false, null, "Payment method is required");
        }
        
        // Validate amount
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.error("Invalid payment amount: {}", amount);
            return new PaymentResult(false, null, "Invalid payment amount");
        }
        
        // Simulate payment processing based on method
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        switch (method.toUpperCase()) {
            case "CARD":
                return processCardPayment(amount, details, transactionId);
            case "CASH":
                return processCashPayment(amount, transactionId);
            default:
                log.warn("Unknown payment method: {}", method);
                return new PaymentResult(false, null, "Unsupported payment method: " + method);
        }
    }
    
    /**
     * Process card payment with validation
     */
    private PaymentResult processCardPayment(BigDecimal amount, String details, String transactionId) {
        log.info("Processing CARD payment for amount: {}", amount);
        
        // In a real implementation, you would:
        // 1. Parse card details from the details string or PaymentRequestDTO
        // 2. Validate card number (Luhn algorithm)
        // 3. Check expiry date
        // 4. Validate CVV
        // 5. Call actual payment gateway API
        
        // For mock implementation, simulate success with 95% probability
        double random = Math.random();
        if (random < 0.95) {
            log.info("Card payment successful. Transaction ID: {}", transactionId);
            return new PaymentResult(true, transactionId, "Card payment processed successfully");
        } else {
            log.warn("Card payment failed due to insufficient funds");
            return new PaymentResult(false, null, "Card payment failed: Insufficient funds");
        }
    }
    
    /**
     * Process cash payment (always successful, payment on delivery)
     */
    private PaymentResult processCashPayment(BigDecimal amount, String transactionId) {
        log.info("Processing CASH payment for amount: {}", amount);
        log.info("Cash payment will be collected on delivery. Transaction ID: {}", transactionId);
        return new PaymentResult(true, transactionId, "Cash payment will be collected on delivery");
    }
    
    /**
     * Process payment with detailed payment request
     */
    public PaymentResponseDTO processPayment(PaymentRequestDTO request) {
        log.info("Processing payment request: method={}, amount={}", request.getPaymentMethod(), request.getAmount());
        
        PaymentResult result = charge(request.getAmount(), request.getPaymentMethod(), null);
        
        return PaymentResponseDTO.builder()
                .success(result.isSuccess())
                .transactionId(result.getTransactionId())
                .message(result.getMessage())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .timestamp(LocalDateTime.now())
                .build();
    }
}

