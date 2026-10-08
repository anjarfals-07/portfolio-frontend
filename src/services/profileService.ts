// ============================================================
// profileService — API layer untuk Profile
// ============================================================
// Endpoint backend:
//   PUBLIC:  GET    /api/users/{username}
//   OWNER:   GET    /api/me/profile
//            PUT    /api/me/profile    → full update (wajib fullName)
//            PATCH  /api/me/profile    → partial update
//   ADMIN:   GET    /api/admin/users/{userId}/profile
//
//   CV PREFS:
//            PUT    /api/profile/cv-preferences?merge=true|false
//            DELETE /api/profile/cv-preferences
// ============================================================

import api from './api'
import type { Profile } from '@/types/profile'
import type { CvPreferences } from '@/types/cv'
import { DEFAULT_CV_PREFERENCES, mergePreferences } from '@/types/cv'

/* ============================================================
   NORMALIZERS
   ============================================================ */

/**
 * Normalize profile dari backend.
 */
function normalizeProfile(raw: any): Profile {
  if (!raw) return raw

  return {
    ...raw,
    cvPreferences: raw.cvPreferences
      ? mergePreferences(raw.cvPreferences)
      : null,
    cvSource:
      typeof raw.cvSource === 'string'
        ? (raw.cvSource.toUpperCase() as Profile['cvSource'])
        : null,
  }
}

/**
 * Serialize cvPreferences untuk dikirim ke backend.
 */
function serializeCvPreferences(
  prefs: Partial<CvPreferences>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  Object.entries(prefs).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      payload[key] = value
    }
  })
  return payload
}

/* ============================================================
   SERVICE
   ============================================================ */

export const profileService = {
  // ============================================================
  // PUBLIC
  // ============================================================
  /**
   * Get profile publik by username (portfolio slug).
   */
  getPublicProfile: async (username: string): Promise<Profile> => {
    const { data } = await api.get<Profile>(`/users/${username}`)
    return normalizeProfile(data)
  },

  // ============================================================
  // OWNER (/api/me/...)
  // ============================================================

  /**
   * Get profile milik user yang login.
   */
  get: async (): Promise<Profile> => {
    const { data } = await api.get<Profile>('/me/profile')
    return normalizeProfile(data)
  },

  /**
   * ⭐ FULL update — pakai PUT.
   * Wajib kirim fullName (karena backend pakai @Valid).
   *
   * Dipakai untuk save form lengkap di ManageProfile.
   */
  update: async (payload: Partial<Profile>): Promise<Profile> => {
    const { data } = await api.put<Profile>('/me/profile', payload)
    return normalizeProfile(data)
  },

  /**
   * ⭐ PARTIAL update — pakai PATCH.
   * Field spesifik aja, tanpa wajib fullName.
   *
   * Dipakai untuk save Personal Info, CV preference, dsb.
   */
  partialUpdate: async (payload: Partial<Profile>): Promise<Profile> => {
    const { data } = await api.patch<Profile>('/me/profile', payload)
    return normalizeProfile(data)
  },

  /**
   * Alias untuk backward compat.
   */
  save: async (payload: Partial<Profile>): Promise<Profile> => {
    const { data } = await api.put<Profile>('/me/profile', payload)
    return normalizeProfile(data)
  },

  // ============================================================
  // CV PREFERENCES
  // ============================================================
  updateCvPreferences: async (
    prefs: Partial<CvPreferences>,
    merge: boolean = true
  ): Promise<Profile> => {
    const payload = serializeCvPreferences(prefs)
    const { data } = await api.put<Profile>(
      `/profile/cv-preferences?merge=${merge}`,
      payload
    )
    return normalizeProfile(data)
  },

  resetCvPreferences: async (): Promise<Profile> => {
    const { data } = await api.delete<Profile>('/profile/cv-preferences')
    return normalizeProfile(data)
  },

  getEffectiveCvPreferences: async (): Promise<CvPreferences> => {
    const profile = await profileService.get()
    return profile.cvPreferences ?? { ...DEFAULT_CV_PREFERENCES }
  },

  // ============================================================
  // ADMIN (/api/admin/...)
  // ============================================================
  getByUserIdForAdmin: async (userId: number): Promise<Profile> => {
    const { data } = await api.get<Profile>(`/admin/users/${userId}/profile`)
    return normalizeProfile(data)
  },
}

export default profileService