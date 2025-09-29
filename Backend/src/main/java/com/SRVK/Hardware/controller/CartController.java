package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.AddItemRequest;
import com.SRVK.Hardware.dto.UpdateItemRequest;
import com.SRVK.Hardware.dto.UpdateQuantityRequest;
import com.SRVK.Hardware.entity.Cart;
import com.SRVK.Hardware.entity.CartItem;
import com.SRVK.Hardware.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CartController {
    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<Cart> addItem(@RequestBody AddItemRequest request) {
        try{
            return ResponseEntity.ok(cartService.addItem(request));
        }
        catch(Exception e){
            return ResponseEntity.noContent().build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long userId) {
        try{
            Cart cart = cartService.getCart(userId);
            return ResponseEntity.ok(cart);
        }
        catch(Exception e){
            return ResponseEntity.noContent().build();
        }
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<Cart> updateItemQuantity(@PathVariable Long cartItemId,@RequestBody UpdateQuantityRequest request) {
    try {
        return ResponseEntity.ok(cartService.updateItemQuantity(cartItemId, request.getQuantity()));
    } catch (Exception e) {
        return ResponseEntity.status(500).build();
    }
}

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<String> removeItem(@PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(cartItemId));
    }

    @PostMapping("/{userId}/checkout")
    public ResponseEntity<Cart> checkout(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.checkout(userId));
    }

}
