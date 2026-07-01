package com.finance.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.finance.entity.Bill;
import java.util.List;

public interface BillService extends IService<Bill> {
    List<Bill> getUserBills(Long userId);
    Bill addBill(Long userId, Bill bill);
    void updateBillStatus(Long billId, String status);
    void deleteBill(Long userId, Long billId);
}
