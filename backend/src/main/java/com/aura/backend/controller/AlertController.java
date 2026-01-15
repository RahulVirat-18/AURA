package com.aura.backend.controller;

import com.aura.backend.model.Alert;
import com.aura.backend.model.User;
import com.aura.backend.repository.AlertRepository;
import com.aura.backend.repository.UserRepository;
import com.aura.backend.service.EmailService; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired private AlertRepository alertRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService; 

    // Get Alerts for Dashboard
    @GetMapping("/{userId}")
    public List<Alert> getUserAlerts(@PathVariable Long userId) {
        return alertRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    // Save New Alert (Called by Python Agent or Stress Test)
    @PostMapping("/{userId}")
    public Alert saveAlert(@PathVariable Long userId, @RequestBody Map<String, String> data) {
        User user = userRepository.findById(userId).orElseThrow();
        
        Alert alert = new Alert();
        alert.setType(data.get("type")); // e.g. "CRITICAL_RISK"
        alert.setMessage(data.get("message")); // e.g. "Critical CPU Risk: 99.0%"
        alert.setTimestamp(LocalDateTime.now());
        alert.setUser(user);
        
        // Email Notification Logic
        if (user.isEmailNotificationsEnabled() && user.getEmail() != null) {
            String subject = "AURA ALERT: " + alert.getType();
            String body = "System Notification:\n\n" + alert.getMessage() + "\n\nTime: " + alert.getTimestamp();
            new Thread(() -> emailService.sendAlert(user.getEmail(), subject, body)).start();
        }
        
        return alertRepository.save(alert);
    }

    // --- NEW: CSV EXPORT (4 COLUMNS) ---
    @GetMapping("/{userId}/export")
    public ResponseEntity<byte[]> exportAlertsToCsv(@PathVariable Long userId) {
        try {
            List<Alert> alerts = alertRepository.findByUserIdOrderByTimestampDesc(userId);
            StringBuilder csvBuilder = new StringBuilder();
            
            // 1. Headers matching your requirement
            csvBuilder.append("DATE,TIME,TYPE,PREDICTION %\n");

            // Formatters
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

            for (Alert alert : alerts) {
                String fullMessage = alert.getMessage(); // "Critical CPU Risk: 79.0%"
                
                // 2. Extract Data
                String date = alert.getTimestamp().format(dateFormatter);
                String time = alert.getTimestamp().format(timeFormatter);

                // Determine Type (CPU vs RAM)
                String type = "SYSTEM";
                if (fullMessage.contains("CPU")) type = "CPU";
                else if (fullMessage.contains("RAM") || fullMessage.contains("Memory")) type = "RAM";

                // Extract Percentage (After the colon)
                String prediction = "N/A";
                if (fullMessage.contains(":")) {
                    prediction = fullMessage.substring(fullMessage.lastIndexOf(":") + 1).trim();
                }

                // 3. Append Row
                csvBuilder.append(date).append(",");
                csvBuilder.append(time).append(",");
                csvBuilder.append(type).append(",");
                csvBuilder.append(escapeCsv(prediction)).append("\n");
            }

            byte[] csvBytes = csvBuilder.toString().getBytes();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=aura_alerts.csv")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(csvBytes);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper to prevent CSV breaking
    private String escapeCsv(String data) {
        if (data == null) return "";
        return data.contains(",") ? "\"" + data + "\"" : data;
    }
}