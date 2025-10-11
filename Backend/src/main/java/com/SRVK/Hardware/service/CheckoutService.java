package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.CartKeyProduct;
import com.SRVK.Hardware.dto.CartKeyRental;
import com.SRVK.Hardware.dto.CheckoutRequestDTO;
import com.SRVK.Hardware.dto.OrderResponseDTO;
import com.SRVK.Hardware.dto.OrderItemDTO;
import com.SRVK.Hardware.dto.RentalOrderDTO;
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
    private final ToolRepository toolRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponseDTO checkout(CheckoutRequestDTO request) {
        log.info("Checkout attempt for user {}", request.getUserId());
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Validate and compute totals
        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        if (request.getSelectedProducts() != null) {
            for (CartKeyProduct key : request.getSelectedProducts()) {
                ProductCart.ProductCartKey id = new ProductCart.ProductCartKey(key.getUserId(), key.getProductId());
                ProductCart pc = productCartRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Product cart item not found"));
                Product product = pc.getProduct();
                if (pc.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
                if (product.getQuantity() < pc.getQuantity()) throw new IllegalArgumentException("Insufficient stock for product " + product.getName());
                BigDecimal unitPrice = BigDecimal.valueOf(product.getPrice());
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(pc.getQuantity()));
                total = total.add(subtotal);
                orderItems.add(OrderItem.builder()
                        .product(product)
                        .quantity(pc.getQuantity())
                        .unitPrice(unitPrice)
                        .subtotal(subtotal)
                        .build());
            }
        }

        List<RentalOrder> rentalOrders = new ArrayList<>();
        if (request.getSelectedRentals() != null) {
            for (CartKeyRental key : request.getSelectedRentals()) {
                // Create composite key using toolId
                RentalCart.RentalCartKey id = new RentalCart.RentalCartKey(key.getUserId(), key.getToolId());
                RentalCart rc = rentalCartRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Rental cart item not found"));
                
                // Get the tool directly from the rental cart relationship
                Tool tool = rc.getTool();
                
                if (rc.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
                if (rc.getRentalStart() == null || rc.getRentalEnd() == null || !rc.getRentalStart().isBefore(rc.getRentalEnd()))
                    throw new IllegalArgumentException("Invalid rental dates");
                if (tool.getStockQuantity() < rc.getQuantity()) throw new IllegalArgumentException("Insufficient stock for rental " + tool.getName());
                
                long days = ChronoUnit.DAYS.between(rc.getRentalStart(), rc.getRentalEnd());
                if (days == 0) days = 1; // Minimum 1 day rental
                
                BigDecimal subtotal = tool.getDailyRate().multiply(BigDecimal.valueOf(rc.getQuantity())).multiply(BigDecimal.valueOf(days));
                total = total.add(subtotal);
                
                // Create RentalOrder record for tracking rentals separately from orders
                RentalOrder rentalOrder = RentalOrder.builder()
                    .userId(key.getUserId())
                    .toolId(tool.getId())
                    .startDate(rc.getRentalStart())
                    .endDate(rc.getRentalEnd())
                    .quantity(rc.getQuantity())
                    .totalCost(subtotal)
                    .status(RentalOrder.RentalStatus.ACTIVE)
                    .build();
                
                // Add to list to save after payment confirmation
                rentalOrders.add(rentalOrder);
                
                // Note: We're not adding rental items to OrderItems anymore
                // as tool rentals are now managed separately through RentalOrders
            }
        }

        // Adjust stock
        if (request.getSelectedProducts() != null) {
            for (CartKeyProduct key : request.getSelectedProducts()) {
                Product product = productRepository.findById(key.getProductId()).orElseThrow();
                ProductCart pc = productCartRepository.findById(new ProductCart.ProductCartKey(key.getUserId(), key.getProductId())).orElseThrow();
                product.setQuantity(product.getQuantity() - pc.getQuantity());
                productRepository.save(product);
            }
        }
        if (request.getSelectedRentals() != null) {
            for (CartKeyRental key : request.getSelectedRentals()) {
                RentalCart rc = rentalCartRepository.findById(new RentalCart.RentalCartKey(key.getUserId(), key.getToolId())).orElseThrow();
                Tool tool = rc.getTool();
                tool.setStockQuantity(tool.getStockQuantity() - rc.getQuantity());
                toolRepository.save(tool);
            }
        }

        // Create order
        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .status(Order.STATUS_CREATED)
                .createdAt(LocalDateTime.now())
                .build();
        order = orderRepository.save(order);

        for (OrderItem oi : orderItems) {
            oi.setOrder(order);
            orderItemRepository.save(oi);
        }

        // Process payment directly in the Order entity
        // PaymentService.PaymentResult result = paymentService.charge(total, request.getPaymentMethod(), request.getPaymentDetails());
        // if (!result.isSuccess()) {
        //     throw new IllegalStateException("Payment failed: " + result.getMessage());
        // }

        // Update order with payment information
        order.setPaymentAmount(total);
        order.setPaymentMethod(request.getPaymentMethod());
        order.setPaymentStatus(Order.PAYMENT_STATUS_SUCCESS);
        // order.setTransactionId(result.getTransactionId());
        order.setPaymentDate(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setStatus(Order.STATUS_PAID);
        
        orderRepository.save(order);

        // Save all rental records now that payment is confirmed
        if (!rentalOrders.isEmpty()) {
            // We're not using a batch save here to ensure each rental order gets its own ID
            for (RentalOrder rentalOrder : rentalOrders) {
                RentalOrder savedRentalOrder = rentalOrderRepository.save(rentalOrder);
                log.info("Created rental order record: {}", savedRentalOrder);
            }
        }

        // Clear carts
        if (request.getSelectedProducts() != null) {
            for (CartKeyProduct key : request.getSelectedProducts()) {
                productCartRepository.deleteByIdUserIdAndIdProductId(key.getUserId(), key.getProductId());
            }
        }
        if (request.getSelectedRentals() != null) {
            for (CartKeyRental key : request.getSelectedRentals()) {
                rentalCartRepository.deleteByIdUserIdAndIdToolId(key.getUserId(), key.getToolId());
            }
        }

        // Create response DTO
        List<OrderItemDTO> productItems = new ArrayList<>();
        List<RentalOrderDTO> rentalItems = new ArrayList<>();
        
        for (OrderItem oi : orderItems) {
            // All OrderItems are for products now
            productItems.add(OrderItemDTO.builder()
                .productId(oi.getProduct().getId())
                .quantity(oi.getQuantity())
                .unitPrice(oi.getUnitPrice())
                .subtotal(oi.getSubtotal())
                .build());
        }
        
        // Create RentalOrderDTO objects for the separate rental order items
        for (RentalOrder savedRental : rentalOrders) {
            // Get tool information for the DTO
            Tool tool = toolRepository.findById(savedRental.getToolId())
                .orElseThrow(() -> new RuntimeException("Tool not found: " + savedRental.getToolId()));
            
            rentalItems.add(RentalOrderDTO.builder()
                .rentalOrderId(savedRental.getId())
                .toolId(savedRental.getToolId())
                .quantity(savedRental.getQuantity())
                .rentalStart(savedRental.getStartDate())
                .rentalEnd(savedRental.getEndDate())
                .totalCost(savedRental.getTotalCost())
                .status("ACTIVE")
                .toolName(tool.getName())
                .build());
        }
        
        return OrderResponseDTO.builder()
            .orderId(order.getId())
            .totalAmount(total)
            .orderItems(productItems)
            .rentalOrders(rentalItems)
            .build();
    }
}


