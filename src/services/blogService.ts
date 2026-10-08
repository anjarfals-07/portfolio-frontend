import api from './api'
import type { BlogPost, BlogPostFormData } from '@/types/blog'

export const blogService = {
  // ============================================================
  // PUBLIC (by username)
  // ============================================================

  getPublishedByUser: async (username: string): Promise<BlogPost[]> => {
    const { data } = await api.get<BlogPost[]>(`/users/${username}/blog`)
    return data
  },

  getFeaturedByUser: async (username: string): Promise<BlogPost[]> => {
    const { data } = await api.get<BlogPost[]>(
      `/users/${username}/blog/featured`
    )
    return data
  },

  getPublicBySlug: async (username: string, slug: string): Promise<BlogPost> => {
    const { data } = await api.get<BlogPost>(
      `/users/${username}/blog/${slug}`
    )
    return data
  },

  // ============================================================
  // OWNER (/api/me/...)
  // ============================================================

  getAllForOwner: async (): Promise<BlogPost[]> => {
    const { data } = await api.get<BlogPost[]>('/me/blog')
    return data
  },

  getById: async (id: number): Promise<BlogPost> => {
    const { data } = await api.get<BlogPost>(`/me/blog/${id}`)
    return data
  },

  create: async (payload: BlogPostFormData): Promise<BlogPost> => {
    const { data } = await api.post<BlogPost>('/me/blog', payload)
    return data
  },

  update: async (
    id: number,
    payload: Partial<BlogPostFormData>
  ): Promise<BlogPost> => {
    const { data } = await api.put<BlogPost>(`/me/blog/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/me/blog/${id}`)
  },

  // ============================================================
  // ADMIN (/api/admin/...)
  // ============================================================

  getByUserIdForAdmin: async (userId: number): Promise<BlogPost[]> => {
    const { data } = await api.get<BlogPost[]>(
      `/admin/users/${userId}/blog`
    )
    return data
  },
}