package com.example.recruitment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.recruitment.common.BusinessException;
import com.example.recruitment.entity.User;
import com.example.recruitment.entity.dto.LoginRequest;
import com.example.recruitment.entity.dto.RegisterRequest;
import com.example.recruitment.mapper.UserMapper;
import com.example.recruitment.service.impl.UserServiceImpl;
import com.example.recruitment.util.JwtUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserMapper userMapper;
    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private UserServiceImpl service;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Test
    void register_shouldThrowWhenUsernameExists() {
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(new User());
        RegisterRequest req = new RegisterRequest();
        req.setUsername("test");
        req.setPassword("123456");
        req.setRole("candidate");

        assertThrows(BusinessException.class, () -> service.register(req));
    }

    @Test
    void login_shouldThrowWhenUserNotFound() {
        LoginRequest req = new LoginRequest();
        req.setUsername("nobody");
        req.setPassword("xxx");
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(null);

        assertThrows(BusinessException.class, () -> service.login(req));
    }

    @Test
    void login_shouldThrowWhenPasswordWrong() {
        User user = new User();
        user.setId(1L);
        user.setUsername("test");
        user.setPassword(encoder.encode("correct"));
        user.setRole("hr");
        user.setStatus(1);

        LoginRequest req = new LoginRequest();
        req.setUsername("test");
        req.setPassword("wrong");
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);

        assertThrows(BusinessException.class, () -> service.login(req));
    }

    @Test
    void login_shouldReturnTokenWhenSuccess() {
        User user = new User();
        user.setId(1L);
        user.setUsername("test");
        user.setPassword(encoder.encode("123456"));
        user.setRole("candidate");
        user.setStatus(1);

        LoginRequest req = new LoginRequest();
        req.setUsername("test");
        req.setPassword("123456");
        when(userMapper.selectOne(any(LambdaQueryWrapper.class))).thenReturn(user);
        when(jwtUtils.generateToken(1L, "candidate")).thenReturn("mock-token-123");

        var result = service.login(req);
        assertNotNull(result.getToken());
        assertEquals(1L, result.getUserId());
    }
}
