package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.AddItemRequest;
import com.SRVK.Hardware.dto.CartItemResponseDTO;
import com.SRVK.Hardware.entity.Cart;
import com.SRVK.Hardware.entity.CartItem;
import com.SRVK.Hardware.entity.Product;
import com.SRVK.Hardware.repository.CartItemRepository;
import com.SRVK.Hardware.repository.CartRepository;
import com.SRVK.Hardware.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    public CartItemResponseDTO cartToCartItemResponseDTO(Cart cart){
        return CartItemResponseDTO.builder()
            
    }   

    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Cart cart = Cart.builder()
                            .userId(userId)
                            .createdAt(java.time.LocalDateTime.now())
                            .build();
                    return cartRepository.save(cart);
                });
    }

    public Cart addItem(AddItemRequest request) {
        Cart cart = getOrCreateCart(request.getUserId());
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        BigDecimal price;
        if (request.isRental()) {
            LocalDate start = request.getRentalStart();
            LocalDate end = request.getRentalEnd();
            long days = ChronoUnit.DAYS.between(start, end);
            if (days <= 0) throw new RuntimeException("Invalid rental dates");
            price = BigDecimal.valueOf(product.getPrice()).multiply(BigDecimal.valueOf(days));
        } else {
            price = BigDecimal.valueOf(product.getPrice());
        }

        CartItem item = CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(request.getQuantity())
                .unitPrice(price)
                .subtotal(price.multiply(BigDecimal.valueOf(request.getQuantity())))
                .rental(request.isRental())
                .rentalStart(request.getRentalStart())
                .rentalEnd(request.getRentalEnd())
                .build();
        cart.getItems().add(item);
        cartRepository.save(cart);
        
        return cart;
    }

    public Cart getCart(Long userId) {
        return getOrCreateCart(userId);
    }

    public void removeItem(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }

    public Cart checkout(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        return cartRepository.save(cart);
    }
}