package com.SRVK.Hardware;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.ToolRepository;

import java.math.BigDecimal;

@SpringBootApplication()
public class HardwareApplication {

    public static void main(String[] args) {
        SpringApplication.run(HardwareApplication.class, args);
    }

    @Bean
    CommandLineRunner seedTools(ToolRepository toolRepository) {
        return args -> {
            if (toolRepository.count() == 0) {
                toolRepository.save(Tool.builder().name("excavator").dailyRate(new BigDecimal("15000")).category("heavy-equipment").available(true).description("Professional excavator for construction projects").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
                toolRepository.save(Tool.builder().name("Cement-mixer").dailyRate(new BigDecimal("8000")).category("construction").available(true).description("Heavy-duty concrete mixer").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
                toolRepository.save(Tool.builder().name("Scaffoldings").dailyRate(new BigDecimal("5000")).category("construction").available(true).description("Complete scaffolding set").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
                toolRepository.save(Tool.builder().name("wacker-machine").dailyRate(new BigDecimal("7000")).category("tools").available(true).description("Compactor/Wacker machine").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
                toolRepository.save(Tool.builder().name("drill").dailyRate(new BigDecimal("3000")).category("power").available(true).description("Power drill for general use").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
                toolRepository.save(Tool.builder().name("foldable-ladders").dailyRate(new BigDecimal("2000")).category("tools").available(true).description("Foldable ladders for home and site").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
            }
        };
    }
}


