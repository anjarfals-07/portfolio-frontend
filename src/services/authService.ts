import api from './api'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth'

const TOKEN_KEY = 'portfolio_token'
const USER_KEY = 'portfolio_user'

export const authService = {
  // ===== LOGIN =====
  login: async (payload: LoginRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    saveAuth(data)
    return data
  },

  // ===== REGISTER =====
  register: async (payload: RegisterRequest): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    saveAuth(data)
    return data
  },

  // ===== LOGOUT =====
  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },

  // ===== GET TOKEN =====
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  // ===== GET USER =====
  getUser: (): AuthResponse | null => {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  // ===== IS LOGGED IN =====
  isLoggedIn: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY)
  },
}

// ===== HELPER =====
function saveAuth(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.token)
  localStorage.setItem(USER_KEY, JSON.stringify(data))
}