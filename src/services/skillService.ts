import api from './api'
import type { Skill, SkillGrouped } from '@/types/skill'

export const skillService = {
  // ============================================================
  // PUBLIC (by username)
  // ============================================================

  getPublicGrouped: async (username: string): Promise<SkillGrouped> => {
    const { data } = await api.get<SkillGrouped>(`/users/${username}/skills`)
    return data
  },

  // ============================================================
  // OWNER (/api/me/...)
  // ============================================================

  getAll: async (): Promise<Skill[]> => {
    const { data } = await api.get<Skill[]>('/me/skills')
    return data
  },

  getGrouped: async (): Promise<SkillGrouped> => {
    const { data } = await api.get<SkillGrouped>('/me/skills/grouped')
    return data
  },

  create: async (payload: Partial<Skill>): Promise<Skill> => {
    const { data } = await api.post<Skill>('/me/skills', payload)
    return data
  },

  update: async (id: number, payload: Partial<Skill>): Promise<Skill> => {
    const { data } = await api.put<Skill>(`/me/skills/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/me/skills/${id}`)
  },
}