package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.ProductCart;
import com.SRVK.Hardware.entity.ProductCart.ProductCartKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductCartRepository extends JpaRepository<ProductCart, ProductCartKey> {
    List<ProductCart> findByIdUserId(Long userId);
    void deleteByIdUserIdAndIdProductId(Long userId, Long productId);
}


