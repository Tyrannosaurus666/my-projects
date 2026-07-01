package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.finance.entity.Category;
import com.finance.mapper.CategoryMapper;
import com.finance.service.CategoryService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {

    @Override
    public List<Category> getUserCategories(Long userId, String type) {
        LambdaQueryWrapper<Category> wrapper = new LambdaQueryWrapper<Category>()
                .eq(Category::getUserId, userId)
                .eq(Category::getStatus, 1);
        if (type != null) {
            wrapper.eq(Category::getType, type);
        }
        wrapper.orderByAsc(Category::getSort);
        return list(wrapper);
    }

    @Override
    public Category addCategory(Long userId, Category category) {
        category.setUserId(userId);
        category.setStatus(1);
        save(category);
        return category;
    }

    @Override
    public void deleteCategory(Long userId, Long categoryId) {
        Category category = getById(categoryId);
        if (category != null && category.getUserId().equals(userId)) {
            removeById(categoryId);
        }
    }
}
