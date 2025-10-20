package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.RentalCartRepository;
import com.SRVK.Hardware.repository.RentalOrderRepository;
import com.SRVK.Hardware.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> create(@RequestBody Tool tool) {
        try {
            Tool savedTool = toolRepository.save(tool);
            return ResponseEntity.ok(savedTool);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to save tool: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Tool tool) {
        try {
            if (!toolRepository.existsById(id)) {
                return ResponseEntity.status(404).body("Tool not found");
            }
            tool.setId(id);
            Tool updatedTool = toolRepository.save(tool);
            return ResponseEntity.ok(updatedTool);
        } catch (Exception e) {
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
}