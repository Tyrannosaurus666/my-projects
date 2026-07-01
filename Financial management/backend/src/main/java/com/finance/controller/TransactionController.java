package com.finance.controller;

import com.finance.common.Result;
import com.finance.entity.Transaction;
import com.finance.entity.dto.PageResult;
import com.finance.entity.dto.TransactionQuery;
import com.finance.service.TransactionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public Result<PageResult<Transaction>> page(TransactionQuery query, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(transactionService.getTransactionPage(userId, query));
    }

    @PostMapping
    public Result<Transaction> add(@RequestBody Transaction transaction, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(transactionService.addTransaction(userId, transaction));
    }

    @PutMapping
    public Result<Transaction> update(@RequestBody Transaction transaction, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(transactionService.updateTransaction(userId, transaction));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        transactionService.deleteTransaction(userId, id);
        return Result.success();
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> statistics(@RequestParam String start, @RequestParam String end,
                                                   Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(transactionService.getStatistics(userId, start, end));
    }

    @GetMapping("/total")
    public Result<BigDecimal> total(@RequestParam String type, @RequestParam String start,
                                     @RequestParam String end, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(transactionService.getTotalByTypeAndDate(userId, type, start, end));
    }
}
