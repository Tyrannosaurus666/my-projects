<template>
  <div>
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="showAdd = true">新增分类</el-button>
    </div>

    <el-table :data="categories" stripe>
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag :type="row.type === 'income' ? 'success' : 'danger'">
            {{ row.type === 'income' ? '收入' : '支出' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" width="80">
        <template #default="{ row }">
          <el-icon :color="row.color" :size="24">
            <component :is="row.icon || 'Coin'" />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button type="danger" text @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAdd" title="新增分类" width="400px">
      <el-form :model="form" label-width="60px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="收入" value="income" />
            <el-option label="支出" value="expense" />
          </el-select>
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker v-model="form.color" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
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
import { categoryApi } from '../api'
import { ElMessage } from 'element-plus'

const categories = ref([])
const showAdd = ref(false)

const form = reactive({ name: '', type: 'expense', color: '#409eff', sort: 0 })

const fetchData = async () => { categories.value = await categoryApi.list() }

const handleAdd = async () => {
  await categoryApi.add(form)
  ElMessage.success('新增成功')
  showAdd.value = false
  await fetchData()
}

const handleDelete = async (id) => {
  await categoryApi.delete(id)
  ElMessage.success('删除成功')
  await fetchData()
}

onMounted(fetchData)
</script>
