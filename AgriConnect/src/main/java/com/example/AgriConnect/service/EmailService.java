package com.example.AgriConnect.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;


    public void sendPasswordResetMail(
            String email,
            String otp
    ) {

        String resetLink =
                "http://localhost:5173/reset-password?email="
                        + email;


        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setTo(email);
        message.setSubject("AgriConnect Password Reset");

        message.setText(
                "Hello,\n\n"
                        + "Your OTP is: "
                        + otp
                        + "\n\n"
                        + "Reset Password Link:\n"
                        + resetLink
                        + "\n\n"
                        + "OTP valid for 5 minutes."
        );


        mailSender.send(message);
    }
}