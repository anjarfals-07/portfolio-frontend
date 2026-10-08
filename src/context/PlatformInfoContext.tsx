import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { platformService } from '@/services/platformService'
import type { PlatformInfo } from '@/types/platform'

interface PlatformInfoContextValue {
  info: PlatformInfo
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const FALLBACK: PlatformInfo = {
  platformName: 'Portfolio',
  tagline: 'Portfolio Platform',
  logoIcon: 'pi pi-sparkles',
  primaryColor: '#3b82f6',
  accentColor: '#8b5cf6',
  defaultPortfolioUsername: 'muhammad-anjar',
  primaryDomain: 'portfolio.com',
  registrationPaymentEnabled: false,
  registrationFeeIdr: 0,
  paymentExpiryMinutes: 15,
}

const PlatformInfoContext = createContext<PlatformInfoContextValue>({
  info: FALLBACK,
  loading: false,
  error: null,
  refresh: async () => {},
})

export function PlatformInfoProvider({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<PlatformInfo>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInfo = async (force = false) => {
    try {
      setLoading(true)
      setError(null)
      const data = await platformService.getPlatformInfo(force)
      setInfo(data)
    } catch (err) {
      console.error('Failed to load platform info:', err)
      setError('Gagal memuat info platform')
      setInfo(FALLBACK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  return (
    <PlatformInfoContext.Provider
      value={{
        info,
        loading,
        error,
        refresh: () => fetchInfo(true),
      }}
    >
      {children}
    </PlatformInfoContext.Provider>
  )
}

export function usePlatformInfo() {
  return useContext(PlatformInfoContext)
}