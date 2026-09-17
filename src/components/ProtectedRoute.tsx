import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ProgressSpinner } from 'primereact/progressspinner'

interface ProtectedRouteProps {
  requiredRole?: string
}

function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Loading state
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

  // Belum login → redirect ke /admin/login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Cek role kalau diperlukan
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div
        className="page-container"
        style={{ textAlign: 'center', paddingTop: '4rem' }}
      >
        <i className="pi pi-lock text-6xl text-red-500"></i>
        <h2 className="mt-3">Akses Ditolak</h2>
        <p className="text-color-secondary">
          Kamu nggak punya akses ke halaman ini.
        </p>
      </div>
    )
  }

  return <Outlet />
}

export default ProtectedRoute