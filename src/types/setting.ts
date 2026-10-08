export interface PlatformSetting {
  // Branding
  platformName: string
  logoIcon: string
  primaryColor: string
  accentColor: string
  tagline: string

  // Default user
  defaultRole: string
  autoApproveUsers: boolean

  // Domain
  primaryDomain: string
  slugPattern: string
  allowCustomSlug: boolean
  defaultPortfolioUsername: string   // ⭐ NEW

  // Email
  emailNewUser: boolean
  emailNewMessage: boolean
  emailUserApproved: boolean
  emailUserRejected: boolean
  notificationEmail: string

  // Security
  minPasswordLength: number
  requireUppercase: boolean
  requireNumber: boolean
  requireSpecialChar: boolean
  sessionTimeoutMinutes: number
  maxLoginAttempts: number

  // Payment ⭐ NEW
  registrationPaymentEnabled: boolean
  registrationFeeIdr: number
  paymentExpiryMinutes: number

  // Meta
  updatedAt?: string
}

export type PlatformSettingFormData = Partial<PlatformSetting>