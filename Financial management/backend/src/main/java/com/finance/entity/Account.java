package com.finance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("account")
public class Account extends BaseEntity {
    private Long userId;
    private String name;
    private String type;
    private BigDecimal balance;
    private String currency;
    private String remark;
    private Integer sort;
    private Integer status;
}
