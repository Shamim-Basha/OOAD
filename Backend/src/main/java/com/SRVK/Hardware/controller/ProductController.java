package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.entity.Product;
import com.SRVK.Hardware.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // ✅ GET all products
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // ✅ GET single product
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            if (product == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ POST: Add new product (supports multipart/form-data)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addNewProduct(
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("sub_category") String subCategory,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            Product product = new Product();
            product.setName(name);
            product.setCategory(category);
            product.setSubCategory(subCategory);
            product.setPrice(price);
            product.setQuantity(quantity);
            product.setDescription(description);

            if (imageFile != null && !imageFile.isEmpty()) {
                product.setImage(imageFile.getBytes());
            }

            Product saved = productService.addProduct(product);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Error saving product: " + e.getMessage());
        }
    }

    // ✅ PUT: Update existing product (supports multipart/form-data)
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("category") String category,
            @RequestParam("sub_category") String subCategory,
            @RequestParam("price") double price,
            @RequestParam("quantity") int quantity,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            Product existing = productService.getProductById(id);
            if (existing == null) {
                return ResponseEntity.notFound().build();
            }

            existing.setName(name);
            existing.setCategory(category);
            existing.setSubCategory(subCategory);
            existing.setPrice(price);
            existing.setQuantity(quantity);
            existing.setDescription(description);

            if (imageFile != null && !imageFile.isEmpty()) {
                existing.setImage(imageFile.getBytes());
            }

            Product updated = productService.updateProduct(id, existing);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("⚠️ Error updating product: " + e.getMessage());
        }
    }

    // ✅ DELETE: Remove product
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
}
