package com.SRVK.Hardware.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.SRVK.Hardware.entity.Cart;
import com.SRVK.Hardware.entity.User;

public interface CartRepository extends JpaRepository<Cart,Long> {
    Optional<Cart> findByUser(User user);
}
