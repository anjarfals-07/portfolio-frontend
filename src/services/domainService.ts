// src/services/domainService.ts

import api from '@/services/api'
import type { TenantDomain, AddDomainRequest } from '@/types/tenant'

/**
 * Service untuk manage custom domain (owner).
 */
export const domainService = {
  /**
   * List semua domain milik user.
   */
  async list(): Promise<TenantDomain[]> {
    const { data } = await api.get<TenantDomain[]>('/owner/domains')
    return data
  },

  /**
   * Tambah domain baru.
   */
  async add(domain: string): Promise<TenantDomain> {
    const payload: AddDomainRequest = { domain }
    const { data } = await api.post<TenantDomain>('/owner/domains', payload)
    return data
  },

  /**
   * Verifikasi domain (cek DNS).
   */
  async verify(id: number): Promise<TenantDomain> {
    const { data } = await api.post<TenantDomain>(`/owner/domains/${id}/verify`)
    return data
  },

  /**
   * Set domain sebagai primary.
   */
  async setPrimary(id: number): Promise<TenantDomain> {
    const { data } = await api.put<TenantDomain>(`/owner/domains/${id}/primary`)
    return data
  },

  /**
   * Hapus domain.
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/owner/domains/${id}`)
  },
}