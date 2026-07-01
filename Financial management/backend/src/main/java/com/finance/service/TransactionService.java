package com.finance.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.finance.entity.Transaction;
import com.finance.entity.dto.PageResult;
import com.finance.entity.dto.TransactionQuery;
import java.math.BigDecimal;
import java.util.Map;

public interface TransactionService extends IService<Transaction> {
    PageResult<Transaction> getTransactionPage(Long userId, TransactionQuery query);
    Transaction addTransaction(Long userId, Transaction transaction);
    Transaction updateTransaction(Long userId, Transaction transaction);
    void deleteTransaction(Long userId, Long transactionId);
    BigDecimal getTotalByTypeAndDate(Long userId, String type, String start, String end);
    Map<String, Object> getStatistics(Long userId, String start, String end);
}
