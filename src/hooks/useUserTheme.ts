// src/hooks/useUserTheme.ts
import { useUserThemeContext } from '@/context/UserThemeContext'

/**
 * Hook untuk akses user theme.
 */
export function useUserTheme() {
  return useUserThemeContext()
}