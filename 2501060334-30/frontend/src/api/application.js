import request from './request'

export function apply(jobId, file) {
  const formData = new FormData()
  formData.append('jobId', jobId)
  if (file) {
    formData.append('file', file)
  }
  return request.post('/applications', formData)
}

export function listApplications(params) {
  return request.get('/applications', { params })
}

export function updateStatus(id, data) {
  return request.put(`/applications/${id}/status`, data)
}

export function getNotes(id) {
  return request.get(`/applications/${id}/notes`)
}

export function getStages(id) {
  return request.get(`/applications/${id}/stages`)
}

export function getOffer(id) {
  return request.get(`/applications/${id}/offer`)
}

export function getResume(id) {
  return request.get(`/applications/${id}/resume`)
}

export function listDuplicates(hash) {
  return request.get('/applications/duplicates', { params: { hash } })
}

export function parseResume(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/resumes/parse', formData)
}
