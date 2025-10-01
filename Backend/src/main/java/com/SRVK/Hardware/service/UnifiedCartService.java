package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.*;
import com.SRVK.Hardware.entity.*;
import com.SRVK.Hardware.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final ProductCartRepository productCartRepository;
    private final RentalCartRepository rentalCartRepository;
    private final ProductRepository productRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;

    public CartResponseDTO getCart(Long userId) {
        List<ProductCart> productCarts = productCartRepository.findByIdUserId(userId);
        List<RentalCart> rentalCarts = rentalCartRepository.findByIdUserId(userId);

        List<CartProductItemDTO> products = productCarts.stream().map(pc -> {
            CartProductItemDTO dto = new CartProductItemDTO();
            dto.setUserId(pc.getId().getUserId());
            dto.setProductId(pc.getId().getProductId());
            dto.setProductName(pc.getProduct().getName());
            dto.setUnitPrice(pc.getProduct().getPrice());
            dto.setQuantity(pc.getQuantity());
            return dto;
        }).collect(Collectors.toList());

        List<CartRentalItemDTO> rentals = rentalCarts.stream().map(rc -> {
            long days = rc.getRentalStart() != null && rc.getRentalEnd() != null ? ChronoUnit.DAYS.between(rc.getRentalStart(), rc.getRentalEnd()) : 0;
            if (days < 0) days = 0;
            CartRentalItemDTO dto = new CartRentalItemDTO();
            dto.setUserId(rc.getId().getUserId());
            dto.setRentalId(rc.getId().getRentalId());
            dto.setProductName(rc.getRental().getName());
            dto.setUnitPrice(rc.getRental().getDailyRate());
            dto.setQuantity(rc.getQuantity());
            dto.setRentalStart(rc.getRentalStart());
            dto.setRentalEnd(rc.getRentalEnd());
            return dto;
        }).collect(Collectors.toList());

        CartResponseDTO cart = new CartResponseDTO();
        cart.setProducts(products);
        cart.setRentals(rentals);
        return cart;
    }

    @Transactional
    public void addProduct(AddProductCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        Product product = productRepository.findById(request.getProductId()).orElseThrow(() -> new IllegalArgumentException("Product not found"));
        userRepository.findById(request.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (product.getStockQuantity() < request.getQuantity()) throw new IllegalArgumentException("Insufficient stock");

        ProductCart.ProductCartKey id = new ProductCart.ProductCartKey(request.getUserId(), request.getProductId());
        ProductCart pc = productCartRepository.findById(id).orElse(ProductCart.builder().id(id).product(product).quantity(0).addedAt(java.time.LocalDateTime.now()).build());
        pc.setQuantity(pc.getQuantity() + request.getQuantity());
        productCartRepository.save(pc);
        log.info("Added product {} to cart of user {} qty {}", request.getProductId(), request.getUserId(), request.getQuantity());
    }

    @Transactional
    public void addRental(AddRentalCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        if (request.getRentalStart() == null || request.getRentalEnd() == null || !request.getRentalStart().isBefore(request.getRentalEnd()))
            throw new IllegalArgumentException("Invalid rental dates");
        Rental rental = rentalRepository.findById(request.getRentalId()).orElseThrow(() -> new IllegalArgumentException("Rental not found"));
        userRepository.findById(request.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (rental.getStockQuantity() < request.getQuantity()) throw new IllegalArgumentException("Insufficient stock");

        RentalCart.RentalCartKey id = new RentalCart.RentalCartKey(request.getUserId(), request.getRentalId());
        RentalCart rc = rentalCartRepository.findById(id).orElse(RentalCart.builder().id(id).rental(rental).quantity(0).addedAt(java.time.LocalDateTime.now()).build());
        rc.setQuantity(request.getQuantity());
        rc.setRentalStart(request.getRentalStart());
        rc.setRentalEnd(request.getRentalEnd());
        rentalCartRepository.save(rc);
        log.info("Added rental {} to cart of user {} qty {}", request.getRentalId(), request.getUserId(), request.getQuantity());
    }

    @Transactional
    public void updateProduct(Long userId, Long productId, UpdateProductCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        ProductCart.ProductCartKey id = new ProductCart.ProductCartKey(userId, productId);
        ProductCart pc = productCartRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (pc.getProduct().getStockQuantity() < request.getQuantity()) throw new IllegalArgumentException("Insufficient stock");
        pc.setQuantity(request.getQuantity());
        productCartRepository.save(pc);
        log.info("Updated product cart for user {} product {} qty {}", userId, productId, request.getQuantity());
    }

    @Transactional
    public void updateRental(Long userId, Long rentalId, UpdateRentalCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) throw new IllegalArgumentException("Quantity must be > 0");
        if (request.getRentalStart() == null || request.getRentalEnd() == null || !request.getRentalStart().isBefore(request.getRentalEnd()))
            throw new IllegalArgumentException("Invalid rental dates");
        RentalCart.RentalCartKey id = new RentalCart.RentalCartKey(userId, rentalId);
        RentalCart rc = rentalCartRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Item not found"));
        if (rc.getRental().getStockQuantity() < request.getQuantity()) throw new IllegalArgumentException("Insufficient stock");
        rc.setQuantity(request.getQuantity());
        rc.setRentalStart(request.getRentalStart());
        rc.setRentalEnd(request.getRentalEnd());
        rentalCartRepository.save(rc);
        log.info("Updated rental cart for user {} rental {} qty {}", userId, rentalId, request.getQuantity());
    }

    @Transactional
    public void removeProduct(Long userId, Long productId) {
        productCartRepository.deleteByIdUserIdAndIdProductId(userId, productId);
        log.info("Removed product {} from cart of user {}", productId, userId);
    }

    @Transactional
    public void removeRental(Long userId, Long rentalId) {
        rentalCartRepository.deleteByIdUserIdAndIdRentalId(userId, rentalId);
        log.info("Removed rental {} from cart of user {}", rentalId, userId);
    }
}


