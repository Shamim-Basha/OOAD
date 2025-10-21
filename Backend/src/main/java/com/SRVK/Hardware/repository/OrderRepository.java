package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.Order;
import com.SRVK.Hardware.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUser(User user);
    List<Order> findAllByOrderByCreatedAtDesc();
}


