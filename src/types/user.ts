// ============================================================
// USER TYPES
// ============================================================

/**
 * User publik — data yang tampil di landing page.
 */
export interface UserPublic {
  id: number
  username: string
  displayName: string | null
  portfolioSlug: string
  role: 'OWNER' | 'SUPER_ADMIN'
  createdAt: string
}

/**
 * Info user sendiri (dari /api/me).
 */
export interface UserMe {
  id: number
  username: string
  email: string
  displayName: string | null
  portfolioSlug: string
  role: 'OWNER' | 'SUPER_ADMIN'
  active: boolean
  createdAt: string
}

/**
 * Status user — untuk approval system.
 */
export type UserStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'

/**
 * User di halaman admin — data lengkap.
 */
export interface UserAdmin extends UserMe {
  updatedAt: string
  status: UserStatus                // ← BARU
  rejectionReason?: string | null   // ← BARU
  approvedAt?: string | null        // ← BARU
  approvedBy?: number | null        // ← BARU
}

/**
 * Request admin bikin user baru.
 */
export interface CreateUserRequest {
  username: string
  email: string
  password: string
  displayName?: string
  portfolioSlug?: string
  role?: 'OWNER' | 'SUPER_ADMIN'
}

/**
 * Request admin update user.
 */
export interface UpdateUserRequest {
  email?: string
  displayName?: string
  portfolioSlug?: string
  role?: 'OWNER' | 'SUPER_ADMIN'
  active?: boolean
}

/**
 * Global stats — untuk dashboard super admin.
 */
export interface AdminStats {
  totalUsers: number
  totalOwners: number
  totalSuperAdmins: number
  activeUsers: number
  totalProjects: number
  totalBlogPosts: number
  totalSkills: number
  totalExperiences: number
  totalTechStacks: number
  totalMessages: number
}