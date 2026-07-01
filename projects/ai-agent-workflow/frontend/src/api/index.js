import request from './request'

export const agentApi = {
  createSession: () => request.post('/session'),
  executeTask: (sessionId, objective) => request.post('/task/execute', { sessionId, objective }),
  getTask: (taskId) => request.get(`/task/${taskId}`),
  getSessionMessages: (sessionId) => request.get(`/session/${sessionId}/messages`),
  listAgents: () => request.get('/agents'),
  createAgent: (data) => request.post('/agents', data),
  deleteAgent: (id) => request.delete(`/agents/${id}`)
}
