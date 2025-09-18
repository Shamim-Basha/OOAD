package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.Product;
import com.SRVK.Hardware.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository {
    Optional<Product> findByProductName(String productName);
    boolean existsByProductName(String productName);
}
