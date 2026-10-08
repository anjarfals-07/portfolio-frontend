import api from './api'
import type { Project, ProjectFormData } from '@/types/project'

export const projectService = {
  // ============================================================
  // PUBLIC (by username)
  // ============================================================

  getPublicProjects: async (username: string): Promise<Project[]> => {
    const { data } = await api.get<Project[]>(`/users/${username}/projects`)
    return data
  },

  getPublicFeatured: async (username: string): Promise<Project[]> => {
    const all = await projectService.getPublicProjects(username)
    return all.filter((p) => p.featured)
  },

  getPublicBySlug: async (username: string, slug: string): Promise<Project> => {
    const { data } = await api.get<Project>(
      `/users/${username}/projects/${slug}`
    )
    return data
  },

  // ============================================================
  // OWNER (/api/me/...)
  // ============================================================

  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get<Project[]>('/me/projects')
    return data
  },

  getById: async (id: number): Promise<Project> => {
    const { data } = await api.get<Project>(`/me/projects/${id}`)
    return data
  },

  create: async (payload: ProjectFormData): Promise<Project> => {
    const { data } = await api.post<Project>('/me/projects', payload)
    return data
  },

  update: async (
    id: number,
    payload: Partial<ProjectFormData>
  ): Promise<Project> => {
    const { data } = await api.put<Project>(`/me/projects/${id}`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/me/projects/${id}`)
  },

  // ============================================================
  // ADMIN (/api/admin/...)
  // ============================================================

  getByUserIdForAdmin: async (userId: number): Promise<Project[]> => {
    const { data } = await api.get<Project[]>(
      `/admin/users/${userId}/projects`
    )
    return data
  },

  // Alias (backward compat)
  getAllProjects: async (userId: number): Promise<Project[]> => {
    const { data } = await api.get<Project[]>(
      `/admin/users/${userId}/projects`
    )
    return data
  },
}