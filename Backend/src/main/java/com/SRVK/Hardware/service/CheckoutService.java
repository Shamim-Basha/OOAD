package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.CheckoutRequestDTO;
import com.SRVK.Hardware.dto.OrderResponseDTO;
import com.SRVK.Hardware.entity.*;
import com.SRVK.Hardware.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckoutService {

    private final ProductCartRepository productCartRepository;
    private final RentalCartRepository rentalCartRepository;
    private final ProductRepository productRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponseDTO checkout(CheckoutRequestDTO request) {
        log.info("Checkout attempt for user {}", request.getUserId());
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate and compute totals
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        if (request.getSelectedProducts() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedProducts()) {
                ProductCart.ProductCartKey id = new ProductCart.ProductCartKey(key.getUserId(), key.getProductId());
                ProductCart pc = productCartRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Product cart item not found"));
                Product product = pc.getProduct();
                if (pc.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
                if (product.getStockQuantity() < pc.getQuantity()) throw new IllegalArgumentException("Insufficient stock for product " + product.getName());
                BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(pc.getQuantity()));
                total = total.add(subtotal);
                orderItems.add(OrderItem.builder()
                        .product(product)
                        .rental(null)
                        .quantity(pc.getQuantity())
                        .unitPrice(product.getPrice())
                        .subtotal(subtotal)
                        .build());
            }
        }

        if (request.getSelectedRentals() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedRentals()) {
                RentalCart.RentalCartKey id = new RentalCart.RentalCartKey(key.getUserId(), key.getRentalId());
                RentalCart rc = rentalCartRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Rental cart item not found"));
                Rental rental = rc.getRental();
                if (rc.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
                if (rc.getRentalStart() == null || rc.getRentalEnd() == null || !rc.getRentalStart().isBefore(rc.getRentalEnd()))
                    throw new IllegalArgumentException("Invalid rental dates");
                if (rental.getStockQuantity() < rc.getQuantity()) throw new IllegalArgumentException("Insufficient stock for rental " + rental.getName());
                long days = ChronoUnit.DAYS.between(rc.getRentalStart(), rc.getRentalEnd());
                BigDecimal subtotal = rental.getDailyRate().multiply(BigDecimal.valueOf(rc.getQuantity())).multiply(BigDecimal.valueOf(days));
                total = total.add(subtotal);
                orderItems.add(OrderItem.builder()
                        .product(null)
                        .rental(rental)
                        .quantity(rc.getQuantity())
                        .unitPrice(rental.getDailyRate())
                        .subtotal(subtotal)
                        .rentalStart(rc.getRentalStart())
                        .rentalEnd(rc.getRentalEnd())
                        .build());
            }
        }

        // Adjust stock
        if (request.getSelectedProducts() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedProducts()) {
                Product product = productRepository.findById(key.getProductId()).orElseThrow();
                ProductCart pc = productCartRepository.findById(new ProductCart.ProductCartKey(key.getUserId(), key.getProductId())).orElseThrow();
                product.setStockQuantity(product.getStockQuantity() - pc.getQuantity());
                productRepository.save(product);
            }
        }
        if (request.getSelectedRentals() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedRentals()) {
                Rental rental = rentalRepository.findById(key.getRentalId()).orElseThrow();
                RentalCart rc = rentalCartRepository.findById(new RentalCart.RentalCartKey(key.getUserId(), key.getRentalId())).orElseThrow();
                rental.setStockQuantity(rental.getStockQuantity() - rc.getQuantity());
                rentalRepository.save(rental);
            }
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .status("CREATED")
                .createdAt(LocalDateTime.now())
                .build();
        order = orderRepository.save(order);

        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
            orderItemRepository.save(oi);
        }

        // Payment
        PaymentService.PaymentResult result = paymentService.charge(total, request.getPaymentMethod(), request.getPaymentDetails());
        if (!result.isSuccess()) {
            throw new IllegalStateException("Payment failed: " + result.getMessage());
        }

        Payment payment = Payment.builder()
                .order(order)
                .amount(total)
                .method(request.getPaymentMethod())
                .status("SUCCESS")
                .transactionId(result.getTransactionId())
                .createdAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        order.setStatus("PAID");
        orderRepository.save(order);

        // Clear carts
        if (request.getSelectedProducts() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedProducts()) {
                productCartRepository.deleteByIdUserIdAndIdProductId(key.getUserId(), key.getProductId());
            }
        }
        if (request.getSelectedRentals() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedRentals()) {
                rentalCartRepository.deleteByIdUserIdAndIdRentalId(key.getUserId(), key.getRentalId());
            }
        }

        // Response DTO
        List<OrderResponseDTO.Item> items = new ArrayList<>();
        for (OrderItem oi : orderItems) {
            items.add(OrderResponseDTO.Item.builder()
                    .type(oi.getProduct() != null ? "PRODUCT" : "RENTAL")
                    .productId(oi.getProduct() != null ? oi.getProduct().getId() : null)
                    .rentalId(oi.getRental() != null ? oi.getRental().getId() : null)
                    .name(oi.getProduct() != null ? oi.getProduct().getName() : oi.getRental().getName())
                    .quantity(oi.getQuantity())
                    .unitPrice(oi.getUnitPrice())
                    .subtotal(oi.getSubtotal())
                    .rentalStart(oi.getRentalStart())
                    .rentalEnd(oi.getRentalEnd())
                    .build());
        }
        return OrderResponseDTO.builder().orderId(order.getId()).total(total).items(items).build();
    }
}


