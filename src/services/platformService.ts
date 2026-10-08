import api from './api'
import type { PlatformInfo } from '@/types/platform'

const CACHE_KEY = 'platform_info_cache'
const CACHE_TTL = 5 * 60 * 1000

let memoryCache: { data: PlatformInfo; ts: number } | null = null

export const platformService = {
  async getPlatformInfo(force = false): Promise<PlatformInfo> {
    if (!force && memoryCache && Date.now() - memoryCache.ts < CACHE_TTL) {
      return memoryCache.data
    }

    if (!force) {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Date.now() - parsed.ts < CACHE_TTL) {
            memoryCache = parsed
            return parsed.data as PlatformInfo
          }
        }
      } catch { /* ignore */ }
    }

    const { data } = await api.get<PlatformInfo>('/public/platform-info')
    memoryCache = { data, ts: Date.now() }
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache))
    } catch { /* ignore */ }
    return data
  },

  clearCache() {
    memoryCache = null
    try {
      sessionStorage.removeItem(CACHE_KEY)
    } catch { /* ignore */ }
  },
}