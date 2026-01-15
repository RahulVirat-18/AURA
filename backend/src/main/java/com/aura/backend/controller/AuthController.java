package com.aura.backend.controller;

import com.aura.backend.model.User;
import com.aura.backend.repository.UserRepository;
import com.aura.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private EmailService emailService;

    // 1. Forgot Password - Generate OTP & Email it
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return "ERROR: Email not found";
        }

        User user = userOpt.get();
        
        // Generate 6-digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Save to DB (Valid for 10 mins)
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Send Email
        new Thread(() -> emailService.sendOtp(email, otp)).start();

        return "SUCCESS";
    }

    // 2. Verify OTP
    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String otp = data.get("otp");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return "ERROR: User not found";

        User user = userOpt.get();

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            return "ERROR: Invalid OTP";
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return "ERROR: OTP Expired";
        }

        return "SUCCESS";
    }

    // 3. Reset Password
    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody Map<String, String> data) {
        String email = data.get("email");
        String otp = data.get("otp");
        String newPassword = data.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return "ERROR: User not found";

        User user = userOpt.get();

        // Double check OTP for security
        if (!user.getOtp().equals(otp) || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return "ERROR: Invalid request";
        }

        // Update Password (store as plain text for now based on your User model)
        user.setPassword(newPassword);
        
        // Clear OTP fields
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return "SUCCESS";
    }
}