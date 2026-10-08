// ============================================================
// useCvPreferences — Hook untuk manage CV preferences
// ============================================================
// Fitur:
// - Load preferences dari profile
// - Update 1 atau banyak field sekaligus
// - Auto-save dengan debounce (opsional)
// - Dirty detection (compare dengan initial)
// - Reset ke default
// - Merge mode vs replace mode
// ============================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cvService } from '@/services/cvService'
import {
  DEFAULT_CV_PREFERENCES,
  mergePreferences,
  type CvPreferences,
} from '@/types/cv'

/* ============================================================
   TYPES
   ============================================================ */

export interface UseCvPreferencesOptions {
  /** Preferences awal (dari profile) — kalau udah ada, skip fetch */
  initial?: CvPreferences | null

  /** Auto-save tiap update (default: false) */
  autoSave?: boolean

  /** Debounce delay untuk auto-save, ms (default: 800) */
  autoSaveDelay?: number

  /** Callback saat save sukses */
  onSaveSuccess?: (prefs: CvPreferences) => void

  /** Callback saat save gagal */
  onSaveError?: (err: Error) => void
}

export interface UseCvPreferencesResult {
  // ===== State =====
  /** Preferences saat ini (yang di-edit) */
  preferences: CvPreferences

  /** Snapshot awal (buat compare dirty) */
  initialPreferences: CvPreferences

  /** True kalau ada perubahan belum disimpan */
  isDirty: boolean

  /** True saat saving ke backend */
  isSaving: boolean

  /** True saat loading awal */
  isLoading: boolean

  /** Error message (kalau ada) */
  error: string | null

  // ===== Actions =====
  /** Update 1 field */
  update: <K extends keyof CvPreferences>(
    key: K,
    value: CvPreferences[K]
  ) => void

  /** Update banyak field sekaligus */
  updateMany: (partial: Partial<CvPreferences>) => void

  /** Save manual ke backend */
  save: () => Promise<void>

  /** Reset ke default (lokal only, belum save) */
  resetLocal: () => void

  /** Reset di backend + lokal */
  resetRemote: () => Promise<void>

  /** Discard perubahan, balik ke initial */
  discard: () => void

  /** Replace preferences lokal (misal dari response backend) */
  setPreferences: (prefs: CvPreferences) => void
}

/* ============================================================
   HOOK
   ============================================================ */

export function useCvPreferences(
  options: UseCvPreferencesOptions = {}
): UseCvPreferencesResult {
  const {
    initial,
    autoSave = false,
    autoSaveDelay = 800,
    onSaveSuccess,
    onSaveError,
  } = options

  /* ------------------------------------------------------------
     STATE
     ------------------------------------------------------------ */
  const initialMerged = useMemo(
    () => mergePreferences(initial),
    [initial]
  )

  const [preferences, setPreferencesState] = useState<CvPreferences>(initialMerged)
  const [initialPreferences, setInitialPreferences] = useState<CvPreferences>(initialMerged)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sync kalau `initial` berubah dari luar
  useEffect(() => {
    const merged = mergePreferences(initial)
    setPreferencesState(merged)
    setInitialPreferences(merged)
    setError(null)
  }, [initial])

  // Track auto-save timer
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track mounted
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  /* ------------------------------------------------------------
     DIRTY DETECTION
     ------------------------------------------------------------ */
  const isDirty = useMemo(() => {
    const keys = Object.keys(preferences) as Array<keyof CvPreferences>
    return keys.some((k) => preferences[k] !== initialPreferences[k])
  }, [preferences, initialPreferences])

  /* ------------------------------------------------------------
     SAVE (internal)
     ------------------------------------------------------------ */
  const performSave = useCallback(
    async (prefs: CvPreferences): Promise<void> => {
      if (!mountedRef.current) return

      setIsSaving(true)
      setError(null)

      try {
        const result = await cvService.updatePreferences(prefs, false)

        if (!mountedRef.current) return

        // Update initial ke state terbaru → isDirty jadi false
        const saved = mergePreferences(result.cvPreferences)
        setInitialPreferences(saved)
        setPreferencesState(saved)

        onSaveSuccess?.(saved)
      } catch (err: unknown) {
        if (!mountedRef.current) return

        const message =
          err instanceof Error ? err.message : 'Gagal menyimpan preferensi CV'
        setError(message)
        onSaveError?.(err instanceof Error ? err : new Error(message))
      } finally {
        if (mountedRef.current) setIsSaving(false)
      }
    },
    [onSaveSuccess, onSaveError]
  )

  /* ------------------------------------------------------------
     AUTO-SAVE (debounced)
     ------------------------------------------------------------ */
  useEffect(() => {
    if (!autoSave) return
    if (!isDirty) return
    if (isSaving) return

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(() => {
      performSave(preferences)
    }, autoSaveDelay)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [preferences, autoSave, autoSaveDelay, isDirty, isSaving, performSave])

  /* ------------------------------------------------------------
     ACTIONS
     ------------------------------------------------------------ */

  /** Update 1 field */
  const update = useCallback(
    <K extends keyof CvPreferences>(key: K, value: CvPreferences[K]) => {
      setPreferencesState((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  /** Update banyak field */
  const updateMany = useCallback((partial: Partial<CvPreferences>) => {
    setPreferencesState((prev) => ({ ...prev, ...partial }))
  }, [])

  /** Save manual */
  const save = useCallback(async () => {
    await performSave(preferences)
  }, [preferences, performSave])

  /** Reset lokal — belum di-save ke backend */
  const resetLocal = useCallback(() => {
    setPreferencesState({ ...DEFAULT_CV_PREFERENCES })
  }, [])

  /** Reset di backend + lokal */
  const resetRemote = useCallback(async () => {
    if (!mountedRef.current) return

    setIsSaving(true)
    setError(null)

    try {
      const result = await cvService.resetPreferences()

      if (!mountedRef.current) return

      const reset = mergePreferences(result.cvPreferences)
      setPreferencesState(reset)
      setInitialPreferences(reset)

      onSaveSuccess?.(reset)
    } catch (err: unknown) {
      if (!mountedRef.current) return

      const message =
        err instanceof Error ? err.message : 'Gagal reset preferensi CV'
      setError(message)
      onSaveError?.(err instanceof Error ? err : new Error(message))
    } finally {
      if (mountedRef.current) setIsSaving(false)
    }
  }, [onSaveSuccess, onSaveError])

  /** Discard perubahan lokal */
  const discard = useCallback(() => {
    setPreferencesState(initialPreferences)
    setError(null)
  }, [initialPreferences])

  /** Replace preferences lokal */
  const setPreferences = useCallback((prefs: CvPreferences) => {
    setPreferencesState(mergePreferences(prefs))
  }, [])

  /* ------------------------------------------------------------
     RETURN
     ------------------------------------------------------------ */
  return {
    preferences,
    initialPreferences,
    isDirty,
    isSaving,
    isLoading,
    error,
    update,
    updateMany,
    save,
    resetLocal,
    resetRemote,
    discard,
    setPreferences,
  }
}

export default useCvPreferences