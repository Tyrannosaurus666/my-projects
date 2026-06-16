<template>
  <div class="max-w-4xl mx-auto p-6">
    <!-- Back Button -->
    <button
      class="inline-flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 text-sm bg-transparent border-none cursor-pointer mb-5 transition-colors"
      @click="$router.back()"
    >
      <span>&larr;</span> 返回列表
    </button>

    <!-- Job Detail Card -->
    <div v-loading="loading" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <!-- Card Header -->
      <div class="flex justify-between items-center px-6 py-5 border-b border-slate-100">
        <h2 class="text-xl font-bold text-slate-800 m-0">{{ job.title }}</h2>
        <el-tag :type="job.status === '招聘中' ? 'success' : 'info'" size="default" effect="plain">
          {{ job.status }}
        </el-tag>
      </div>

      <!-- Info Rows -->
      <div class="px-6 py-2">
        <div class="flex py-3.5 border-b border-slate-50">
          <span class="w-24 text-sm text-slate-500 flex-shrink-0">薪资待遇</span>
          <span class="text-sm text-emerald-600 font-medium">{{ job.salaryText || job.salary_text || '面议' }}</span>
        </div>
        <div class="flex py-3.5 border-b border-slate-50">
          <span class="w-24 text-sm text-slate-500 flex-shrink-0">截止日期</span>
          <span class="text-sm text-slate-700">{{ job.deadline ? job.deadline.slice(0, 10) : '长期有效' }}</span>
        </div>
        <div v-if="job.tags && job.tags.length" class="flex py-3.5 border-b border-slate-50">
          <span class="w-24 text-sm text-slate-500 flex-shrink-0">标签</span>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="tag in job.tags" :key="tag"
              class="inline-block bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-medium"
            >
              {{ tag }}
            </span>
          </div>
        </div>
        <div class="flex py-3.5">
          <span class="w-24 text-sm text-slate-500 flex-shrink-0">发布时间</span>
          <span class="text-sm text-slate-700">{{ (job.createTime || job.create_time)?.slice(0, 10) }}</span>
        </div>
      </div>

      <!-- Requirements Section -->
      <div class="border-t border-slate-100 px-6 py-5">
        <h3 class="text-base font-semibold text-slate-800 mb-3">职位要求</h3>
        <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap" v-html="formattedRequirements" />
      </div>

      <!-- Actions -->
      <div class="border-t border-slate-100 px-6 py-5 flex items-center gap-4 bg-slate-50/50">
        <template v-if="user?.role === 'candidate'">
          <button
            v-if="!hasApplied"
            class="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            :disabled="applying"
            @click="handleApply"
          >
            {{ applying ? '投递中...' : '投递简历' }}
          </button>
          <button
            v-else
            class="px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium cursor-default border-none"
            disabled
          >
            已投递
          </button>
          <el-upload
            v-if="!hasApplied"
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
            accept=".pdf,.doc,.docx,.txt"
            class="custom-upload"
          >
            <button class="px-4 py-2.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer bg-white">
              上传简历附件(可选)
            </button>
          </el-upload>
          <button
            v-if="!hasApplied && selectedFile"
            class="px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors cursor-pointer"
            :disabled="parsing"
            @click="handleParse"
          >
            {{ parsing ? '解析中...' : '解析预览' }}
          </button>
        </template>
        <el-alert
          v-else
          title="只有候选人可以投递职位"
          type="info"
          :closable="false"
          show-icon
          class="w-full"
        />
      </div>
    </div>

    <!-- Parse Resume Dialog -->
    <el-dialog v-model="parseVisible" title="简历解析预览" width="700px" class="parse-dialog">
      <!-- Duplicate Warning -->
      <el-alert
        v-if="parseResult.duplicateCount > 0"
        :title="'检测到 ' + parseResult.duplicateCount + ' 份相同简历(MD5)，请确认是否为本人账号重复投递'"
        type="warning"
        :closable="false"
        show-icon
        class="mb-4"
      />

      <!-- Parse Info -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-slate-50 rounded-lg p-3">
          <span class="text-xs text-slate-500">文件名</span>
          <p class="text-sm text-slate-700 mt-1 m-0 truncate">{{ parseResult.filename }}</p>
        </div>
        <div class="bg-slate-50 rounded-lg p-3">
          <span class="text-xs text-slate-500">MD5 指纹</span>
          <p class="text-sm text-slate-700 mt-1 m-0 font-mono text-xs">{{ parseResult.hash }}</p>
        </div>
      </div>
      <div class="bg-slate-50 rounded-lg p-3 mb-4">
        <span class="text-xs text-slate-500">文本长度: {{ parseResult.textLength }} 字符</span>
      </div>

      <!-- Duplicate Details -->
      <div v-if="parseResult.duplicateCount > 0" class="mb-4">
        <h4 class="text-sm font-semibold text-slate-700 mb-2">重复简历详情</h4>
        <div
          v-for="(dup, idx) in parseResult.duplicates"
          :key="idx"
          class="bg-amber-50 rounded-lg p-3 mb-2 text-sm text-slate-700"
        >
          投递记录 #{{ dup.appId }}，用户 ID: {{ dup.otherUserId }}，职位 ID: {{ dup.jobId }}
        </div>
      </div>

      <!-- Parsed Text -->
      <div class="border border-slate-200 rounded-lg overflow-hidden">
        <div class="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
          <span class="text-sm font-medium text-slate-700">解析文本内容</span>
          <button
            class="text-xs text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer"
            @click="copyText"
          >
            复制
          </button>
        </div>
        <div class="p-4 max-h-80 overflow-y-auto">
          <pre class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed m-0">{{ parseResult.text }}</pre>
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end">
          <el-button @click="parseVisible = false">关闭</el-button>
          <el-button
            v-if="!hasApplied"
            type="primary"
            @click="confirmApplyAfterParse"
          >
            确认投递
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getJobDetail } from '@/api/job'
import { apply, listApplications, parseResume } from '@/api/application'

const route = useRoute()
const jobId = route.params.id

const user = computed(() => {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
})

const loading = ref(false)
const applying = ref(false)
const parsing = ref(false)
const job = ref({})
const hasApplied = ref(false)
const selectedFile = ref(null)

const parseVisible = ref(false)
const parseResult = ref({
  hash: '',
  text: '',
  textLength: 0,
  filename: '',
  duplicateCount: 0,
  duplicates: []
})

const formattedRequirements = computed(() => {
  const raw = job.value.requirements || ''
  return raw.replace(/\n/g, '<br>')
})

async function checkApplied() {
  if (user.value?.role !== 'candidate') return
  try {
    const res = await listApplications({ scope: 'mine' })
    const records = res.data?.records || []
    hasApplied.value = records.some(a => a.job_id === Number(jobId))
  } catch { /* ignore */ }
}

function onFileChange(file) {
  selectedFile.value = file.raw
}

function onFileRemove() {
  selectedFile.value = null
}

async function handleParse() {
  if (!selectedFile.value) return
  parsing.value = true
  try {
    const res = await parseResume(selectedFile.value)
    parseResult.value = res.data
    parseVisible.value = true
  } catch { /* ignore */ } finally {
    parsing.value = false
  }
}

async function handleApply() {
  if (hasApplied.value) return
  applying.value = true
  try {
    await apply(jobId, selectedFile.value)
    ElMessage.success('投递成功')
    hasApplied.value = true
    parseVisible.value = false
  } catch { /* ignore */ } finally {
    applying.value = false
  }
}

async function confirmApplyAfterParse() {
  parseVisible.value = false
  await handleApply()
}

function copyText() {
  navigator.clipboard.writeText(parseResult.value.text).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getJobDetail(jobId)
    job.value = res.data
  } finally {
    loading.value = false
  }
  await checkApplied()
})
</script>

<style scoped>
.custom-upload :deep(.el-upload-list) {
  margin-top: 8px;
}
.parse-dialog :deep(.el-dialog__header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.parse-dialog :deep(.el-dialog__body) {
  padding: 1.5rem;
}
</style>
