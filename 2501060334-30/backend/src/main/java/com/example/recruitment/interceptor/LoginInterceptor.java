package com.example.recruitment.interceptor;

import com.example.recruitment.util.JwtUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.HashMap;
import java.util.Map;//拦截器
//拦截器层
@Component
public class LoginInterceptor implements HandlerInterceptor {

    private final JwtUtils jwtUtils;

    public LoginInterceptor(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response,
                             Object handler) throws Exception {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            Map<String, Object> err = new HashMap<>();
            err.put("code", 401);
            err.put("message", "未登录");
            err.put("data", null);
            response.getWriter().write(
                    new ObjectMapper().writeValueAsString(err));
            return false;
        }

        String token = authHeader.substring(7);
        if (!jwtUtils.validateToken(token)) {
            response.setStatus(401);
            response.setContentType("application/json;charset=UTF-8");
            Map<String, Object> err = new HashMap<>();
            err.put("code", 401);
            err.put("message", "token无效或已过期");
            err.put("data", null);
            response.getWriter().write(
                    new ObjectMapper().writeValueAsString(err));
            return false;
        }

        Claims claims = jwtUtils.parseToken(token);
        request.setAttribute("userId", Long.valueOf(claims.getSubject()));
        request.setAttribute("role", claims.get("role", String.class));
        return true;
    }
}
