import api from './api'
import type { Experience } from '@/types/experience'

export const experienceService = {
  // ============================================================
  // PUBLIC (by username)
  // ============================================================

  getPublicList: async (username: string): Promise<Experience[]> => {
    const { data } = await api.get<Experience[]>(`/users/${username}/experiences`)
    return data
  },

  // ============================================================
  // OWNER (/api/me/...)
  // ============================================================

  getAll: async (): Promise<Experience[]> => {
    const { data } = await api.get<Experience[]>('/me/experiences')
    return data
  },

  getById: async (id: number): Promise<Experience> => {
    const { data } = await api.get<Experience>(`/me/experiences/${id}`)
    return data
  },

  create: async (payload: Partial<Experience>): Promise<Experience> => {
    const { data } = await api.post<Experience>('/me/experiences', payload)
    return data
  },

  update: async (
    id: number,
    payload: Partial<Experience>
  ): Promise<Experience> => {
    const { data } = await api.put<Experience>(`/me/experiences/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/me/experiences/${id}`)
  },
}