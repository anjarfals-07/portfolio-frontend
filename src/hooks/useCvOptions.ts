// ============================================================
// useCvOptions — Hook untuk fetch daftar opsi CV
// ============================================================
// Fetch sekali dari GET /api/me/cv/options, lalu cache di memory.
// Semua component yang butuh (picker, customizer, dll) tinggal
// pakai hook ini — nggak akan spam request.
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { cvService } from '@/services/cvService'
import type { CvOptions } from '@/types/cv'

/* ============================================================
   MODULE-LEVEL CACHE
   ============================================================ */
// Cache global — biar fetch cuma sekali per session.
// Bisa di-clear via clearCvOptionsCache() kalau perlu refresh.

let cachedOptions: CvOptions | null = null
let inflightPromise: Promise<CvOptions> | null = null

/**
 * Clear cache — panggil ini kalau backend berubah (misal habis deploy).
 */
export function clearCvOptionsCache(): void {
  cachedOptions = null
  inflightPromise = null
}

/* ============================================================
   HOOK RESULT
   ============================================================ */

export interface UseCvOptionsResult {
  /** Daftar opsi — null kalau belum loaded */
  options: CvOptions | null
  /** True saat loading pertama kali */
  loading: boolean
  /** Error message kalau gagal fetch */
  error: string | null
  /** Manual refetch (bypass cache) */
  refetch: () => Promise<void>
}

/* ============================================================
   HOOK
   ============================================================ */

export function useCvOptions(options?: {
  /** Skip fetch kalau false (misal modal belum kebuka) */
  enabled?: boolean
}): UseCvOptionsResult {
  const enabled = options?.enabled ?? true

  const [data, setData] = useState<CvOptions | null>(cachedOptions)
  const [loading, setLoading] = useState<boolean>(!cachedOptions && enabled)
  const [error, setError] = useState<string | null>(null)

  // Track mount — biar nggak setState setelah unmount
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  /* ------------------------------------------------------------
     FETCH FUNCTION
     ------------------------------------------------------------ */
  const fetchOptions = useCallback(
    async (forceRefresh = false): Promise<void> => {
      // Kalau ada cache & nggak force refresh, langsung pakai
      if (cachedOptions && !forceRefresh) {
        if (mountedRef.current) {
          setData(cachedOptions)
          setLoading(false)
          setError(null)
        }
        return
      }

      // Kalau ada request in-flight, ikutin promise yang sama
      if (inflightPromise && !forceRefresh) {
        try {
          const result = await inflightPromise
          if (mountedRef.current) {
            setData(result)
            setLoading(false)
            setError(null)
          }
        } catch (err: unknown) {
          if (mountedRef.current) {
            setError(
              err instanceof Error ? err.message : 'Gagal memuat opsi CV'
            )
            setLoading(false)
          }
        }
        return
      }

      // Fetch baru
      if (mountedRef.current) {
        setLoading(true)
        setError(null)
      }

      inflightPromise = cvService.getOptions()

      try {
        const result = await inflightPromise
        cachedOptions = result

        if (mountedRef.current) {
          setData(result)
          setError(null)
        }
      } catch (err: unknown) {
        if (mountedRef.current) {
          setError(
            err instanceof Error ? err.message : 'Gagal memuat opsi CV'
          )
        }
      } finally {
        inflightPromise = null
        if (mountedRef.current) setLoading(false)
      }
    },
    []
  )

  /* ------------------------------------------------------------
     AUTO FETCH
     ------------------------------------------------------------ */
  useEffect(() => {
    if (!enabled) return
    if (cachedOptions) return // udah ada cache, skip

    fetchOptions()
  }, [enabled, fetchOptions])

  /* ------------------------------------------------------------
     REFETCH (manual)
     ------------------------------------------------------------ */
  const refetch = useCallback(async (): Promise<void> => {
    clearCvOptionsCache()
    await fetchOptions(true)
  }, [fetchOptions])

  return { options: data, loading, error, refetch }
}

export default useCvOptions