package com.aura.backend.controller;

import com.aura.backend.model.User;
import com.aura.backend.repository.UserRepository;
import com.aura.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;
    
    // Security Tool (Hashing)
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ===========================
    // 1. AUTHENTICATION SECTION
    // ===========================

    // Register User
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        // Check if email already registered
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return Map.of("success", false, "message", "Email already registered");
        }
        
        // Check if systemId already exists (prevent same system with different email)
        String systemId = user.getSystemId();
        if (systemId != null && !systemId.isEmpty()) {
            Optional<User> existingSystem = userRepository.findBySystemId(systemId);
            if (existingSystem.isPresent()) {
                String registeredEmail = existingSystem.get().getRegisteredEmail();
                return Map.of(
                    "success", false, 
                    "message", "System already initialized and activated with email: " + registeredEmail
                );
            }
        }
        
        // Set Defaults
        user.setEmailNotificationsEnabled(false);
        user.setAlertIntervalMinutes(5);
        user.setRegisteredEmail(user.getEmail()); // Store registration email
        
        // Hash Password before saving
        user.setPassword(encoder.encode(user.getPassword())); 
        
        User saved = userRepository.save(user);
        return Map.of("success", true, "user", saved);
    }

    // Login User
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String rawPassword = data.get("password");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        // Verify Password Match (Raw vs Hashed)
        if (userOpt.isPresent() && encoder.matches(rawPassword, userOpt.get().getPassword())) {
            return Map.of("success", true, "user", userOpt.get());
        }
        return Map.of("success", false, "message", "Invalid email or password");
    }

    // ===========================
    // 2. PASSWORD RECOVERY (OTP)
    // ===========================

    // Forgot Password - Generate & Email OTP
    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) return Map.of("success", false, "message", "Email not found");
        
        User user = userOpt.get();
        
        // Generate 6-Digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10)); // Valid for 10 mins
        userRepository.save(user);
        
        // Send Email (Async)
        new Thread(() -> emailService.sendOtp(email, otp)).start();
        
        return Map.of("success", true, "message", "OTP sent to email");
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public Map<String, Object> verifyOtp(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String otp = data.get("otp");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Map.of("success", false, "message", "User not found");
        
        User user = userOpt.get();
        
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return Map.of("success", false, "message", "Invalid OTP");
        }
        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return Map.of("success", false, "message", "OTP Expired");
        }
        
        return Map.of("success", true, "message", "OTP Verified");
    }

    // Reset Password
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String otp = data.get("otp");
        String newPass = data.get("newPassword");
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Map.of("success", false, "message", "User not found");
        
        User user = userOpt.get();
        
        // Security Check: Ensure OTP is still valid during reset
        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return Map.of("success", false, "message", "Invalid Request");
        }
        
        // Hash New Password
        user.setPassword(encoder.encode(newPass));
        user.setOtp(null); // Clear OTP
        user.setOtpExpiry(null);
        userRepository.save(user);
        
        return Map.of("success", true, "message", "Password Reset Successfully");
    }

    // ===========================
    // 3. SETTINGS & PROFILE
    // ===========================

    // Get User Details (For Settings/Profile Page)
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    // Update Settings (Intervals & Notifications)
    @PostMapping("/settings/{id}")
    public User updateSettings(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        User user = userRepository.findById(id).orElseThrow();
        if (updates.containsKey("emailEnabled")) {
            user.setEmailNotificationsEnabled(Boolean.parseBoolean(updates.get("emailEnabled").toString()));
        }
        if (updates.containsKey("interval")) {
            user.setAlertIntervalMinutes(Integer.parseInt(updates.get("interval").toString()));
        }
        return userRepository.save(user);
    }

    // --- NEW: Update Profile (Username, Email, Change Password) ---
    @PutMapping("/{id}")
    public User updateProfile(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = userRepository.findById(id).orElseThrow();

        if (payload.containsKey("username") && !payload.get("username").isEmpty()) {
            user.setUsername(payload.get("username"));
        }
        if (payload.containsKey("email") && !payload.get("email").isEmpty()) {
            user.setEmail(payload.get("email"));
        }
        
        // Update Password ONLY if provided
        if (payload.containsKey("password") && !payload.get("password").isEmpty()) {
            // Hash the new password before saving
            user.setPassword(encoder.encode(payload.get("password"))); 
        }

        return userRepository.save(user);
    }
}