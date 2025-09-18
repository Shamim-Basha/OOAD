package com.SRVK.Hardware.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ProductController {

    @GetMapping("/products")
    public String getAllProduct(){
        return "Products list";
    }

}