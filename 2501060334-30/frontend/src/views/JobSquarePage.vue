<template>
  <div class="max-w-6xl mx-auto p-6">
    <!-- Page Header -->
    <header class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800 m-0">职位广场</h2>
      <div class="flex items-center gap-3">
        <span v-if="user" class="text-sm text-slate-500">
          {{ user.role === 'hr' ? 'HR' : user.role === 'admin' ? '管理员' : '' }}
          {{ user.username }}
        </span>
        <button
          v-if="user?.role === 'hr' || user?.role === 'admin'"
          class="px-4 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors cursor-pointer"
          @click="$router.push('/kanban')"
        >
          人才看板
        </button>
        <button
          v-if="user?.role === 'hr' || user?.role === 'admin'"
          class="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          @click="$router.push('/my-jobs')"
        >
          我的职位
        </button>
        <button
          class="px-4 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          @click="$router.push('/my-applications')"
        >
          我的投递
        </button>
        <button
          class="px-4 py-1.5 text-red-500 border border-red-200 rounded-lg text-sm hover:bg-red-50 transition-colors cursor-pointer"
          @click="handleLogout"
        >
          退出
        </button>
      </div>
    </header>

    <!-- Search Bar -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
      <div class="flex items-center gap-3 flex-wrap">
        <el-input
          v-model="keyword"
          placeholder="搜索职位/要求..."
          clearable
          class="!w-52 custom-input"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select v-model="statusFilter" placeholder="状态" clearable class="!w-32 custom-input" @change="search">
          <el-option label="招聘中" value="招聘中" />
          <el-option label="停招" value="停招" />
        </el-select>
        <el-input
          v-model="salaryKeyword"
          placeholder="薪资关键词"
          clearable
          class="!w-36 custom-input"
          @keyup.enter="search"
          @clear="search"
        />
        <el-input
          v-model="tagFilter"
          placeholder="标签筛选"
          clearable
          class="!w-32 custom-input"
          @keyup.enter="search"
          @clear="search"
        />
        <button
          class="px-5 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          @click="search"
        >
          搜索
        </button>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <el-table :data="tableData" stripe v-loading="loading" class="w-full" :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '13px' }">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="title" label="职位名称" min-width="180">
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="salaryText" label="薪资" width="160">
          <template #default="{ row }">
            <span class="text-emerald-600 font-medium">{{ row.salaryText || '面议' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="标签" width="180">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1">
              <span
                v-for="tag in (row.tags || [])" :key="tag"
                class="inline-block bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:bg-indigo-100 transition-colors"
                @click="tagFilter = tag; search()"
              >
                {{ tag }}
              </span>
              <span v-if="!row.tags || row.tags.length === 0" class="text-slate-300 text-xs">-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止日期" width="150">
          <template #default="{ row }">
            <span :class="row.deadline ? 'text-slate-600' : 'text-slate-400'">
              {{ row.deadline ? row.deadline.slice(0, 10) : '长期有效' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <button
              class="text-indigo-600 hover:text-indigo-700 text-sm font-medium bg-transparent border-none cursor-pointer"
              @click="$router.push(`/job/${row.id}`)"
            >
              查看详情
            </button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Empty State -->
      <div v-if="!loading && tableData.length === 0" class="py-16 text-center">
        <div class="text-slate-300 text-5xl mb-4">&#128269;</div>
        <p class="text-slate-400 text-sm">暂无职位信息</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listJobs } from '@/api/job'

const router = useRouter()

const user = computed(() => {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
})

const loading = ref(false)
const keyword = ref('')
const statusFilter = ref('')
const salaryKeyword = ref('')
const tagFilter = ref('')
const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

function search() {
  pageNum.value = 1
  fetchData()
}

async function fetchData() {
  loading.value = true
  try {
    const res = await listJobs({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      status: statusFilter.value || undefined,
      salaryKeyword: salaryKeyword.value || undefined,
      tag: tagFilter.value || undefined
    })
    tableData.value = res.data.records || []
    total.value = res.data.total || 0
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.replace('/login')
  }).catch(() => {})
}

onMounted(fetchData)
</script>

<style scoped>
.custom-input :deep(.el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}
.custom-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c7d2fe inset;
}
.custom-input :deep(.el-select__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}
</style>
