import api from './api'

export interface VerifyTokenResponse {
  valid: boolean
  message: string
  email?: string
}

export const emailService = {
  /**
   * Kirim link reset password ke email.
   */
  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email })
  },

  /**
   * Verify reset token valid atau gak.
   */
  verifyResetToken: async (token: string): Promise<VerifyTokenResponse> => {
    const { data } = await api.get<VerifyTokenResponse>(
      '/auth/verify-reset-token',
      { params: { token } }
    )
    return data
  },

  /**
   * Reset password dengan token.
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, newPassword })
  },
}