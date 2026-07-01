package com.finance.entity.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class TransactionQuery {
    private Long accountId;
    private Long categoryId;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer page;
    private Integer size;
}
