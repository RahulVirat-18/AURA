package com.aura.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Alert {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String type; // e.g., "CRITICAL_CPU"
    private String message;
    private LocalDateTime timestamp;
    
    // Link alert to a specific user
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}