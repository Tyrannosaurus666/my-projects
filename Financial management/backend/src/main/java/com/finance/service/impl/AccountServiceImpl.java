package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.finance.entity.Account;
import com.finance.mapper.AccountMapper;
import com.finance.service.AccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountServiceImpl extends ServiceImpl<AccountMapper, Account> implements AccountService {

    @Override
    public List<Account> getUserAccounts(Long userId) {
        return list(new LambdaQueryWrapper<Account>()
                .eq(Account::getUserId, userId)
                .orderByAsc(Account::getSort));
    }

    @Override
    public Account addAccount(Long userId, Account account) {
        account.setUserId(userId);
        if (account.getBalance() == null) {
            account.setBalance(BigDecimal.ZERO);
        }
        if (account.getCurrency() == null) {
            account.setCurrency("CNY");
        }
        account.setStatus(1);
        save(account);
        return account;
    }

    @Override
    public Account updateAccount(Long userId, Account account) {
        account.setUserId(userId);
        updateById(account);
        return getById(account.getId());
    }

    @Override
    @Transactional
    public void transfer(Long fromId, Long toId, BigDecimal amount, Long userId) {
        Account from = getById(fromId);
        Account to = getById(toId);
        if (from == null || to == null) {
            throw new IllegalArgumentException("账户不存在");
        }
        if (!from.getUserId().equals(userId) || !to.getUserId().equals(userId)) {
            throw new IllegalArgumentException("无权操作");
        }
        if (from.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("余额不足");
        }
        from.setBalance(from.getBalance().subtract(amount));
        to.setBalance(to.getBalance().add(amount));
        updateById(from);
        updateById(to);
    }

    @Override
    public void deleteAccount(Long userId, Long accountId) {
        Account account = getById(accountId);
        if (account != null && account.getUserId().equals(userId)) {
            removeById(accountId);
        }
    }
}
