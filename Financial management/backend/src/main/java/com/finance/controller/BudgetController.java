package com.finance.controller;

import com.finance.common.Result;
import com.finance.entity.Budget;
import com.finance.service.BudgetService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public Result<List<Budget>> list(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(budgetService.getUserBudgets(userId));
    }

    @PostMapping
    public Result<Budget> add(@RequestBody Budget budget, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(budgetService.addBudget(userId, budget));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        budgetService.deleteBudget(userId, id);
        return Result.success();
    }

    @GetMapping("/overview")
    public Result<Map<String, Object>> overview(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(budgetService.getBudgetOverview(userId));
    }
}
