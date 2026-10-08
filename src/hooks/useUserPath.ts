import { useParams } from 'react-router-dom'

/**
 * Hook untuk generate path user.
 *
 * Contoh:
 *   const userPath = useUserPath()
 *   userPath('/projects') → '/anjar/projects'
 *   userPath('blog')      → '/anjar/blog'
 */
export function useUserPath() {
  const { username } = useParams<{ username: string }>()

  return (path: string = '') => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `/${username}${cleanPath}`
  }
}