package com.finance.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.finance.entity.User;
import com.finance.entity.dto.*;
import com.finance.mapper.UserMapper;
import com.finance.security.JwtTokenProvider;
import com.finance.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserServiceImpl(PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = getOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername()));
        if (user == null) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("用户名或密码错误");
        }
        if (user.getStatus() != null && user.getStatus() == 0) {
            throw new IllegalArgumentException("账号已被禁用");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());
        UserInfo userInfo = new UserInfo();
        BeanUtil.copyProperties(user, userInfo);
        return new LoginResponse(token, userInfo);
    }

    @Override
    public void register(RegisterRequest request) {
        long count = count(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, request.getUsername()));
        if (count > 0) {
            throw new IllegalArgumentException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname() != null ? request.getNickname() : request.getUsername());
        user.setStatus(1);
        save(user);
    }

    @Override
    public UserInfo getCurrentUser(Long userId) {
        User user = getById(userId);
        if (user == null) {
            throw new IllegalArgumentException("用户不存在");
        }
        UserInfo userInfo = new UserInfo();
        BeanUtil.copyProperties(user, userInfo);
        return userInfo;
    }
}
