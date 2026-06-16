import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '@/views/LoginPage.vue'
import JobSquarePage from '@/views/JobSquarePage.vue'
import JobDetailPage from '@/views/JobDetailPage.vue'
import MyApplicationsPage from '@/views/MyApplicationsPage.vue'
import MyJobsPage from '@/views/MyJobsPage.vue'
import KanbanPage from '@/views/KanbanPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: JobSquarePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/job/:id',
    name: 'JobDetail',
    component: JobDetailPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-applications',
    name: 'MyApplications',
    component: MyApplicationsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-jobs',
    name: 'MyJobs',
    component: MyJobsPage,
    meta: { requiresAuth: true }
  },
  {
    path: '/kanban',
    name: 'Kanban',
    component: KanbanPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('token')) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  }
  next()
})

export default router
