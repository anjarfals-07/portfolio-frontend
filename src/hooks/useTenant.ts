// src/hooks/useTenant.ts

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '@/services/api'
import { isCustomDomain, getCurrentHost, isDev } from '@/utils/domain'

interface UseTenantResult {
  /** Username tenant yang sedang diakses */
  tenant: string | null
  /** Loading state — true saat fetch tenant by domain */
  loading: boolean
  /** Error message kalau fetch gagal */
  error: string | null
  /** True kalau ini custom domain (bukan URL param) */
  isCustomDomain: boolean
}

/**
 * Hook deteksi tenant.
 *
 * Prioritas:
 * 1. URL param `:username` (kalau ada)
 * 2. Custom domain (hostname → lookup via API)
 *
 * Contoh:
 * - platform.com/badru       → tenant = "badru" (dari URL param)
 * - badru.com                → tenant = "badru" (dari custom domain lookup)
 * - localhost:5173           → tenant = null (platform)
 */
export function useTenant(): UseTenantResult {
  const params = useParams<{ username: string }>()
  const [tenant, setTenant] = useState<string | null>(params.username || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customDomain, setCustomDomain] = useState(false)

  useEffect(() => {
    // ⭐ Prioritas 1: URL param (paling cepat, no API call)
    if (params.username) {
      setTenant(params.username)
      setCustomDomain(false)
      setLoading(false)
      setError(null)
      return
    }

    // ⭐ Prioritas 2: Custom domain
    const host = getCurrentHost()

    // Kalau platform domain atau localhost → tidak ada tenant
    if (!isCustomDomain(host)) {
      setTenant(null)
      setCustomDomain(false)
      setLoading(false)
      setError(null)
      return
    }

    // Custom domain — lookup via API
    setCustomDomain(true)
    setLoading(true)
    setError(null)

    let cancelled = false

    async function lookupTenant() {
      try {
        const { data } = await api.get<{ username: string; displayName: string }>(
          '/public/tenant-by-domain',
          { params: { domain: host } }
        )

        if (cancelled) return
        setTenant(data.username)
      } catch (err: any) {
        if (cancelled) return

        if (isDev()) {
          console.error('[useTenant] Failed to lookup custom domain:', err)
        }

        // 404 → domain tidak terdaftar / belum diverifikasi
        setTenant(null)
        setError('Domain tidak dikenali')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    lookupTenant()

    return () => {
      cancelled = true
    }
  }, [params.username])

  return {
    tenant,
    loading,
    error,
    isCustomDomain: customDomain,
  }
}