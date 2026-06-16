import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res
    }
    if (res.code === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      ElMessage.error('未登录')
      return Promise.reject(new Error(res.message || '未登录'))
    }
    ElMessage.error(res.message || '操作失败')
    return Promise.reject(new Error(res.message || '操作失败'))
  },
  error => {
    const res = error.response
    if (res) {
      const data = res.data
      if (res.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        ElMessage.error('未登录，请重新登录')
      } else if (data && data.message) {
        ElMessage.error(data.message)
      } else {
        ElMessage.error('请求失败 (HTTP ' + res.status + ')')
      }
    } else {
      ElMessage.error('网络异常，请稍后重试')
    }
    return Promise.reject(error)
  }
)

export default request
