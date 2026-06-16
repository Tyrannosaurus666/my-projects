import request from './request'

export function getFunnel(hrId) {
  return request.get('/statistics/funnel', { params: hrId ? { hrId } : {} })
}
