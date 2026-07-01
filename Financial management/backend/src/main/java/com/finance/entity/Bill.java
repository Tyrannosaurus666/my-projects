package com.finance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("bill")
public class Bill extends BaseEntity {
    private Long userId;
    private Long categoryId;
    private Long accountId;
    private String name;
    private BigDecimal amount;
    private LocalDate dueDate;
    private Integer remindDay;
    private String status;
    private String remark;
}
