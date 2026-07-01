package com.finance.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.finance.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("transaction")
public class Transaction extends BaseEntity {
    private Long userId;
    private Long accountId;
    private Long categoryId;
    private String type;
    private BigDecimal amount;
    private LocalDateTime transactionTime;
    private String remark;
    private String image;
}
