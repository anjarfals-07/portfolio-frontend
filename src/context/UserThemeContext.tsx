// src/context/UserThemeContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { themeService } from '@/services/themeService'
import { isReservedUsername } from '@/constants/reservedUsernames'
import type { Theme, ThemeFormData } from '@/types/theme'
import { DEFAULT_THEME } from '@/types/theme'

// ============================================================
// CONTEXT TYPE
// ============================================================

interface UserThemeContextType {
  theme: Theme | null
  loading: boolean
  error: string | null
  notFound: boolean
  applyTheme: (data: ThemeFormData) => Promise<void>
  applyPreset: (presetName: string) => Promise<void>
  resetTheme: () => Promise<void>
  refetch: () => Promise<void>
}

const UserThemeContext = createContext<UserThemeContextType | undefined>(
  undefined
)

// ============================================================
// HELPER — COLOR UTILS
// ============================================================

function asColor(value: string | null | undefined, fallback: string): string {
  return value && value.trim() !== '' ? value : fallback
}

function mix(a: string, b: string, weightA: number): string {
  return `color-mix(in srgb, ${a} ${weightA}%, ${b})`
}

function darken(color: string, amount: number): string {
  return `color-mix(in srgb, ${color} ${100 - amount}%, black)`
}

function lighten(color: string, amount: number): string {
  return `color-mix(in srgb, ${color} ${100 - amount}%, white)`
}

// ============================================================
// INJECT CSS VARIABLES
// ============================================================

function injectCSSVariables(t: Theme | ThemeFormData | null) {
  const root = document.documentElement

  const primary: string = asColor(t?.primaryColor, DEFAULT_THEME.primaryColor)
  const accent: string = asColor(t?.accentColor, DEFAULT_THEME.accentColor)
  const bg: string = asColor(t?.bgColor, DEFAULT_THEME.bgColor)
  const text: string = asColor(t?.textColor, DEFAULT_THEME.textColor)
  const radius: string = asColor(t?.borderRadius, DEFAULT_THEME.borderRadius)
  const font: string | null = t?.fontFamily || null
  const headingFont: string | null = t?.headingFont || null

  const mode: 'light' | 'dark' =
    t?.defaultMode === 'DARK' ? 'dark' : 'light'

  // Accent
  root.style.setProperty('--accent', primary)
  root.style.setProperty('--accent-hover', darken(primary, 12))
  root.style.setProperty('--accent-secondary', accent)
  root.style.setProperty('--accent-tertiary', accent)

  root.style.setProperty('--primary-color', primary)
  root.style.setProperty('--accent-color', accent)

  // Background
  root.style.setProperty('--bg-primary', bg)
  root.style.setProperty('--bg-secondary', mix(bg, text, 97))
  root.style.setProperty('--bg-tertiary', mix(bg, text, 93))

  // Text
  root.style.setProperty('--text-primary', text)
  root.style.setProperty('--text-secondary', mix(text, bg, 65))
  root.style.setProperty('--text-muted', mix(text, bg, 45))

  // Border
  root.style.setProperty('--border-color', mix(text, bg, 12))
  root.style.setProperty('--border-strong', mix(text, bg, 22))

  // Card
  root.style.setProperty('--card-bg', bg)
  root.style.setProperty('--card-border', mix(text, bg, 12))

  // Semantic
  root.style.setProperty('--success', '#10b981')
  root.style.setProperty('--warning', '#f59e0b')
  root.style.setProperty('--danger', '#ef4444')

  // Gradients
  root.style.setProperty(
    '--gradient-primary',
    `linear-gradient(135deg, ${primary}, ${accent})`
  )
  root.style.setProperty(
    '--gradient-accent',
    `linear-gradient(135deg, ${primary} 0%, ${accent} 50%, ${accent} 100%)`
  )

  // Radius
  root.style.setProperty('--radius-sm', radius)
  root.style.setProperty('--radius-md', radius)
  root.style.setProperty('--radius-lg', radius)
  root.style.setProperty('--radius-xl', radius)
  root.style.setProperty('--border-radius', radius)

  // Font
  if (font) {
    root.style.setProperty('--font-body', font)
    document.body.style.fontFamily = font
  } else {
    root.style.removeProperty('--font-body')
    document.body.style.removeProperty('font-family')
  }

  if (headingFont) {
    root.style.setProperty('--font-heading', headingFont)
  } else {
    root.style.removeProperty('--font-heading')
  }

  // Dark mode overrides
  root.style.setProperty('--dark-accent', lighten(primary, 20))
  root.style.setProperty('--dark-accent-hover', lighten(primary, 30))
  root.style.setProperty('--dark-accent-secondary', lighten(accent, 20))
  root.style.setProperty('--dark-accent-tertiary', lighten(accent, 20))

  root.style.setProperty('--dark-bg-primary', '#0f172a')
  root.style.setProperty('--dark-bg-secondary', '#1e293b')
  root.style.setProperty('--dark-bg-tertiary', '#334155')

  root.style.setProperty('--dark-text-primary', '#f1f5f9')
  root.style.setProperty('--dark-text-secondary', '#cbd5e1')
  root.style.setProperty('--dark-text-muted', '#64748b')

  root.style.setProperty('--dark-border-color', '#334155')
  root.style.setProperty('--dark-border-strong', '#475569')

  root.style.setProperty('--dark-card-bg', '#1e293b')
  root.style.setProperty('--dark-card-border', '#334155')

  root.style.setProperty(
    '--dark-gradient-primary',
    `linear-gradient(135deg, ${lighten(primary, 20)}, ${lighten(accent, 20)})`
  )
  root.style.setProperty(
    '--dark-gradient-accent',
    `linear-gradient(135deg, ${lighten(primary, 20)} 0%, ${lighten(accent, 20)} 50%, ${lighten(accent, 20)} 100%)`
  )

  root.setAttribute('data-theme-default', mode)
  root.dataset.userThemeActive = 'true'
}

// ============================================================
// CLEAR CSS VARIABLES
// ============================================================

function clearCSSVariables() {
  const root = document.documentElement

  const vars = [
    '--accent', '--accent-hover', '--accent-secondary', '--accent-tertiary',
    '--primary-color', '--accent-color',
    '--bg-primary', '--bg-secondary', '--bg-tertiary',
    '--text-primary', '--text-secondary', '--text-muted',
    '--border-color', '--border-strong',
    '--card-bg', '--card-border',
    '--success', '--warning', '--danger',
    '--gradient-primary', '--gradient-accent',
    '--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--border-radius',
    '--font-body', '--font-heading',

    '--dark-accent', '--dark-accent-hover', '--dark-accent-secondary', '--dark-accent-tertiary',
    '--dark-bg-primary', '--dark-bg-secondary', '--dark-bg-tertiary',
    '--dark-text-primary', '--dark-text-secondary', '--dark-text-muted',
    '--dark-border-color', '--dark-border-strong',
    '--dark-card-bg', '--dark-card-border',
    '--dark-gradient-primary', '--dark-gradient-accent',
  ]

  vars.forEach((v) => root.style.removeProperty(v))
  root.removeAttribute('data-theme-default')
  delete root.dataset.userThemeActive
  document.body.style.removeProperty('font-family')
}

// ============================================================
// PROVIDER
// ============================================================

interface UserThemeProviderProps {
  children: ReactNode
  /**
   * ⭐ Override username untuk custom domain.
   * Kalau di-set, pakai ini daripada useParams().
   */
  usernameOverride?: string
}

export function UserThemeProvider({
  children,
  usernameOverride,
}: UserThemeProviderProps) {
  const params = useParams<{ username: string }>()
  const { user } = useAuth()

  // ⭐ Prioritas username:
  // 1. Override (custom domain, misal: badru.com → 'badru')
  // 2. URL param (portfolio user, misal: /muhammad-anjar → 'muhammad-anjar')
  // 3. User yang login (owner/admin dashboard, misal: /owner/theme → user.portfolioSlug)
  const username =
    usernameOverride ||
    params.username ||
    user?.portfolioSlug ||
    user?.username ||
    undefined

  const [theme, setTheme] = useState<Theme | null>(null)

  // ⭐ Set true di initial state supaya TenantGuard render LoadingScreen
  // di render pertama — jangan render children dulu sebelum theme selesai fetch
  const [loading, setLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const mountedRef = useRef(true)

  // ============================================================
  // FETCH THEME
  // ============================================================
  const fetchTheme = useCallback(async () => {
    // ⭐ Guard: username kosong / reserved → 404
    if (!username || username.trim() === '' || isReservedUsername(username)) {
      clearCSSVariables()
      setTheme(null)
      setError(null)
      setNotFound(true)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setNotFound(false)

      const data = await themeService.getPublicTheme(username)

      if (!mountedRef.current) return

      setTheme(data)

      if (data) {
        injectCSSVariables(data)
      } else {
        clearCSSVariables()
      }
    } catch (err: any) {
      console.error('Failed to fetch theme:', err)
      if (!mountedRef.current) return

      // ⭐ 404 → user tidak ada
      if (err?.response?.status === 404) {
        setNotFound(true)
        setTheme(null)
        clearCSSVariables()
      } else {
        setError('Gagal memuat theme.')
        clearCSSVariables()
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [username])

  // ============================================================
  // MOUNT / USERNAME CHANGE
  // ============================================================
  useEffect(() => {
    // ⭐ Set mounted = true di awal effect
    mountedRef.current = true
    fetchTheme()

    // ⭐ Set timeout di scope luar cleanup (BUKAN di dalam cleanup)
    const timeout = setTimeout(() => {
      if (!mountedRef.current) {
        clearCSSVariables()
      }
    }, 100)

    // ⭐ Cleanup — return void
    return () => {
      mountedRef.current = false
      clearTimeout(timeout)
    }
  }, [fetchTheme])

  // ============================================================
  // APPLY THEME (owner)
  // ============================================================
  const applyTheme = useCallback(async (data: ThemeFormData) => {
    try {
      const saved = await themeService.saveMyTheme(data)
      setTheme(saved)
      // ⭐ Inject supaya preview berubah instant
      injectCSSVariables(saved)
    } catch (err) {
      console.error('Failed to save theme:', err)
      throw err
    }
  }, [])

  // ============================================================
  // APPLY PRESET
  // ============================================================
  const applyPreset = useCallback(async (presetName: string) => {
    try {
      const saved = await themeService.applyPreset(presetName)
      setTheme(saved)
      // ⭐ Inject supaya preview berubah instant
      injectCSSVariables(saved)
    } catch (err) {
      console.error('Failed to apply preset:', err)
      throw err
    }
  }, [])

  // ============================================================
  // RESET THEME
  // ============================================================
  const resetTheme = useCallback(async () => {
    try {
      await themeService.resetMyTheme()
      setTheme(null)
      clearCSSVariables()
    } catch (err) {
      console.error('Failed to reset theme:', err)
      throw err
    }
  }, [])

  return (
    <UserThemeContext.Provider
      value={{
        theme,
        loading,
        error,
        notFound,
        applyTheme,
        applyPreset,
        resetTheme,
        refetch: fetchTheme,
      }}
    >
      {children}
    </UserThemeContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================

export function useUserThemeContext() {
  const context = useContext(UserThemeContext)
  if (context === undefined) {
    throw new Error('useUserThemeContext must be used within UserThemeProvider')
  }
  return context
}