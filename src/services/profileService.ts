import api from './api'
import type { Profile } from '@/types/profile'

export const profileService = {
  get: async (): Promise<Profile> => {
    const { data } = await api.get<Profile>('/profile')
    return data
  },

  save: async (payload: Partial<Profile>): Promise<Profile> => {
    const { data } = await api.post<Profile>('/profile', payload)
    return data
  },
}