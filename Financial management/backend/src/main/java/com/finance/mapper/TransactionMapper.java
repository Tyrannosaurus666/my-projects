package com.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.finance.entity.Transaction;
import org.apache.ibatis.annotations.Select;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface TransactionMapper extends BaseMapper<Transaction> {

    @Select("SELECT COALESCE(SUM(amount), 0) FROM transaction WHERE user_id = #{userId} AND type = #{type} " +
            "AND transaction_time BETWEEN #{start} AND #{end} AND deleted = 0")
    BigDecimal sumByTypeAndDate(Long userId, String type, LocalDateTime start, LocalDateTime end);
}
