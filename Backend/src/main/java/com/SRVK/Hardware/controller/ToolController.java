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
}


// 