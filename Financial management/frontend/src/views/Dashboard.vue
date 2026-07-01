<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">总资产</div>
            <div class="stat-value">¥ {{ data.totalBalance }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">账户数量</div>
            <div class="stat-value">{{ data.totalAccounts }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">本月收入</div>
            <div class="stat-value income">¥ {{ data.monthIncome }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-label">本月支出</div>
            <div class="stat-value expense">¥ {{ data.monthExpense }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" style="margin-top: 20px">
      <template #header><span>我的账户</span></template>
      <el-table :data="data.accounts" stripe>
        <el-table-column prop="name" label="账户名称" />
        <el-table-column prop="type" label="类型">
          <template #default="{ row }">
            <el-tag :type="row.type === 'bank' ? 'primary' : 'success'">
              {{ row.type === 'bank' ? '银行卡' : '现金' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额">
          <template #default="{ row }">¥ {{ row.balance }}</template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dashboardApi } from '../api'

const data = ref({
  totalBalance: 0,
  totalAccounts: 0,
  monthIncome: 0,
  monthExpense: 0,
  accounts: []
})

onMounted(async () => {
  data.value = await dashboardApi.getData()
})
</script>

<style scoped>
.stat-item { text-align: center; padding: 10px 0; }
.stat-label { font-size: 14px; color: #909399; margin-bottom: 8px; }
.stat-value { font-size: 28px; font-weight: bold; color: #303133; }
.income { color: #67c23a; }
.expense { color: #f56c6c; }
</style>
