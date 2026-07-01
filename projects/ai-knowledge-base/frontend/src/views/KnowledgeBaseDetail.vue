<template>
  <div style="height: 100vh; display: flex; flex-direction: column;">
    <div style="padding: 12px 24px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
      <el-button text @click="$router.push('/knowledge-bases')">
        <el-icon><ArrowLeft /></el-icon> 返回
      </el-button>
      <span style="font-size: 18px; font-weight: 600;">{{ kb?.name }}</span>
      <span style="font-size: 13px; color: #999;">{{ kb?.docCount || 0 }} 文档</span>
    </div>

    <div style="flex: 1; display: flex; overflow: hidden;">
      <div style="width: 320px; border-right: 1px solid #eee; padding: 16px; overflow-y: auto; flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-weight: 600;">文档列表</span>
          <el-upload :show-file-list="false" :http-request="handleUpload" accept=".txt,.md,.json,.csv,.py,.java,.js,.ts,.html,.css,.xml">
            <el-button size="small" type="primary">上传文档</el-button>
          </el-upload>
        </div>

        <div v-for="doc in documents" :key="doc.id" style="padding: 8px; border: 1px solid #eee; border-radius: 6px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 14px;">{{ doc.fileName }}</div>
              <div style="font-size: 12px; color: #999; margin-top: 2px;">
                <el-tag :type="statusType(doc.status)" size="small">{{ statusLabel(doc.status) }}</el-tag>
                {{ doc.chunkCount || 0 }} 分块
              </div>
            </div>
            <el-button text size="small" type="danger" @click="handleDeleteDoc(doc)">删除</el-button>
          </div>
        </div>

        <el-empty v-if="!documents.length" description="暂无文档" :image-size="60" />
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <div style="flex: 1; overflow-y: auto; padding: 16px;">
          <div v-for="(item, idx) in qaList" :key="idx" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
              <div style="max-width: 70%; background: #ecf5ff; padding: 10px 14px; border-radius: 8px; font-size: 14px;">
                {{ item.question }}
              </div>
            </div>
            <div style="display: flex; justify-content: flex-start;">
              <div style="max-width: 70%; background: #f5f5f5; padding: 10px 14px; border-radius: 8px; font-size: 14px; white-space: pre-wrap;">
                {{ item.answer }}
              </div>
            </div>
            <div v-if="item.sourceChunks && item.sourceChunks !== '[]'" style="font-size: 12px; color: #999; margin-left: 8px; margin-top: 4px;">
              来源: {{ item.sourceChunks.substring(0, 120) }}...
            </div>
          </div>

          <div v-if="loading" style="text-align: center; padding: 24px;">
            <el-icon class="is-loading" :size="20"><Loading /></el-icon>
            <span style="margin-left: 8px; color: #999;">AI 正在思考...</span>
          </div>

          <el-empty v-if="!qaList.length && !loading" description="上传文档后，在这里提问" :image-size="60" />
        </div>

        <div style="padding: 12px 16px; border-top: 1px solid #eee; display: flex; gap: 8px; flex-shrink: 0;">
          <el-input v-model="question" placeholder="输入你的问题..." @keyup.enter="handleAsk" :disabled="loading" />
          <el-button type="primary" @click="handleAsk" :disabled="loading || !question.trim()">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const kbId = route.params.id
const kb = ref({})
const documents = ref([])
const qaList = ref([])
const question = ref('')
const loading = ref(false)

const statusType = (s) => ({ pending: 'info', processing: 'warning', done: 'success', failed: 'danger' }[s] || 'info')
const statusLabel = (s) => ({ pending: '待处理', processing: '处理中', done: '已完成', failed: '失败' }[s] || s)

const loadKB = async () => {
  const res = await api.getKnowledgeBases()
  kb.value = res.data?.find(k => k.id == kbId) || {}
}

const loadDocs = async () => {
  const res = await api.getDocuments(kbId)
  documents.value = res.data || []
}

const loadHistory = async () => {
  const res = await api.getQAHistory(kbId)
  qaList.value = res.data || []
}

const handleUpload = async (opt) => {
  try {
    await api.uploadDocument(kbId, opt.file)
    ElMessage.success('上传成功，后台处理中...')
    await loadDocs()
  } catch {
    ElMessage.error('上传失败')
  }
}

const handleDeleteDoc = async (doc) => {
  try {
    await ElMessageBox.confirm('确定删除此文档？', '确认')
    await api.deleteDocument(doc.id)
    await loadDocs()
    ElMessage.success('已删除')
  } catch {}
}

const handleAsk = async () => {
  if (!question.value.trim() || loading.value) return
  loading.value = true
  try {
    const res = await api.askQuestion(kbId, question.value)
    await loadHistory()
    question.value = ''
  } catch {
    ElMessage.error('请求失败')
  }
  loading.value = false
}

onMounted(() => { loadKB(); loadDocs(); loadHistory() })
</script>
