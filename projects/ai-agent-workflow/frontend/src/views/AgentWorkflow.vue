<template>
  <div class="app-container">
    <el-container style="height: 100vh">
      <el-aside width="280px" class="sidebar">
        <div class="logo">AI Agent Workflow</div>
        <div class="new-session">
          <el-button type="primary" style="width: 100%" @click="createSession">+ 新建会话</el-button>
        </div>
        <div class="session-info" v-if="sessionId">
          <el-tag type="success" size="small">会话ID: {{ sessionId }}</el-tag>
        </div>
        <el-divider style="margin: 12px 0" />
        <div class="tool-list">
          <div class="section-title">可用工具</div>
          <div class="tool-item" v-for="tool in tools" :key="tool.name">
            <el-icon><component :is="tool.icon" /></el-icon>
            <span>{{ tool.label }}</span>
          </div>
        </div>
      </el-aside>

      <el-container>
        <el-main class="chat-main">
          <div class="chat-messages" ref="msgContainer">
            <div v-if="!sessionId" class="welcome">
              <h2>🤖 AI Agent Workflow</h2>
              <p>输入任务目标，AI 将自动规划并执行</p>
              <div class="examples">
                <el-tag v-for="ex in examples" :key="ex" @click="inputText = ex" style="cursor:pointer; margin:4px">
                  {{ ex }}
                </el-tag>
              </div>
            </div>

            <div v-for="msg in messages" :key="msg.id" class="message-row" :class="msg.role">
              <div class="msg-avatar">
                <el-avatar :icon="msg.role === 'user' ? User : Monitor" :style="{ background: msg.role === 'user' ? '#409eff' : '#67c23a' }" />
              </div>
              <div class="msg-content">
                <div class="msg-sender">{{ msg.agentName || (msg.role === 'user' ? '你' : 'AI') }}</div>
                <div class="msg-bubble">
                  <div v-if="msg.content" class="msg-text">{{ msg.content }}</div>
                  <div v-if="msg.toolCall" class="msg-tool">
                    <el-tag size="small" type="warning">🛠 调用工具: {{ msg.toolCall }}</el-tag>
                  </div>
                  <div v-if="msg.toolResult" class="msg-tool-result">
                    <el-tag size="small" type="info">📥 工具结果</el-tag>
                    <pre>{{ msg.toolResult }}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="loading" class="loading-indicator">
              <el-icon class="is-loading"><Loading /></el-icon> AI 正在思考...
            </div>
          </div>

          <div class="input-area">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="2"
              placeholder="输入任务目标，例如：搜索今天的热点新闻并总结..."
              :disabled="loading"
              @keydown.ctrl.enter="submitTask"
            />
            <el-button type="primary" :loading="loading" @click="submitTask" style="margin-left: 12px">
              执行
            </el-button>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { User, Monitor, Loading, Search, Calc, Link, Time } from '@element-plus/icons-vue'
import { agentApi } from '../api'

const sessionId = ref('')
const inputText = ref('')
const messages = ref([])
const loading = ref(false)
const msgContainer = ref(null)

const tools = [
  { name: 'web_search', label: '网页搜索', icon: 'Search' },
  { name: 'calculator', label: '计算器', icon: 'Calc' },
  { name: 'web_fetch', label: '网页抓取', icon: 'Link' },
  { name: 'current_time', label: '当前时间', icon: 'Time' }
]

const examples = [
  '搜索今天的科技新闻并总结要点',
  '计算 3.14 * 25 的平方根是多少',
  '帮我查一下当前时间',
  '搜索北京最近的天气情况'
]

onMounted(async () => {
  await createSession()
})

const createSession = async () => {
  const data = await agentApi.createSession()
  sessionId.value = data.sessionId
  messages.value = []
}

const scrollToBottom = async () => {
  await nextTick()
  if (msgContainer.value) {
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  }
}

const submitTask = async () => {
  if (!inputText.value.trim() || loading.value) return
  const objective = inputText.value
  inputText.value = ''

  messages.value.push({
    id: Date.now().toString(),
    role: 'user',
    agentName: '你',
    content: objective
  })
  await scrollToBottom()

  loading.value = true
  try {
    const task = await agentApi.executeTask(sessionId.value, objective)

    const poll = setInterval(async () => {
      const updated = await agentApi.getTask(task.taskId)
      if (updated.status === 'completed' || updated.status === 'failed') {
        clearInterval(poll)
        loading.value = false
        const msgs = await agentApi.getSessionMessages(sessionId.value)
        messages.value = msgs
        await scrollToBottom()
      }
    }, 1000)
  } catch (e) {
    loading.value = false
    console.error(e)
  }
}
</script>

<style scoped>
.sidebar {
  background: #1a1a2e;
  color: #fff;
  padding: 16px;
}
.logo {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
}
.new-session { margin-bottom: 12px; }
.session-info { text-align: center; margin-bottom: 8px; }
.section-title { font-size: 12px; color: #8899aa; margin-bottom: 8px; }
.tool-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; font-size: 14px; color: #ccd; }
.chat-main { display: flex; flex-direction: column; background: #fff; }
.chat-messages { flex: 1; overflow-y: auto; padding: 20px; }
.welcome { text-align: center; margin-top: 120px; color: #666; }
.welcome h2 { font-size: 28px; margin-bottom: 8px; }
.examples { margin-top: 16px; }
.message-row { display: flex; margin-bottom: 16px; }
.message-row.user { flex-direction: row-reverse; }
.msg-avatar { margin: 0 12px; }
.msg-content { max-width: 70%; }
.message-row.user .msg-content { text-align: right; }
.msg-sender { font-size: 12px; color: #999; margin-bottom: 4px; }
.msg-bubble { background: #f0f2f5; padding: 12px 16px; border-radius: 12px; line-height: 1.6; }
.message-row.user .msg-bubble { background: #409eff; color: #fff; }
.msg-text { white-space: pre-wrap; word-break: break-word; }
.msg-tool { margin-top: 8px; }
.msg-tool-result { margin-top: 8px; }
.msg-tool-result pre { background: #1a1a2e; color: #0f0; padding: 8px; border-radius: 6px; font-size: 12px; overflow-x: auto; }
.loading-indicator { display: flex; align-items: center; gap: 8px; color: #999; padding: 12px; }
.input-area { display: flex; padding: 16px 20px; border-top: 1px solid #e6e6e6; background: #fff; }
</style>
