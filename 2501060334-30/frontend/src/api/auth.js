import request from './request'

export function login(loginRequest) {
  return request.post('/auth/login', loginRequest)
}

export function register(registerRequest) {
  return request.post('/auth/register', registerRequest)
}

export function getMe() {
  return request.get('/auth/me')
}
