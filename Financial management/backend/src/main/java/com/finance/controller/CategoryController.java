package com.finance.controller;

import com.finance.common.Result;
import com.finance.entity.Category;
import com.finance.service.CategoryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public Result<List<Category>> list(@RequestParam(required = false) String type,
                                        Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(categoryService.getUserCategories(userId, type));
    }

    @PostMapping
    public Result<Category> add(@RequestBody Category category, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(categoryService.addCategory(userId, category));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        categoryService.deleteCategory(userId, id);
        return Result.success();
    }
}
