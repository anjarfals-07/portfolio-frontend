import api from './api'
import type { Project, ProjectFormData } from '@/types/project'

export const projectService = {
  // ===== GET ALL =====
  // by default cuma published, kalau `all: true` tampilkan semua
  getAll: async (all = false): Promise<Project[]> => {
    const { data } = await api.get<Project[]>('/projects', {
      params: all ? { all: true } : {},
    })
    return data
  },

  // ===== GET FEATURED =====
  getFeatured: async (): Promise<Project[]> => {
    const { data } = await api.get<Project[]>('/projects/featured')
    return data
  },

  // ===== GET BY ID =====
  getById: async (id: number): Promise<Project> => {
    const { data } = await api.get<Project>(`/projects/${id}`)
    return data
  },

  // ===== GET BY SLUG =====
  getBySlug: async (slug: string): Promise<Project> => {
    const { data } = await api.get<Project>(`/projects/slug/${slug}`)
    return data
  },

  // ===== CREATE =====
  create: async (payload: ProjectFormData): Promise<Project> => {
    const { data } = await api.post<Project>('/projects', payload)
    return data
  },

  // ===== UPDATE =====
  update: async (id: number, payload: Partial<ProjectFormData>): Promise<Project> => {
    const { data } = await api.put<Project>(`/projects/${id}`, payload)
    return data
  },

  // ===== DELETE =====
  delete: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },
}