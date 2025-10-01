package com.SRVK.Hardware.repository;

import com.SRVK.Hardware.entity.RentalCart;
import com.SRVK.Hardware.entity.RentalCart.RentalCartKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalCartRepository extends JpaRepository<RentalCart, RentalCartKey> {
    List<RentalCart> findByIdUserId(Long userId);
    void deleteByIdUserIdAndIdRentalId(Long userId, Long rentalId);
}


