// // ============================================================
// // CV SERVICE — API layer untuk fitur CV
// // ============================================================
// // Endpoint backend:
// //   GET    /api/me/cv/options              → list pilihan valid
// //   POST   /api/me/cv/generate             → generate PDF
// //   GET    /api/me/cv/preview              → preview HTML
// //   GET    /api/me/cv/status               → cek status CV
// //   PUT    /api/profile/cv-preferences     → update preferences
// //   DELETE /api/profile/cv-preferences     → reset preferences
// // ============================================================

// import api from './api'
// import type {
//   CvGenerateResult,
//   CvOptions,
//   CvPreferences,
//   CvSource,
//   CvTemplate,
// } from '@/types/cv'
// import {
//   DEFAULT_CV_PREFERENCES,
//   mergePreferences,
// } from '@/types/cv'

// /* ============================================================
//    NORMALIZERS
//    ============================================================ */

// function normalizePreferences(raw: unknown): CvPreferences {
//   if (!raw || typeof raw !== 'object') {
//     return { ...DEFAULT_CV_PREFERENCES }
//   }
//   return mergePreferences(raw as Partial<CvPreferences>)
// }

// function normalizeGenerateResult(raw: any): CvGenerateResult {
//   return {
//     url: raw.url ?? '',
//     publicId: raw.publicId ?? '',
//     source: (raw.source as CvSource) ?? 'GENERATED',
//     template: (raw.template as CvTemplate) ?? 'modern',
//     layout: raw.layout ?? 'sidebar-left',
//     theme: raw.theme ?? 'light',
//     generatedAt: raw.generatedAt ?? new Date().toISOString(),
//     sizeBytes: raw.sizeBytes ?? 0,
//   }
// }

// function normalizeOptions(raw: any): CvOptions {
//   return {
//     templates: raw.templates ?? [],
//     layouts: raw.layouts ?? [],
//     palettes: raw.palettes ?? [],
//     fontPairs: raw.fontPairs ?? [],
//     themes: raw.themes ?? [],
//     densities: raw.densities ?? [],
//     cardStyles: raw.cardStyles ?? [],
//     badgeStyles: raw.badgeStyles ?? [],
//     iconSets: raw.iconSets ?? [],
//     backgroundPatterns: raw.backgroundPatterns ?? [],
//   }
// }

// /* ============================================================
//    SERIALIZER
//    ============================================================ */

// function serializePreferences(
//   prefs: Partial<CvPreferences>
// ): Record<string, unknown> {
//   const payload: Record<string, unknown> = {}
//   Object.entries(prefs).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       payload[key] = value
//     }
//   })
//   return payload
// }

// /* ============================================================
//    SERVICE
//    ============================================================ */

// export const cvService = {
//   // ============================================================
//   // OPTIONS
//   // ============================================================
//   async getOptions(): Promise<CvOptions> {
//     const { data } = await api.get('/me/cv/options')
//     return normalizeOptions(data)
//   },

//   // ============================================================
//   // GENERATE — PDF
//   // ============================================================
//   async generate(template?: CvTemplate): Promise<CvGenerateResult> {
//     const { data } = await api.post(
//       '/me/cv/generate',
//       null,
//       { params: template ? { template } : {} }
//     )
//     return normalizeGenerateResult(data)
//   },

//   // ============================================================
//   // ⭐ PREVIEW — HTML
//   // ============================================================
//   /**
//    * Get HTML preview sebagai blob URL.
//    * Caller WAJIB revoke setelah selesai:
//    *   URL.revokeObjectURL(url)
//    */
//   async getPreviewBlob(template?: CvTemplate): Promise<string> {
//     const res = await api.get('/me/cv/preview', {
//       params: template ? { template } : {},
//       responseType: 'blob',
//     })
//     const blob = new Blob([res.data], {
//       type: 'text/html;charset=utf-8',
//     })
//     return URL.createObjectURL(blob)
//   },

//   /**
//    * Get HTML preview sebagai string.
//    */
//   async getPreviewHtml(template?: CvTemplate): Promise<string> {
//     const { data } = await api.get('/me/cv/preview', {
//       params: template ? { template } : {},
//       responseType: 'text',
//     })
//     return data
//   },

//   // ============================================================
//   // STATUS
//   // ============================================================
//   async getStatus(): Promise<{
//     userId: number
//     hasCv: boolean
//     cvUrl?: string
//     cvSource?: CvSource
//     cvGeneratedAt?: string
//     message?: string
//   }> {
//     const { data } = await api.get('/me/cv/status')
//     return data
//   },

//   // ============================================================
//   // PREFERENCES
//   // ============================================================
//   async updatePreferences(
//     prefs: Partial<CvPreferences>,
//     merge: boolean = true
//   ): Promise<{ cvPreferences: CvPreferences }> {
//     const payload = serializePreferences(prefs)
//     const { data } = await api.put(
//       `/profile/cv-preferences?merge=${merge}`,
//       payload
//     )
//     return {
//       cvPreferences: normalizePreferences(data?.cvPreferences),
//     }
//   },

//   async resetPreferences(): Promise<{ cvPreferences: CvPreferences }> {
//     const { data } = await api.delete('/profile/cv-preferences')
//     return {
//       cvPreferences: normalizePreferences(data?.cvPreferences),
//     }
//   },
// }

// export default cvService







// ============================================================
// CV SERVICE — API layer untuk fitur CV
// ============================================================
// ⚠️ FASE 4: Method untuk preview & generate sudah DEPRECATED.
//
// Sejak migrasi ke full frontend:
//   - Preview HTML  → renderCvHtml()  (frontend)
//   - Generate PDF  → generateAndDownloadPdf()  (frontend)
//
// Method di bawah ini TIDAK DIPAKAI LAGI:
//   - generate()          @deprecated
//   - getPreviewBlob()    @deprecated
//   - getPreviewHtml()    @deprecated
//
// Backend endpoint yang bisa dimatikan (setelah stabil):
//   - POST /api/me/cv/generate
//   - GET  /api/me/cv/preview
//
// Endpoint yang MASIH DIPAKAI:
//   - GET  /api/me/cv/options              → list pilihan valid
//   - GET  /api/me/cv/status               → cek status CV
//   - PUT  /api/profile/cv-preferences     → update preferences
//   - DELETE /api/profile/cv-preferences   → reset preferences
// ============================================================

import api from './api'
import type {
  CvGenerateResult,
  CvOptions,
  CvPreferences,
  CvSource,
  CvTemplate,
} from '@/types/cv'
import {
  DEFAULT_CV_PREFERENCES,
  mergePreferences,
} from '@/types/cv'

/* ============================================================
   NORMALIZERS
   ============================================================ */

function normalizePreferences(raw: unknown): CvPreferences {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_CV_PREFERENCES }
  }
  return mergePreferences(raw as Partial<CvPreferences>)
}

function normalizeGenerateResult(raw: any): CvGenerateResult {
  return {
    url: raw.url ?? '',
    publicId: raw.publicId ?? '',
    source: (raw.source as CvSource) ?? 'GENERATED',
    template: (raw.template as CvTemplate) ?? 'modern',
    layout: raw.layout ?? 'sidebar-left',
    theme: raw.theme ?? 'light',
    generatedAt: raw.generatedAt ?? new Date().toISOString(),
    sizeBytes: raw.sizeBytes ?? 0,
  }
}

function normalizeOptions(raw: any): CvOptions {
  return {
    templates: raw.templates ?? [],
    layouts: raw.layouts ?? [],
    palettes: raw.palettes ?? [],
    fontPairs: raw.fontPairs ?? [],
    themes: raw.themes ?? [],
    densities: raw.densities ?? [],
    cardStyles: raw.cardStyles ?? [],
    badgeStyles: raw.badgeStyles ?? [],
    iconSets: raw.iconSets ?? [],
    backgroundPatterns: raw.backgroundPatterns ?? [],
  }
}

/* ============================================================
   SERIALIZER
   ============================================================ */

function serializePreferences(
  prefs: Partial<CvPreferences>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  Object.entries(prefs).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      payload[key] = value
    }
  })
  return payload
}

/* ============================================================
   SERVICE
   ============================================================ */

export const cvService = {
  // ============================================================
  // OPTIONS — ✅ MASIH DIPAKAI
  // ============================================================
  async getOptions(): Promise<CvOptions> {
    const { data } = await api.get('/me/cv/options')
    return normalizeOptions(data)
  },

  // ============================================================
  // STATUS — ✅ MASIH DIPAKAI
  // ============================================================
  async getStatus(): Promise<{
    userId: number
    hasCv: boolean
    cvUrl?: string
    cvSource?: CvSource
    cvGeneratedAt?: string
    message?: string
  }> {
    const { data } = await api.get('/me/cv/status')
    return data
  },

  // ============================================================
  // PREFERENCES — ✅ MASIH DIPAKAI
  // ============================================================
  async updatePreferences(
    prefs: Partial<CvPreferences>,
    merge: boolean = true
  ): Promise<{ cvPreferences: CvPreferences }> {
    const payload = serializePreferences(prefs)
    const { data } = await api.put(
      `/profile/cv-preferences?merge=${merge}`,
      payload
    )
    return {
      cvPreferences: normalizePreferences(data?.cvPreferences),
    }
  },

  async resetPreferences(): Promise<{ cvPreferences: CvPreferences }> {
    const { data } = await api.delete('/profile/cv-preferences')
    return {
      cvPreferences: normalizePreferences(data?.cvPreferences),
    }
  },

  // ============================================================
  // ⚠️ DEPRECATED — JANGAN DIPAKAI LAGI
  // ============================================================
  // Method di bawah ini hanya dipertahankan untuk backward compat.
  // Setelah 1-2 minggu stabil, HAPUS semua method di bawah.
  // ============================================================

  /**
   * @deprecated Sejak migrasi full frontend.
   * Generate PDF sekarang di frontend via `generateAndDownloadPdf()`.
   *
   * @see {@link @/services/cvPdfService.generateAndDownloadPdf}
   * @see {@link @/services/cvHtmlRenderer.renderCvHtml}
   */
  async generate(_template?: CvTemplate): Promise<CvGenerateResult> {
    if (import.meta.env.DEV) {
      console.warn(
        '[cvService.generate] DEPRECATED — pakai generateAndDownloadPdf() di frontend'
      )
    }
    const { data } = await api.post(
      '/me/cv/generate',
      null,
      { params: _template ? { template: _template } : {} }
    )
    return normalizeGenerateResult(data)
  },

  /**
   * @deprecated Sejak migrasi full frontend.
   * Preview HTML sekarang di-render via `renderCvHtml()`.
   *
   * @see {@link @/services/cvHtmlRenderer.renderCvHtml}
   */
  async getPreviewBlob(_template?: CvTemplate): Promise<string> {
    if (import.meta.env.DEV) {
      console.warn(
        '[cvService.getPreviewBlob] DEPRECATED — pakai renderCvHtml() di frontend'
      )
    }
    const res = await api.get('/me/cv/preview', {
      params: _template ? { template: _template } : {},
      responseType: 'blob',
    })
    const blob = new Blob([res.data], {
      type: 'text/html;charset=utf-8',
    })
    return URL.createObjectURL(blob)
  },

  /**
   * @deprecated Sejak migrasi full frontend.
   * Preview HTML sekarang di-render via `renderCvHtml()`.
   *
   * @see {@link @/services/cvHtmlRenderer.renderCvHtml}
   */
  async getPreviewHtml(_template?: CvTemplate): Promise<string> {
    if (import.meta.env.DEV) {
      console.warn(
        '[cvService.getPreviewHtml] DEPRECATED — pakai renderCvHtml() di frontend'
      )
    }
    const { data } = await api.get('/me/cv/preview', {
      params: _template ? { template: _template } : {},
      responseType: 'text',
    })
    return data
  },
}

export default cvService