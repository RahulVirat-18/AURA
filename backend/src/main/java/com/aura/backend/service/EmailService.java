package com.aura.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // Send Alert Email (Existing logic)
    public void sendAlert(String to, String subject, String body) {
        sendEmail(to, subject, body);
    }

    // Send OTP Email (New logic)
    public void sendOtp(String to, String otp) {
        String subject = "AURA: Password Reset OTP";
        String body = "Your One-Time Password (OTP) for password reset is: " + otp + "\n\n" +
                      "This OTP is valid for 10 minutes.\n" +
                      "If you did not request this, please ignore this email.";
        sendEmail(to, subject, body);
    }

    // Common Helper
    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("rvirat154@gmail.com"); 
            mailSender.send(message);
            System.out.println("Email sent to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}