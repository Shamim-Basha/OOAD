package com.SRVK.Hardware.config;

import com.SRVK.Hardware.entity.Tool;
import com.SRVK.Hardware.repository.ToolRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ToolRepository toolRepository;

    @Override
    public void run(String... args) throws Exception {
        // Initialize totalStock for existing tools that don't have it set
        List<Tool> tools = toolRepository.findAll();
        boolean updated = false;
        
        for (Tool tool : tools) {
            if (tool.getTotalStock() == null || tool.getTotalStock() == 0) {
                tool.setTotalStock(tool.getStockQuantity());
                toolRepository.save(tool);
                log.info("Initialized totalStock for tool: {} - set to {}", tool.getName(), tool.getTotalStock());
                updated = true;
            }
        }
        
        if (updated) {
            log.info("Database initialization completed - totalStock field updated for existing tools");
        }
    }
}
