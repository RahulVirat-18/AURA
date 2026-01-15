package com.aura.backend.controller;

import com.aura.backend.model.SystemMetrics;
import com.aura.backend.repository.MetricsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(origins = "*")
public class MetricsController {

    @Autowired
    private MetricsRepository repository;

    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public SystemMetrics receiveMetrics(@RequestBody SystemMetrics metrics) {
        String mlUrl = "http://localhost:5000/predict";
        Map<String, Object> request = new HashMap<>();
        request.put("cpuUsage", metrics.getCpuUsage());
        request.put("memoryUsage", metrics.getMemoryUsage());

        try {
            Map<String, Object> response = restTemplate.postForObject(mlUrl, request, Map.class);
            if (response != null) {
                if (response.containsKey("prediction")) {
                    metrics.setPrediction((int) response.get("prediction"));
                }
                // Capture CPU Risk
                if (response.containsKey("cpuRisk")) {
                    Object r = response.get("cpuRisk");
                    if (r instanceof Number) metrics.setCpuRisk(((Number) r).doubleValue());
                }
                // Capture Memory Risk
                if (response.containsKey("memRisk")) {
                    Object r = response.get("memRisk");
                    if (r instanceof Number) metrics.setMemRisk(((Number) r).doubleValue());
                }
            }
        } catch (Exception e) {
            System.out.println("ML Error: " + e.getMessage());
            metrics.setCpuRisk(0.0);
            metrics.setMemRisk(0.0);
        }
        return repository.save(metrics);
    }

    @GetMapping
    public List<SystemMetrics> getMetrics() {
        return repository.findAll().stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .limit(20)
                .collect(Collectors.toList());
    }
}