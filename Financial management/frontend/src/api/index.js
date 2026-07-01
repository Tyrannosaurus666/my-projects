import request from '../utils/axios'

export const authApi = {
  login: data => request.post('/auth/login', data),
  register: data => request.post('/auth/register', data)
}

export const userApi = {
  getInfo: () => request.get('/user/info')
}

export const accountApi = {
  list: () => request.get('/accounts'),
  add: data => request.post('/accounts', data),
  update: data => request.put('/accounts', data),
  delete: id => request.delete(`/accounts/${id}`),
  transfer: params => request.post('/accounts/transfer', null, { params })
}

export const transactionApi = {
  page: params => request.get('/transactions', { params }),
  add: data => request.post('/transactions', data),
  update: data => request.put('/transactions', data),
  delete: id => request.delete(`/transactions/${id}`),
  statistics: params => request.get('/transactions/statistics', { params }),
  total: params => request.get('/transactions/total', { params })
}

export const categoryApi = {
  list: params => request.get('/categories', { params }),
  add: data => request.post('/categories', data),
  delete: id => request.delete(`/categories/${id}`)
}

export const budgetApi = {
  list: () => request.get('/budgets'),
  add: data => request.post('/budgets', data),
  delete: id => request.delete(`/budgets/${id}`),
  overview: () => request.get('/budgets/overview')
}

export const billApi = {
  list: () => request.get('/bills'),
  add: data => request.post('/bills', data),
  updateStatus: (id, status) => request.put(`/bills/${id}/status`, null, { params: { status } }),
  delete: id => request.delete(`/bills/${id}`)
}

export const dashboardApi = {
  getData: () => request.get('/dashboard')
}
