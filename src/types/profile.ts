export interface SocialLink {
  icon: string
  url: string
  label: string
}

export interface Profile {
  id: number
  fullName: string
  role: string | null
  bio: string | null
  shortBio: string | null
  email: string | null
  location: string | null
  avatarUrl: string | null
  cvUrl: string | null
  availableForWork: boolean
  socials: SocialLink[] | null
  updatedAt: string
}