import api from './api'
import type {
  PaymentInitResponse,
  PaymentStatusResponse,
  PaymentTransactionDTO,
  PaymentMethod,
} from '@/types/payment'

export const paymentService = {
  // ===== Public — untuk halaman payment =====
  async getDetail(referenceId: string): Promise<PaymentInitResponse> {
    const { data } = await api.get<PaymentInitResponse>(
      `/payment/${referenceId}`
    )
    return data
  },

  async getStatus(referenceId: string): Promise<PaymentStatusResponse> {
    const { data } = await api.get<PaymentStatusResponse>(
      `/payment/status/${referenceId}`
    )
    return data
  },

  async uploadProof(
    referenceId: string,
    file: File,
    note?: string
  ): Promise<PaymentTransactionDTO> {
    const formData = new FormData()
    formData.append('file', file)
    if (note) formData.append('note', note)

    const { data } = await api.post<PaymentTransactionDTO>(
      `/payment/${referenceId}/proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
  },

  // ===== Public — list metode bayar =====
  async getActiveMethods(): Promise<PaymentMethod[]> {
    const { data } = await api.get<PaymentMethod[]>('/payment-methods')
    return data
  },
}