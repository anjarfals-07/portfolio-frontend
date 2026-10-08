import api from './api'
import type { ContactFormData, Message, UnreadCount } from '@/types/message'

export const messageService = {
  // ============================================================
  // PUBLIC — kirim pesan ke user (contact form)
  // ============================================================

  send: async (
    username: string,
    payload: ContactFormData
  ): Promise<Message> => {
    const { data } = await api.post<Message>(
      `/messages/public/${username}`,
      payload
    )
    return data
  },

  // ============================================================
  // OWNER — inbox (/api/me/...)
  // ============================================================

  getAll: async (): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/me/messages')
    return data
  },

  getUnread: async (): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/me/messages/unread')
    return data
  },

  countUnread: async (): Promise<number> => {
    const { data } = await api.get<UnreadCount>('/me/messages/count-unread')
    return data.count
  },

  getById: async (id: number): Promise<Message> => {
    const { data } = await api.get<Message>(`/me/messages/${id}`)
    return data
  },

  markAsRead: async (id: number, read = true): Promise<Message> => {
    const { data } = await api.patch<Message>(
      `/me/messages/${id}/read`,
      null,
      { params: { read } }
    )
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/me/messages/${id}`)
  },
}