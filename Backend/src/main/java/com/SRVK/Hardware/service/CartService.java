package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.*;
import com.SRVK.Hardware.entity.*;
import com.SRVK.Hardware.entity.ProductCart.ProductCartKey;
import com.SRVK.Hardware.entity.RentalCart.RentalCartKey;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final ProductCartRepository productCartRepository;
    private final RentalCartRepository rentalCartRepository;
    private final ProductRepository productRepository;
    private final ToolRepository toolRepository;
    private final UserRepository userRepository;
    private final RentalService rentalService;

    /**
     * Get cart information for a specific user
     * @param userId the ID of the user
     * @return CartResponseDTO containing all product and rental items in the cart
     */
    public CartResponseDTO getCartByUser(Long userId) {
        // Validate user exists
        userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Get all product cart items for the user
        List<ProductCart> productCarts = productCartRepository.findByIdUserId(userId);

        // Get all rental cart items for the user
        List<RentalCart> rentalCarts = rentalCartRepository.findByIdUserId(userId);

        // Map product cart items to DTOs
        List<CartProductItemDTO> products = productCarts.stream().map(pc -> {
            CartProductItemDTO dto = new CartProductItemDTO();
            dto.setUserId(pc.getId().getUserId());
            dto.setProductId(pc.getId().getProductId());
            dto.setName(pc.getProduct().getName());
            dto.setImage(pc.getProduct().getImage());
            dto.setUnitPrice(BigDecimal.valueOf(pc.getProduct().getPrice()));
            dto.setQuantity(pc.getQuantity());
            // Calculate subtotal
            BigDecimal subtotal = dto.getUnitPrice().multiply(BigDecimal.valueOf(pc.getQuantity()));
            dto.setSubtotal(subtotal);
            return dto;
        }).collect(Collectors.toList());

        // Map rental cart items to DTOs
        List<CartRentalItemDTO> rentals = rentalCarts.stream().map(rc -> {
            long days = rc.getRentalStart() != null && rc.getRentalEnd() != null ?
                ChronoUnit.DAYS.between(rc.getRentalStart(), rc.getRentalEnd()) : 0;
            if (days < 0) days = 0;

            // Use the tool directly from the relationship
            Tool tool = rc.getTool();

            CartRentalItemDTO dto = new CartRentalItemDTO();
            dto.setUserId(rc.getId().getUserId());
            // Critical fix: Set rentalId to be the same as toolId for consistency with frontend
            dto.setRentalId(rc.getId().getToolId());
            dto.setName(tool.getName());
            dto.setDailyRate(tool.getDailyRate());
            dto.setQuantity(rc.getQuantity());
            dto.setRentalStart(rc.getRentalStart());
            dto.setRentalEnd(rc.getRentalEnd());

            // Calculate subtotal: dailyRate * quantity * days
            // We already calculated days above, just ensure minimum 1 day
            if (days == 0) days = 1; // Minimum 1 day rental

            BigDecimal subtotal = tool.getDailyRate()
                .multiply(BigDecimal.valueOf(rc.getQuantity()))
                .multiply(BigDecimal.valueOf(days));
            dto.setSubtotal(subtotal);

            return dto;
        }).collect(Collectors.toList());

        // Combine into the cart response
        CartResponseDTO cart = new CartResponseDTO();
        cart.setProducts(products);
        cart.setRentals(rentals);

        // Calculate total amount for the entire cart
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Add product subtotals
        for (CartProductItemDTO product : products) {
            totalAmount = totalAmount.add(product.getSubtotal());
        }

        // Add rental subtotals
        for (CartRentalItemDTO rental : rentals) {
            totalAmount = totalAmount.add(rental.getSubtotal());
        }

        cart.setTotalAmount(totalAmount);

        return cart;
    }

    /**
     * Add a product to the user's cart
     * @param request request containing userId, productId and quantity
     */
    @Transactional
    public void addProductToCart(AddProductCartRequest request) {
        // Validate request
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        // Get product and validate it exists
        Product product = productRepository.findById(request.getProductId())
            .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Get user and validate it exists
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if product has sufficient stock
        if (product.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        // Create composite key for product cart
        ProductCartKey id = new ProductCartKey(request.getUserId(), request.getProductId());

        // Find existing cart item or create new one
        ProductCart productCart = productCartRepository.findById(id)
            .orElse(ProductCart.builder()
                .id(id)
                .user(user)
                .product(product)
                .quantity(0)
                .addedAt(LocalDateTime.now())
                .build());

        // Update quantity
        productCart.setQuantity(productCart.getQuantity() + request.getQuantity());

        // Save to database
        productCartRepository.save(productCart);

        log.info("Added product {} to cart of user {} qty {}", request.getProductId(), request.getUserId(), request.getQuantity());
    }

    /**
     * Add a rental to the user's cart
     * @param request request containing userId, rentalId, quantity, and rental dates
     */
    @Transactional
    public void addRentalToCart(AddRentalCartRequest request) {
        log.info("Starting addRentalToCart with request: {}", request);

        // Validate quantity
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        // Validate rental dates
        if (request.getRentalStart() == null || request.getRentalEnd() == null ||
                !request.getRentalStart().isBefore(request.getRentalEnd())) {
            throw new IllegalArgumentException("Invalid rental dates");
        }

        // Get tool
        Tool tool = toolRepository.findById(request.getRentalId())
                .orElseThrow(() -> new IllegalArgumentException("Tool not found with ID: " + request.getRentalId()));

        // Get user
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + request.getUserId()));

        // Check stock
        if (tool.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock for tool: " + tool.getName());
        }

        // Calculate days and total cost
        long days = ChronoUnit.DAYS.between(request.getRentalStart(), request.getRentalEnd());
        if (days == 0) days = 1;
        BigDecimal totalCost = tool.getDailyRate().multiply(BigDecimal.valueOf(days * request.getQuantity()));

        // Create composite key
        RentalCartKey id = new RentalCartKey(request.getUserId(), request.getRentalId());

        // Check if rental item already exists in the cart
        RentalCart rentalCart = rentalCartRepository.findById(id).orElse(null);

        if (rentalCart != null) {
            // Update existing cart item
            rentalCart.setQuantity(request.getQuantity());
            rentalCart.setRentalStart(request.getRentalStart());
            rentalCart.setRentalEnd(request.getRentalEnd());
            rentalCart.setTotalCost(totalCost);
            rentalCart.setAddedAt(LocalDateTime.now());

            log.info("Updated existing rental cart for user {} tool {}", request.getUserId(), request.getRentalId());
        } else {
            // Create new rental cart item
            rentalCart = RentalCart.builder()
                    .id(id)
                    .user(user)
                    .tool(tool)
                    .quantity(request.getQuantity())
                    .rentalStart(request.getRentalStart())
                    .rentalEnd(request.getRentalEnd())
                    .totalCost(totalCost)
                    .addedAt(LocalDateTime.now())
                    .build();

            log.info("Created new rental cart for user {} tool {}", request.getUserId(), request.getRentalId());
        }

        // Save using JPA
        rentalCartRepository.save(rentalCart);
        log.info("Saved rental cart successfully for user {} tool {} qty {}",
                request.getUserId(), request.getRentalId(), request.getQuantity());
    }

    /**
     * Update the quantity of a product in the user's cart
     * @param userId the ID of the user
     * @param productId the ID of the product
     * @param request request containing the new quantity
     */
    @Transactional
    public void updateProductQuantity(Long userId, Long productId, UpdateProductCartRequest request) {
        // Validate request
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        // Create composite key for product cart
        ProductCartKey id = new ProductCartKey(userId, productId);

        // Find cart item and validate it exists
        ProductCart productCart = productCartRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Item not found in cart"));

        // Check if product has sufficient stock
        if (productCart.getProduct().getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        // Update quantity
        productCart.setQuantity(request.getQuantity());

        // Save to database
        productCartRepository.save(productCart);

        log.info("Updated product cart for user {} product {} qty {}", userId, productId, request.getQuantity());
    }

    /**
     * Update the duration and quantity of a rental in the user's cart
     * @param userId the ID of the user
     * @param toolId the ID of the tool
     * @param request request containing the new quantity and rental dates
     */
    @Transactional
    public void updateRentalDuration(Long userId, Long toolId, UpdateRentalCartRequest request) {
        // Validate request
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        if (request.getRentalStart() == null || request.getRentalEnd() == null ||
            !request.getRentalStart().isBefore(request.getRentalEnd())) {
            throw new IllegalArgumentException("Invalid rental dates");
        }

        // Create composite key for rental cart
        RentalCartKey id = new RentalCartKey(userId, toolId);

        // Find cart item and validate it exists
        RentalCart rentalCart = rentalCartRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Item not found in cart"));

        // Ensure corresponding tool exists
        Tool tool = toolRepository.findById(toolId)
            .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        // Check if tool has sufficient stock
        if (tool.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        // Update quantity and rental dates
        rentalCart.setQuantity(request.getQuantity());
        rentalCart.setRentalStart(request.getRentalStart());
        rentalCart.setRentalEnd(request.getRentalEnd());

        // Calculate total cost
        long days = ChronoUnit.DAYS.between(request.getRentalStart(), request.getRentalEnd());
        BigDecimal totalCost = tool.getDailyRate().multiply(BigDecimal.valueOf(days * request.getQuantity()));
        rentalCart.setTotalCost(totalCost);

        // Save to database
        rentalCartRepository.save(rentalCart);

        log.info("Updated rental cart for user {} tool {} qty {}", userId, toolId, request.getQuantity());
    }

    /**
     * Remove a product from the user's cart
     * @param userId the ID of the user
     * @param productId the ID of the product
     */
    @Transactional
    public void removeProductFromCart(Long userId, Long productId) {
        productCartRepository.deleteByIdUserIdAndIdProductId(userId, productId);
        log.info("Removed product {} from cart of user {}", productId, userId);
    }

    /**
     * Remove a rental from the user's cart
     * @param userId the ID of the user
     * @param toolId the ID of the tool
     */
    @Transactional
    public void removeRentalFromCart(Long userId, Long toolId) {
        rentalCartRepository.deleteByIdUserIdAndIdToolId(userId, toolId);
        log.info("Removed rental tool {} from cart of user {}", toolId, userId);
    }

    /**
     * Process the checkout for a user's cart
     * @param userId the ID of the user
     */
    @Transactional
    public void clearCart(Long userId) {
        // Delete all product cart items for the user
        List<ProductCart> productCarts = productCartRepository.findByIdUserId(userId);
        productCartRepository.deleteAll(productCarts);

        // Delete all rental cart items for the user
        List<RentalCart> rentalCarts = rentalCartRepository.findByIdUserId(userId);
        rentalCartRepository.deleteAll(rentalCarts);

        log.info("Cleared cart for user {}", userId);
    }

    /**
     * Process rentals from a user's cart and create rental records
     * @param userId the ID of the user
     * @return List of created rental entities
     */
    @Transactional
    public List<RentalOrder> checkoutRentals(Long userId) {
        // Get all rental cart items for the user
        List<RentalCart> rentalCarts = rentalCartRepository.findByIdUserId(userId);

        List<RentalOrder> createdRentalOrders = new ArrayList<>();

        if (rentalCarts.isEmpty()) {
            return createdRentalOrders;
        }

        // Create rental orders using existing validation logic in RentalService
        for (RentalCart item : rentalCarts) {
            Long toolId = item.getId().getToolId();

            if (toolId == null) {
                throw new RuntimeException("Missing toolId for rental cart item");
            }

            // Use the rental service to create proper rental order records
            RentalOrder rentalOrder = rentalService.createRental(
                    userId,
                    toolId,
                    item.getRentalStart(),
                    item.getRentalEnd(),
                    item.getQuantity()
            );
            createdRentalOrders.add(rentalOrder);
        }

        // Remove all rental items from the cart
        rentalCartRepository.deleteAll(rentalCarts);

        return createdRentalOrders;
    }
}
