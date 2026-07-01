package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.finance.entity.Account;
import com.finance.entity.Transaction;
import com.finance.entity.dto.PageResult;
import com.finance.entity.dto.TransactionQuery;
import com.finance.mapper.TransactionMapper;
import com.finance.service.AccountService;
import com.finance.service.TransactionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class TransactionServiceImpl extends ServiceImpl<TransactionMapper, Transaction> implements TransactionService {

    private final AccountService accountService;

    public TransactionServiceImpl(AccountService accountService) {
        this.accountService = accountService;
    }

    @Override
    public PageResult<Transaction> getTransactionPage(Long userId, TransactionQuery query) {
        LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<Transaction>()
                .eq(Transaction::getUserId, userId);

        if (query.getType() != null) {
            wrapper.eq(Transaction::getType, query.getType());
        }
        if (query.getAccountId() != null) {
            wrapper.eq(Transaction::getAccountId, query.getAccountId());
        }
        if (query.getCategoryId() != null) {
            wrapper.eq(Transaction::getCategoryId, query.getCategoryId());
        }
        if (query.getStartDate() != null) {
            wrapper.ge(Transaction::getTransactionTime, query.getStartDate().atStartOfDay());
        }
        if (query.getEndDate() != null) {
            wrapper.le(Transaction::getTransactionTime, query.getEndDate().atTime(LocalTime.MAX));
        }

        wrapper.orderByDesc(Transaction::getTransactionTime);

        int page = query.getPage() != null ? query.getPage() : 1;
        int size = query.getSize() != null ? query.getSize() : 10;
        Page<Transaction> p = page(new Page<>(page, size), wrapper);

        return new PageResult<>(p.getTotal(), (int) p.getCurrent(), (int) p.getSize(), p.getRecords());
    }

    @Override
    @Transactional
    public Transaction addTransaction(Long userId, Transaction transaction) {
        transaction.setUserId(userId);
        if (transaction.getTransactionTime() == null) {
            transaction.setTransactionTime(LocalDateTime.now());
        }
        save(transaction);

        Account account = accountService.getById(transaction.getAccountId());
        if (account != null && account.getUserId().equals(userId)) {
            if ("income".equals(transaction.getType())) {
                account.setBalance(account.getBalance().add(transaction.getAmount()));
            } else if ("expense".equals(transaction.getType())) {
                account.setBalance(account.getBalance().subtract(transaction.getAmount()));
            }
            accountService.updateById(account);
        }

        return transaction;
    }

    @Override
    @Transactional
    public Transaction updateTransaction(Long userId, Transaction transaction) {
        Transaction old = getById(transaction.getId());
        if (old != null) {
            reverseAccountBalance(old);
        }
        transaction.setUserId(userId);
        updateById(transaction);
        applyAccountBalance(transaction);
        return getById(transaction.getId());
    }

    @Override
    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = getById(transactionId);
        if (transaction != null && transaction.getUserId().equals(userId)) {
            reverseAccountBalance(transaction);
            removeById(transactionId);
        }
    }

    private void reverseAccountBalance(Transaction transaction) {
        Account account = accountService.getById(transaction.getAccountId());
        if (account != null) {
            if ("income".equals(transaction.getType())) {
                account.setBalance(account.getBalance().subtract(transaction.getAmount()));
            } else if ("expense".equals(transaction.getType())) {
                account.setBalance(account.getBalance().add(transaction.getAmount()));
            }
            accountService.updateById(account);
        }
    }

    private void applyAccountBalance(Transaction transaction) {
        Account account = accountService.getById(transaction.getAccountId());
        if (account != null) {
            if ("income".equals(transaction.getType())) {
                account.setBalance(account.getBalance().add(transaction.getAmount()));
            } else if ("expense".equals(transaction.getType())) {
                account.setBalance(account.getBalance().subtract(transaction.getAmount()));
            }
            accountService.updateById(account);
        }
    }

    @Override
    public BigDecimal getTotalByTypeAndDate(Long userId, String type, String start, String end) {
        LocalDateTime startDt = LocalDate.parse(start).atStartOfDay();
        LocalDateTime endDt = LocalDate.parse(end).atTime(LocalTime.MAX);
        return baseMapper.sumByTypeAndDate(userId, type, startDt, endDt);
    }

    @Override
    public Map<String, Object> getStatistics(Long userId, String start, String end) {
        LocalDateTime startDt = LocalDate.parse(start).atStartOfDay();
        LocalDateTime endDt = LocalDate.parse(end).atTime(LocalTime.MAX);
        BigDecimal income = baseMapper.sumByTypeAndDate(userId, "income", startDt, endDt);
        BigDecimal expense = baseMapper.sumByTypeAndDate(userId, "expense", startDt, endDt);

        Map<String, Object> stats = new HashMap<>();
        stats.put("income", income);
        stats.put("expense", expense);
        stats.put("balance", income.subtract(expense));
        return stats;
    }
}
