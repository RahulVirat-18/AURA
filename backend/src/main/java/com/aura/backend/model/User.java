package com.aura.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String email;
    private String password; // Will store Hashed Password
    private boolean emailNotificationsEnabled;
    private int alertIntervalMinutes;

    // --- SYSTEM REGISTRATION SECURITY ---
    @Column(unique = true)
    private String systemId;  // Unique system identifier (generated on first registration)
    private String registeredEmail; // Email system was first registered with

    // --- NEW SECURITY FIELDS ---
    private String otp;
    private LocalDateTime otpExpiry;
}