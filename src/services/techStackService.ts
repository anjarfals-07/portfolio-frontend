import api from './api'
import type { TechStack } from '@/types/techStack'

export const techStackService = {
  // ============================================================
  // PUBLIC (by username)
  // ============================================================

  getPublicList: async (username: string): Promise<TechStack[]> => {
    const { data } = await api.get<TechStack[]>(`/users/${username}/tech-stack`)
    return data
  },

  // ============================================================
  // OWNER (/api/me/...)
  // ============================================================

  getAll: async (): Promise<TechStack[]> => {
    const { data } = await api.get<TechStack[]>('/me/tech-stack')
    return data
  },

  create: async (payload: Partial<TechStack>): Promise<TechStack> => {
    const { data } = await api.post<TechStack>('/me/tech-stack', payload)
    return data
  },

  update: async (
    id: number,
    payload: Partial<TechStack>
  ): Promise<TechStack> => {
    const { data } = await api.put<TechStack>(`/me/tech-stack/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/me/tech-stack/${id}`)
  },
}