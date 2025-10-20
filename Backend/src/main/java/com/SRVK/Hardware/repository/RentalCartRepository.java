package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.RentalCart;
import com.SRVK.Hardware.entity.RentalCart.RentalCartKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
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
    @Transactional
    void deleteByIdUserIdAndIdToolId(Long userId, Long toolId);

    /**
     * Delete all rental cart items referencing a specific tool
     */
    void deleteByIdToolId(Long toolId);
}


