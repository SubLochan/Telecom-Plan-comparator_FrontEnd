import axios from 'axios'
import { getActiveToken } from './session'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach the active tab's JWT on every request
api.interceptors.request.use(config => {
  const token = getActiveToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap ApiResponse<T> wrapper from Spring Boot
// Backend always returns: { success: boolean, message: string, data: T }
// This interceptor strips the wrapper and returns T directly to callers
api.interceptors.response.use(
  res => {
    const body = res.data
    if (body !== null && typeof body === 'object' && 'data' in body) {
      return body.data
    }
    return body
  },
  err => {
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export default api
