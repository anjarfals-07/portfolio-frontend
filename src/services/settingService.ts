import api from './api'
import type { PlatformSetting, PlatformSettingFormData } from '@/types/setting'

export const settingService = {
  async getSettings(): Promise<PlatformSetting> {
    const { data } = await api.get<PlatformSetting>('/admin/settings')
    return data
  },

  async updateSettings(
    payload: PlatformSettingFormData
  ): Promise<PlatformSetting> {
    const { data } = await api.put<PlatformSetting>(
      '/admin/settings',
      payload
    )
    return data
  },
}