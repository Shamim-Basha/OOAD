package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.AddItemRequest;
import com.SRVK.Hardware.dto.CartItemResponseDTO;
import com.SRVK.Hardware.entity.Cart;
import com.SRVK.Hardware.entity.CartItem;
import com.SRVK.Hardware.entity.Product;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.repository.CartItemRepository;
import com.SRVK.Hardware.repository.CartRepository;
import com.SRVK.Hardware.repository.ProductRepository;
import com.SRVK.Hardware.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public CartItemResponseDTO cartToCartItemResponseDTO(Cart cart){
        return CartItemResponseDTO.builder().build();
    }

    public Cart getOrCreateCart(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = userOpt.get();

            return cartRepository.findByUser(user)
                    .orElseGet(() -> {
                        Cart newCart = Cart.builder()
                                .user(user)
                                .createdAt(LocalDateTime.now())
                                .build();
                        newCart.setItems(new ArrayList<>());
                        return cartRepository.save(newCart);
                    });
        } catch (Exception e) {
            throw e;
        }
    }

    //Updated addItem method
    public Cart addItem(AddItemRequest request) {
        try {
            Cart cart = getOrCreateCart(request.getUserId());

            if (cart == null) {
                throw new RuntimeException("User not found");
            }

            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Check if product already exists in cart
            Optional<CartItem> existingItemOpt = cart.getItems().stream()
                    .filter(i -> i.getProduct().getId().equals(request.getProductId()))
                    .findFirst();

            BigDecimal unitPrice;
            if (request.isRental()) {
                LocalDate start = request.getRentalStart();
                LocalDate end = request.getRentalEnd();
                long days = ChronoUnit.DAYS.between(start, end);
                if (days <= 0) throw new RuntimeException("Invalid rental dates");
                unitPrice = BigDecimal.valueOf(product.getPrice()).multiply(BigDecimal.valueOf(days));
            } else {
                unitPrice = BigDecimal.valueOf(product.getPrice());
            }

            if (existingItemOpt.isPresent()) {
                //Update existing item instead of creating duplicate
                CartItem existingItem = existingItemOpt.get();
                int newTotalQuantity = existingItem.getQuantity() + request.getQuantity();
                
                // Check stock availability for updated quantity
                if (newTotalQuantity > product.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + product.getQuantity() + ", Requested: " + newTotalQuantity);
                }
                
                existingItem.setQuantity(newTotalQuantity);
                existingItem.setSubtotal(unitPrice.multiply(BigDecimal.valueOf(existingItem.getQuantity())));
                cartItemRepository.save(existingItem);
            } else {
                // Add new item
                // Check stock availability for new item
                if (request.getQuantity() > product.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + product.getQuantity() + ", Requested: " + request.getQuantity());
                }
                
                CartItem newItem = CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(request.getQuantity())
                        .unitPrice(unitPrice)
                        .subtotal(unitPrice.multiply(BigDecimal.valueOf(request.getQuantity())))
                        .rental(request.isRental())
                        .rentalStart(request.getRentalStart())
                        .rentalEnd(request.getRentalEnd())
                        .build();
                cart.getItems().add(newItem);
            }

            return cartRepository.save(cart);
        } catch (Exception e) {
            throw e;
        }
    }

    public Cart getCart(Long userId) {
        return getOrCreateCart(userId);
    }

    public String removeItem(Long cartItemId) {
        if (cartItemRepository.existsById(cartItemId)) {
            cartItemRepository.deleteById(cartItemId);
            return "Item with ID: " + cartItemId + " has been successfully deleted";
        }
        return "Item Not Found with Id : " + cartItemId;
    }

    public Cart updateItemQuantity(Long cartItemId, Integer newQuantity) {
        try {
            System.out.println("updateItemQuantity called with cartItemId: " + cartItemId + ", newQuantity: " + newQuantity);
            
            CartItem cartItem = cartItemRepository.findById(cartItemId)
                    .orElseThrow(() -> new RuntimeException("Cart item not found"));

            System.out.println("Found cart item: " + cartItem.getId() + ", current quantity: " + cartItem.getQuantity());

            if (newQuantity <= 0) {
                System.out.println("Deleting cart item due to quantity <= 0");
                cartItemRepository.deleteById(cartItemId);
            } else {
                // Check stock availability
                Product product = cartItem.getProduct();
                if (newQuantity > product.getQuantity()) {
                    throw new RuntimeException("Insufficient stock. Available: " + product.getQuantity() + ", Requested: " + newQuantity);
                }
                
                System.out.println("Updating quantity from " + cartItem.getQuantity() + " to " + newQuantity);
                cartItem.setQuantity(newQuantity);
                cartItem.setSubtotal(cartItem.getUnitPrice().multiply(BigDecimal.valueOf(newQuantity)));
                cartItemRepository.save(cartItem);
                System.out.println("Cart item updated successfully");
            }

            // Return the updated cart
            Cart updatedCart = cartRepository.findById(cartItem.getCart().getId())
                    .orElseThrow(() -> new RuntimeException("Cart not found"));
            System.out.println("Returning cart with " + updatedCart.getItems().size() + " items");
            return updatedCart;
        } catch (Exception e) {
            System.out.println("Error in updateItemQuantity: " + e.getMessage());
            throw e;
        }
    }

    public Cart checkout(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        return cartRepository.save(cart);
    }
}
