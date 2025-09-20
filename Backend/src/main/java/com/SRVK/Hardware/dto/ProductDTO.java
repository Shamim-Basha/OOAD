package com.SRVK.Hardware.dto;

import jakarta.persistence.*;
import lombok.Data;

@Data
public class ProductDTO {
        private Long id;
        private String name;
        private int quantity;

}
