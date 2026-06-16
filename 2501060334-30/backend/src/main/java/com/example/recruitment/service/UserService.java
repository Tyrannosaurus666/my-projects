package com.example.recruitment.service;

import com.example.recruitment.entity.dto.*;

public interface UserService {
    void register(RegisterRequest req);
    LoginResponse login(LoginRequest req);
    UserInfoResponse getCurrentUser(Long userId);
}
