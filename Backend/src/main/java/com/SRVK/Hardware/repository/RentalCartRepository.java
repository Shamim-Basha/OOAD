package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.RentalCart;
import com.SRVK.Hardware.entity.RentalCart.RentalCartKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for managing rental cart items.
 * Uses JPA method naming conventions for automatic query generation.
 */
@Repository
public interface RentalCartRepository extends JpaRepository<RentalCart, RentalCartKey> {
    /**
     * Find all rental cart items for a specific user
     * @param userId the user ID
     * @return list of rental cart items
     */
    List<RentalCart> findByIdUserId(Long userId);
    
    /**
     * Delete a specific rental cart item by user ID and tool ID
     * @param userId the user ID
     * @param toolId the tool ID
     */
    void deleteByIdUserIdAndIdToolId(Long userId, Long toolId);
    
    @Modifying
    @Transactional
    @Query(value = "INSERT INTO rental_cart (user_id, tool_id, quantity, rental_start, rental_end, total_cost, added_at) " +
           "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)", nativeQuery = true)
    void insertRentalCart(
        Long userId,
        Long toolId,
        Integer quantity,
        LocalDate rentalStart,
        LocalDate rentalEnd,
        BigDecimal totalCost,
        LocalDateTime addedAt
    );
}


