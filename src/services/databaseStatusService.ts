import api from './api'
import type { DatabaseStatus } from '@/types/backup'

export const databaseStatusService = {
  /**
   * Cek status koneksi database.
   * Return connected + info PostgreSQL.
   */
  async getStatus(): Promise<DatabaseStatus> {
    const { data } = await api.get<DatabaseStatus>(
      '/admin/database/status'
    )
    return data
  },
}