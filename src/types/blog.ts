export interface Author {
  name: string
  avatarUrl: string | null
  role: string
  email: string | null
  location: string | null
  bio: string | null
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  coverUrl: string | null
  tags: string[] | null
  readingTime: number | null
  published: boolean
  featured: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface BlogPostFormData {
  title: string
  slug?: string
  excerpt?: string
  content?: string
  coverUrl?: string
  tags?: string[]
  readingTime?: number
  published?: boolean
  featured?: boolean
}