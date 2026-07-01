<template>
  <div>
    <el-card shadow="hover" style="margin-bottom: 16px">
      <el-form :inline="true" :model="query" size="small">
        <el-form-item label="类型">
          <el-select v-model="query.type" clearable placeholder="全部">
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="query.dateRange" type="daterange" range-separator="至" start-placeholder="开始" end-placeholder="结束" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="showAdd = true">新增流水</el-button>
    </div>

    <el-table :data="list" stripe>
      <el-table-column prop="transactionTime" label="时间" width="160" />
      <el-table-column prop="type" label="类型" width="80">
        <template #default="{ row }">
          <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
            {{ row.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="金额">
        <template #default="{ row }">¥ {{ row.amount }}</template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" text @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination v-model:current-page="query.page" :page-size="query.size" :total="total" layout="prev, pager, next" @current-change="fetchData" style="margin-top: 16px" />

    <el-dialog v-model="showAdd" title="新增流水" width="450px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="账户">
          <el-select v-model="form.accountId" style="width: 100%">
            <el-option v-for="a in accounts" :key="a.id" :label="a.name" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="form.amount" :min="0.01" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时间">
          <el-date-picker v-model="form.transactionTime" type="datetime" format="YYYY-MM-DD HH:mm" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAdd = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { transactionApi, accountApi, categoryApi } from '../api'
import { ElMessage } from 'element-plus'

const list = ref([])
const total = ref(0)
const accounts = ref([])
const categories = ref([])
const showAdd = ref(false)

const query = reactive({ type: null, dateRange: null, page: 1, size: 10 })
const form = reactive({ type: 'expense', accountId: null, categoryId: null, amount: 0, transactionTime: null, remark: '' })

const buildParams = () => {
  const params = { page: query.page, size: query.size }
  if (query.type) params.type = query.type
  if (query.dateRange) {
    params.startDate = query.dateRange[0]
    params.endDate = query.dateRange[1]
  }
  return params
}

const fetchData = async () => {
  const res = await transactionApi.page(buildParams())
  list.value = res.records
  total.value = res.total
}

const resetForm = () => {
  form.type = 'expense'
  form.accountId = null
  form.categoryId = null
  form.amount = 0
  form.transactionTime = null
  form.remark = ''
}

const handleAdd = async () => {
  await transactionApi.add(form)
  ElMessage.success('新增成功')
  showAdd.value = false
  resetForm()
  await fetchData()
}

const handleDelete = async (id) => {
  await transactionApi.delete(id)
  ElMessage.success('删除成功')
  await fetchData()
}

onMounted(async () => {
  accounts.value = await accountApi.list()
  categories.value = await categoryApi.list()
  await fetchData()
})
</script>
