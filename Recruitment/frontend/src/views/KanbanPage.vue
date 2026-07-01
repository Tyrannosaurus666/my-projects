<template>
  <div class="flex flex-col h-screen p-5 box-border">
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <h2 class="text-2xl font-bold text-slate-800 m-0">人才看板</h2>
      <div class="flex items-center gap-3">
        <button
          class="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm bg-transparent border-none cursor-pointer"
          @click="$router.push('/')"
        >
          <span>&larr;</span> 职位广场
        </button>
        <el-select v-if="role === 'admin'" v-model="hrFilter" placeholder="全部HR" clearable @change="loadAll" size="default" class="!w-40 custom-select">
          <el-option v-for="h in hrList" :key="h.hrId" :label="h.username" :value="h.hrId" />
        </el-select>
      </div>
    </div>

    <!-- Funnel Chart -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-5 flex-shrink-0">
      <h3 class="text-base font-semibold text-slate-800 m-0 mb-3">招聘漏斗</h3>
      <div class="overflow-hidden">
        <v-chart v-if="funnelData.length" :option="funnelOption" class="h-[260px]" autoresize />
        <div v-else class="py-8 text-center text-sm text-slate-400">
          <div class="text-slate-300 text-4xl mb-2">&#128200;</div>
          暂无数据
        </div>
      </div>
    </div>

    <!-- Kanban Columns -->
    <div class="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-0">
      <div
        v-for="col in columns" :key="col.status"
        class="board-column flex-1 min-w-[240px] bg-slate-100/80 rounded-xl flex flex-col min-h-0"
      >
        <!-- Column Header -->
        <div
          class="px-4 py-3 bg-white rounded-t-xl flex justify-between items-center border-t-[3px]"
          :style="{ borderTopColor: col.color }"
        >
          <span class="font-semibold text-sm text-slate-700">{{ col.label }}</span>
          <span
            :class="[
              'inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-semibold',
              col.tagBg, col.tagText
            ]"
          >
            {{ col.apps.length }}
          </span>
        </div>

        <!-- Column Body -->
        <div class="flex-1 overflow-y-auto p-3">
          <draggable
            :list="col.apps"
            :group="{ name: 'apps', pull: true, put: true }"
            item-key="id"
            class="min-h-[60px] flex flex-col gap-2"
            @change="(evt) => onDragChange(evt, col.status)"
            ghost-class="opacity-50"
            :move="checkMove"
          >
            <template #item="{ element: app }">
              <div
                class="bg-white rounded-lg shadow-sm p-3 cursor-pointer hover:shadow-md transition-shadow border border-slate-200/60"
                @click="showDetail(app)"
              >
                <div class="font-semibold text-sm text-slate-800 truncate">{{ app.jobTitle || '未知职位' }}</div>
                <div class="text-xs text-slate-500 mt-1">{{ app.candidateName }}</div>
                <div class="text-[11px] text-slate-400 mt-1.5">{{ formatTime(app.createTime || app.create_time) }}</div>
              </div>
            </template>
          </draggable>
          <div v-if="col.apps.length === 0" class="py-6 text-center text-xs text-slate-400">
            暂无{{ col.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Dialog -->
    <el-dialog v-model="detailVisible" title="投递详情" width="620px" class="custom-dialog">
      <template v-if="currentApp">
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="职位">{{ currentApp.title || currentApp.jobTitle }}</el-descriptions-item>
          <el-descriptions-item label="候选人">{{ currentApp.username || currentApp.candidateName }}</el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <span :class="['inline-block px-2.5 py-0.5 rounded-full text-xs font-medium', kanbanStatusClass(currentApp.status || currentApp.status_text)]">
              {{ currentApp.status || currentApp.status_text }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="投递时间">{{ formatTime(currentApp.create_time || currentApp.createTime) }}</el-descriptions-item>
        </el-descriptions>

        <!-- Stage History -->
        <div v-if="stageHistory.length" class="mt-5">
          <h4 class="text-sm font-semibold text-slate-700 m-0 mb-3">阶段历史</h4>
          <el-timeline>
            <el-timeline-item
              v-for="s in stageHistory" :key="s.id"
              :timestamp="formatTime(s.createTime)"
              placement="top"
            >
              <span class="text-sm text-slate-600">{{ s.fromStatus || '投递' }} → {{ s.toStatus }}</span>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- Status Transfer -->
        <div v-if="canTransition(currentApp)" class="mt-5 p-4 bg-slate-50 rounded-xl">
          <h4 class="text-sm font-semibold text-slate-700 m-0 mb-3">状态流转</h4>
          <div class="flex gap-2 mb-2">
            <el-select v-model="newStatus" placeholder="选择目标状态" size="default" class="!w-40 custom-select">
              <el-option
                v-for="ns in nextStatuses(currentApp.status || currentApp.status_text)"
                :key="ns" :label="ns" :value="ns" />
            </el-select>
          </div>
          <el-input v-model="noteContent" placeholder="备注（可选）" type="textarea" :rows="2" class="mb-3 custom-input" />
          <button
            class="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            :disabled="!newStatus"
            @click="doMoveStatus"
          >
            确认流转
          </button>
        </div>

        <!-- Offer -->
        <div v-if="(currentApp.status || currentApp.status_text) === '已录用' && ['hr','admin'].includes(role)" class="mt-5 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <h4 class="text-sm font-semibold text-amber-800 m-0 mb-3">录用通知书</h4>
          <button class="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer mb-3" @click="handleOffer">
            生成 Offer
          </button>
          <div v-if="offerData" class="mt-3">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="候选人">{{ offerData.candidateName }}</el-descriptions-item>
              <el-descriptions-item label="职位">{{ offerData.jobTitle }}</el-descriptions-item>
              <el-descriptions-item label="薪资">{{ offerData.salary }}</el-descriptions-item>
              <el-descriptions-item label="日期">{{ offerData.date }}</el-descriptions-item>
            </el-descriptions>
            <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-white rounded-lg p-3 mt-3 border border-amber-100">{{ offerData.content }}</div>
          </div>
        </div>

        <!-- Resume -->
        <div class="mt-5">
          <h4 class="text-sm font-semibold text-slate-700 m-0 mb-3">简历信息</h4>
          <div class="flex gap-2">
            <button class="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer bg-white" @click="loadResumeText" :disabled="resumeLoading">
              {{ resumeLoading ? '加载中...' : '查看简历文本' }}
            </button>
            <a
              v-if="resumeUrl"
              :href="'/uploads/' + resumeUrl.replace(/^uploads[\\/]/, '')"
              target="_blank"
              class="inline-block px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg text-xs hover:bg-indigo-50 transition-colors cursor-pointer no-underline"
            >
              下载简历文件
            </a>
            <button
              v-if="['hr','admin'].includes(role) && resumeHash"
              class="px-3 py-1.5 border border-amber-300 text-amber-600 rounded-lg text-xs hover:bg-amber-50 transition-colors cursor-pointer bg-white"
              @click="checkDuplicates"
            >
              查重检测
            </button>
          </div>
          <div v-if="resumeText" class="mt-3">
            <p class="text-xs text-slate-400 m-0 mb-1">MD5: {{ resumeHash }}</p>
            <div class="bg-slate-50 rounded-lg p-3 max-h-[200px] overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-slate-600 border border-slate-100">
              {{ resumeText }}
            </div>
          </div>
          <div v-if="duplicates.length > 0" class="mt-3">
            <el-alert :title="`发现 ${duplicates.length} 份相同简历(MD5)`" type="warning" show-icon :closable="false" />
          </div>
        </div>

        <!-- Interview Schedules -->
        <div v-if="['hr','admin'].includes(role)" class="mt-5">
          <h4 class="text-sm font-semibold text-slate-700 m-0 mb-3">面试日程</h4>
          <div v-if="schedules.length" class="flex flex-wrap gap-2 mb-3">
            <span
              v-for="s in schedules" :key="s.id"
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs',
                s.status === '已完成' ? 'bg-emerald-50 text-emerald-600' :
                s.status === '已取消' ? 'bg-slate-100 text-slate-400' :
                'bg-indigo-50 text-indigo-600'
              ]"
            >
              {{ s.title || '面试' }} {{ (s.interviewTime || s.interview_time)?.slice(0,16)?.replace('T',' ') }}
              <button class="text-red-400 hover:text-red-500 bg-transparent border-none cursor-pointer text-xs ml-0.5" @click="cancelSchedule(s)">&times;</button>
            </span>
          </div>
          <div v-if="showScheduleForm" class="bg-slate-50 rounded-lg p-3 space-y-2">
            <el-input v-model="scheduleForm.title" placeholder="面试标题" size="small" class="custom-input" />
            <el-date-picker
              v-model="scheduleForm.time"
              type="datetime"
              placeholder="面试时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              size="small"
              class="!w-full custom-input"
            />
            <el-input v-model="scheduleForm.place" placeholder="地点（可选）" size="small" class="custom-input" />
            <div class="flex gap-2">
              <button class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors cursor-pointer" @click="doSchedule">确认安排</button>
              <button class="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs hover:bg-slate-50 transition-colors cursor-pointer bg-white" @click="showScheduleForm = false">取消</button>
            </div>
          </div>
          <button v-else class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors cursor-pointer mt-2" @click="showScheduleForm = true">
            安排面试
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { FunnelChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { ElMessage } from 'element-plus'
import draggable from 'vuedraggable'
import { getFunnel } from '@/api/statistics'
import { listApplications, updateStatus, getStages, getOffer, getResume, listDuplicates } from '@/api/application'
import { listJobs } from '@/api/job'
import { listSchedules, createSchedule, deleteSchedule } from '@/api/schedule'

use([FunnelChart, CanvasRenderer, TooltipComponent, LegendComponent])

const role = ref(localStorage.getItem('role') || 'candidate')
const hrFilter = ref(null)
const hrList = ref([])
const funnelData = ref([])

const columnDefs = [
  { status: '待筛选', label: '待筛选', color: '#f59e0b', tagBg: 'bg-amber-50', tagText: 'text-amber-700' },
  { status: '已面试', label: '已面试', color: '#6366f1', tagBg: 'bg-indigo-50', tagText: 'text-indigo-600' },
  { status: '已录用', label: '已录用', color: '#10b981', tagBg: 'bg-emerald-50', tagText: 'text-emerald-700' },
  { status: '已拒绝', label: '已拒绝', color: '#ef4444', tagBg: 'bg-red-50', tagText: 'text-red-700' }
]

const columns = ref(columnDefs.map(c => ({ ...c, apps: [] })))

const detailVisible = ref(false)
const currentApp = ref(null)
const newStatus = ref('')
const noteContent = ref('')
const stageHistory = ref([])

const ALLOWED_TRANSITIONS = {
  '待筛选': ['已面试', '已拒绝'],
  '已面试': ['已录用', '已拒绝']
}

const kanbanStatusMap = {
  '待筛选': 'bg-amber-50 text-amber-700',
  '已面试': 'bg-indigo-50 text-indigo-600',
  '已录用': 'bg-emerald-50 text-emerald-700',
  '已拒绝': 'bg-red-50 text-red-700'
}

function kanbanStatusClass(status) {
  return kanbanStatusMap[status] || 'bg-slate-100 text-slate-600'
}

function checkMove(evt) {
  const fromCol = columns.value.find(c => c.apps.includes(evt.draggedContext.element))
  const fromStatus = fromCol ? fromCol.status : null
  const toColIndex = Array.from(evt.to.closest('.board-column')?.parentNode?.children || []).indexOf(evt.to.closest('.board-column'))
  const toCol = toColIndex >= 0 ? columns.value[toColIndex] : null
  const actualToStatus = toCol?.status

  if (fromStatus && actualToStatus) {
    const allowed = ALLOWED_TRANSITIONS[fromStatus]
    if (allowed && !allowed.includes(actualToStatus)) {
      ElMessage.warning('不允许逆向或跳步流转: ' + fromStatus + ' → ' + actualToStatus)
      return false
    }
  }
  return true
}

async function onDragChange(evt, toStatus) {
  if (!evt.added) return
  const app = evt.added.element
  try {
    await updateStatus(app.appId || app.id, { status: toStatus, content: '拖拽流转' })
    ElMessage.success('已流转至 ' + toStatus)
    loadFunnel()
  } catch {
    ElMessage.error('流转失败，请检查状态是否合法')
    loadKanban()
  }
}

const funnelOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c}人' },
  legend: { data: funnelData.value.map(f => f.status), bottom: 0 },
  series: [{
    type: 'funnel',
    left: '10%',
    top: 10,
    bottom: 40,
    width: '80%',
    min: 0,
    max: Math.max(...funnelData.value.map(f => f.count), 1),
    minSize: '20%',
    maxSize: '100%',
    gap: 2,
    label: { show: true, position: 'inside', formatter: '{b}\n{c}人', fontSize: 13 },
    itemStyle: { borderColor: '#fff', borderWidth: 2 },
    data: funnelData.value.map((f, i) => ({
      name: f.status,
      value: f.count,
      itemStyle: {
        color: ['#f59e0b', '#6366f1', '#10b981', '#ef4444'][i]
      }
    }))
  }]
}))

function canTransition(app) {
  const s = app.status || app.status_text
  return ['hr', 'admin'].includes(role.value) && ALLOWED_TRANSITIONS[s]
}

function nextStatuses(status) {
  return ALLOWED_TRANSITIONS[status] || []
}

function formatTime(t) {
  if (!t) return ''
  return t.slice(0, 16).replace('T', ' ')
}

async function loadFunnel() {
  try {
    const res = await getFunnel(hrFilter.value)
    funnelData.value = res.data
  } catch { }
}

async function loadKanban() {
  try {
    const scope = role.value === 'hr' ? 'myJobs' : (hrFilter.value ? 'jobId' : 'mine')
    const res = await listApplications({ scope, pageNum: 1, pageSize: 200 })
    const allApps = res.data.records || []
    const jobsRes = await listJobs({ pageNum: 1, pageSize: 200 })
    const jobs = jobsRes.data.records || []
    const jobMap = {}
    jobs.forEach(j => { jobMap[j.id] = j.title })

    columns.value = columnDefs.map(col => {
      const matched = allApps.filter(a => {
        const s = a.status || a.status_text
        return s === col.status
      })
      return {
        ...col,
        apps: matched.map(a => ({
          ...a,
          jobTitle: jobMap[a.job_id || a.jobId] || '未知职位',
          candidateName: a.username || ('用户' + (a.user_id || a.userId))
        }))
      }
    })
  } catch (e) {
    console.error('[Kanban] load failed:', e)
  }
}

async function loadAll() {
  await Promise.all([loadFunnel(), loadKanban()])
}

async function showDetail(app) {
  currentApp.value = app
  newStatus.value = ''
  noteContent.value = ''
  resumeText.value = ''
  resumeHash.value = ''
  resumeUrl.value = app.resume_url || ''
  showScheduleForm.value = false
  offerData.value = null
  duplicates.value = []
  scheduleForm.value = { title: '', time: '', place: '' }
  detailVisible.value = true
  const appId = app.appId || app.id
  try {
    const res = await getStages(appId)
    stageHistory.value = res.data || []
  } catch { stageHistory.value = [] }
  loadSchedules(appId)
}

async function handleOffer() {
  const appId = currentApp.value.appId || currentApp.value.id
  try {
    const res = await getOffer(appId)
    offerData.value = res.data
    ElMessage.success('Offer已生成')
  } catch { ElMessage.error('生成Offer失败') }
}

async function loadResumeText() {
  resumeLoading.value = true
  const appId = currentApp.value.appId || currentApp.value.id
  try {
    const res = await getResume(appId)
    resumeText.value = res.data.resumeText || ''
    resumeHash.value = res.data.resumeHash || ''
    resumeUrl.value = res.data.resumeUrl || currentApp.value.resume_url || ''
  } catch { ElMessage.error('获取简历文本失败') }
  finally { resumeLoading.value = false }
}

async function checkDuplicates() {
  if (!resumeHash.value) return
  try {
    const res = await listDuplicates(resumeHash.value)
    duplicates.value = res.data || []
    if (duplicates.value.length > 1) {
      ElMessage.warning('发现 ' + duplicates.value.length + ' 份相同简历(MD5)')
    } else {
      ElMessage.success('未发现重复简历')
    }
  } catch { ElMessage.error('查重失败') }
}

async function doMoveStatus() {
  if (!newStatus.value) return
  try {
    const appId = currentApp.value.appId || currentApp.value.id
    await updateStatus(appId, { status: newStatus.value, content: noteContent.value })
    ElMessage.success('状态流转成功')
    detailVisible.value = false
    await loadAll()
  } catch { }
}

const schedules = ref([])
const showScheduleForm = ref(false)
const offerData = ref(null)
const resumeText = ref('')
const resumeHash = ref('')
const resumeUrl = ref('')
const resumeLoading = ref(false)
const duplicates = ref([])
const scheduleForm = ref({ title: '', time: '', place: '' })

async function loadSchedules(appId) {
  try {
    const res = await listSchedules({ appId })
    schedules.value = res.data || []
  } catch { schedules.value = [] }
}

async function doSchedule() {
  if (!scheduleForm.value.time) return
  try {
    const appId = currentApp.value.appId || currentApp.value.id
    await createSchedule(appId, {
      title: scheduleForm.value.title || '面试',
      interviewTime: scheduleForm.value.time,
      place: scheduleForm.value.place || '待定'
    })
    ElMessage.success('面试已安排（模拟邮件通知已发送）')
    showScheduleForm.value = false
    scheduleForm.value = { title: '', time: '', place: '' }
    await loadSchedules(appId)
  } catch { }
}

async function cancelSchedule(s) {
  try {
    await deleteSchedule(s.id)
    ElMessage.success('已取消')
    const appId = currentApp.value.appId || currentApp.value.id
    await loadSchedules(appId)
  } catch { }
}

onMounted(loadAll)
</script>

<style scoped>
.custom-dialog :deep(.el-dialog__header) {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}
.custom-dialog :deep(.el-dialog__body) {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}
.custom-select :deep(.el-select__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
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
</style>
