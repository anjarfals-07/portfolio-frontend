import { useParams, useLocation } from 'react-router-dom'

/**
 * Hook untuk generate path dashboard berdasarkan role.
 *
 * - Admin route:  /admin/projects
 * - Owner route:  /anjar/dashboard/projects
 *
 * Cara pakai:
 *   const dashPath = useDashboardPath()
 *   dashPath('/projects')  → '/admin/projects' atau '/anjar/dashboard/projects'
 *   dashPath('')           → '/admin' atau '/anjar/dashboard'
 */
export function useDashboardPath() {
  const { username } = useParams<{ username: string }>()
  const location = useLocation()

  const isAdmin = location.pathname.startsWith('/admin')

  return (path: string = '') => {
    const clean = path.startsWith('/') ? path : path ? `/${path}` : ''

    if (isAdmin) {
      return `/admin${clean}`
    }

    if (!username) {
      // Fallback — kalau gak ada username di URL
      return `/admin${clean}`
    }

    return `/${username}/dashboard${clean}`
  }
}

/**
 * Hook untuk cek apakah sedang di admin area.
 */
export function useIsAdminArea() {
  const location = useLocation()
  return location.pathname.startsWith('/admin')
}