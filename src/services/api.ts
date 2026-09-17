import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/config/env'

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== REQUEST INTERCEPTOR =====
// Auto-inject JWT token ke setiap request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('portfolio_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ===== RESPONSE INTERCEPTOR =====
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      const data = error.response.data as { message?: string }

      switch (status) {
        case 401:
          console.warn('Unauthorized — token invalid atau expired')
          // Hapus token & redirect ke login
          localStorage.removeItem('portfolio_token')
          localStorage.removeItem('portfolio_user')

          // Redirect kalau lagi di halaman admin
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/login'
          }
          break
        case 403:
          console.warn('Forbidden — nggak punya akses')
          break
        case 404:
          console.warn('Not found:', data?.message)
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