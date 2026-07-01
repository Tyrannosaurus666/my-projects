package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.finance.entity.Bill;
import com.finance.mapper.BillMapper;
import com.finance.service.BillService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BillServiceImpl extends ServiceImpl<BillMapper, Bill> implements BillService {

    @Override
    public List<Bill> getUserBills(Long userId) {
        return list(new LambdaQueryWrapper<Bill>()
                .eq(Bill::getUserId, userId)
                .orderByAsc(Bill::getDueDate));
    }

    @Override
    public Bill addBill(Long userId, Bill bill) {
        bill.setUserId(userId);
        if (bill.getStatus() == null) {
            bill.setStatus("unpaid");
        }
        save(bill);
        return bill;
    }

    @Override
    public void updateBillStatus(Long billId, String status) {
        Bill bill = getById(billId);
        if (bill != null) {
            bill.setStatus(status);
            updateById(bill);
        }
    }

    @Override
    public void deleteBill(Long userId, Long billId) {
        Bill bill = getById(billId);
        if (bill != null && bill.getUserId().equals(userId)) {
            removeById(billId);
        }
    }
}
