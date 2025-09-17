package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.AuthenticationRequest;
import com.SRVK.Hardware.dto.AuthenticationResponse;
import com.SRVK.Hardware.dto.RegisterRequest;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        try {
            // Check if user already exists
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("UserName already exists");
            }

            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }

            // Create new user
            var user = User.builder()
                    .username(request.getUsername())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .city(request.getCity())
                    .postalCode(request.getPostalCode())
                    .role(request.getRole() != null ? request.getRole() : User.UserRole.CUSTOMER)
                    .enabled(true)
                    .build();

            userRepository.save(user);

            var jwtToken = jwtService.generateToken(user);
            return new AuthenticationResponse(jwtToken, user, "User registered successfully");
        }catch (Exception e){
            return new AuthenticationResponse(e.getMessage());
        }
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            var user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            var jwtToken = jwtService.generateToken(user);
            return new AuthenticationResponse(jwtToken, user, "Login successful");

        } catch (Exception e) {
            return new AuthenticationResponse("Invalid username or password");
        }
    }
}