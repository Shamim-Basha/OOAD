package com.SRVK.Hardware.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Slf4j
public class MockPaymentService implements PaymentService {
    @Override
    public PaymentResult charge(BigDecimal amount, String method, String details) {
        log.info("Charging {} via {} with details {}", amount, method, details != null ? "provided" : "none");
        // Always succeed for mock
        return new PaymentResult(true, UUID.randomUUID().toString(), "Mock payment success");
    }
}


