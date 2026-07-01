package com.example.recruitment.controller;

import com.example.recruitment.common.Result;
import com.example.recruitment.entity.dto.*;
import com.example.recruitment.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterRequest req) {
        userService.register(req);
        return Result.success(null, "注册成功");
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse resp = userService.login(req);
        return Result.success(resp, "登录成功");
    }

    @GetMapping("/me")
    public Result<UserInfoResponse> me(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        UserInfoResponse resp = userService.getCurrentUser(userId);
        return Result.success(resp);
    }
}
