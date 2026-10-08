// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ProgressSpinner } from 'primereact/progressspinner'

interface ProtectedRouteProps {
  requiredRole?: 'OWNER' | 'SUPER_ADMIN'
}

function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ minHeight: '60vh' }}
      >
        <ProgressSpinner />
      </div>
    )
  }

  // ============================================================
  // BELUM LOGIN
  // ============================================================
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  // ============================================================
  // SUPER_ADMIN ONLY
  // ⭐ OWNER yang akses /admin → redirect ke /owner
  // ============================================================
  if (requiredRole === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    if (user.role === 'OWNER') {
      // ⭐ Owner coba akses /admin → redirect ke /owner
      return <Navigate to="/owner" replace />
    }
    // User biasa → redirect ke portfolio-nya
    const slug = user.portfolioSlug || user.username
    return <Navigate to={`/${slug}`} replace />
  }

  // ============================================================
  // OWNER (SUPER_ADMIN juga boleh)
  // ⭐ Hanya user biasa yang di-redirect
  // ============================================================
  if (
    requiredRole === 'OWNER' &&
    user.role !== 'OWNER' &&
    user.role !== 'SUPER_ADMIN'
  ) {
    // User biasa coba akses /owner → redirect ke portfolio-nya
    const slug = user.portfolioSlug || user.username
    return <Navigate to={`/${slug}`} replace />
  }

  return <Outlet />
}

export default ProtectedRoute