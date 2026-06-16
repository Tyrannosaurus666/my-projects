package com.example.recruitment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.recruitment.common.BusinessException;
import com.example.recruitment.entity.User;
import com.example.recruitment.entity.dto.*;
import com.example.recruitment.mapper.UserMapper;
import com.example.recruitment.service.UserService;
import com.example.recruitment.util.JwtUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final JwtUtils jwtUtils;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserServiceImpl(UserMapper userMapper, JwtUtils jwtUtils) {
        this.userMapper = userMapper;
        this.jwtUtils = jwtUtils;
    }

    @Override
    public void register(RegisterRequest req) {
        User exist = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername()));
        if (exist != null) {
            throw new BusinessException(1001, "用户名已存在");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setRole(req.getRole());
        userMapper.insert(user);
    }

    @Override
    public LoginResponse login(LoginRequest req) {
        User user = userMapper.selectOne(
                new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername()));
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException(1002, "密码错误");
        }
        String token = jwtUtils.generateToken(user.getId(), user.getRole());
        return new LoginResponse(token, user.getId(), user.getRole(), user.getUsername());
    }

    @Override
    public UserInfoResponse getCurrentUser(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return new UserInfoResponse(user.getId(), user.getUsername(), user.getRole());
    }
}
