package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.entity.Rental;
import com.SRVK.Hardware.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    public ResponseEntity<Rental> create(@RequestBody Map<String, String> body) {
        Long userId = Long.valueOf(body.get("userId"));
        Long toolId = Long.valueOf(body.get("toolId"));
        LocalDate startDate = LocalDate.parse(body.get("startDate"));
        LocalDate endDate = LocalDate.parse(body.get("endDate"));
        return ResponseEntity.ok(rentalService.createRental(userId, toolId, startDate, endDate));
    }

    @GetMapping
    public ResponseEntity<List<Rental>> all() {
        return ResponseEntity.ok(rentalService.getAll());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rental> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        LocalDate startDate = LocalDate.parse(body.get("startDate"));
        LocalDate endDate = LocalDate.parse(body.get("endDate"));
        return ResponseEntity.ok(rentalService.updateDates(id, startDate, endDate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rentalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


