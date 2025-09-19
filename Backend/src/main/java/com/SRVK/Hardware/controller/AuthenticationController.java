package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.AuthenticationRequest;
import com.SRVK.Hardware.dto.AuthenticationResponse;
import com.SRVK.Hardware.dto.RegisterRequest;
import com.SRVK.Hardware.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        AuthenticationResponse authenticationResponse = authenticationService.register(request);
        if (authenticationResponse.getMessage().equals("User registered successfully")){
            return ResponseEntity.ok(authenticationResponse);
        }else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(authenticationResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        AuthenticationResponse authenticationResponse = authenticationService.authenticate(request);
        if (authenticationResponse.getMessage().equals("Login successful")){
            return ResponseEntity.ok(authenticationResponse);
        }else{
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(authenticationResponse);
        }
    }
}