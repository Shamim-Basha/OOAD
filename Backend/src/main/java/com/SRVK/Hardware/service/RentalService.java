package com.SRVK.Hardware.service;

import com.SRVK.Hardware.entity.RentalOrder;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.RentalOrderRepository;
import com.SRVK.Hardware.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RentalService {

    private final RentalOrderRepository rentalOrderRepository;
    private final ToolRepository toolRepository;

    @Transactional
    public RentalOrder createRental(Long userId, Long toolId, LocalDate startDate, LocalDate endDate, Integer quantity) {
        log.info("Creating rental - User: {}, Tool: {}, Quantity: {}", userId, toolId, quantity);
        
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

        log.info("Tool found: {} - Current stock: {}, Available: {}", 
            tool.getName(), tool.getStockQuantity(), tool.isAvailable());

        // Check if tool has enough stock
        if (tool.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Insufficient stock. Available: " + tool.getStockQuantity() + ", Requested: " + quantity);
        }

        // Decrease stock quantity
        int oldStock = tool.getStockQuantity();
        tool.setStockQuantity(tool.getStockQuantity() - quantity);
        log.info("Decreasing stock from {} to {}", oldStock, tool.getStockQuantity());

        // Mark tool as unavailable if stock becomes zero
        if (tool.getStockQuantity() == 0) {
            tool.setAvailable(false);
            log.info("Tool {} marked as unavailable (stock is 0)", tool.getName());
        }
        
        toolRepository.save(tool);
        log.info("Tool stock updated successfully");

        // Calculate total cost
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        if (days == 0) days = 1; // Minimum 1 day rental
        BigDecimal total = tool.getDailyRate()
                .multiply(BigDecimal.valueOf(days))
                .multiply(BigDecimal.valueOf(quantity));

        // Create rental with ACTIVE status
        RentalOrder rentalOrder = RentalOrder.builder()
                .userId(userId)
                .toolId(toolId)
                .startDate(startDate)
                .endDate(endDate)
                .quantity(quantity)
                .totalCost(total)
                .status(RentalOrder.RentalStatus.ACTIVE)
                .build();

        RentalOrder saved = rentalOrderRepository.save(rentalOrder);
        log.info("Rental created successfully - ID: {}, Status: {}", saved.getId(), saved.getStatus());
        
        return saved;
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

        // Find rental order
        RentalOrder rentalOrder = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental order not found"));
        
        // Only check for past dates if the rental is still ACTIVE and dates are being changed to the past
        if (rentalOrder.getStatus() == RentalOrder.RentalStatus.ACTIVE && 
            startDate.isBefore(LocalDate.now()) && 
            !startDate.equals(rentalOrder.getStartDate())) {
            throw new IllegalArgumentException("Cannot change active rental to past dates");
        }

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
    public RentalOrder updateRental(Long id, LocalDate startDate, LocalDate endDate, String status) {
        log.info("updateRental called - ID: {}, status: {}", id, status);
        
        // First update dates
        RentalOrder rentalOrder = updateDates(id, startDate, endDate);
        log.info("After updateDates - rental status: {}", rentalOrder.getStatus());
        
        // Then update status if provided
        if (status != null && !status.isEmpty()) {
            log.info("Updating status from {} to {}", rentalOrder.getStatus(), status);
            
            RentalOrder.RentalStatus oldStatus = rentalOrder.getStatus();
            RentalOrder.RentalStatus newStatus = RentalOrder.RentalStatus.valueOf(status);
            
            rentalOrder.setStatus(newStatus);
            log.info("Status set to: {}", newStatus);
            
            // If changing from ACTIVE to RETURNED, increase tool stock and mark as available
            if (oldStatus == RentalOrder.RentalStatus.ACTIVE && 
                newStatus == RentalOrder.RentalStatus.RETURNED) {
                log.info("Changing status from ACTIVE to RETURNED - increasing stock");
                
                Tool tool = toolRepository.findById(rentalOrder.getToolId())
                        .orElseThrow(() -> new IllegalArgumentException("Tool not found"));
                
                int oldStock = tool.getStockQuantity();
                tool.setStockQuantity(tool.getStockQuantity() + rentalOrder.getQuantity());
                
                log.info("Tool {} - Stock increased from {} to {}", 
                    tool.getName(), oldStock, tool.getStockQuantity());
                
                // Mark tool as available if it now has stock
                if (tool.getStockQuantity() > 0) {
                    tool.setAvailable(true);
                    log.info("Tool {} marked as available", tool.getName());
                }
                toolRepository.save(tool);
                log.info("Tool saved successfully");
            }
            // If changing from RETURNED to ACTIVE, decrease tool stock
            else if (oldStatus == RentalOrder.RentalStatus.RETURNED && 
                     newStatus == RentalOrder.RentalStatus.ACTIVE) {
                log.info("Changing status from RETURNED to ACTIVE - decreasing stock");
                
                Tool tool = toolRepository.findById(rentalOrder.getToolId())
                        .orElseThrow(() -> new IllegalArgumentException("Tool not found"));
                if (tool.getStockQuantity() < rentalOrder.getQuantity()) {
                    throw new IllegalArgumentException("Not enough stock to reactivate rental");
                }
                
                int oldStock = tool.getStockQuantity();
                tool.setStockQuantity(tool.getStockQuantity() - rentalOrder.getQuantity());
                
                log.info("Tool {} - Stock decreased from {} to {}", 
                    tool.getName(), oldStock, tool.getStockQuantity());
                
                // Mark tool as unavailable if stock becomes zero
                if (tool.getStockQuantity() == 0) {
                    tool.setAvailable(false);
                    log.info("Tool {} marked as unavailable (stock is 0)", tool.getName());
                }
                toolRepository.save(tool);
                log.info("Tool saved successfully");
            }
            
            log.info("Saving rental order to database...");
            rentalOrder = rentalOrderRepository.save(rentalOrder);
            log.info("Rental order saved successfully - Final status: {}, ID: {}", 
                rentalOrder.getStatus(), rentalOrder.getId());
        }
        
        log.info("Returning updated rental order");
        return rentalOrder;
    }
    
    @Transactional
    public void returnRental(Long id) {
        RentalOrder rentalOrder = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental order not found"));

        rentalOrder.setStatus(RentalOrder.RentalStatus.RETURNED);
        rentalOrderRepository.save(rentalOrder);

        // Increase tool stock and mark as available
        Tool tool = toolRepository.findById(rentalOrder.getToolId())
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        tool.setStockQuantity(tool.getStockQuantity() + rentalOrder.getQuantity());
        // Mark tool as available if it now has stock
        if (tool.getStockQuantity() > 0) {
            tool.setAvailable(true);
        }
        toolRepository.save(tool);
    }

    @Transactional
    public void delete(Long id) {
        log.info("Deleting rental ID: {}", id);
        
        // Get rental before deleting to return stock
        RentalOrder rental = rentalOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental not found"));
        
        // Only return stock if rental was ACTIVE
        if (rental.getStatus() == RentalOrder.RentalStatus.ACTIVE) {
            Tool tool = toolRepository.findById(rental.getToolId())
                    .orElseThrow(() -> new IllegalArgumentException("Tool not found"));
            
            int oldStock = tool.getStockQuantity();
            tool.setStockQuantity(tool.getStockQuantity() + rental.getQuantity());
            
            log.info("Returning stock for deleted rental - Tool: {}, Stock: {} -> {}", 
                tool.getName(), oldStock, tool.getStockQuantity());
            
            // Mark tool as available if it has stock
            if (tool.getStockQuantity() > 0) {
                tool.setAvailable(true);
                log.info("Tool {} marked as available", tool.getName());
            }
            
            toolRepository.save(tool);
        }
        
        rentalOrderRepository.deleteById(id);
        log.info("Rental deleted successfully");
    }
}