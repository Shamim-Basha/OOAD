package com.SRVK.Hardware.controller;

import com.SRVK.Hardware.dto.LoginDTO;
import com.SRVK.Hardware.dto.RegisterDTO;
import com.SRVK.Hardware.dto.ResponseDTO;
import com.SRVK.Hardware.dto.ChangePasswordDTO;
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
    public ResponseEntity<ResponseDTO> register(@RequestBody RegisterDTO dto){
        try{
            return ResponseEntity.ok(userService.register(dto));
        }
        catch (Exception e){
            ResponseDTO rd = ResponseDTO.builder().message(e.getMessage()).build();
            return ResponseEntity.status(HttpStatus.CONFLICT).body(rd);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@RequestBody LoginDTO dto){
        try{
            ResponseDTO user = userService.login(dto);
            return ResponseEntity.ok(user);
        }
        catch (Exception e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<User>> getUsers(){
        return ResponseEntity.ok(userService.getUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> getUser(@PathVariable Long id){
        try{
            ResponseDTO user = userService.getUser(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable Long id, @RequestBody RegisterDTO dto){
        try{
            userService.update(id,dto);
            return ResponseEntity.ok("Updated user with ID: " + id + " Successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id){
        try{
            userService.delete(id);
            return ResponseEntity.ok("User with Id : " + id + " has been deleted Successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<String> changePassword(@PathVariable Long id, @RequestBody ChangePasswordDTO dto) {
        try {
            userService.changePassword(id, dto.getOldPassword(), dto.getNewPassword());
            return ResponseEntity.ok("Password changed successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to change password");
        }
    }
}