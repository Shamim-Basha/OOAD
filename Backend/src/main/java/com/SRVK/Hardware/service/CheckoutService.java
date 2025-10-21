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
    private final ToolRepository toolRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponseDTO checkout(CheckoutRequestDTO request) {
        log.info("Checkout attempt for user {}", request.getUserId());
        log.info("Selected products: {}", request.getSelectedProducts() != null ? request.getSelectedProducts().size() : 0);
        log.info("Selected rentals: {}", request.getSelectedRentals() != null ? request.getSelectedRentals().size() : 0);
        
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
            for (CheckoutRequestDTO.Key key : request.getSelectedRentals()) {
                // Create composite key using toolId (rentalId in the key is actually toolId)
                RentalCart.RentalCartKey id = new RentalCart.RentalCartKey(key.getUserId(), key.getRentalId());
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

        // Adjust stock BEFORE payment - will be rolled back if payment fails
        if (request.getSelectedProducts() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedProducts()) {
                Product product = productRepository.findById(key.getProductId()).orElseThrow();
                ProductCart pc = productCartRepository.findById(new ProductCart.ProductCartKey(key.getUserId(), key.getProductId())).orElseThrow();
                product.setQuantity(product.getQuantity() - pc.getQuantity());
                productRepository.save(product);
            }
        }
        if (request.getSelectedRentals() != null) {
            for (CheckoutRequestDTO.Key key : request.getSelectedRentals()) {
                RentalCart rc = rentalCartRepository.findById(new RentalCart.RentalCartKey(key.getUserId(), key.getRentalId())).orElseThrow();
                Tool tool = rc.getTool();
                tool.setStockQuantity(tool.getStockQuantity() - rc.getQuantity());
                toolRepository.save(tool);
            }
        }

        // Create order with user's address
        String deliveryAddress = user.getAddress();
        if (deliveryAddress == null || deliveryAddress.trim().isEmpty()) {
            // If address is empty, use city and postal code
            deliveryAddress = (user.getCity() != null ? user.getCity() : "") + 
                            (user.getPostalCode() != null ? ", " + user.getPostalCode() : "");
        }
        
        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .status(Order.STATUS_CREATED)
                .createdAt(LocalDateTime.now())
                .deliveryAddress(deliveryAddress.trim().isEmpty() ? "Not provided" : deliveryAddress)
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
        
        // For Cash on Delivery, mark as COD (not paid yet)
        if ("CASH".equals(request.getPaymentMethod())) {
            order.setPaymentStatus("COD");
            order.setStatus(Order.STATUS_CREATED);
        } else {
            order.setPaymentStatus(Order.PAYMENT_STATUS_SUCCESS);
            order.setStatus(Order.STATUS_PAID);
            order.setPaymentDate(LocalDateTime.now());
        }
        
        // order.setTransactionId(result.getTransactionId());
        order.setUpdatedAt(LocalDateTime.now());
        
        // Determine order type
        boolean hasProducts = !orderItems.isEmpty();
        boolean hasRentals = !rentalOrders.isEmpty();
        try {
            if (hasProducts && hasRentals) {
                order.setOrderType("MIXED");
            } else if (hasRentals) {
                order.setOrderType("RENTAL");
            } else {
                order.setOrderType("PRODUCT");
            }
        } catch (Exception e) {
            log.warn("Could not set order type (column may not exist yet): {}", e.getMessage());
            // Continue without setting order type if column doesn't exist
        }
        
        orderRepository.save(order);

        // Save all rental records now that payment is confirmed and link them to the order
        if (!rentalOrders.isEmpty()) {
            // We're not using a batch save here to ensure each rental order gets its own ID
            for (RentalOrder rentalOrder : rentalOrders) {
                rentalOrder.setOrderId(order.getId()); // Link to the main order
                RentalOrder savedRentalOrder = rentalOrderRepository.save(rentalOrder);
                log.info("Created rental order record: {}", savedRentalOrder);
            }
        }

        // Clear carts after successful payment
        if (request.getSelectedProducts() != null) {
            log.info("Clearing {} selected product(s) from cart", request.getSelectedProducts().size());
            for (CheckoutRequestDTO.Key key : request.getSelectedProducts()) {
                log.info("Deleting product cart item: userId={}, productId={}", key.getUserId(), key.getProductId());
                productCartRepository.deleteByIdUserIdAndIdProductId(key.getUserId(), key.getProductId());
            }
        } else {
            log.info("No products to clear from cart");
        }
        if (request.getSelectedRentals() != null) {
            log.info("Clearing {} selected rental(s) from cart", request.getSelectedRentals().size());
            for (CheckoutRequestDTO.Key key : request.getSelectedRentals()) {
                log.info("Deleting rental cart item: userId={}, toolId={}", key.getUserId(), key.getRentalId());
                rentalCartRepository.deleteByIdUserIdAndIdToolId(key.getUserId(), key.getRentalId());
            }
        } else {
            log.info("No rentals to clear from cart");
        }

        // Create response DTO with combined items list
        List<OrderResponseDTO.Item> items = new ArrayList<>();
        
        // Add product items
        for (OrderItem oi : orderItems) {
            items.add(OrderResponseDTO.Item.builder()
                .type("PRODUCT")
                .productId(oi.getProduct().getId())
                .rentalId(null)
                .name(oi.getProduct().getName())
                .quantity(oi.getQuantity())
                .unitPrice(oi.getUnitPrice())
                .subtotal(oi.getSubtotal())
                .rentalStart(null)
                .rentalEnd(null)
                .build());
        }
        
        // Add rental items
        for (RentalOrder savedRental : rentalOrders) {
            Tool tool = toolRepository.findById(savedRental.getToolId()).orElse(null);
            items.add(OrderResponseDTO.Item.builder()
                .type("RENTAL")
                .productId(null)
                .rentalId(savedRental.getId())
                .name(tool != null ? tool.getName() : "Unknown Tool")
                .quantity(savedRental.getQuantity())
                .unitPrice(tool != null ? tool.getDailyRate() : BigDecimal.ZERO)
                .subtotal(savedRental.getTotalCost())
                .rentalStart(savedRental.getStartDate().atStartOfDay())
                .rentalEnd(savedRental.getEndDate().atStartOfDay())
                .build());
        }
        
        return OrderResponseDTO.builder()
            .orderId(order.getId())
            .total(total)
            .items(items)
            .paymentStatus(order.getPaymentStatus())
            .transactionId(order.getTransactionId())
            .paymentMethod(order.getPaymentMethod())
            .orderDate(order.getCreatedAt())
            .build();
    }
}


