package com.SRVK.Hardware.service;

import com.SRVK.Hardware.dto.LoginDTO;
import com.SRVK.Hardware.dto.RegisterDTO;
import com.SRVK.Hardware.dto.ResponseDTO;
import com.SRVK.Hardware.entity.User.UserRole;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public ResponseDTO toResponseDTO(User user) {
        return ResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .postalCode(user.getPostalCode())
                .build();
    }

    public ResponseDTO register(RegisterDTO registerDTO){
        if (userRepository.existsByUsername(registerDTO.getUsername())) { throw new RuntimeException("Username already exists");};
        if (userRepository.existsByEmail(registerDTO.getEmail())) { throw new RuntimeException("Email is already in use");};

        User newUser = toUser(registerDTO);

        User user = userRepository.save(newUser);
        return toResponseDTO(user);
    }

    public ResponseDTO login(LoginDTO loginDTO){
        User user = userRepository.findByUsername(loginDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("Username doesn't exists!"));

        if (!user.getPassword().equals(loginDTO.getPassword())){throw new RuntimeException("Invalid Password");}
        return toResponseDTO(user);
    }

    public List<User> getUsers(){
        return userRepository.findAll();
    }

    public ResponseDTO getUser(Long id){
        try {
            User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User with ID: " + id + " Not Found!"));
            return toResponseDTO(user);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void update(Long id, RegisterDTO dto) {
        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found with Id: " + id));

            // Check for username duplication (excluding current user)
            if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
                if (userRepository.existsByUsernameAndIdNot(dto.getUsername(), id)) {
                    throw new RuntimeException("Username already exists");
                }
                user.setUsername(dto.getUsername());
            }

            // Check for email duplication (excluding current user)
            if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
                if (userRepository.existsByEmailAndIdNot(dto.getEmail(), id)) {
                    throw new RuntimeException("Email already exists");
                }
                user.setEmail(dto.getEmail());
            }

            if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
            if (dto.getLastName() != null) user.setLastName(dto.getLastName());
            if (dto.getPhone() != null) user.setPhone(dto.getPhone());
            if (dto.getAddress() != null) user.setAddress(dto.getAddress());
            if (dto.getCity() != null) user.setCity(dto.getCity());
            if (dto.getPostalCode() != null) user.setPostalCode(dto.getPostalCode());
            if (dto.getPassword() != null) user.setPassword(dto.getPassword());

            userRepository.save(user);

        } catch (Exception e) {
            throw e;
        }
    }


    public void delete(Long id){
        try{
            userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not Found with ID : " + id));
            userRepository.deleteById(id);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
    }
}
