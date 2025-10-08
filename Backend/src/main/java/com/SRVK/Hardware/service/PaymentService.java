package com.SRVK.Hardware.service;

import lombok.*;

import java.math.BigDecimal;

public interface PaymentService {
    PaymentResult charge(BigDecimal amount, String method, String details);

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    class PaymentResult {
        private boolean success;
        private String transactionId;
        private String message;
    }
}


