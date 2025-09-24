package com.SRVK.Hardware.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.ToolRepository;

import java.math.BigDecimal;

@Profile("dev")
@Component
public class DevDataSeeder implements CommandLineRunner {

    private final ToolRepository toolRepository;

    public DevDataSeeder(ToolRepository toolRepository) {
        this.toolRepository = toolRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (toolRepository.count() == 0) {
            toolRepository.save(Tool.builder().name("excavator").dailyRate(new BigDecimal("15000")).category("heavy-equipment").available(true).description("Professional excavator for construction projects").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
            toolRepository.save(Tool.builder().name("Cement-mixer").dailyRate(new BigDecimal("8000")).category("construction").available(true).description("Heavy-duty concrete mixer").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
            toolRepository.save(Tool.builder().name("Scaffoldings").dailyRate(new BigDecimal("5000")).category("construction").available(true).description("Complete scaffolding set").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
            toolRepository.save(Tool.builder().name("wacker-machine").dailyRate(new BigDecimal("7000")).category("tools").available(true).description("Compactor/Wacker machine").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
            toolRepository.save(Tool.builder().name("drill").dailyRate(new BigDecimal("3000")).category("power").available(true).description("Power drill for general use").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
            toolRepository.save(Tool.builder().name("foldable-ladders").dailyRate(new BigDecimal("2000")).category("tools").available(true).description("Foldable ladders for home and site").imageUrl("https://images.unsplash.com/photo-1581147036325-860c6c2a3b0c?w=400&h=300&fit=crop").build());
        }
    }
}


