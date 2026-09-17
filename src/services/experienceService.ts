import api from './api'
import type { Experience } from '@/types/experience'

export const experienceService = {
  getAll: async (): Promise<Experience[]> => {
    const { data } = await api.get<Experience[]>('/experiences')
    return data
  },

  getById: async (id: number): Promise<Experience> => {
    const { data } = await api.get<Experience>(`/experiences/${id}`)
    return data
  },

  create: async (payload: Partial<Experience>): Promise<Experience> => {
    const { data } = await api.post<Experience>('/experiences', payload)
    return data
  },

  update: async (id: number, payload: Partial<Experience>): Promise<Experience> => {
    const { data } = await api.put<Experience>(`/experiences/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/experiences/${id}`)
  },
}