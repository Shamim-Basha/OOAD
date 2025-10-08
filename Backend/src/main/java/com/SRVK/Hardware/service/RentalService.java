package com.SRVK.Hardware.service;

import com.SRVK.Hardware.entity.RentalOrder;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.RentalOrderRepository;
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

    private final RentalOrderRepository rentalOrderRepository;
    private final ToolRepository toolRepository;

    @Transactional
    public RentalOrder createRental(Long userId, Long toolId, LocalDate startDate, LocalDate endDate, Integer quantity) {
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
        if (tool.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + tool.getStockQuantity() + ", Requested: " + quantity);
        }

        // Check for overlapping rentals and calculate required stock
        List<RentalOrder> overlappingRentals = rentalOrderRepository.findOverlappingRentals(toolId, startDate, endDate);
        int totalRentedQuantity = overlappingRentals.stream()
                .mapToInt(RentalOrder::getQuantity)
                .sum();

        // Check if there's enough stock considering existing rentals
        if (totalRentedQuantity + quantity > tool.getStockQuantity()) {
            throw new IllegalArgumentException("Not enough available stock for the requested dates. " +
                    "Requested: " + quantity + ", Already rented: " + totalRentedQuantity +
                    ", Total stock: " + tool.getStockQuantity());
        }

        // Calculate total cost
        // Note: ChronoUnit.DAYS.between calculates the difference between dates
        // For example: between 2025-01-01 and 2025-01-02 = 1 day (not 2)
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days == 0) days = 1; // Minimum 1 day rental
        BigDecimal total = tool.getDailyRate()
                .multiply(BigDecimal.valueOf(days))
                .multiply(BigDecimal.valueOf(quantity));

        // Create rental
        RentalOrder rentalOrder = RentalOrder.builder()
                .userId(userId)
                .toolId(toolId)
                .startDate(startDate)
                .endDate(endDate)
                .quantity(quantity)
                .totalCost(total)
                .build();

        return rentalOrderRepository.save(rentalOrder);
    }

    public List<RentalOrder> getAll() {
        return rentalOrderRepository.findAll();
    }

    public RentalOrder getById(Long id) {
        return rentalOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental order not found"));
    }

    public List<RentalOrder> getByUser(Long userId) {
        return rentalOrderRepository.findByUserId(userId);
    }

    public List<RentalOrder> getByTool(Long toolId) {
        return rentalOrderRepository.findByToolId(toolId);
    }

    @Transactional
    public RentalOrder updateDates(Long id, LocalDate startDate, LocalDate endDate) {
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

        // Find rental order
        RentalOrder rentalOrder = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental order not found"));

        // Find tool
        Tool tool = toolRepository.findById(rentalOrder.getToolId())
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        // Check for overlapping rentals excluding this rental
        List<RentalOrder> overlappingRentals = rentalOrderRepository.findOverlappingRentalsExcluding(
                rentalOrder.getToolId(), startDate, endDate, id);

        int totalRentedQuantity = overlappingRentals.stream()
                .mapToInt(RentalOrder::getQuantity)
                .sum();

        // Check if there's enough stock considering existing rentals
        if (totalRentedQuantity + rentalOrder.getQuantity() > tool.getStockQuantity()) {
            throw new IllegalArgumentException("Not enough available stock for the requested dates. " +
                    "Requested: " + rentalOrder.getQuantity() + ", Already rented: " + totalRentedQuantity +
                    ", Total stock: " + tool.getStockQuantity());
        }

        // Update rental order
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days == 0) days = 1; // Minimum 1 day rental

        rentalOrder.setStartDate(startDate);
        rentalOrder.setEndDate(endDate);
        rentalOrder.setTotalCost(tool.getDailyRate()
                .multiply(BigDecimal.valueOf(days))
                .multiply(BigDecimal.valueOf(rentalOrder.getQuantity())));

        return rentalOrderRepository.save(rentalOrder);
    }

    @Transactional
    public void returnRental(Long id) {
        RentalOrder rentalOrder = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental order not found"));

        rentalOrder.setStatus(RentalOrder.RentalStatus.RETURNED);
        rentalOrderRepository.save(rentalOrder);

        // Increase tool stock
        Tool tool = toolRepository.findById(rentalOrder.getToolId())
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        tool.setStockQuantity(tool.getStockQuantity() + rentalOrder.getQuantity());
        toolRepository.save(tool);
    }

    public void delete(Long id) {
        rentalOrderRepository.deleteById(id);
    }
}