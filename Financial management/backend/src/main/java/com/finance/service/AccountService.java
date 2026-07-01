package com.finance.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.finance.entity.Account;
import java.util.List;

public interface AccountService extends IService<Account> {
    List<Account> getUserAccounts(Long userId);
    Account addAccount(Long userId, Account account);
    Account updateAccount(Long userId, Account account);
    void deleteAccount(Long userId, Long accountId);
    void transfer(Long fromId, Long toId, java.math.BigDecimal amount, Long userId);
}
