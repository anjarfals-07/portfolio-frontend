// ============================================================
// uploadService — API layer untuk upload file
// ============================================================
// Endpoint backend:
//   IMAGE:
//     POST   /api/me/upload          → upload image (Cloudinary)
//     DELETE /api/me/upload          → hapus image
//
//   CV:
//     POST   /api/me/upload/cv       → upload CV PDF
//     DELETE /api/me/upload/cv       → hapus CV PDF
// ============================================================

import { apiUpload } from './api'   // ⭐ Pakai apiUpload (timeout 2 menit)

/* ============================================================
   TYPES
   ============================================================ */

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface CvUploadResult {
  url: string
  publicId: string
}

/* ============================================================
   NORMALIZERS
   ============================================================ */

function normalizeUploadResult(raw: any): UploadResult {
  return {
    url: raw?.url ?? '',
    publicId: raw?.publicId ?? '',
    width: raw?.width ?? 0,
    height: raw?.height ?? 0,
    format: raw?.format ?? '',
    bytes: raw?.bytes ?? 0,
  }
}

function normalizeCvUploadResult(raw: any): CvUploadResult {
  return {
    url: raw?.url ?? '',
    publicId: raw?.publicId ?? '',
  }
}

/* ============================================================
   HELPERS
   ============================================================ */

const CV_MAX_SIZE_MB = 10
const CV_MIME = 'application/pdf'

function validateCvFile(file: File): string | null {
  if (!file) return 'File tidak boleh kosong'

  if (file.type !== CV_MIME) {
    return 'File harus berformat PDF'
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return 'File harus berformat .pdf'
  }

  const maxBytes = CV_MAX_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return `File maksimal ${CV_MAX_SIZE_MB}MB`
  }

  return null
}

/* ============================================================
   SERVICE
   ============================================================ */

export const uploadService = {
  // ============================================================
  // IMAGE
  // ============================================================
  uploadImage: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiUpload.post('/me/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })

    return normalizeUploadResult(data)
  },

  deleteImage: async (publicId: string): Promise<void> => {
    await apiUpload.delete('/me/upload', {
      params: { publicId },
    })
  },

  // ============================================================
  // CV
  // ============================================================
  uploadCv: async (
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<CvUploadResult> => {
    // Validasi client-side
    const err = validateCvFile(file)
    if (err) {
      throw new Error(err)
    }

    const formData = new FormData()
    formData.append('file', file)

    const { data } = await apiUpload.post('/me/upload/cv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) {
          onProgress(Math.round((e.loaded * 100) / e.total))
        }
      },
    })

    return normalizeCvUploadResult(data)
  },

  deleteCv: async (publicId: string): Promise<void> => {
    if (!publicId || publicId.trim() === '') {
      throw new Error('publicId wajib diisi')
    }

    await apiUpload.delete('/me/upload/cv', {
      params: { publicId },
    })
  },

  // ============================================================
  // UTILITIES
  // ============================================================
  extractPublicId: (url: string | null | undefined): string | null => {
    if (!url) return null
    try {
      const parts = url.split('/')
      const last = parts[parts.length - 1]
      return last && last.endsWith('.pdf') ? last : null
    } catch {
      return null
    }
  },

  validateCv: validateCvFile,
}

export default uploadService