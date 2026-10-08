// ============================================================
// CvPreviewIframe — Preview CV + Download PDF (MODERN)
// ============================================================
// v5 FINAL:
// - HAPUS import './cv.css' (biar tidak bocor ke iframe)
// - Pakai Blob URL (bukan srcDoc)
// - Sandbox ketat (tanpa allow-same-origin)
// - ⭐ Preview bisa di-SCROLL (bukan fixed aspect-ratio)
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { renderCvHtml } from '@/services/cvHtmlRenderer'
import {
  generateAndDownloadPdf,
  type PdfStage,
} from '@/services/cvPdfService'
import type { CvRenderData } from '@/services/cvHtmlRenderer'
import type { CvPreferences } from '@/types/cv'

// ⚠️ JANGAN import './cv.css' di sini — biar tidak bocor ke iframe

export interface CvPreviewIframeProps {
  preferences: CvPreferences
  renderData: CvRenderData | null
  debounceDelay?: number
  refreshKey?: number | string
  onLoad?: () => void
  onError?: (err: Error) => void
  disabled?: boolean
  template?: string
  pdfFilename?: string
  hideDownloadButton?: boolean
}

const STAGE_LABEL: Record<PdfStage, string> = {
  init: 'Menyiapkan...',
  rendering: 'Merender HTML...',
  'loading-images': 'Memuat gambar...',
  'loading-fonts': 'Memuat font...',
  generating: 'Membuat PDF...',
  finalizing: 'Menyelesaikan...',
  done: 'Selesai',
}

export default function CvPreviewIframe({
  preferences,
  renderData,
  debounceDelay = 300,
  refreshKey,
  onLoad,
  onError,
  disabled = false,
  template,
  pdfFilename,
  hideDownloadButton = false,
}: CvPreviewIframeProps) {
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [pdfProgress, setPdfProgress] = useState(0)
  const [pdfStage, setPdfStage] = useState<PdfStage>('init')
  const [error, setError] = useState<string | null>(null)
  const [html, setHtml] = useState<string>('')
  const [blobUrl, setBlobUrl] = useState<string>('')

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  /* ------------------------------------------------------------
     RENDER HTML
     ------------------------------------------------------------ */
  useEffect(() => {
    if (disabled) return
    if (!renderData) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return

      setLoading(true)
      setError(null)

      try {
        const previewHtml = renderCvHtml(renderData, preferences, {
          template: template as any,
        })

        if (!mountedRef.current) return

        console.log('📄 Preview HTML length:', previewHtml.length)
        setHtml(previewHtml)
        onLoad?.()
      } catch (err: unknown) {
        if (!mountedRef.current) return

        const message =
          err instanceof Error ? err.message : 'Gagal render preview'
        setError(message)
        onError?.(err instanceof Error ? err : new Error(message))
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }, debounceDelay)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [
    renderData,
    preferences,
    template,
    refreshKey,
    debounceDelay,
    disabled,
    onLoad,
    onError,
  ])

  /* ------------------------------------------------------------
     CONVERT HTML → BLOB URL
     ------------------------------------------------------------ */
  useEffect(() => {
    if (!html) {
      setBlobUrl('')
      return
    }

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [html])

  /* ------------------------------------------------------------
     DOWNLOAD
     ------------------------------------------------------------ */
  const handleDownload = useCallback(async () => {
    if (!html) {
      console.warn('⚠️ Preview HTML belum siap')
      return
    }

    console.log('📄 Generating PDF from HTML length:', html.length)

    setDownloading(true)
    setPdfProgress(0)
    setPdfStage('init')

    try {
      const filename = pdfFilename || 'CV'

      await generateAndDownloadPdf({
        html,
        filename,
        format: 'a4',
        orientation: 'portrait',
        scale: 2,
        margin: 0,
        onProgress: (progress, stage) => {
          if (!mountedRef.current) return
          setPdfProgress(progress)
          setPdfStage(stage)
        },
      })

      console.log('✅ PDF downloaded')
    } catch (err) {
      console.error('❌ Failed to download PDF:', err)
    } finally {
      setTimeout(() => {
        if (mountedRef.current) {
          setDownloading(false)
          setPdfProgress(0)
          setPdfStage('init')
        }
      }, 800)
    }
  }, [html, pdfFilename])

  if (!renderData && !loading && !error) {
    return (
      <div className="cv-scope cv-preview-wrapper">
        <div className="cv-preview-empty">
          <div className="cv-preview-empty-icon">
            <i className="pi pi-file-pdf" />
          </div>
          <strong>Preview CV</strong>
          <span className="cv-text-xs cv-text-muted">
            Memuat data profile...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="cv-scope cv-preview-wrapper">
      <div className="cv-preview-header">
        <div className="cv-preview-header-title">
          <span className="cv-preview-header-dot" />
          <i className="pi pi-eye" />
          <span>Live Preview</span>
          {loading && (
            <i className="pi pi-spin pi-spinner cv-text-xs cv-text-muted" />
          )}
        </div>

        {!hideDownloadButton && html && !error && (
          <Button
            label={downloading ? STAGE_LABEL[pdfStage] : 'Download PDF'}
            icon={downloading ? 'pi pi-spin pi-spinner' : 'pi pi-download'}
            size="small"
            onClick={handleDownload}
            disabled={downloading || loading || disabled}
            type="button"
            className="cv-preview-download-btn"
          />
        )}
      </div>

      {downloading && (
        <div className="cv-preview-progress">
          <div
            className="cv-preview-progress-fill"
            style={{ width: `${pdfProgress}%` }}
          />
        </div>
      )}

      {/* ⭐ Frame dengan scroll */}
      <div className="cv-preview-frame">
        {loading && (
          <div className="cv-preview-loading">
            <div className="cv-preview-loading-spinner" />
            <span className="cv-preview-loading-text">Memuat preview...</span>
          </div>
        )}

        {error && (
          <div className="cv-preview-empty" style={{ aspectRatio: 'auto' }}>
            <div className="cv-preview-empty-icon is-error">
              <i className="pi pi-exclamation-triangle" />
            </div>
            <strong>Gagal render preview</strong>
            <span className="cv-text-xs cv-text-muted">{error}</span>
          </div>
        )}

        {/* Blob URL + sandbox ketat */}
        {blobUrl && !error && (
          <iframe
            title="CV Preview"
            src={blobUrl}
            sandbox="allow-scripts"
            referrerPolicy="no-referrer"
            loading="lazy"
            className="cv-preview-iframe"
          />
        )}
      </div>

      <div className="cv-preview-hint">
        <i className="pi pi-sparkles" />
        <span>
          Preview ini <strong>100% sama</strong> dengan PDF hasil download.
        </span>
      </div>
    </div>
  )
}