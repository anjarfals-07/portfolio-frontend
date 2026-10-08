import api from './api'
import type { PaymentMethod, PaymentMethodFormData } from '@/types/payment'

export const paymentMethodService = {
  // ===== Admin =====
  async getAll(): Promise<PaymentMethod[]> {
    const { data } = await api.get<PaymentMethod[]>('/admin/payment-methods')
    return data
  },

  async getById(id: number): Promise<PaymentMethod> {
    const { data } = await api.get<PaymentMethod>(`/admin/payment-methods/${id}`)
    return data
  },

  async create(payload: PaymentMethodFormData): Promise<PaymentMethod> {
    const { data } = await api.post<PaymentMethod>(
      '/admin/payment-methods',
      payload
    )
    return data
  },

  async update(
    id: number,
    payload: PaymentMethodFormData
  ): Promise<PaymentMethod> {
    const { data } = await api.put<PaymentMethod>(
      `/admin/payment-methods/${id}`,
      payload
    )
    return data
  },

  async toggleActive(id: number): Promise<PaymentMethod> {
    const { data } = await api.patch<PaymentMethod>(
      `/admin/payment-methods/${id}/toggle-active`
    )
    return data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/admin/payment-methods/${id}`)
  },

  async uploadQris(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post<{ url: string }>(
      '/admin/payment-methods/upload-qris',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.url
  },

  // ===== Public =====
  async getActive(): Promise<PaymentMethod[]> {
    const { data } = await api.get<PaymentMethod[]>('/payment-methods')
    return data
  },
}