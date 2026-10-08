// import { createContext, useContext, useState, useEffect } from 'react'
// import type { ReactNode } from 'react'
// import { authService } from '@/services/authService'
// import type { AuthResponse, LoginRequest, AuthUser } from '@/types/auth'

// interface AuthContextType {
//   user: AuthUser | null
//   isAuthenticated: boolean
//   loading: boolean
//   login: (payload: LoginRequest) => Promise<AuthResponse>
//   logout: () => void
//   isOwner: () => boolean
//   isSuperAdmin: () => boolean
//   refetch: () => Promise<void>
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<AuthUser | null>(null)
//   const [loading, setLoading] = useState(true)

//   // ===== Load user dari localStorage saat mount =====
//   useEffect(() => {
//     const storedUser = authService.getUser()
//     if (storedUser && authService.isLoggedIn()) {
//       setUser({
//         userId: storedUser.userId,
//         username: storedUser.username,
//         role: storedUser.role,
//         portfolioSlug: storedUser.portfolioSlug,
//         displayName: storedUser.displayName,
//       })
//     }
//     setLoading(false)
//   }, [])

//   // ===== Login =====
//   const login = async (payload: LoginRequest) => {
//     const data = await authService.login(payload)

//     const authUser: AuthUser = {
//       userId: data.userId,
//       username: data.username,
//       role: data.role,
//       portfolioSlug: data.portfolioSlug,
//       displayName: data.displayName,
//     }

//     setUser(authUser)
//     return data
//   }

//   // ===== Logout =====
//   const logout = () => {
//     authService.logout()
//     setUser(null)
//   }

//   // ===== Refetch — validate token masih valid =====
//   const refetch = async () => {
//     try {
//       const data = await authService.me()
//       const authUser: AuthUser = {
//         userId: data.userId,
//         username: data.username,
//         role: data.role,
//         portfolioSlug: data.portfolioSlug,
//         displayName: data.displayName,
//       }
//       setUser(authUser)
//     } catch {
//       // Token expired / invalid → logout
//       logout()
//     }
//   }

//   const isOwner = () => user?.role === 'OWNER'
//   const isSuperAdmin = () => user?.role === 'SUPER_ADMIN'

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isAuthenticated: !!user,
//         loading,
//         login,
//         logout,
//         isOwner,
//         isSuperAdmin,
//         refetch,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   )
// }

// // ===== CUSTOM HOOK =====
// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error('useAuth must be used within AuthProvider')
//   }
//   return context
// }






import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react'
import type { ReactNode } from 'react'
import { authService } from '@/services/authService'
import type { AuthResponse, LoginRequest, AuthUser } from '@/types/auth'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginRequest) => Promise<AuthResponse>
  logout: () => void
  isOwner: () => boolean
  isSuperAdmin: () => boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // ============================================================
  // BOOTSTRAP — verify token ke backend
  // ============================================================
  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        if (!cancelled) setLoading(true)

        // 1. Cek session di localStorage (validate JWT expiry)
        const hasSession = authService.isLoggedIn()

        if (!hasSession) {
          if (!cancelled) {
            authService.logout()
            setUser(null)
          }
          return
        }

        // 2. Set cached user dulu (instant UI)
        const cachedUser = authService.getUser()
        if (cachedUser && !cancelled) {
          setUser(cachedUser)
        }

        // 3. ⭐ Verify ke backend
        try {
          const verifiedUser = await authService.me()
          if (!cancelled) {
            setUser(verifiedUser)
          }
        } catch (verifyErr) {
          if (!cancelled) {
            console.warn('[Auth] Token verification failed:', verifyErr)
            authService.logout()
            setUser(null)
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[Auth] Bootstrap failed:', err)
          authService.logout()
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginRequest) => {
    const data = await authService.login(payload)
    const authUser: AuthUser = {
      userId: data.userId,
      username: data.username,
      role: data.role,
      portfolioSlug: data.portfolioSlug,
      displayName: data.displayName,
    }
    setUser(authUser)
    return data
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const refetch = useCallback(async () => {
    try {
      const data = await authService.me()
      const authUser: AuthUser = {
        userId: data.userId,
        username: data.username,
        role: data.role,
        portfolioSlug: data.portfolioSlug,
        displayName: data.displayName,
      }
      setUser(authUser)
    } catch {
      logout()
    }
  }, [logout])

  const isOwner = useCallback(() => user?.role === 'OWNER', [user])
  const isSuperAdmin = useCallback(
    () => user?.role === 'SUPER_ADMIN',
    [user]
  )

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      isOwner,
      isSuperAdmin,
      refetch,
    }),
    [user, loading, login, logout, isOwner, isSuperAdmin, refetch]
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}