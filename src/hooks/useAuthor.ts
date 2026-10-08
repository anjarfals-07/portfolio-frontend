import { useCurrentUser } from './useCurrentUser'
import type { Author } from '@/types/blog'

/**
 * Hook untuk ambil info author dari user yang sedang dilihat.
 *
 * Dipakai di BlogCard, BlogDetail, dll.
 */
export function useAuthor() {
  const { user } = useCurrentUser()

  const author: Author = {
    name: user?.fullName || 'User',
    avatarUrl: user?.avatarUrl || null,
    role: user?.role || 'Creative Professional',
    email: user?.email || null,
    location: user?.location || null,
    bio: user?.shortBio || user?.bio || null,
  }

  return { author }
}