package com.finance.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.finance.entity.Budget;
import java.util.List;
import java.util.Map;

public interface BudgetService extends IService<Budget> {
    List<Budget> getUserBudgets(Long userId);
    Budget addBudget(Long userId, Budget budget);
    void deleteBudget(Long userId, Long budgetId);
    Map<String, Object> getBudgetOverview(Long userId);
}
