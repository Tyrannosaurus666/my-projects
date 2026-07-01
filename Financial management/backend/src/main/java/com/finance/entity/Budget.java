package com.finance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("budget")
public class Budget extends BaseEntity {
    private Long userId;
    private Long categoryId;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String remark;
    private Integer status;
}
