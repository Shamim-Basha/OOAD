package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.CreateRentalRequest;
import com.SRVK.Hardware.dto.UpdateRentalRequest;
import com.SRVK.Hardware.entity.Rental;
import com.SRVK.Hardware.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    public ResponseEntity<Rental> create(@Valid @RequestBody CreateRentalRequest request) {
        Rental rental = rentalService.createRental(
                request.getUserId(),
                request.getToolId(),
                request.getStartDate(),
                request.getEndDate(),
                request.getQuantity()
        );
        return ResponseEntity.ok(rental);
    }

    @GetMapping
    public ResponseEntity<List<Rental>> all() {
        return ResponseEntity.ok(rentalService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Rental> getById(@PathVariable Long id) {
        Rental rental = rentalService.getById(id);
        return ResponseEntity.ok(rental);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Rental>> getByUser(@PathVariable Long userId) {
        List<Rental> rentals = rentalService.getByUser(userId);
        return ResponseEntity.ok(rentals);
    }

    @GetMapping("/tool/{toolId}")
    public ResponseEntity<List<Rental>> getByTool(@PathVariable Long toolId) {
        List<Rental> rentals = rentalService.getByTool(toolId);
        return ResponseEntity.ok(rentals);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Rental> update(@PathVariable Long id, @Valid @RequestBody UpdateRentalRequest request) {
        Rental rental = rentalService.updateDates(id, request.getStartDate(), request.getEndDate());
        return ResponseEntity.ok(rental);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rentalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


