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
        return CartItemResponseDTO.builder()
        .build();
            
    }   

    public Cart getOrCreateCart(Long userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if(userOpt.isEmpty()){
                throw( new RuntimeException("user not found"));
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

    public Cart addItem(AddItemRequest request) {
        try{
            Cart cart = getOrCreateCart(request.getUserId());

            if(cart==null){
                throw (new RuntimeException("User not found"));
            }
            
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
        catch(Exception e){
            throw e;
        }

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