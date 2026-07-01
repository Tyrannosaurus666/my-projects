<template>
  <el-container style="height: 100vh">
    <el-aside width="220px" class="sidebar">
      <div class="logo">财务管理系统</div>
      <el-menu :default-active="route.path" router background-color="#304156" text-color="#bfcbd9" active-text-color="#409eff">
        <el-menu-item index="/dashboard">
          <el-icon><DataBoard /></el-icon><span>首页</span>
        </el-menu-item>
        <el-menu-item index="/accounts">
          <el-icon><Wallet /></el-icon><span>账户管理</span>
        </el-menu-item>
        <el-menu-item index="/transactions">
          <el-icon><List /></el-icon><span>流水记录</span>
        </el-menu-item>
        <el-menu-item index="/categories">
          <el-icon><Collection /></el-icon><span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/budgets">
          <el-icon><Money /></el-icon><span>预算管理</span>
        </el-menu-item>
        <el-menu-item index="/bills">
          <el-icon><Bell /></el-icon><span>账单提醒</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="header">
        <span class="page-title">{{ route.meta.title }}</span>
        <div class="user-info">
          <span>{{ userStore.nickname || userStore.username }}</span>
          <el-button type="danger" text @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { onMounted } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (!userStore.id) {
    userStore.fetchUserInfo()
  }
})

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.sidebar {
  background-color: #304156;
  overflow-y: auto;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #263445;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}
.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #606266;
}
.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
