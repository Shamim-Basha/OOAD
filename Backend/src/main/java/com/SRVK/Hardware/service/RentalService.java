package com.SRVK.Hardware.service;

import com.SRVK.Hardware.entity.Rental;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.RentalRepository;
import com.SRVK.Hardware.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ToolRepository toolRepository;

    @Transactional
    public Rental createRental(Long userId, Long toolId, LocalDate startDate, LocalDate endDate, Integer quantity) {
        // Validate input
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot rent tools for past dates");
        }
        if (quantity == null || quantity <= 0) {
            quantity = 1;
        }

        // Find and validate tool
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        // Check if tool has enough stock
        if (!tool.hasEnoughStock(quantity)) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + tool.getStockQuantity() + ", Requested: " + quantity);
        }

        // Check for overlapping rentals and calculate required stock
        List<Rental> overlappingRentals = rentalRepository.findOverlappingRentals(toolId, startDate, endDate);
        int totalRentedQuantity = overlappingRentals.stream()
                .mapToInt(Rental::getQuantity)
                .sum();

        // Check if there's enough stock considering existing rentals
        if (totalRentedQuantity + quantity > tool.getStockQuantity()) {
            throw new IllegalArgumentException("Not enough available stock for the requested dates. " +
                    "Requested: " + quantity + ", Already rented: " + totalRentedQuantity + 
                    ", Total stock: " + tool.getStockQuantity());
        }

        // Calculate total cost
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        BigDecimal total = tool.getDailyRate()
                .multiply(BigDecimal.valueOf(days))
                .multiply(BigDecimal.valueOf(quantity));

        // Create rental
        Rental rental = Rental.builder()
                .userId(userId)
                .toolId(toolId)
                .startDate(startDate)
                .endDate(endDate)
                .quantity(quantity)
                .totalCost(total)
                .build();
        
        return rentalRepository.save(rental);
    }

    public List<Rental> getAll() {
        return rentalRepository.findAll();
    }

    @Transactional
    public Rental updateDates(Long id, LocalDate startDate, LocalDate endDate) {
        // Validate input
        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException("Start date and end date are required");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        if (startDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot rent tools for past dates");
        }

        // Find rental
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental not found"));

        // Find tool
        Tool tool = toolRepository.findById(rental.getToolId())
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        // Check for overlapping rentals excluding this rental
        List<Rental> overlappingRentals = rentalRepository.findOverlappingRentalsExcluding(
                rental.getToolId(), startDate, endDate, id);
        
        int totalRentedQuantity = overlappingRentals.stream()
                .mapToInt(Rental::getQuantity)
                .sum();

        // Check if there's enough stock considering existing rentals
        if (totalRentedQuantity + rental.getQuantity() > tool.getStockQuantity()) {
            throw new IllegalArgumentException("Not enough available stock for the requested dates. " +
                    "Requested: " + rental.getQuantity() + ", Already rented: " + totalRentedQuantity + 
                    ", Total stock: " + tool.getStockQuantity());
        }

        // Update rental
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        rental.setStartDate(startDate);
        rental.setEndDate(endDate);
        rental.setTotalCost(tool.getDailyRate()
                .multiply(BigDecimal.valueOf(days))
                .multiply(BigDecimal.valueOf(rental.getQuantity())));
        
        return rentalRepository.save(rental);
    }

    public void delete(Long id) {
        rentalRepository.deleteById(id);
    }
}


