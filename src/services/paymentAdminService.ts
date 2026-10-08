import api from './api'
import type {
  PaymentAdminDTO,
  PaymentStatsDTO,
  PaymentVerificationRequest,
  PageResponse,
} from '@/types/payment'

export const paymentAdminService = {
  async list(
    status: string = 'ALL',
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<PaymentAdminDTO>> {
    const { data } = await api.get<PageResponse<PaymentAdminDTO>>(
      '/admin/payments',
      { params: { status, page, size } }
    )
    return data
  },

  async getStats(): Promise<PaymentStatsDTO> {
    const { data } = await api.get<PaymentStatsDTO>('/admin/payments/stats')
    return data
  },

  async getDetail(id: number): Promise<PaymentAdminDTO> {
    const { data } = await api.get<PaymentAdminDTO>(`/admin/payments/${id}`)
    return data
  },

  async approve(id: number): Promise<PaymentAdminDTO> {
    const { data } = await api.post<PaymentAdminDTO>(
      `/admin/payments/${id}/approve`
    )
    return data
  },

  async reject(
    id: number,
    payload: PaymentVerificationRequest
  ): Promise<PaymentAdminDTO> {
    const { data } = await api.post<PaymentAdminDTO>(
      `/admin/payments/${id}/reject`,
      payload
    )
    return data
  },
}