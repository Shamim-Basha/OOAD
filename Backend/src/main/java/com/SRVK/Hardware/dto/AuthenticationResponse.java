package com.SRVK.Hardware.dto;

import com.SRVK.Hardware.entity.User;
import lombok.Data;

@Data
public class AuthenticationResponse {
    private String token;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String message;

    public AuthenticationResponse(String token, User user, String message) {
        this.token = token;
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.role = user.getRole().name();
        this.message = message;
    }

    public AuthenticationResponse(String message) {
        this.message = message;
    }
}