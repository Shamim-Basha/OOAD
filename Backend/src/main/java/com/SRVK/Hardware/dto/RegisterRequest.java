package com.SRVK.Hardware.dto;

import com.SRVK.Hardware.entity.User;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String city;
    private String postalCode;
    private User.UserRole role;
}