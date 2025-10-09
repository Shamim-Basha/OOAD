package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.ProductCart;
import com.SRVK.Hardware.entity.ProductCart.ProductCartKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for managing product cart items.
 * Uses JPA method naming conventions for automatic query generation.
 */
@Repository
public interface ProductCartRepository extends JpaRepository<ProductCart, ProductCartKey> {
    /**
     * Find all product cart items for a specific user
     * @param userId the user ID
     * @return list of product cart items
     */
    List<ProductCart> findByIdUserId(Long userId);
    
    /**
     * Delete a specific product cart item by user ID and product ID
     * @param userId the user ID
     * @param productId the product ID
     */
    void deleteByIdUserIdAndIdProductId(Long userId, Long productId);
}


