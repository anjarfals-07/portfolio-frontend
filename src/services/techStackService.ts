import api from './api'
import type { TechStack } from '@/types/techStack'

export const techStackService = {
  getAll: async (): Promise<TechStack[]> => {
    const { data } = await api.get<TechStack[]>('/tech-stack')
    return data
  },

  create: async (payload: Partial<TechStack>): Promise<TechStack> => {
    const { data } = await api.post<TechStack>('/tech-stack', payload)
    return data
  },

  update: async (id: number, payload: Partial<TechStack>): Promise<TechStack> => {
    const { data } = await api.put<TechStack>(`/tech-stack/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tech-stack/${id}`)
  },
}