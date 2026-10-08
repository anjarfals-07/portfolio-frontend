// src/services/themeService.ts
import api from './api'
import type { Theme, ThemeFormData, ThemePreset } from '@/types/theme'

function normalizeTheme(raw: any): Theme | null {
  if (!raw) return null

  return {
    id: raw.id,

    // ⭐ OWNER INFO — white-label
    username: raw.username ?? null,
    displayName: raw.displayName ?? raw.display_name ?? null,

    // Colors
    primaryColor: raw.primaryColor ?? raw.primary_color ?? null,
    accentColor: raw.accentColor ?? raw.accent_color ?? null,
    bgColor: raw.bgColor ?? raw.bg_color ?? null,
    textColor: raw.textColor ?? raw.text_color ?? null,

    // Typography
    fontFamily: raw.fontFamily ?? raw.font_family ?? null,
    headingFont: raw.headingFont ?? raw.heading_font ?? null,

    // Layout
    borderRadius: raw.borderRadius ?? raw.border_radius ?? null,
    logoIcon: raw.logoIcon ?? raw.logo_icon ?? null,
    layout: raw.layout ?? null,
    defaultMode: raw.defaultMode ?? raw.default_mode ?? null,
    preset: raw.preset ?? null,

    // Timestamps
    updatedAt: raw.updatedAt ?? raw.updated_at ?? new Date().toISOString(),
  }
}

function serializeTheme(data: ThemeFormData): Record<string, any> {
  const payload: Record<string, any> = {}

  if (data.primaryColor !== undefined) payload.primaryColor = data.primaryColor
  if (data.accentColor !== undefined) payload.accentColor = data.accentColor
  if (data.bgColor !== undefined) payload.bgColor = data.bgColor
  if (data.textColor !== undefined) payload.textColor = data.textColor
  if (data.fontFamily !== undefined) payload.fontFamily = data.fontFamily
  if (data.headingFont !== undefined) payload.headingFont = data.headingFont
  if (data.borderRadius !== undefined) payload.borderRadius = data.borderRadius
  if (data.logoIcon !== undefined) payload.logoIcon = data.logoIcon
  if (data.layout !== undefined) payload.layout = data.layout
  if (data.defaultMode !== undefined) payload.defaultMode = data.defaultMode
  if (data.preset !== undefined) payload.preset = data.preset

  return payload
}

export const themeService = {
  async getPublicTheme(username: string): Promise<Theme | null> {
    const res = await api.get(`/themes/public/${username}`)
    return normalizeTheme(res.data)
  },

  async getMyTheme(): Promise<Theme | null> {
    const res = await api.get('/themes/me')
    return normalizeTheme(res.data)
  },

  async saveMyTheme(data: ThemeFormData): Promise<Theme> {
    const payload = serializeTheme(data)
    const res = await api.put('/themes/me', payload)
    const normalized = normalizeTheme(res.data)
    if (!normalized) throw new Error('Invalid theme response')
    return normalized
  },

  async applyPreset(presetName: string): Promise<Theme> {
    const res = await api.post('/themes/me/preset', { preset: presetName })
    const normalized = normalizeTheme(res.data)
    if (!normalized) throw new Error('Invalid theme response')
    return normalized
  },

  async resetMyTheme(): Promise<void> {
    await api.delete('/themes/me')
  },

  async getPresets(): Promise<ThemePreset[]> {
    const res = await api.get('/themes/presets')
    return res.data
  },
}