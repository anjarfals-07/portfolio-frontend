// src/types/tenant.ts

/**
 * Status SSL cert per domain.
 */
export type SSLStatus = 'PENDING' | 'ACTIVE' | 'FAILED'

/**
 * Custom domain per user.
 */
export interface TenantDomain {
  id: number
  domain: string
  isPrimary: boolean
  isVerified: boolean
  verificationToken: string | null
  sslStatus: SSLStatus
  lastCheckedAt: string | null
  verifiedAt: string | null
  createdAt: string

  // DNS instructions (dari backend)
  cnameTarget: string
  txtRecordName: string
  txtRecordValue: string
}

/**
 * Request tambah domain.
 */
export interface AddDomainRequest {
  domain: string
}