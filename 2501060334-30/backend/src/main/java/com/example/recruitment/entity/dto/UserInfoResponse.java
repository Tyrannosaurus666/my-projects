package com.example.recruitment.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserInfoResponse {
    private Long userId;
    private String username;
    private String role;
}
