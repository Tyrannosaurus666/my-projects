<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Page Header -->
    <header class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800 m-0">我的职位</h2>
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm bg-transparent border-none cursor-pointer"
          @click="$router.push('/')"
        >
          <span>&larr;</span> 职位广场
        </button>
        <button
          class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          @click="openCreateDialog"
        >
          发布新职位
        </button>
      </div>
    </header>

    <!-- Table Card -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <el-table :data="tableData" stripe v-loading="loading" class="w-full" :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="职位名称" min-width="160">
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salaryText" label="薪资" width="150">
          <template #default="{ row }">
            <span class="text-emerald-600 font-medium">{{ row.salaryText || '面议' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span
              :class="[
                'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                row.status === '招聘中' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              ]"
            >
              {{ row.status }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发布时间" width="170">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ row.createTime?.slice(0, 16) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <button
                class="text-indigo-600 hover:text-indigo-700 text-sm bg-transparent border-none cursor-pointer"
                @click="viewApplicants(row)"
              >
                投递列表
              </button>
              <button
                class="text-slate-600 hover:text-slate-800 text-sm bg-transparent border-none cursor-pointer"
                @click="openEditDialog(row)"
              >
                编辑
              </button>
              <button
                class="text-red-500 hover:text-red-600 text-sm bg-transparent border-none cursor-pointer"
                @click="handleDelete(row)"
              >
                下架
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="!loading && tableData.length === 0" class="py-16 text-center">
        <div class="text-slate-300 text-5xl mb-4">&#128196;</div>
        <p class="text-slate-400 text-sm mb-4">暂无职位，快去发布第一个吧</p>
        <button
          class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          @click="openCreateDialog"
        >
          发布新职位
        </button>
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
          @size-change="fetchJobs"
          @current-change="fetchJobs"
        />
      </div>
    </div>

    <!-- Create/Edit Job Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingJob ? '编辑职位' : '发布新职位'"
      width="560px"
      class="custom-dialog"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="jobForm" :rules="jobRules" label-width="90px" class="custom-form">
        <el-form-item label="职位名称" prop="title">
          <el-input v-model="jobForm.title" placeholder="请输入职位名称" maxlength="100" show-word-limit class="custom-input" />
        </el-form-item>
        <el-form-item label="薪资" prop="salary_text">
          <el-input v-model="jobForm.salary_text" placeholder="如: 15K-25K 或 面议" maxlength="50" class="custom-input" />
        </el-form-item>
        <el-form-item label="职位要求" prop="requirements">
          <el-input
            v-model="jobForm.requirements"
            type="textarea"
            :rows="5"
            placeholder="请描述职位要求，支持多行"
            maxlength="2000"
            show-word-limit
            class="custom-input"
          />
        </el-form-item>
        <el-form-item label="截止日期" prop="deadline">
          <el-date-picker
            v-model="jobForm.deadline"
            type="datetime"
            placeholder="选择截止日期，或留空长期有效"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            class="custom-input"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="jobForm.tags" placeholder="多个标签用逗号分隔，如: Java,Spring,Vue" maxlength="100" class="custom-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            class="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            @click="dialogVisible = false"
          >
            取消
          </button>
          <button
            class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            :disabled="saving"
            @click="handleSave"
          >
            {{ saving ? '保存中...' : (editingJob ? '保存修改' : '发布') }}
          </button>
        </div>
      </template>
    </el-dialog>

    <!-- Applicants Dialog -->
    <el-dialog v-model="applicantsVisible" title="投递列表" width="850px" class="custom-dialog">
      <el-table :data="applicants" stripe v-loading="applicantsLoading" class="w-full" :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }">
        <el-table-column prop="id" label="申请ID" width="80" />
        <el-table-column prop="username" label="候选人" width="120">
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.username }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <span
              :class="[
                'inline-block px-2.5 py-0.5 rounded-full text-xs font-medium',
                appStatusClass(row.status)
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
        <el-table-column prop="create_time" label="投递时间" width="160">
          <template #default="{ row }">
            <span class="text-sm text-slate-500">{{ row.create_time?.slice(0, 16) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <button
                v-if="row.status === '待筛选'"
                class="text-indigo-600 hover:text-indigo-700 text-xs bg-transparent border-none cursor-pointer font-medium"
                @click="handleStatus(row, '已面试')"
              >
                安排面试
              </button>
              <button
                v-if="row.status === '已面试'"
                class="text-emerald-600 hover:text-emerald-700 text-xs bg-transparent border-none cursor-pointer font-medium"
                @click="handleStatus(row, '已录用')"
              >
                录用
              </button>
              <button
                v-if="row.status === '已录用'"
                class="text-amber-600 hover:text-amber-700 text-xs bg-transparent border-none cursor-pointer font-medium"
                @click="handleOffer(row)"
              >
                Offer
              </button>
              <button
                v-if="row.status === '待筛选' || row.status === '已面试'"
                class="text-red-500 hover:text-red-600 text-xs bg-transparent border-none cursor-pointer font-medium"
                @click="handleStatus(row, '已拒绝')"
              >
                拒绝
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="!applicantsLoading && applicants.length === 0" class="py-12 text-center text-sm text-slate-400">暂无投递</div>

      <template #footer>
        <button
          class="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer bg-white"
          @click="applicantsVisible = false"
        >
          关闭
        </button>
      </template>
    </el-dialog>

    <!-- Offer Dialog -->
    <el-dialog v-model="offerVisible" title="录用通知书" width="520px" class="custom-dialog">
      <template v-if="offerData">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="候选人">{{ offerData.candidateName }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ offerData.jobTitle }}</el-descriptions-item>
          <el-descriptions-item label="薪资">{{ offerData.salary }}</el-descriptions-item>
          <el-descriptions-item label="日期">{{ offerData.date }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-4">{{ offerData.content }}</div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer bg-white" @click="offerVisible = false">关闭</button>
          <button class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer" @click="offerVisible = false">确认发送</button>
        </div>
      </template>
    </el-dialog>

    <!-- Status Update Dialog -->
    <el-dialog v-model="statusDialogVisible" :title="`更新状态为: ${targetStatus}`" width="450px" class="custom-dialog">
      <el-form label-width="90px" class="custom-form">
        <el-form-item label="备注内容">
          <el-input v-model="statusNote" type="textarea" :rows="3" placeholder="可选" class="custom-input" />
        </el-form-item>
        <el-form-item v-if="targetStatus !== '已拒绝' && targetStatus !== '已录用'" label="下一环节">
          <el-input v-model="statusNextStage" placeholder="如: 技术面试 / HR终面" class="custom-input" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button class="px-5 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer bg-white" @click="statusDialogVisible = false">取消</button>
          <button class="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer" :disabled="statusSaving" @click="confirmStatus">
            {{ statusSaving ? '处理中...' : '确认' }}
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listJobs, createJob, updateJob, deleteJob } from '@/api/job'
import { listApplications, updateStatus, getOffer } from '@/api/application'

const loading = ref(false)
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const editingJob = ref(null)
const saving = ref(false)
const formRef = ref(null)

const jobForm = ref({
  title: '',
  salary_text: '',
  requirements: '',
  deadline: null,
  tags: ''
})

const jobRules = {
  title: [
    { required: true, message: '请输入职位名称', trigger: 'blur' },
    { max: 100, message: '职位名称不超过 100 字', trigger: 'blur' }
  ],
  requirements: [
    { required: true, message: '请输入职位要求', trigger: 'blur' }
  ]
}

const applicantsVisible = ref(false)
const applicants = ref([])
const applicantsLoading = ref(false)
const currentJobId = ref(null)

const statusDialogVisible = ref(false)
const targetStatus = ref('')
const targetAppId = ref(null)
const statusNote = ref('')
const statusNextStage = ref('')
const statusSaving = ref(false)

const offerVisible = ref(false)
const offerData = ref(null)

const appStatusClassMap = {
  '待筛选': 'bg-amber-50 text-amber-700',
  '已面试': 'bg-blue-50 text-blue-700',
  '已录用': 'bg-emerald-50 text-emerald-700',
  '已拒绝': 'bg-red-50 text-red-700'
}

function appStatusClass(status) {
  return appStatusClassMap[status] || 'bg-slate-100 text-slate-600'
}

async function handleOffer(row) {
  const appId = row.application_id || row.id
  try {
    const res = await getOffer(appId)
    offerData.value = res.data
    offerVisible.value = true
  } catch { ElMessage.error('生成Offer失败') }
}

async function fetchJobs() {
  loading.value = true
  try {
    const res = await listJobs({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    tableData.value = res.data?.records || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingJob.value = null
  jobForm.value = { title: '', salary_text: '', requirements: '', deadline: null, tags: '' }
  dialogVisible.value = true
}

function openEditDialog(row) {
  editingJob.value = row
  jobForm.value = {
    title: row.title,
    salary_text: row.salaryText || '',
    requirements: row.requirements || '',
    deadline: row.deadline ? row.deadline.replace('T', ' ').slice(0, 19) : null,
    tags: (row.tags || []).join(',')
  }
  dialogVisible.value = true
}

function resetForm() {
  editingJob.value = null
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      title: jobForm.value.title,
      salaryText: jobForm.value.salary_text,
      requirements: jobForm.value.requirements,
      deadline: jobForm.value.deadline || null,
      tags: jobForm.value.tags || null
    }
    if (editingJob.value) {
      await updateJob(editingJob.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createJob(payload)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    await fetchJobs()
  } finally {
    saving.value = false
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(
    `确定要下架职位「${row.title}」吗？`,
    '确认操作',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    await deleteJob(row.id)
    ElMessage.success('下架成功')
    await fetchJobs()
  }).catch(() => {})
}

async function viewApplicants(row) {
  currentJobId.value = row.id
  applicantsVisible.value = true
  applicantsLoading.value = true
  try {
    const res = await listApplications({
      scope: 'jobId',
      jobId: row.id,
      pageSize: 100
    })
    applicants.value = res.data?.records || []
  } finally {
    applicantsLoading.value = false
  }
}

function handleStatus(row, status) {
  targetAppId.value = row.application_id || row.id
  targetStatus.value = status
  statusNote.value = ''
  statusNextStage.value = ''
  statusDialogVisible.value = true
}

async function confirmStatus() {
  statusSaving.value = true
  try {
    await updateStatus(targetAppId.value, {
      status: targetStatus.value,
      content: statusNote.value || undefined,
      nextStage: statusNextStage.value || undefined
    })
    ElMessage.success('状态更新成功')
    statusDialogVisible.value = false
    await viewApplicants({ id: currentJobId.value })
  } finally {
    statusSaving.value = false
  }
}

onMounted(fetchJobs)
</script>

<style scoped>
.custom-dialog :deep(.el-dialog__header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.custom-dialog :deep(.el-dialog__body) {
  padding: 1.5rem;
}
.custom-dialog :deep(.el-dialog__footer) {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
}
.custom-input :deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}
.custom-input :deep(.el-textarea__inner) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  font-family: inherit;
}
.custom-form :deep(.el-form-item) {
  margin-bottom: 1.25rem;
}
</style>
