import api from './api'
import type {
  UserPublic,
  UserMe,
  UserAdmin,
  CreateUserRequest,
  UpdateUserRequest,
  AdminStats,
} from '@/types/user'

export const userService = {
  // ============================================================
  // PUBLIC
  // ============================================================

  getAllPublic: async (): Promise<UserPublic[]> => {
    const { data } = await api.get<UserPublic[]>('/users')
    return data
  },

  // ============================================================
  // ME
  // ============================================================

  getMe: async (): Promise<UserMe> => {
    const { data } = await api.get<UserMe>('/me')
    return data
  },

  // ============================================================
  // ADMIN — USER CRUD
  // ============================================================

  getAllForAdmin: async (): Promise<UserAdmin[]> => {
    const { data } = await api.get<UserAdmin[]>('/admin/users')
    return data
  },

  getByIdForAdmin: async (id: number): Promise<UserAdmin> => {
    const { data } = await api.get<UserAdmin>(`/admin/users/${id}`)
    return data
  },

  createByAdmin: async (payload: CreateUserRequest): Promise<UserAdmin> => {
    const { data } = await api.post<UserAdmin>('/admin/users', payload)
    return data
  },

  updateByAdmin: async (
    id: number,
    payload: UpdateUserRequest
  ): Promise<UserAdmin> => {
    const { data } = await api.put<UserAdmin>(`/admin/users/${id}`, payload)
    return data
  },

  deleteByAdmin: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  setActive: async (id: number, active: boolean): Promise<UserAdmin> => {
    const { data } = await api.patch<UserAdmin>(
      `/admin/users/${id}/disable`,
      null,
      { params: { disable: !active } }
    )
    return data
  },

  changeRole: async (id: number, role: string): Promise<UserAdmin> => {
    const { data } = await api.patch<UserAdmin>(
      `/admin/users/${id}/role`,
      null,
      { params: { role } }
    )
    return data
  },

  getAdminStats: async (): Promise<AdminStats> => {
    const { data } = await api.get<AdminStats>('/admin/stats')
    return data
  },

  // ============================================================
  // ADMIN — APPROVAL (BARU — Fase 6)
  // ============================================================

  /**
   * Approve user — ubah status jadi ACTIVE.
   * Setelah approve, user bisa login.
   */
  approveUser: async (id: number): Promise<UserAdmin> => {
    const { data } = await api.patch<UserAdmin>(`/admin/users/${id}/approve`)
    return data
  },

  /**
   * Reject user — ubah status jadi REJECTED dengan alasan.
   */
  rejectUser: async (id: number, reason?: string): Promise<UserAdmin> => {
    const { data } = await api.patch<UserAdmin>(
      `/admin/users/${id}/reject`,
      null,
      { params: { reason } }
    )
    return data
  },

  /**
   * Suspend user — ubah status jadi SUSPENDED dengan alasan.
   */
  suspendUser: async (id: number, reason?: string): Promise<UserAdmin> => {
    const { data } = await api.patch<UserAdmin>(
      `/admin/users/${id}/suspend`,
      null,
      { params: { reason } }
    )
    return data
  },
}