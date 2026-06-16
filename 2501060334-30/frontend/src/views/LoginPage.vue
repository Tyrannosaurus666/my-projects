<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
    <div class="w-full max-w-md mx-4">
      <div class="bg-white rounded-2xl shadow-2xl p-10">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-indigo-100 rounded-xl mb-4">
            <svg class="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">招聘管理与人才看板</h1>
          <p class="text-sm text-slate-500 mt-1.5">{{ isLogin ? '登录到您的账号' : '创建新账号' }}</p>
        </div>

        <!-- Form -->
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="0"
          size="large"
          class="space-y-5"
          @submit.prevent
        >
          <el-form-item prop="username" class="custom-form-item">
            <el-input
              v-model="form.username"
              placeholder="用户名"
              prefix-icon="User"
              class="custom-input"
            />
          </el-form-item>

          <el-form-item prop="password" class="custom-form-item">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              prefix-icon="Lock"
              show-password
              class="custom-input"
            />
          </el-form-item>

          <el-form-item v-if="!isLogin" prop="role" class="custom-form-item">
            <el-select
              v-model="form.role"
              placeholder="请选择角色"
              class="w-full custom-input"
            >
              <el-option label="候选人" value="candidate" />
              <el-option label="HR" value="hr" />
            </el-select>
          </el-form-item>

          <el-form-item class="!mb-0">
            <button
              type="button"
              :disabled="loading"
              class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors duration-200 text-base cursor-pointer"
              @click="onSubmit"
            >
              <template v-if="loading">
                <span class="inline-flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  处理中...
                </span>
              </template>
              <template v-else>
                {{ isLogin ? '登录' : '注册' }}
              </template>
            </button>
          </el-form-item>
        </el-form>

        <!-- Switch mode -->
        <div class="mt-6 text-center">
          <p class="text-sm text-slate-500">
            {{ isLogin ? '还没有账号？' : '已有账号？' }}
            <button
              type="button"
              class="text-indigo-600 hover:text-indigo-700 font-medium bg-transparent border-none cursor-pointer"
              @click="toggleMode"
            >
              {{ isLogin ? '立即注册' : '返回登录' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login, register } from '@/api/auth'

const router = useRouter()
const route = useRoute()

const isLogin = ref(true)
const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  username: '',
  password: '',
  role: 'candidate'
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名 3-20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码 6-32 个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

function toggleMode() {
  isLogin.value = !isLogin.value
  formRef.value?.resetFields()
}

async function onSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    if (isLogin.value) {
      const res = await login({
        username: form.username,
        password: form.password
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('role', res.data.role)
      localStorage.setItem('user', JSON.stringify(res.data))
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/'
      router.replace(redirect)
    } else {
      await register({
        username: form.username,
        password: form.password,
        role: form.role
      })
      ElMessage.success('注册成功，请登录')
      isLogin.value = true
      formRef.value?.resetFields()
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Element Plus 深度定制 */
.custom-form-item {
  margin-bottom: 0;
}
:deep(.custom-input .el-input__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  transition: box-shadow 0.2s;
}
:deep(.custom-input .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c7d2fe inset;
}
:deep(.custom-input .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #6366f1 inset;
}
:deep(.custom-input .el-select__wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 0 0 1px #e2e8f0 inset;
}
</style>
