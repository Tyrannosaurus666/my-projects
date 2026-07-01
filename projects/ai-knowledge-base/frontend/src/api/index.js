import request from './request'

export const api = {
  getKnowledgeBases: () => request.get('/knowledge-bases'),
  createKnowledgeBase: (data) => request.post('/knowledge-bases', data),
  updateKnowledgeBase: (id, data) => request.put(`/knowledge-bases/${id}`, data),
  deleteKnowledgeBase: (id) => request.delete(`/knowledge-bases/${id}`),

  getDocuments: (kbId) => request.get(`/documents/kb/${kbId}`),
  uploadDocument: (kbId, file) => {
    const form = new FormData()
    form.append('kbId', kbId)
    form.append('file', file)
    return request.post('/documents/upload', form)
  },
  deleteDocument: (id) => request.delete(`/documents/${id}`),

  askQuestion: (kbId, question) => request.post('/qa/ask', { kbId, question }),
  getQAHistory: (kbId) => request.get(`/qa/history/${kbId}`)
}
