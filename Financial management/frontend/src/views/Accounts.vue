<template>
  <div>
    <div style="margin-bottom: 16px">
      <el-button type="primary" @click="showAdd = true">新增账户</el-button>
      <el-button type="warning" @click="showTransfer = true">转账</el-button>
    </div>

    <el-table :data="accounts" stripe>
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
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="danger" text @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showAdd" title="新增账户" width="400px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" style="width: 100%">
            <el-option label="银行卡" value="bank" />
            <el-option label="现金" value="cash" />
          </el-select>
        </el-form-item>
        <el-form-item label="余额" prop="balance">
          <el-input-number v-model="form.balance" :min="0" :precision="2" style="width: 100%" />
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

    <el-dialog v-model="showTransfer" title="转账" width="400px">
      <el-form :model="transferForm" label-width="80px">
        <el-form-item label="转出账户">
          <el-select v-model="transferForm.fromId" style="width: 100%">
            <el-option v-for="a in accounts" :key="a.id" :label="a.name" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="转入账户">
          <el-select v-model="transferForm.toId" style="width: 100%">
            <el-option v-for="a in accounts" :key="a.id" :label="a.name" :value="a.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="transferForm.amount" :min="0.01" :precision="2" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTransfer = false">取消</el-button>
        <el-button type="primary" @click="handleTransfer">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { accountApi } from '../api'
import { ElMessage } from 'element-plus'

const accounts = ref([])
const showAdd = ref(false)
const showTransfer = ref(false)

const form = reactive({ name: '', type: 'bank', balance: 0, remark: '' })
const transferForm = reactive({ fromId: null, toId: null, amount: 0 })

const rules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
}

const fetchData = async () => { accounts.value = await accountApi.list() }

const handleAdd = async () => {
  await accountApi.add(form)
  ElMessage.success('新增成功')
  showAdd.value = false
  await fetchData()
}

const handleTransfer = async () => {
  await accountApi.transfer(transferForm)
  ElMessage.success('转账成功')
  showTransfer.value = false
  await fetchData()
}

const handleDelete = async (id) => {
  await accountApi.delete(id)
  ElMessage.success('删除成功')
  await fetchData()
}

onMounted(fetchData)
</script>
