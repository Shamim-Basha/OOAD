package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.LoginDTO;
import com.SRVK.Hardware.dto.RegisterDTO;
import com.SRVK.Hardware.entity.User;
import com.SRVK.Hardware.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@AllArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDTO dto){
        try{
            userService.register(dto);
            return ResponseEntity.ok("Message: User registered Successfully!");
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO dto){
        try{
            userService.login(dto);
            return ResponseEntity.ok("Message: User Logged in Successfully!");
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getUsers(){
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id){
        try{
            User user = userService.getUser(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public String update(@PathVariable Long id){
        return "Updating user " + id;
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id){
        return "Deleting User "+ id;
    }
}