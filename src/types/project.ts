export interface Project {
  id: number
  title: string
  slug: string
  description: string | null
  content: string | null
  thumbnailUrl: string | null
  techStack: string[] | null
  githubUrl: string | null
  demoUrl: string | null
  featured: boolean
  published: boolean
  createdAt: string
  updatedAt: string
}

export interface ProjectFormData {
  title: string
  slug?: string
  description?: string
  content?: string
  thumbnailUrl?: string
  techStack?: string[]
  githubUrl?: string
  demoUrl?: string
  featured?: boolean
  published?: boolean
}