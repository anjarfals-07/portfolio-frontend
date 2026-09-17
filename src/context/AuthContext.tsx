import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { AuthResponse, LoginRequest } from '@/types/auth'

interface AuthContextType {
  user: AuthResponse | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user dari localStorage saat pertama kali
  useEffect(() => {
    const storedUser = authService.getUser()
    if (storedUser && authService.isLoggedIn()) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const login = async (payload: LoginRequest) => {
    const data = await authService.login(payload)
    setUser(data)
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ===== CUSTOM HOOK =====
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}