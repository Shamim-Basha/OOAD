package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.CreateRentalRequest;
import com.SRVK.Hardware.dto.UpdateRentalRequest;
import com.SRVK.Hardware.entity.RentalOrder;
import com.SRVK.Hardware.service.RentalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
@CrossOrigin(*)
@Slf4j
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    public ResponseEntity<RentalOrder> create(@Valid @RequestBody CreateRentalRequest request) {
        RentalOrder rental = rentalService.createRental(
                request.getUserId(),
                request.getToolId(),
                request.getStartDate(),
                request.getEndDate(),
                request.getQuantity()
        );
        return ResponseEntity.ok(rental);
    }

    @GetMapping
    public ResponseEntity<List<RentalOrder>> all() {
        return ResponseEntity.ok(rentalService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RentalOrder> getById(@PathVariable Long id) {
        RentalOrder rental = rentalService.getById(id);
        return ResponseEntity.ok(rental);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RentalOrder>> getByUser(@PathVariable Long userId) {
        List<RentalOrder> rentals = rentalService.getByUser(userId);
        return ResponseEntity.ok(rentals);
    }

    @GetMapping("/tool/{toolId}")
    public ResponseEntity<List<RentalOrder>> getByTool(@PathVariable Long toolId) {
        List<RentalOrder> rentals = rentalService.getByTool(toolId);
        return ResponseEntity.ok(rentals);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RentalOrder> update(@PathVariable Long id, @Valid @RequestBody UpdateRentalRequest request) {
        log.info("Received update request for rental ID: {}", id);
        log.info("Update data - startDate: {}, endDate: {}, status: {}", 
            request.getStartDate(), request.getEndDate(), request.getStatus());
        
        RentalOrder rental = rentalService.updateRental(id, request.getStartDate(), request.getEndDate(), request.getStatus());
        
        log.info("Updated rental - ID: {}, Status: {}", rental.getId(), rental.getStatus());
        return ResponseEntity.ok(rental);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rentalService.delete(id);
        return ResponseEntity.noContent().build();
    }
}


