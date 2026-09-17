import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/config/env'

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== Request Interceptor =====
// Nanti di Task 15, kita tambah JWT token di sini
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => Promise.reject(error)
)

// ===== Response Interceptor =====
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle error global
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as { message?: string }

      switch (status) {
        case 401:
          console.error('Unauthorized — perlu login')
          // Nanti: redirect ke /admin/login
          break
        case 403:
          console.error('Forbidden — nggak punya akses')
          break
        case 404:
          console.error('Not found:', data?.message)
          break
        case 500:
          console.error('Server error:', data?.message)
          break
        default:
          console.error('API error:', data?.message || error.message)
      }
    } else if (error.request) {
      console.error('Network error — backend nggak jalan?')
    } else {
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default api