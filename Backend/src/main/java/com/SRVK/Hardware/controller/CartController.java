package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.*;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.ToolRepository;
import com.SRVK.Hardware.service.CheckoutService;
import com.SRVK.Hardware.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CartController {
    private final CartService cartService;
    private final CheckoutService checkoutService;
    private final ToolRepository toolRepository; // Add this for debugging

    @PostMapping("/product/add")
    public ResponseEntity<?> addProduct(@RequestBody AddProductCartRequest request) {
        try {
            cartService.addProductToCart(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/rental/add")
    public ResponseEntity<?> addRental(@RequestBody AddRentalCartRequest request) {
        log.info("Received rental add request: {}", request);
        try {
            // Log the exact fields we're receiving to help debug
            log.info("Request details - userId: {}, rentalId: {}, quantity: {}, start: {}, end: {}", 
                    request.getUserId(), request.getRentalId(), request.getQuantity(), 
                    request.getRentalStart(), request.getRentalEnd());
            
            // Add to cart using direct SQL insertion (bypassing entity mapping issues)
            cartService.addRentalToCart(request);
            log.info("Successfully added rental to cart");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error adding rental to cart", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        try {
            CartResponseDTO cart = cartService.getCartByUser(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"success\":false,\"message\":\""+e.getMessage()+"\"}");
        }
    }

    @PutMapping("/product/{userId}/{productId}")
    public ResponseEntity<?> updateProduct(@PathVariable Long userId, @PathVariable Long productId, @RequestBody UpdateProductCartRequest request) {
        try {
            cartService.updateProductQuantity(userId, productId, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/rental/{userId}/{toolId}")
    public ResponseEntity<?> updateRental(@PathVariable Long userId, @PathVariable Long toolId, @RequestBody UpdateRentalCartRequest request) {
        try {
            cartService.updateRentalDuration(userId, toolId, request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/product/{userId}/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long userId, @PathVariable Long productId) {
        try {
            cartService.removeProductFromCart(userId, productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/rental/{userId}/{toolId}")
    public ResponseEntity<?> deleteRental(@PathVariable Long userId, @PathVariable Long toolId) {
        try {
            cartService.removeRentalFromCart(userId, toolId);
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
            // Clear the cart after successful checkout
            cartService.clearCart(userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"success\":false,\"message\":\""+e.getMessage()+"\"}");
        }
    }
    
    // Debug endpoint to check if tools exist
    @GetMapping("/debug/tools")
    public ResponseEntity<?> debugTools() {
        try {
            long toolCount = toolRepository.count();
            List<Tool> allTools = toolRepository.findAll();
            StringBuilder sb = new StringBuilder("Total tools: " + toolCount + "\n");
            for (Tool tool : allTools) {
                sb.append("- ID: ").append(tool.getId())
                  .append(", Name: ").append(tool.getName())
                  .append(", Stock: ").append(tool.getStockQuantity())
                  .append(", Available: ").append(tool.isAvailable())
                  .append("\n");
            }
            log.info(sb.toString());
            return ResponseEntity.ok(sb.toString());
        } catch (Exception e) {
            log.error("Error counting tools", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Direct debug endpoint to add a rental to cart
    @GetMapping("/debug/add-rental/{userId}/{toolId}")
    public ResponseEntity<?> debugAddRental(
            @PathVariable Long userId,
            @PathVariable Long toolId,
            @RequestParam(required = false, defaultValue = "1") Integer quantity,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end) {
        try {
            log.info("Debug adding rental: userId={}, toolId={}, quantity={}, start={}, end={}",
                    userId, toolId, quantity, start, end);
                    
            // Check if tool exists
            Tool tool = toolRepository.findById(toolId).orElse(null);
            if (tool == null) {
                return ResponseEntity.badRequest().body("Tool with ID " + toolId + " not found");
            }
            
            LocalDate startDate = start != null ? LocalDate.parse(start) : LocalDate.now();
            LocalDate endDate = end != null ? LocalDate.parse(end) : LocalDate.now().plusDays(3);
            
            AddRentalCartRequest request = new AddRentalCartRequest();
            request.setUserId(userId);
            request.setRentalId(toolId);
            request.setQuantity(quantity);
            request.setRentalStart(startDate);
            request.setRentalEnd(endDate);
            
            cartService.addRentalToCart(request);
            return ResponseEntity.ok("Rental added successfully");
        } catch (Exception e) {
            log.error("Error in debug add rental", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
