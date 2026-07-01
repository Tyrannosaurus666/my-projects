package com.finance.controller;

import com.finance.common.Result;
import com.finance.entity.Account;
import com.finance.service.AccountService;
import com.finance.service.TransactionService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AccountService accountService;
    private final TransactionService transactionService;

    public DashboardController(AccountService accountService, TransactionService transactionService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
    }

    @GetMapping
    public Result<Map<String, Object>> dashboard(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<Account> accounts = accountService.getUserAccounts(userId);
        BigDecimal totalBalance = accounts.stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);
        LocalDate monthEnd = now;

        BigDecimal monthIncome = transactionService.getTotalByTypeAndDate(userId, "income",
                monthStart.toString(), monthEnd.toString());
        BigDecimal monthExpense = transactionService.getTotalByTypeAndDate(userId, "expense",
                monthStart.toString(), monthEnd.toString());

        Map<String, Object> data = new HashMap<>();
        data.put("totalBalance", totalBalance);
        data.put("totalAccounts", accounts.size());
        data.put("monthIncome", monthIncome);
        data.put("monthExpense", monthExpense);
        data.put("accounts", accounts);

        return Result.success(data);
    }
}
