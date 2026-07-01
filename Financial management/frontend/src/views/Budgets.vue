<template>
  <div>
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="showAdd = true">新增预算</el-button>
    </div>

    <el-table :data="budgets" stripe>
      <el-table-column prop="amount" label="预算金额">
        <template #default="{ row }">¥ {{ row.amount }}</template>
      </el-table-column>
      <el-table-column prop="spentAmount" label="已用金额">
        <template #default="{ row }">¥ {{ row.spentAmount }}</template>
      </el-table-column>
      <el-table-column label="进度" min-width="200">
        <template #default="{ row }">
          <el-progress :percentage="row.amount > 0 ? Math.min(Number((row.spentAmount / row.amount * 100).toFixed(1)), 100) : 0"
                       :status="row.spentAmount > row.amount ? 'exception' : 'success'" />
        </template>
      </el-table-column>
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" text @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAdd" title="新增预算" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="分类">
          <el-select v-model="form.categoryId" style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="form.amount" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="form.startDate" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker v-model="form.endDate" style="width: 100%" />
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
import { budgetApi, categoryApi } from '../api'
import { ElMessage } from 'element-plus'

const budgets = ref([])
const categories = ref([])
const showAdd = ref(false)

const form = reactive({ categoryId: null, amount: 0, startDate: null, endDate: null, remark: '' })

const fetchData = async () => { budgets.value = await budgetApi.list() }

const handleAdd = async () => {
  await budgetApi.add(form)
  ElMessage.success('新增成功')
  showAdd.value = false
  await fetchData()
}

const handleDelete = async (id) => {
  await budgetApi.delete(id)
  ElMessage.success('删除成功')
  await fetchData()
}

onMounted(async () => {
  categories.value = await categoryApi.list()
  await fetchData()
})
</script>
