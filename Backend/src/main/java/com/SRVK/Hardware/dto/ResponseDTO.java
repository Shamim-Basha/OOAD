package com.SRVK.Hardware.dto;

import com.SRVK.Hardware.entity.User;
import lombok.*;

@Getter @Setter @Builder
public class ResponseDTO {
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private String city;
    private String postalCode;
    private String token;
    private String message;
    private User.UserRole role;
}
