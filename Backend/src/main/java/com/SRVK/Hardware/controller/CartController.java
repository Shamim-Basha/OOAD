package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.*;
import com.SRVK.Hardware.service.CheckoutService;
import com.SRVK.Hardware.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CartController {
    private final CartService cartService;
    private final CheckoutService checkoutService;

    @PostMapping("/product/add")
    public ResponseEntity<?> addProduct(@RequestBody AddProductCartRequest request) {
        try {
            cartService.addProduct(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rental/add")
    public ResponseEntity<?> addRental(@RequestBody AddRentalCartRequest request) {
        try {
            cartService.addRental(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            CartResponseDTO cart = cartService.getCart(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"success\":false,\"message\":\""+e.getMessage()+"\"}");
        }
    }

    @PutMapping("/product/{userId}/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long userId, @PathVariable Long productId, @RequestBody UpdateProductCartRequest request) {
        try {
            cartService.updateProduct(userId, productId, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/rental/{userId}/{rentalId}")
    public ResponseEntity<?> updateRental(@PathVariable Long userId, @PathVariable Long rentalId, @RequestBody UpdateRentalCartRequest request) {
        try {
            cartService.updateRental(userId, rentalId, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/product/{userId}/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long userId, @PathVariable Long productId) {
        try {
            cartService.removeProduct(userId, productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/rental/{userId}/{rentalId}")
    public ResponseEntity<?> deleteRental(@PathVariable Long userId, @PathVariable Long rentalId) {
        try {
            cartService.removeRental(userId, rentalId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{userId}/checkout")
    public ResponseEntity<?> checkout(@PathVariable Long userId, @RequestBody CheckoutRequestDTO request) {
        try {
            if (!userId.equals(request.getUserId())) {
                return ResponseEntity.badRequest().body("{\"success\":false,\"message\":\"userId path and body mismatch\"}");
            }
            OrderResponseDTO response = checkoutService.checkout(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"success\":false,\"message\":\""+e.getMessage()+"\"}");
        }
    }
}
