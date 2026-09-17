export interface Skill {
  id: number
  category: string | null
  categoryIcon: string | null
  name: string
  level: number
  sortOrder: number
  createdAt: string
}

export interface SkillGroup {
  category: string
  categoryIcon: string | null
  items: Skill[]
}

export type SkillGrouped = Record<string, SkillGroup>