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
            dto.setProductName(pc.getProduct().getName());
            dto.setUnitPrice(BigDecimal.valueOf(pc.getProduct().getPrice()));
            dto.setQuantity(pc.getQuantity());
            return dto;
        }).collect(Collectors.toList());

        // Map rental cart items to DTOs
        List<CartRentalItemDTO> rentals = rentalCarts.stream().map(rc -> {
            long days = rc.getRentalStart() != null && rc.getRentalEnd() != null ? 
                ChronoUnit.DAYS.between(rc.getRentalStart(), rc.getRentalEnd()) : 0;
            if (days < 0) days = 0;
            
            // Get the tool from the rental
            Tool tool = toolRepository.findById(rc.getId().getRentalId())
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));
            
            CartRentalItemDTO dto = new CartRentalItemDTO();
            dto.setUserId(rc.getId().getUserId());
            dto.setRentalId(rc.getId().getRentalId());
            dto.setProductName(tool.getName());
            dto.setUnitPrice(tool.getDailyRate());
            dto.setQuantity(rc.getQuantity());
            dto.setRentalStart(rc.getRentalStart());
            dto.setRentalEnd(rc.getRentalEnd());
            return dto;
        }).collect(Collectors.toList());

        // Combine into the cart response
        CartResponseDTO cart = new CartResponseDTO();
        cart.setProducts(products);
        cart.setRentals(rentals);
        
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
        // Validate request
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        
        if (request.getRentalStart() == null || request.getRentalEnd() == null || 
            !request.getRentalStart().isBefore(request.getRentalEnd())) {
            throw new IllegalArgumentException("Invalid rental dates");
        }
        
        // Get tool and validate it exists (using toolId, not name)
        Tool tool = toolRepository.findById(request.getRentalId())
            .orElseThrow(() -> new IllegalArgumentException("Tool not found"));
            
        // Get user and validate it exists
        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
            
        // Check if tool has sufficient stock
        if (tool.getStockQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient stock");
        }

        // Create composite key for rental cart
        RentalCartKey id = new RentalCartKey(request.getUserId(), request.getRentalId());
        
        // Find existing cart item or create new one using the tool as rental
        RentalCart rentalCart = rentalCartRepository.findById(id)
            .orElse(RentalCart.builder()
                .id(id)
                .user(user)
                .quantity(0)
                .addedAt(LocalDateTime.now())
                .build());
                
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
        
        log.info("Added rental {} to cart of user {} qty {}", request.getRentalId(), request.getUserId(), request.getQuantity());
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
     * @param rentalId the ID of the rental
     * @param request request containing the new quantity and rental dates
     */
    @Transactional
    public void updateRentalDuration(Long userId, Long rentalId, UpdateRentalCartRequest request) {
        // Validate request
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        
        if (request.getRentalStart() == null || request.getRentalEnd() == null || 
            !request.getRentalStart().isBefore(request.getRentalEnd())) {
            throw new IllegalArgumentException("Invalid rental dates");
        }
        
        // Create composite key for rental cart
        RentalCartKey id = new RentalCartKey(userId, rentalId);
        
        // Find cart item and validate it exists
        RentalCart rentalCart = rentalCartRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Item not found in cart"));
            
        // Get the tool directly
        Tool tool = toolRepository.findById(rentalId)
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
        
        log.info("Updated rental cart for user {} rental {} qty {}", userId, rentalId, request.getQuantity());
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
     * @param rentalId the ID of the rental
     */
    @Transactional
    public void removeRentalFromCart(Long userId, Long rentalId) {
        rentalCartRepository.deleteByIdUserIdAndIdRentalId(userId, rentalId);
        log.info("Removed rental {} from cart of user {}", rentalId, userId);
    }

    /**
     * Process the checkout for a user's cart
     * @param userId the ID of the user
     * @return The cleared cart
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
}
