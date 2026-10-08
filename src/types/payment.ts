// ============================================================
// PAYMENT TYPES
// ============================================================

export type PaymentMethodType =
  | 'QRIS'
  | 'BANK_TRANSFER'
  | 'EWALLET'
  | 'CRYPTO_EVM'

export type PaymentStatus =
  | 'PENDING'
  | 'WAITING_VERIFICATION'
  | 'PAID'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REFUNDED'

// ============================================================
// PAYMENT METHOD (config admin)
// ============================================================
export interface PaymentMethod {
  id: number
  type: PaymentMethodType
  label: string
  isActive: boolean
  sortOrder: number

  // QRIS
  qrisImageUrl?: string
  qrisMerchantName?: string

  // BANK_TRANSFER
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string

  // EWALLET
  ewalletProvider?: string
  ewalletAccount?: string
  ewalletAccountHolder?: string

  // CRYPTO_EVM
  cryptoChain?: string
  cryptoToken?: string
  cryptoAddress?: string
  cryptoNetworkNote?: string

  // Common
  instructions?: string

  createdAt?: string
  updatedAt?: string
}

export interface PaymentMethodFormData {
  type: PaymentMethodType
  label: string
  isActive?: boolean
  sortOrder?: number

  // QRIS
  qrisImageUrl?: string
  qrisMerchantName?: string

  // BANK_TRANSFER
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string

  // EWALLET
  ewalletProvider?: string
  ewalletAccount?: string
  ewalletAccountHolder?: string

  // CRYPTO_EVM
  cryptoChain?: string
  cryptoToken?: string
  cryptoAddress?: string
  cryptoNetworkNote?: string

  // Common
  instructions?: string
}

// ============================================================
// PAYMENT INIT — return setelah register
// ============================================================
export interface PaymentInitResponse {
  referenceId: string
  amountIdr: number
  provider: string
  method: PaymentMethodType
  methodLabel: string
  status: PaymentStatus
  expiredAt: string

  // QRIS
  qrisImageUrl?: string
  qrisMerchantName?: string

  // BANK_TRANSFER
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string

  // EWALLET
  ewalletProvider?: string
  ewalletAccount?: string
  ewalletAccountHolder?: string

  // CRYPTO_EVM
  cryptoChain?: string
  cryptoToken?: string
  cryptoAddress?: string
  cryptoNetworkNote?: string

  // Common
  instructions?: string
}

// ============================================================
// PAYMENT STATUS — untuk polling
// ============================================================
export interface PaymentStatusResponse {
  referenceId: string
  status: PaymentStatus
  methodLabel: string
  amountIdr: number
  proofImageUrl?: string
  proofUploadedAt?: string
  rejectionReason?: string
  expiredAt?: string
  paidAt?: string
}

// ============================================================
// PAYMENT TRANSACTION DTO
// ============================================================
export interface PaymentTransactionDTO {
  id: number
  userId: number
  referenceId: string
  paymentMethodId?: number
  methodType: string
  methodLabel: string
  amountIdr: number
  status: string

  proofImageUrl?: string
  proofNote?: string
  proofUploadedAt?: string
  proofUploadCount: number

  rejectionReason?: string
  verifiedAt?: string

  expiredAt?: string
  paidAt?: string
  createdAt: string
  updatedAt?: string
}

// ============================================================
// ADMIN — payment management
// ============================================================
export interface PaymentAdminDTO {
  id: number
  referenceId: string

  userId: number
  username: string
  email: string
  displayName?: string
  portfolioSlug: string
  userStatus: string
  userPaymentStatus: string

  paymentMethodId?: number
  methodType: string
  methodLabel: string

  // Snapshot method
  qrisImageUrl?: string
  qrisMerchantName?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  ewalletProvider?: string
  ewalletAccount?: string
  ewalletAccountHolder?: string
  cryptoChain?: string
  cryptoToken?: string
  cryptoAddress?: string
  cryptoNetworkNote?: string

  amountIdr: number
  status: string

  proofImageUrl?: string
  proofNote?: string
  proofUploadedAt?: string
  proofUploadCount: number

  verifiedBy?: number
  verifiedByName?: string
  verifiedAt?: string
  rejectionReason?: string

  expiredAt?: string
  paidAt?: string
  createdAt: string
  updatedAt?: string
}

export interface PaymentStatsDTO {
  totalPending: number
  totalPaid: number
  totalRejected: number
  totalExpired: number
  revenueThisMonth: number
  revenueTotal: number
}

export interface PaymentVerificationRequest {
  rejectionReason?: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}