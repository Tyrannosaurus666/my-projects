package com.example.recruitment.entity.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 32, message = "用户名3-32个字符")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, max = 32, message = "密码6-32个字符")
    private String password;

    @NotBlank(message = "角色不能为空")
    @Pattern(regexp = "candidate|hr|admin", message = "角色只能是candidate/hr/admin")
    private String role;
}
