package com.finance.controller;

import com.finance.common.Result;
import com.finance.entity.Account;
import com.finance.service.AccountService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public Result<List<Account>> list(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(accountService.getUserAccounts(userId));
    }

    @PostMapping
    public Result<Account> add(@RequestBody Account account, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(accountService.addAccount(userId, account));
    }

    @PutMapping
    public Result<Account> update(@RequestBody Account account, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(accountService.updateAccount(userId, account));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        accountService.deleteAccount(userId, id);
        return Result.success();
    }

    @PostMapping("/transfer")
    public Result<Void> transfer(@RequestParam Long fromId, @RequestParam Long toId,
                                  @RequestParam BigDecimal amount, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        accountService.transfer(fromId, toId, amount, userId);
        return Result.success();
    }
}
