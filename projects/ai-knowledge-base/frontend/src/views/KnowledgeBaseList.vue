<template>
  <div style="padding: 24px; max-width: 1200px; margin: 0 auto;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h1 style="margin: 0; font-size: 24px;">AI 知识库问答系统</h1>
      <el-button type="primary" @click="showCreate = true">创建知识库</el-button>
    </div>

    <el-row :gutter="16">
      <el-col :span="8" v-for="kb in kbList" :key="kb.id" style="margin-bottom: 16px;">
        <el-card shadow="hover" style="cursor: pointer;" @click="$router.push(`/knowledge-bases/${kb.id}`)">
          <div style="display: flex; align-items: center; gap: 12px;">
            <el-icon :size="28" color="#409eff"><Folder /></el-icon>
            <div>
              <div style="font-size: 16px; font-weight: 600;">{{ kb.name }}</div>
              <div style="font-size: 13px; color: #999; margin-top: 4px;">{{ kb.docCount || 0 }} 文档 / {{ kb.chunkCount || 0 }} 分块</div>
            </div>
          </div>
          <div v-if="kb.description" style="margin-top: 8px; font-size: 13px; color: #666;">{{ kb.description }}</div>
          <div style="margin-top: 8px; text-align: right;">
            <el-button size="small" text type="danger" @click.stop="handleDelete(kb)">删除</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="!kbList.length" description="还没有知识库，点击右上角创建" />

    <el-dialog v-model="showCreate" title="创建知识库" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="知识库名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const kbList = ref([])
const showCreate = ref(false)
const form = ref({ name: '', description: '' })

const loadKBs = async () => {
  const res = await api.getKnowledgeBases()
  kbList.value = res.data || []
}

const handleCreate = async () => {
  if (!form.value.name) return ElMessage.warning('请输入名称')
  await api.createKnowledgeBase({ ...form.value })
  showCreate.value = false
  form.value = { name: '', description: '' }
  await loadKBs()
  ElMessage.success('创建成功')
}

const handleDelete = async (kb) => {
  try {
    await ElMessageBox.confirm(`确定删除知识库「${kb.name}」？所有文档和问答记录将一并删除。`, '确认')
    await api.deleteKnowledgeBase(kb.id)
    await loadKBs()
    ElMessage.success('已删除')
  } catch {}
}

onMounted(loadKBs)
</script>
