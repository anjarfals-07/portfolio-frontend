import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  clearOverride: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Key khusus override manual (biar tidak bentrok dengan key lain)
const OVERRIDE_KEY = 'portfolio_theme_override'

// ============================================================
// GET INITIAL THEME
// ============================================================
function getInitialTheme(): Theme {
  // 1. Override manual (paling tinggi)
  const override = localStorage.getItem(OVERRIDE_KEY)
  if (override === 'light' || override === 'dark') {
    return override
  }

  // 2. Default dari user theme
  const themeDefault =
    document.documentElement.getAttribute('data-theme-default')
  if (themeDefault === 'light' || themeDefault === 'dark') {
    return themeDefault
  }

  // 3. System preference
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return 'light'
}

// ============================================================
// APPLY THEME
// ============================================================
function applyTheme(theme: Theme) {
  const root = document.documentElement

  // ===== Set class dark-mode =====
  if (theme === 'dark') {
    root.classList.add('dark-mode')
    root.setAttribute('data-theme', 'dark')
  } else {
    root.classList.remove('dark-mode')
    root.setAttribute('data-theme', 'light')
  }

  // ===== Ganti PrimeReact theme CSS =====
  const link = document.getElementById('primereact-theme') as HTMLLinkElement
  if (link) {
    link.href =
      theme === 'dark'
        ? '/themes/lara-dark-blue/theme.css'
        : '/themes/lara-light-blue/theme.css'
  }
}

// ============================================================
// PROVIDER
// ============================================================
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // ===== Apply saat theme berubah =====
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // ===== Observe data-theme-default (dari UserThemeContext) =====
  useEffect(() => {
    const root = document.documentElement

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme-default') {
          // Kalau user sudah override manual → jangan ubah
          const override = localStorage.getItem(OVERRIDE_KEY)
          if (override) return

          const newDefault = root.getAttribute('data-theme-default')
          if (newDefault === 'light' || newDefault === 'dark') {
            setThemeState(newDefault)
          }
        }
      }
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme-default'],
    })

    return () => observer.disconnect()
  }, [])

  // ===== Observe system preference =====
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      const override = localStorage.getItem(OVERRIDE_KEY)
      const themeDefault =
        document.documentElement.getAttribute('data-theme-default')
      if (!override && !themeDefault) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // ===== Set theme (manual toggle) =====
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem(OVERRIDE_KEY, newTheme)
  }, [])

  // ===== Toggle =====
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(OVERRIDE_KEY, next)
      return next
    })
  }, [])

  // ===== Clear override =====
  const clearOverride = useCallback(() => {
    localStorage.removeItem(OVERRIDE_KEY)
    const themeDefault =
      document.documentElement.getAttribute('data-theme-default')
    if (themeDefault === 'light' || themeDefault === 'dark') {
      setThemeState(themeDefault)
    } else {
      setThemeState('light')
    }
  }, [])

  return (
    <ThemeContext.Provider
      value={{ theme, toggleTheme, setTheme, clearOverride }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// ============================================================
// HOOK
// ============================================================
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}