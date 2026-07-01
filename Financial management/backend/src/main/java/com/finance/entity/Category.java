package com.finance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("category")
public class Category extends BaseEntity {
    private Long userId;
    private String name;
    private String type;
    private String icon;
    private String color;
    private Integer sort;
    private Integer status;
}
