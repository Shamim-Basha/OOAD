package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.RentalOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalOrderRepository extends JpaRepository<RentalOrder, Long> {

    List<RentalOrder> findByUserId(Long userId);

    List<RentalOrder> findByToolId(Long toolId);

    /**
     * Delete all rental orders for a specific tool (dev/test convenience).
     * Prefer marking tools unavailable in production to preserve history.
     */
    void deleteByToolId(Long toolId);

    // Find overlapping rentals for a specific tool and date range
    @Query("SELECT r FROM RentalOrder r WHERE r.toolId = :toolId " +
           "AND ((r.startDate <= :endDate AND r.endDate >= :startDate))")
    List<RentalOrder> findOverlappingRentals(@Param("toolId") Long toolId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    // Find overlapping rentals excluding a specific rental (for updates)
    @Query("SELECT r FROM RentalOrder r WHERE r.toolId = :toolId " +
           "AND r.id != :excludeRentalId " +
           "AND ((r.startDate <= :endDate AND r.endDate >= :startDate))")
    List<RentalOrder> findOverlappingRentalsExcluding(@Param("toolId") Long toolId,
                                                @Param("startDate") LocalDate startDate,
                                                @Param("endDate") LocalDate endDate,
                                                @Param("excludeRentalId") Long excludeRentalId);
    
    List<RentalOrder> findByOrderId(Long orderId);
}