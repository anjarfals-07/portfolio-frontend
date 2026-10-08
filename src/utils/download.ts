/* ============================================================
   DOWNLOAD UTILS
   Auto-download blob ke folder Download browser
   ============================================================ */

/**
 * Auto-download blob ke folder Download default browser.
 * Jalan di semua browser (Chrome, Firefox, Safari, Edge).
 */
export function autoDownloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.style.display = 'none'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Cleanup setelah jeda
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * Format bytes ke human-readable.
 * Contoh: 2516582 → "2.4 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
}

/**
 * Format tanggal ke format Indonesia.
 */
export function formatDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Generate nama file backup di FE (fallback).
 * Format: backup-YYYY-MM-DD_HH-mm-ss.sql.gz
 */
export function generateBackupFilename(): string {
  const now = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')

  const ts =
    now.getFullYear() +
    '-' +
    pad(now.getMonth() + 1) +
    '-' +
    pad(now.getDate()) +
    '_' +
    pad(now.getHours()) +
    '-' +
    pad(now.getMinutes()) +
    '-' +
    pad(now.getSeconds())

  return `backup-${ts}.sql.gz`
}