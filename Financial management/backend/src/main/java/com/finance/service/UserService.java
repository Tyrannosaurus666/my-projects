package com.finance.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.finance.entity.User;
import com.finance.entity.dto.LoginRequest;
import com.finance.entity.dto.LoginResponse;
import com.finance.entity.dto.RegisterRequest;
import com.finance.entity.dto.UserInfo;

public interface UserService extends IService<User> {
    LoginResponse login(LoginRequest request);
    void register(RegisterRequest request);
    UserInfo getCurrentUser(Long userId);
}
