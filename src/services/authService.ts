// ============================================================
// authService — Authentication & token management
// ============================================================

import api from './api'
import type {
  AuthResponse,
  LoginRequest,
  AuthUser,
  RegisterRequest,
  RegisterResponse,
} from '@/types/auth'

/* ============================================================
   CONSTANTS
   ============================================================ */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

/* ============================================================
   SAFE STORAGE
   ============================================================ */

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch (err) {
    console.warn('localStorage.setItem failed:', err)
  }
}

function safeRemoveItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

/* ============================================================
   JWT UTILS
   ============================================================ */

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    )
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwt(token)
  if (!payload) return true

  const exp = payload.exp
  if (typeof exp !== 'number') return true

  const nowSec = Math.floor(Date.now() / 1000)
  return exp <= nowSec
}

/* ============================================================
   AUTH SERVICE
   ============================================================ */

export const authService = {
  /* ============================================================
     GET USER (dari localStorage)
     ============================================================ */
  getUser(): AuthUser | null {
    try {
      const raw = safeGetItem(USER_KEY)
      if (!raw) return null

      const parsed = JSON.parse(raw)
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        typeof parsed.userId !== 'number' ||
        typeof parsed.username !== 'string'
      ) {
        safeRemoveItem(USER_KEY)
        return null
      }

      return parsed as AuthUser
    } catch {
      safeRemoveItem(USER_KEY)
      return null
    }
  },

  /* ============================================================
     IS LOGGED IN
     ============================================================ */
  isLoggedIn(): boolean {
    const token = safeGetItem(TOKEN_KEY)
    const user = this.getUser()

    if (!token || !user) return false
    if (isTokenExpired(token)) {
      this.logout()
      return false
    }

    return true
  },

  /* ============================================================
     ⭐ REGISTER — daftar user baru
     ⚠️ TIDAK auto-login, user nunggu approval admin
     ============================================================ */
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<RegisterResponse>(
      '/auth/register',
      payload
    )

    // Validate response
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid register response')
    }

    if (typeof data.userId !== 'number') {
      throw new Error('Invalid register response: no userId')
    }

    if (typeof data.username !== 'string') {
      throw new Error('Invalid register response: no username')
    }

    // ⚠️ Register TIDAK nyimpen token — user belum bisa login
    return data
  },

  /* ============================================================
     LOGIN
     ============================================================ */
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)

    if (!data.token || typeof data.token !== 'string') {
      throw new Error('Invalid login response: no token')
    }

    safeSetItem(TOKEN_KEY, data.token)

    const authUser: AuthUser = {
      userId: data.userId,
      username: data.username,
      role: data.role,
      portfolioSlug: data.portfolioSlug,
      displayName: data.displayName,
    }
    safeSetItem(USER_KEY, JSON.stringify(authUser))

    return data
  },

  /* ============================================================
     LOGOUT
     ============================================================ */
  logout(): void {
    safeRemoveItem(TOKEN_KEY)
    safeRemoveItem(USER_KEY)
  },

  /* ============================================================
     ME — get current user dari token
     ============================================================ */
  async me(): Promise<AuthUser> {
    const { data } = await api.get<any>('/auth/me')

    if (!data || typeof data !== 'object') {
      console.warn('[authService.me] Invalid response:', data)
      throw new Error('Invalid /me response: not an object')
    }

    if (typeof data.userId !== 'number') {
      console.warn('[authService.me] Missing userId:', data)
      throw new Error('Invalid /me response: no userId')
    }

    if (typeof data.username !== 'string') {
      console.warn('[authService.me] Missing username:', data)
      throw new Error('Invalid /me response: no username')
    }

    // Fallback untuk field opsional
    const user: AuthUser = {
      userId: data.userId,
      username: data.username,
      role: data.role || 'OWNER',
      portfolioSlug: data.portfolioSlug || data.username,
      displayName: data.displayName || data.username,
    }

    safeSetItem(USER_KEY, JSON.stringify(user))
    return user
  },

  /* ============================================================
     GET TOKEN
     ============================================================ */
  getToken(): string | null {
    return safeGetItem(TOKEN_KEY)
  },
}

export default authService