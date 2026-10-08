import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { profileService } from '@/services/profileService'
import type { Profile } from '@/types/profile'

interface UseCurrentUserResult {
  user: Profile | null
  username: string | undefined
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// ===== Simple cache (in-memory) =====
const profileCache = new Map<string, Profile>()

/**
 * Hook untuk detect user dari URL + fetch profile.
 *
 * Dipakai di halaman public (Home, Projects, Blog, About, Contact).
 *
 * Contoh:
 *   const { user, loading, error } = useCurrentUser()
 */
export function useCurrentUser(): UseCurrentUserResult {
  const { username } = useParams<{ username: string }>()
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Untuk cancel fetch kalau component unmount
  const isMountedRef = useRef(true)

  const fetchProfile = async (forceRefresh = false) => {
    if (!username) {
      setLoading(false)
      return
    }

    // ===== Cek cache dulu =====
    if (!forceRefresh && profileCache.has(username)) {
      setUser(profileCache.get(username)!)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const data = await profileService.getPublicProfile(username)

      if (!isMountedRef.current) return

      // ===== Simpan ke cache =====
      profileCache.set(username, data)
      setUser(data)
    } catch (err) {
      if (!isMountedRef.current) return
      console.error('Failed to load user profile:', err)
      setError('Gagal memuat profile user.')
      setUser(null)
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    isMountedRef.current = true
    fetchProfile()

    return () => {
      isMountedRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  // ===== Refetch (bypass cache) =====
  const refetch = async () => {
    if (username) {
      profileCache.delete(username)
    }
    await fetchProfile(true)
  }

  return {
    user,
    username,
    loading,
    error,
    refetch,
  }
}

/**
 * Clear cache untuk user tertentu (dipanggil setelah update profile).
 */
export function clearUserCache(username?: string) {
  if (username) {
    profileCache.delete(username)
  } else {
    profileCache.clear()
  }
}