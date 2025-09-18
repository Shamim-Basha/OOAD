package com.SRVK.Hardware.service;

import com.SRVK.Hardware.entity.Rental;
import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.RentalRepository;
import com.SRVK.Hardware.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ToolRepository toolRepository;

    public Rental createRental(Long userId, Long toolId, LocalDate startDate, LocalDate endDate) {
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days <= 0) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        BigDecimal total = tool.getDailyRate().multiply(BigDecimal.valueOf(days));

        Rental rental = Rental.builder()
                .userId(userId)
                .toolId(toolId)
                .startDate(startDate)
                .endDate(endDate)
                .totalCost(total)
                .build();
        return rentalRepository.save(rental);
    }

    public List<Rental> getAll() {
        return rentalRepository.findAll();
    }

    public Rental updateDates(Long id, LocalDate startDate, LocalDate endDate) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rental not found"));
        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        if (days <= 0) {
            throw new IllegalArgumentException("End date must be after start date");
        }

        Tool tool = toolRepository.findById(rental.getToolId())
                .orElseThrow(() -> new IllegalArgumentException("Tool not found"));

        rental.setStartDate(startDate);
        rental.setEndDate(endDate);
        rental.setTotalCost(tool.getDailyRate().multiply(BigDecimal.valueOf(days)));
        return rentalRepository.save(rental);
    }

    public void delete(Long id) {
        rentalRepository.deleteById(id);
    }
}


