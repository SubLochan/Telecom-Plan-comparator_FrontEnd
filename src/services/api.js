import axios from 'axios'
import { getActiveToken } from './session'

// In development: VITE_API_BASE_URL = /api  (proxied by Vite to localhost:8080)
// In production:  VITE_API_BASE_URL = https://your-backend.onrender.com/api
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
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
