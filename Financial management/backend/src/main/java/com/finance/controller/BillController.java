package com.finance.controller;

import com.finance.common.Result;
import com.finance.entity.Bill;
import com.finance.service.BillService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @GetMapping
    public Result<List<Bill>> list(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(billService.getUserBills(userId));
    }

    @PostMapping
    public Result<Bill> add(@RequestBody Bill bill, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(billService.addBill(userId, bill));
    }

    @PutMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable Long id, @RequestParam String status) {
        billService.updateBillStatus(id, status);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        billService.deleteBill(userId, id);
        return Result.success();
    }
}
