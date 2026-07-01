import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 120000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      console.error('API error:', res.message)
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

export default request
