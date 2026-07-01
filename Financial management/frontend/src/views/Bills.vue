<template>
  <div>
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="showAdd = true">新增账单</el-button>
    </div>

    <el-table :data="bills" stripe>
      <el-table-column prop="name" label="账单名称" />
      <el-table-column prop="amount" label="金额">
        <template #default="{ row }">¥ {{ row.amount }}</template>
      </el-table-column>
      <el-table-column prop="dueDate" label="到期日" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'paid' ? 'success' : 'warning'">
            {{ row.status === 'paid' ? '已支付' : '未支付' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="200" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button v-if="row.status === 'unpaid'" type="success" text @click="handlePay(row.id)">标记已支付</el-button>
          <el-button type="danger" text @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAdd" title="新增账单" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="到期日">
          <el-date-picker v-model="form.dueDate" style="width: 100%" />
        </el-form-item>
        <el-form-item label="提前提醒">
          <el-input-number v-model="form.remindDay" :min="0" :max="30" style="width: 100%" />
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
import { billApi } from '../api'
import { ElMessage } from 'element-plus'

const bills = ref([])
const showAdd = ref(false)

const form = reactive({ name: '', amount: 0, dueDate: null, remindDay: 3, remark: '' })

const fetchData = async () => { bills.value = await billApi.list() }

const handleAdd = async () => {
  await billApi.add(form)
  ElMessage.success('新增成功')
  showAdd.value = false
  await fetchData()
}

const handlePay = async (id) => {
  await billApi.updateStatus(id, 'paid')
  ElMessage.success('已标记为已支付')
  await fetchData()
}

const handleDelete = async (id) => {
  await billApi.delete(id)
  ElMessage.success('删除成功')
  await fetchData()
}

onMounted(fetchData)
</script>
