package com.finance.entity.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class PageResult<T> {
    private long total;
    private int page;
    private int size;
    private List<T> records;
}
