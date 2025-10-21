package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.ToolRequest;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.RentalCartRepository;
import com.SRVK.Hardware.repository.RentalOrderRepository;
import com.SRVK.Hardware.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/tools")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ToolController {

    private final ToolRepository toolRepository;
    private final RentalCartRepository rentalCartRepository;
    private final RentalOrderRepository rentalOrderRepository;

    @GetMapping
    public ResponseEntity<List<Tool>> all() {
        return ResponseEntity.ok(toolRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> byId(@PathVariable Long id) {
        return toolRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(404).body("Tool not found"));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ToolRequest request) {
        try {
            Tool tool = new Tool();
            tool.setName(request.getName());
            tool.setDailyRate(request.getDailyRate());
            tool.setCategory(request.getCategory());
            tool.setDescription(request.getDescription());
            
            // Handle image conversion from base64 to byte[]
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                tool.setImage(convertBase64ToBytes(request.getImage()));
            }
            
            // When creating a new tool, both totalStock and stockQuantity should be the same
            if (request.getTotalStock() != null && request.getTotalStock() > 0) {
                // User provided totalStock, set stockQuantity to match
                tool.setTotalStock(request.getTotalStock());
                tool.setStockQuantity(request.getTotalStock());
            } else if (request.getStockQuantity() != null && request.getStockQuantity() > 0) {
                // User provided stockQuantity, set totalStock to match
                tool.setTotalStock(request.getStockQuantity());
                tool.setStockQuantity(request.getStockQuantity());
            } else {
                // Neither provided, default to 1
                tool.setTotalStock(1);
                tool.setStockQuantity(1);
            }
            
            // Set available flag based on stock
            tool.setAvailable(tool.getStockQuantity() > 0);
            
            Tool savedTool = toolRepository.save(tool);
            return ResponseEntity.ok(savedTool);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to save tool: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody ToolRequest request) {
        try {
            if (!toolRepository.existsById(id)) {
                return ResponseEntity.status(404).body("Tool not found");
            }
            
            Tool existing = toolRepository.findById(id).orElseThrow();
            Tool tool = new Tool();
            tool.setId(id);
            tool.setName(request.getName());
            tool.setDailyRate(request.getDailyRate());
            tool.setCategory(request.getCategory());
            tool.setDescription(request.getDescription());
            
            // Handle image conversion from base64 to byte[]
            if (request.getImage() != null && !request.getImage().isEmpty()) {
                tool.setImage(convertBase64ToBytes(request.getImage()));
            } else {
                tool.setImage(existing.getImage()); // Keep existing image
            }
            
            // Handle totalStock update
            if (request.getTotalStock() != null && request.getTotalStock() > 0) {
                int oldTotalStock = existing.getTotalStock() != null ? existing.getTotalStock() : existing.getStockQuantity();
                int newTotalStock = request.getTotalStock();
                int difference = newTotalStock - oldTotalStock;
                
                // Adjust stockQuantity by the same difference
                int newStockQuantity = existing.getStockQuantity() + difference;
                
                // Ensure stockQuantity doesn't go negative
                if (newStockQuantity < 0) {
                    return ResponseEntity.badRequest().body(
                        "Cannot reduce total stock below currently rented quantity. " +
                        "Available: " + existing.getStockQuantity() + 
                        ", Rented: " + (oldTotalStock - existing.getStockQuantity()) + 
                        ", New Total: " + newTotalStock
                    );
                }
                
                tool.setTotalStock(newTotalStock);
                tool.setStockQuantity(newStockQuantity);
                
                // Update availability based on new stock quantity
                tool.setAvailable(newStockQuantity > 0);
            } else {
                // If totalStock not provided, keep existing values
                tool.setTotalStock(existing.getTotalStock());
                tool.setStockQuantity(existing.getStockQuantity());
                tool.setAvailable(existing.isAvailable());
            }
            
            Tool updatedTool = toolRepository.save(tool);
            return ResponseEntity.ok(updatedTool);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Failed to update tool: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            if (!toolRepository.existsById(id)) {
                return ResponseEntity.status(404).body("Tool not found");
            }
            // Clean up referencing rows to allow deletion
            try {
                rentalCartRepository.deleteByIdToolId(id);
            } catch (Exception ignored) {}
            try {
                rentalOrderRepository.deleteByToolId(id);
            } catch (Exception ignored) {}

            toolRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete tool: " + e.getMessage());
        }
    }
    
    // Helper method to convert base64 string to byte array
    private byte[] convertBase64ToBytes(String base64String) {
        if (base64String == null || base64String.isEmpty()) {
            return null;
        }
        try {
            // Remove data:image/...;base64, prefix if present
            String base64Data = base64String;
            if (base64String.contains(",")) {
                base64Data = base64String.split(",")[1];
            }
            return Base64.getDecoder().decode(base64Data);
        } catch (Exception e) {
            return null;
        }
    }
}