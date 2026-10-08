// ============================================================
// AUTH TYPES
// ============================================================

import type { PaymentInitResponse } from './payment'

/**
 * Response setelah login berhasil.
 */
export interface AuthResponse {
  token: string
  type: string
  userId: number
  username: string
  role: 'OWNER' | 'SUPER_ADMIN'
  portfolioSlug: string
  displayName?: string
  expiresIn: number
}

/**
 * Response setelah register.
 * ⚠️ TIDAK ada token — user nunggu approval atau bayar.
 */
export interface RegisterResponse {
  message: string
  userId: number
  username: string
  portfolioSlug: string
  status:
    | 'PENDING'
    | 'PENDING_PAYMENT'
    | 'ACTIVE'
    | 'REJECTED'
    | 'SUSPENDED'

  /**
   * ⭐ Info pembayaran (nullable).
   * Diisi kalau registrationPaymentEnabled = true.
   */
  payment?: PaymentInitResponse

  /**
   * ⭐ Flag untuk frontend — butuh bayar atau enggak.
   */
  requiresPayment: boolean
}

/**
 * Request login.
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * Request register.
 */
export interface RegisterRequest {
  username: string
  email: string
  password: string
  displayName?: string
  portfolioSlug?: string

  /**
   * ⭐ ID payment method yang dipilih (kalau payment enabled).
   */
  paymentMethodId?: number
}

/**
 * User yang login (dari context).
 */
export interface AuthUser {
  userId: number
  username: string
  role: 'OWNER' | 'SUPER_ADMIN'
  portfolioSlug: string
  displayName?: string
}