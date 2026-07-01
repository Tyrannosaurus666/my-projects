import { createRouter, createWebHistory } from 'vue-router'
import KnowledgeBaseList from '../views/KnowledgeBaseList.vue'
import KnowledgeBaseDetail from '../views/KnowledgeBaseDetail.vue'

const routes = [
  { path: '/', redirect: '/knowledge-bases' },
  { path: '/knowledge-bases', name: 'KBList', component: KnowledgeBaseList },
  { path: '/knowledge-bases/:id', name: 'KBDetail', component: KnowledgeBaseDetail }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
