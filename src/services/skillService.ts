import api from './api'
import type { Skill, SkillGrouped } from '@/types/skill'

export const skillService = {
  getAll: async (): Promise<Skill[]> => {
    const { data } = await api.get<Skill[]>('/skills')
    return data
  },

  getGrouped: async (): Promise<SkillGrouped> => {
    const { data } = await api.get<SkillGrouped>('/skills/grouped')
    return data
  },

  create: async (payload: Partial<Skill>): Promise<Skill> => {
    const { data } = await api.post<Skill>('/skills', payload)
    return data
  },

  update: async (id: number, payload: Partial<Skill>): Promise<Skill> => {
    const { data } = await api.put<Skill>(`/skills/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/skills/${id}`)
  },
}