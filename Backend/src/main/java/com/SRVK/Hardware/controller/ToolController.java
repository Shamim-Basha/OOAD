package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.entity.Tool;
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

    @GetMapping
    public ResponseEntity<List<Tool>> all() {
        return ResponseEntity.ok(toolRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tool> byId(@PathVariable Long id) {
        return toolRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tool> create(@RequestBody Tool tool) {
        try {
            Tool savedTool = toolRepository.save(tool);
            return ResponseEntity.ok(savedTool);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tool> update(@PathVariable Long id, @RequestBody Tool tool) {
        try {
            if (!toolRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            tool.setId(id);
            Tool updatedTool = toolRepository.save(tool);
            return ResponseEntity.ok(updatedTool);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            if (!toolRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            toolRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}