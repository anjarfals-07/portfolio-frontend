// src/components/TenantGuard.tsx
import type { ReactNode } from 'react'
import { useUserThemeContext } from '@/context/UserThemeContext'
import NotFound from '@/pages/NotFound'

interface TenantGuardProps {
  children: ReactNode
}

function LoadingScreen() {
  return (
    <div
      className="app-loading"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }} />
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <i
        className="pi pi-exclamation-triangle"
        style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}
      />
      <h2 style={{ margin: '0 0 0.5rem 0' }}>Terjadi kesalahan</h2>
      <p style={{ color: '#64748b', margin: 0 }}>{message}</p>
    </div>
  )
}

export default function TenantGuard({ children }: TenantGuardProps) {
  const { loading, error, notFound } = useUserThemeContext()

  // ⭐ 1. Loading state
  if (loading) return <LoadingScreen />

  // ⭐ 2. User tidak ditemukan → 404 netral
  if (notFound) return <NotFound />

  // ⭐ 3. Error → error screen
  if (error) return <ErrorScreen message={error} />

  // ⭐ 4. OK → render children
  return <>{children}</>
}