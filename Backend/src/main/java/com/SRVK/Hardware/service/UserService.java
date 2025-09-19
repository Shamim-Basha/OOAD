package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.LoginDTO;
import com.SRVK.Hardware.dto.RegisterDTO;
import com.SRVK.Hardware.entity.User.UserRole;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class UserService {
    private UserRepository userRepository;

    public User toUser(RegisterDTO dto) {
        return User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .postalCode(dto.getPostalCode())
                .role(UserRole.CUSTOMER)
                .build();
    }

    public void register(RegisterDTO registerDTO){
        if (userRepository.existsByUsername(registerDTO.getUsername())) { throw new RuntimeException("Username already exists");};
        if (userRepository.existsByEmail(registerDTO.getEmail())) { throw new RuntimeException("Email is already in use");};

        User newUser = toUser(registerDTO);

        userRepository.save(newUser);
    }

    public void login(LoginDTO loginDTO){
        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("Username doesn't exists!"));

        if (!user.getPassword().equals(loginDTO.getPassword())){throw new RuntimeException("Invalid Password");}
    }

    public List<User> getUsers(){
        return userRepository.findAll();
    }

    public User getUser(Long id){
        try {
            return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User with ID: " + id + " Not Found!"));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public User update(Long id){
        try{
            userRepository
        }
    }
}
