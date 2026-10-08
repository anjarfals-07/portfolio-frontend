import { apiLong } from './api'
import type { RestoreResult, RestoreStatus } from '@/types/backup'

export const backupService = {
  // ============================================================
  // BACKUP
  // ============================================================
  async streamBackup(): Promise<{
    blob: Blob
    filename: string
    sizeBytes: number
    mode: string
    databaseName: string
  }> {
    const response = await apiLong.post(
      '/admin/backup/stream',
      {},
      { responseType: 'blob' }
    )

    const blob = response.data as Blob
    const headers = response.headers

    const filename =
      headers['x-backup-filename'] ||
      extractFilenameFromDisposition(headers['content-disposition']) ||
      `backup-${new Date().toISOString().slice(0, 10)}.sql.gz`

    const sizeBytes = parseInt(headers['x-backup-size'] || '0', 10)
    const mode = headers['x-backup-mode'] || 'UNKNOWN'
    const databaseName = headers['x-backup-database'] || 'unknown'

    return { blob, filename, sizeBytes, mode, databaseName }
  },

  // ============================================================
  // RESTORE
  // ============================================================
  /**
   * Upload file backup + restore ke database.
   * Timeout 10 menit karena restore bisa lama.
   */
  async restoreFromFile(file: File): Promise<RestoreResult> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiLong.post<RestoreResult>(
      '/admin/backup/restore',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000, // 10 menit
      }
    )

    return data
  },

  /**
   * Cek status restore yang sedang berjalan.
   */
  async getRestoreStatus(): Promise<RestoreStatus> {
    const { data } = await apiLong.get<RestoreStatus>(
      '/admin/backup/restore/status'
    )
    return data
  },
}

/* ============================================================
   HELPERS
   ============================================================ */

function extractFilenameFromDisposition(disposition?: string): string | null {
  if (!disposition) return null

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/)
  if (utf8Match) return decodeURIComponent(utf8Match[1])

  const match = disposition.match(/filename="?([^";]+)"?/)
  return match ? match[1] : null
}