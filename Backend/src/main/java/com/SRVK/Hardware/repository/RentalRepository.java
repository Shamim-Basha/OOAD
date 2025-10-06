package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {
    
    List<Rental> findByUserId(Long userId);
    
    List<Rental> findByToolId(Long toolId);
    
    // Find overlapping rentals for a specific tool and date range
    @Query("SELECT r FROM Rental r WHERE r.toolId = :toolId " +
           "AND ((r.startDate <= :endDate AND r.endDate >= :startDate))")
    List<Rental> findOverlappingRentals(@Param("toolId") Long toolId, 
                                       @Param("startDate") LocalDate startDate, 
                                       @Param("endDate") LocalDate endDate);
    
    // Find overlapping rentals excluding a specific rental (for updates)
    @Query("SELECT r FROM Rental r WHERE r.toolId = :toolId " +
           "AND r.id != :excludeRentalId " +
           "AND ((r.startDate <= :endDate AND r.endDate >= :startDate))")
    List<Rental> findOverlappingRentalsExcluding(@Param("toolId") Long toolId, 
                                                @Param("startDate") LocalDate startDate, 
                                                @Param("endDate") LocalDate endDate,
                                                @Param("excludeRentalId") Long excludeRentalId);
}


