import api from './api'
import type { ContactFormData, Message, UnreadCount } from '@/types/message'

export const messageService = {
  // ===== PUBLIC: kirim pesan dari contact form =====
  send: async (payload: ContactFormData): Promise<Message> => {
    const { data } = await api.post<Message>('/messages', payload)
    return data
  },

  // ===== ADMIN: list semua pesan =====
  getAll: async (): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/messages')
    return data
  },

  // ===== ADMIN: list pesan unread =====
  getUnread: async (): Promise<Message[]> => {
    const { data } = await api.get<Message[]>('/messages/unread')
    return data
  },

  // ===== ADMIN: count unread =====
  countUnread: async (): Promise<number> => {
    const { data } = await api.get<UnreadCount>('/messages/count-unread')
    return data.count
  },

  // ===== ADMIN: detail (auto mark as read) =====
  getById: async (id: number): Promise<Message> => {
    const { data } = await api.get<Message>(`/messages/${id}`)
    return data
  },

  // ===== ADMIN: mark read/unread =====
  markAsRead: async (id: number, read = true): Promise<Message> => {
    const { data } = await api.patch<Message>(`/messages/${id}/read`, null, {
      params: { read },
    })
    return data
  },

  // ===== ADMIN: hapus =====
  delete: async (id: number): Promise<void> => {
    await api.delete(`/messages/${id}`)
  },
}