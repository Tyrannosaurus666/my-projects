package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.finance.entity.Budget;
import com.finance.mapper.BudgetMapper;
import com.finance.service.BudgetService;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

@Service
public class BudgetServiceImpl extends ServiceImpl<BudgetMapper, Budget> implements BudgetService {

    @Override
    public List<Budget> getUserBudgets(Long userId) {
        return list(new LambdaQueryWrapper<Budget>()
                .eq(Budget::getUserId, userId)
                .orderByAsc(Budget::getStartDate));
    }

    @Override
    public Budget addBudget(Long userId, Budget budget) {
        budget.setUserId(userId);
        if (budget.getSpentAmount() == null) {
            budget.setSpentAmount(BigDecimal.ZERO);
        }
        budget.setStatus(1);
        save(budget);
        return budget;
    }

    @Override
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = getById(budgetId);
        if (budget != null && budget.getUserId().equals(userId)) {
            removeById(budgetId);
        }
    }

    @Override
    public Map<String, Object> getBudgetOverview(Long userId) {
        List<Budget> budgets = getUserBudgets(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("total", budgets.size());
        result.put("budgets", budgets);
        return result;
    }
}
