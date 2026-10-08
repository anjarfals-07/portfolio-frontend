// ============================================================
// educationService — API layer untuk riwayat pendidikan
// ============================================================
// Endpoint backend:
//   GET    /api/me/educations                        → list (owner)
//   GET    /api/me/educations/public/{username}      → list (public) ⭐
//   GET    /api/me/educations/{id}                   → detail
//   POST   /api/me/educations                        → create
//   PUT    /api/me/educations/{id}                   → update
//   DELETE /api/me/educations/{id}                   → delete
//   POST   /api/me/educations/reorder                → reorder
// ============================================================

import api from './api'
import type { Education, EducationFormData } from '@/types/cv'

/* ============================================================
   NORMALIZERS
   ============================================================ */

function normalizeEducation(raw: any): Education {
  return {
    id: raw?.id ?? 0,
    institution: raw?.institution ?? '',
    degree: raw?.degree ?? null,
    fieldOfStudy: raw?.fieldOfStudy ?? null,
    startDate: raw?.startDate ?? null,
    endDate: raw?.endDate ?? null,
    gpa: raw?.gpa ?? null,
    description: raw?.description ?? null,
    sortOrder: raw?.sortOrder ?? 0,
    createdAt: raw?.createdAt ?? undefined,
    updatedAt: raw?.updatedAt ?? undefined,
  }
}

function normalizeList(raw: any): Education[] {
  if (!Array.isArray(raw)) return []
  return raw.map(normalizeEducation)
}

/* ============================================================
   SERIALIZER
   ============================================================ */

function serializeEducation(
  data: Partial<EducationFormData>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  if (data.institution !== undefined) payload.institution = data.institution
  if (data.degree !== undefined && data.degree !== '') payload.degree = data.degree
  if (data.fieldOfStudy !== undefined && data.fieldOfStudy !== '')
    payload.fieldOfStudy = data.fieldOfStudy
  if (data.startDate !== undefined && data.startDate !== '')
    payload.startDate = data.startDate
  if (data.endDate !== undefined && data.endDate !== '')
    payload.endDate = data.endDate
  if (data.gpa !== undefined && data.gpa !== '') payload.gpa = data.gpa
  if (data.description !== undefined && data.description !== '')
    payload.description = data.description

  return payload
}

/* ============================================================
   SERVICE
   ============================================================ */

export const educationService = {
  /**
   * List semua education user (owner yang login).
   */
  async list(): Promise<Education[]> {
    const { data } = await api.get('/me/educations')
    return normalizeList(data)
  },

  /**
   * List education publik by username (portfolio slug). ⭐ BARU
   * Dipakai di halaman About (public view).
   */
  async listPublic(username: string): Promise<Education[]> {
    const { data } = await api.get(`/me/educations/public/${username}`)
    return normalizeList(data)
  },

  /**
   * Get satu education by id.
   */
  async getOne(id: number): Promise<Education> {
    const { data } = await api.get(`/me/educations/${id}`)
    return normalizeEducation(data)
  },

  /**
   * Create education baru.
   */
  async create(formData: EducationFormData): Promise<Education> {
    const payload = serializeEducation(formData)
    const { data } = await api.post('/me/educations', payload)
    return normalizeEducation(data)
  },

  /**
   * Update education (partial).
   */
  async update(
    id: number,
    formData: Partial<EducationFormData>
  ): Promise<Education> {
    const payload = serializeEducation(formData)
    const { data } = await api.put(`/me/educations/${id}`, payload)
    return normalizeEducation(data)
  },

  /**
   * Delete education.
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/me/educations/${id}`)
  },

  /**
   * Reorder education.
   */
  async reorder(orderedIds: number[]): Promise<void> {
    await api.post('/me/educations/reorder', { orderedIds })
  },
}

export default educationService