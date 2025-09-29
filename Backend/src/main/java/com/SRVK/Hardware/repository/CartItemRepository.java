package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}
