export interface Experience {
  id: number
  year: string | null
  title: string
  subtitle: string | null
  description: string | null
  icon: string | null
  color: string | null
  tags: string[] | null
  sortOrder: number
  createdAt: string
  updatedAt: string
}