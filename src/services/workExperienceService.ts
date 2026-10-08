// ============================================================
// workExperienceService — API layer untuk riwayat pekerjaan
// ============================================================
// Endpoint backend:
//   GET    /api/me/work-experiences                     → list (owner)
//   GET    /api/me/work-experiences/public/{username}   → list (public)
//   GET    /api/me/work-experiences/{id}                → detail
//   POST   /api/me/work-experiences                     → create
//   PUT    /api/me/work-experiences/{id}                → update
//   DELETE /api/me/work-experiences/{id}                → delete
//   POST   /api/me/work-experiences/reorder             → reorder
// ============================================================

import api from './api'
import type {
  EmploymentType,
  WorkExperience,
  WorkExperienceFormData,
} from '@/types/cv'

/* ============================================================
   NORMALIZERS
   ============================================================ */

function normalizeWork(raw: any): WorkExperience {
  return {
    id: raw?.id ?? 0,
    company: raw?.company ?? '',
    position: raw?.position ?? '',
    employmentType: (raw?.employmentType as EmploymentType) ?? null,
    location: raw?.location ?? null,
    startDate: raw?.startDate ?? null,
    endDate: raw?.endDate ?? null,
    currentlyHere: raw?.currentlyHere ?? false,
    description: raw?.description ?? null,
    sortOrder: raw?.sortOrder ?? 0,
    createdAt: raw?.createdAt ?? undefined,
    updatedAt: raw?.updatedAt ?? undefined,
  }
}

function normalizeList(raw: any): WorkExperience[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeWork)
}

/* ============================================================
   SERIALIZER
   ============================================================ */

function serializeWork(
  data: Partial<WorkExperienceFormData>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (data.company !== undefined) payload.company = data.company
  if (data.position !== undefined) payload.position = data.position

  // ⚠️ FIX: employmentType adalah EmploymentType (union), bukan string kosong
  // Jadi cukup cek undefined aja
  if (data.employmentType !== undefined)
    payload.employmentType = data.employmentType

  if (data.location !== undefined && data.location !== '')
    payload.location = data.location
  if (data.startDate !== undefined && data.startDate !== '')
    payload.startDate = data.startDate
  if (data.endDate !== undefined && data.endDate !== '')
    payload.endDate = data.endDate
  if (data.currentlyHere !== undefined)
    payload.currentlyHere = data.currentlyHere
  if (data.description !== undefined && data.description !== '')
    payload.description = data.description

  return payload
}

/* ============================================================
   SERVICE
   ============================================================ */

export const workExperienceService = {
  /**
   * List semua work experience user (owner yang login).
   */
  async list(): Promise<WorkExperience[]> {
    const { data } = await api.get('/me/work-experiences')
    return normalizeList(data)
  },

  /**
   * List work experience publik by username.
   */
  async listPublic(username: string): Promise<WorkExperience[]> {
    const { data } = await api.get(`/me/work-experiences/public/${username}`)
    return normalizeList(data)
  },

  /**
   * Get satu work experience by id.
   */
  async getOne(id: number): Promise<WorkExperience> {
    const { data } = await api.get(`/me/work-experiences/${id}`)
    return normalizeWork(data)
  },

  /**
   * Create work experience baru.
   */
  async create(formData: WorkExperienceFormData): Promise<WorkExperience> {
    const payload = serializeWork(formData)
    const { data } = await api.post('/me/work-experiences', payload)
    return normalizeWork(data)
  },

  /**
   * Update work experience (partial).
   */
  async update(
    id: number,
    formData: Partial<WorkExperienceFormData>
  ): Promise<WorkExperience> {
    const payload = serializeWork(formData)
    const { data } = await api.put(`/me/work-experiences/${id}`, payload)
    return normalizeWork(data)
  },

  /**
   * Delete work experience.
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/me/work-experiences/${id}`)
  },

  /**
   * Reorder work experience.
   */
  async reorder(orderedIds: number[]): Promise<void> {
    await api.post('/me/work-experiences/reorder', { orderedIds })
  },
}

export default workExperienceService