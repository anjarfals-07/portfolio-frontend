// src/services/api.ts
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { ENV } from '@/config/env'

/* ============================================================
   API INSTANCE — DEFAULT (10s timeout)
   Untuk request biasa: fetch data, CRUD ringan
   ============================================================ */

const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

/* ============================================================
   ⭐ API INSTANCE — UPLOAD (2 menit timeout)
   Untuk upload file: image, CV, backup
   ============================================================ */

export const apiUpload = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 120000, // 2 menit
  headers: { 'Content-Type': 'multipart/form-data' },
})

/* ============================================================
   API INSTANCE — LONG (2 menit timeout)
   Untuk request yang butuh waktu lama: backup, download besar
   ============================================================ */

export const apiLong = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

/* ============================================================
   REQUEST INTERCEPTOR — SHARED
   ============================================================ */

const attachToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

api.interceptors.request.use(attachToken, (e) => Promise.reject(e))
apiUpload.interceptors.request.use(attachToken, (e) => Promise.reject(e))
apiLong.interceptors.request.use(attachToken, (e) => Promise.reject(e))

/* ============================================================
   RESPONSE INTERCEPTOR — SHARED
   ============================================================ */

const SKIP_TOAST_URLS = [
  '/me/messages/count-unread',
  '/me/messages/unread',
]

const SKIP_REDIRECT_URLS = [
  '/auth/login',
  '/auth/register',
  '/auth/me',
  '/auth/refresh',
]

/**
 * ⭐ URL yang 404-nya expected (jangan log)
 */
const SILENT_404_PATTERNS = [
  /^\/users\/[^\/]+$/,           // GET /api/users/{username}
  /^\/users\/[^\/]+\/theme$/,    // GET /api/users/{username}/theme
]

const isSilent404 = (url: string) =>
  SILENT_404_PATTERNS.some((pattern) => pattern.test(url))

const handleResponseError = async (error: AxiosError) => {
  // ⭐ Handle timeout
  if (error.code === 'ECONNABORTED') {
    const url = error.config?.url || ''
    console.error('⏱️ Request timeout:', url)
    return Promise.reject(error)
  }

  if (error.response) {
    const status = error.response.status
    const url = error.config?.url || ''
    let data = error.response.data as { message?: string }

    // Handle Blob response
    if (data instanceof Blob) {
      try {
        const text = await data.text()
        data = JSON.parse(text)
        error.response.data = data
      } catch {
        // Gagal parse — biarkan sebagai Blob
      }
    }

    // Silent 404
    if (status === 404 && isSilent404(url)) {
      return Promise.reject(error)
    }

    const isBackground = SKIP_TOAST_URLS.some((p) => url.includes(p))
    const skipRedirect = SKIP_REDIRECT_URLS.some((p) => url.includes(p))

    switch (status) {
      case 401: {
        console.warn('🔒 Unauthorized:', url)
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        if (!isBackground && !skipRedirect) {
          const path = window.location.pathname
          const isAuthPage =
            path === '/login' ||
            path === '/register' ||
            path.startsWith('/forgot') ||
            path.startsWith('/reset') ||
            path === '/pending-approval'

          const isProtected =
            path.includes('/dashboard') ||
            path.startsWith('/admin') ||
            path.startsWith('/owner')

          if (!isAuthPage && isProtected) {
            window.location.href = '/login'
          }
        }
        break
      }

      case 403:
        if (!isBackground) console.warn('🚫 Forbidden:', data?.message)
        break

      case 404:
        if (!isBackground) console.warn('🔍 Not found:', data?.message)
        break

      case 500:
        if (!isBackground) console.error('❌ Server error:', data?.message)
        break

      default:
        if (!isBackground)
          console.error('API error:', data?.message || error.message)
    }
  } else if (error.request) {
    console.error('📡 Network error — backend nggak jalan?')
  }

  return Promise.reject(error)
}

api.interceptors.response.use((r) => r, handleResponseError)
apiUpload.interceptors.response.use((r) => r, handleResponseError)
apiLong.interceptors.response.use((r) => r, handleResponseError)

export default api