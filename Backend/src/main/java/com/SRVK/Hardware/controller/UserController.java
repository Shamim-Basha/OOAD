package com.SRVK.Hardware.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @PostMapping("/register")
    public String register(){
        return "Registering user";
    }

    @PostMapping("/login")
    public String authenticate(){
        return "Logging in";
    }

    @GetMapping
    public String getUsers(){
        return "Getting all users";
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