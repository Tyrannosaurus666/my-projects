<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Page Header -->
    <header class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800 m-0">我的投递</h2>
      <button
        class="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm bg-transparent border-none cursor-pointer"
        @click="$router.push('/')"
      >
        <span>&larr;</span> 职位广场
      </button>
    </header>

    <!-- Card -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <el-table :data="tableData" stripe v-loading="loading" class="w-full" :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }">
        <el-table-column prop="id" label="申请ID" width="80" />
        <el-table-column prop="title" label="职位名称" min-width="180">
          <template #default="{ row }">
            <button
              class="text-indigo-600 hover:text-indigo-700 text-sm bg-transparent border-none cursor-pointer"
              @click="$router.push(`/job/${row.job_id}`)"
            >
              {{ row.title }}
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <span
              :class="[
                'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                statusClass(row.status)
              ]"
            >
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="resume_url" label="简历" width="120">
          <template #default="{ row }">
            <a
              v-if="row.resume_url"
              :href="'/uploads/' + row.resume_url.replace(/^uploads[\\/]/, '')"
              target="_blank"
              class="text-indigo-600 hover:text-indigo-700 text-sm no-underline"
            >
              查看简历
            </a>
            <span v-else class="text-sm text-slate-400">未上传</span>
          </template>
        </el-table-column>
        <el-table-column prop="create_time" label="投递时间" width="170">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ row.create_time?.slice(0, 16) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <button
                class="text-indigo-600 hover:text-indigo-700 text-sm bg-transparent border-none cursor-pointer"
                @click="showNotes(row)"
              >
                备注
              </button>
              <button
                class="text-indigo-600 hover:text-indigo-700 text-sm bg-transparent border-none cursor-pointer"
                @click="showResume(row)"
              >
                解析简历
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="!loading && tableData.length === 0" class="py-16 text-center">
        <div class="text-slate-300 text-5xl mb-4">&#128203;</div>
        <p class="text-slate-400 text-sm">暂无投递记录</p>
      </div>

      <!-- Pagination -->
      <div v-if="total > 0" class="px-6 py-4 border-t border-slate-100 flex justify-between items-center">
        <span class="text-sm text-slate-500">共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="sizes, prev, pager, next"
          small
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- Notes Dialog -->
    <el-dialog v-model="notesVisible" title="面试备注" width="520px" class="custom-dialog">
      <el-timeline v-if="notes.length">
        <el-timeline-item
          v-for="note in notes"
          :key="note.id"
          :timestamp="(note.createTime || note.create_time)?.slice(0, 16)"
          placement="top"
        >
          <div class="bg-slate-50 rounded-lg p-4">
            <p class="text-sm text-slate-700 m-0">{{ note.content }}</p>
            <span
              v-if="note.nextStage || note.next_stage"
              class="inline-block mt-2 bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-medium"
            >
              下一环节: {{ note.nextStage || note.next_stage }}
            </span>
          </div>
        </el-timeline-item>
      </el-timeline>
      <div v-else class="py-8 text-center text-sm text-slate-400">暂无面试备注</div>
    </el-dialog>

    <!-- Resume Text Dialog -->
    <el-dialog v-model="resumeVisible" title="简历解析内容" width="680px" class="custom-dialog">
      <div v-if="resumeLoading" class="py-12 text-center">
        <p class="text-sm text-slate-400">加载中...</p>
      </div>
      <template v-else>
        <!-- Resume Info -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-slate-50 rounded-lg p-3">
            <span class="text-xs text-slate-500">简历文件</span>
            <p class="text-sm text-slate-700 mt-1 m-0 truncate">{{ resumeData.resumeUrl || '未上传' }}</p>
          </div>
          <div class="bg-slate-50 rounded-lg p-3">
            <span class="text-xs text-slate-500">MD5 指纹</span>
            <p class="text-sm text-slate-700 mt-1 m-0 font-mono text-xs">{{ resumeData.resumeHash || '无' }}</p>
          </div>
        </div>

        <!-- Parsed Text -->
        <div class="border border-slate-200 rounded-lg overflow-hidden">
          <div class="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
            <span class="text-sm font-medium text-slate-700">解析文本内容</span>
            <button
              class="text-xs text-indigo-600 hover:text-indigo-700 bg-transparent border-none cursor-pointer"
              @click="copyResumeText"
            >
              复制
            </button>
          </div>
          <div class="p-4 max-h-80 overflow-y-auto">
            <pre v-if="resumeData.resumeText" class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed m-0">{{
              resumeData.resumeText
            }}</pre>
            <div v-else class="py-8 text-center text-sm text-slate-400">暂无解析内容（投递时未上传简历文件）</div>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="resumeVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listApplications, getNotes, getResume } from '@/api/application'

const loading = ref(false)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const notesVisible = ref(false)
const notes = ref([])

const resumeVisible = ref(false)
const resumeLoading = ref(false)
const resumeData = ref({
  resumeUrl: '',
  resumeHash: '',
  resumeText: ''
})

const statusClassMap = {
  '待筛选': 'bg-amber-50 text-amber-700',
  '已面试': 'bg-blue-50 text-blue-700',
  '已录用': 'bg-emerald-50 text-emerald-700',
  '已拒绝': 'bg-red-50 text-red-700'
}

function statusClass(status) {
  return statusClassMap[status] || 'bg-slate-100 text-slate-600'
}

async function fetchData() {
  loading.value = true
  try {
    const res = await listApplications({
      scope: 'mine',
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

async function showNotes(row) {
  notesVisible.value = true
  try {
    const res = await getNotes(row.application_id || row.id)
    notes.value = res.data || []
  } catch {
    notes.value = []
  }
}

async function showResume(row) {
  resumeVisible.value = true
  resumeLoading.value = true
  try {
    const appId = row.id
    const res = await getResume(appId)
    resumeData.value = res.data || { resumeUrl: '', resumeHash: '', resumeText: '' }
  } catch {
    resumeData.value = { resumeUrl: '', resumeHash: '', resumeText: '' }
  } finally {
    resumeLoading.value = false
  }
}

function copyResumeText() {
  navigator.clipboard.writeText(resumeData.value.resumeText || '').then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

onMounted(fetchData)
</script>

<style scoped>
.custom-dialog :deep(.el-dialog__header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.custom-dialog :deep(.el-dialog__body) {
  padding: 1.5rem;
}
</style>
