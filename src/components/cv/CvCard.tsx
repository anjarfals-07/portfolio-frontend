// ============================================================
// CvCard — Kartu CV di ManageProfile
// ============================================================
// Fitur:
// - Tampilkan status CV (ada / belum ada)
// - Info source (Upload / Generated) + timestamp
// - Tombol: Upload PDF, Generate, Download, Delete
// - Drag & drop upload
// - Delete pakai CvDeleteDialog (custom portal)
// ============================================================

import { useCallback, useMemo, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { ProgressBar } from 'primereact/progressbar'

import CvDeleteDialog from './CvDeleteDialog'
import type { CvSource } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvCardProps {
  cvUrl?: string | null
  cvSource?: CvSource | null
  cvGeneratedAt?: string | null

  onUpload?: (file: File) => void | Promise<void>
  onGenerate?: () => void
  onDelete?: () => void | Promise<void>

  uploadProgress?: number
  disabled?: boolean
  maxSizeMB?: number
}

/* ============================================================
   HELPERS
   ============================================================ */

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '-'
  }
}

function getFilename(url: string): string {
  try {
    return decodeURIComponent(url.split('/').pop() ?? 'cv.pdf')
  } catch {
    return 'cv.pdf'
  }
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvCard({
  cvUrl,
  cvSource,
  cvGeneratedAt,
  onUpload,
  onGenerate,
  onDelete,
  uploadProgress,
  disabled = false,
  maxSizeMB = 10,
}: CvCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  // ⭐ State untuk dialog delete
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const hasCv = !!cvUrl
  const isUploading = uploadProgress !== undefined

  /* ------------------------------------------------------------
     SOURCE INFO
     ------------------------------------------------------------ */
  const sourceInfo = useMemo(() => {
    if (cvSource === 'GENERATED') {
      return {
        label: 'Auto-generated',
        icon: 'pi pi-sparkles',
        className: 'is-generated',
      }
    }
    if (cvSource === 'UPLOAD') {
      return {
        label: 'Upload',
        icon: 'pi pi-upload',
        className: 'is-upload',
      }
    }
    return null
  }, [cvSource])

  /* ------------------------------------------------------------
     VALIDATE FILE
     ------------------------------------------------------------ */
  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.type !== 'application/pdf') {
        return 'File harus berformat PDF'
      }
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return 'File harus berformat .pdf'
      }
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        return `File maksimal ${maxSizeMB}MB`
      }
      return null
    },
    [maxSizeMB]
  )

  /* ------------------------------------------------------------
     HANDLE FILE
     ------------------------------------------------------------ */
  const handleFile = useCallback(
    async (file: File) => {
      setLocalError(null)
      const err = validateFile(file)
      if (err) {
        setLocalError(err)
        return
      }
      await onUpload?.(file)
    },
    [validateFile, onUpload]
  )

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) await handleFile(file)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [handleFile]
  )

  /* ------------------------------------------------------------
     DRAG & DROP
     ------------------------------------------------------------ */
  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (disabled) return
      setDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (disabled) return

      const file = e.dataTransfer.files?.[0]
      if (file) await handleFile(file)
    },
    [disabled, handleFile]
  )

  /* ------------------------------------------------------------
     TRIGGER FILE PICKER
     ------------------------------------------------------------ */
  const triggerFilePicker = useCallback(() => {
    if (disabled) return
    fileInputRef.current?.click()
  }, [disabled])

  /* ------------------------------------------------------------
     DELETE DIALOG
     ------------------------------------------------------------ */
  const openDeleteDialog = useCallback(() => {
    if (disabled) return
    setLocalError(null)
    setShowDeleteDialog(true)
  }, [disabled])

  const handleConfirmDelete = useCallback(async () => {
    try {
      setDeleting(true)
      await onDelete?.()
      setShowDeleteDialog(false)
    } catch (err) {
      console.error('Delete failed:', err)
      setLocalError('Gagal menghapus CV. Coba lagi.')
    } finally {
      setDeleting(false)
    }
  }, [onDelete])

  const handleCancelDelete = useCallback(() => {
    if (deleting) return
    setShowDeleteDialog(false)
  }, [deleting])

  /* ------------------------------------------------------------
     RENDER — EMPTY STATE
     ------------------------------------------------------------ */
  if (!hasCv) {
    return (
      <div className="cv-scope">
        <div
          className={`cv-card-empty ${dragging ? 'is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="cv-card-empty-icon">
            <i className="pi pi-file-pdf" />
          </div>

          <h4 className="cv-card-empty-title">Belum ada CV</h4>
          <p className="cv-card-empty-desc">
            Upload file PDF atau generate dari data portfolio kamu
          </p>

          {localError && (
            <div className="cv-card-error">
              <i className="pi pi-exclamation-circle" />
              {localError}
            </div>
          )}

          {isUploading ? (
            <div className="cv-card-upload-progress">
              <ProgressBar
                value={uploadProgress}
                showValue={false}
                style={{ height: '6px' }}
              />
              <span className="cv-text-xs cv-text-muted">
                Mengupload... {uploadProgress}%
              </span>
            </div>
          ) : (
            <div className="cv-card-empty-actions">
              <Button
                label="Upload PDF"
                icon="pi pi-upload"
                onClick={triggerFilePicker}
                disabled={disabled}
                type="button"
              />
              <Button
                label="Generate CV"
                icon="pi pi-sparkles"
                severity="secondary"
                outlined
                onClick={onGenerate}
                disabled={disabled}
                type="button"
              />
            </div>
          )}

          <p className="cv-card-empty-hint">
            atau drop file PDF di sini (maks. {maxSizeMB}MB)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleInputChange}
            hidden
          />
        </div>
      </div>
    )
  }

  /* ------------------------------------------------------------
     RENDER — HAS CV
     ------------------------------------------------------------ */
  return (
    <>
      <div className="cv-scope">
        <div className="cv-card">
          {/* ===== Header ===== */}
          <div className="cv-card-header">
            <div className="cv-card-header-info">
              <div className="cv-card-header-icon">
                <i className="pi pi-file-pdf" />
              </div>
              <div className="cv-card-header-text">
                <h4 className="cv-card-header-title">CV Aktif</h4>
                <div className="cv-card-header-sub">
                  {sourceInfo && (
                    <span
                      className={`cv-card-source-badge ${sourceInfo.className}`}
                    >
                      <i className={sourceInfo.icon} />
                      {sourceInfo.label}
                    </span>
                  )}
                  {cvGeneratedAt && (
                    <span>{formatDate(cvGeneratedAt)}</span>
                  )}
                </div>
              </div>
            </div>

            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              onClick={openDeleteDialog}
              disabled={disabled}
              tooltip="Hapus CV"
              tooltipOptions={{ position: 'top' }}
              type="button"
              aria-label="Hapus CV"
            />
          </div>

          {/* ===== Body ===== */}
          <div className="cv-card-body">
            <div className="cv-card-preview-mini">
              <div className="cv-card-preview-mini-icon">
                <i className="pi pi-file-pdf" />
              </div>
              <div className="cv-card-preview-mini-text">
                <strong>{getFilename(cvUrl!)}</strong>
                <span>Klik preview untuk buka di tab baru</span>
              </div>
              <a
                href={cvUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="cv-card-preview-link"
                aria-label="Preview CV"
              >
                <i className="pi pi-external-link" />
              </a>
            </div>

            {localError && (
              <div className="cv-card-error">
                <i className="pi pi-exclamation-circle" />
                {localError}
              </div>
            )}

            {isUploading && (
              <div className="cv-card-upload-progress">
                <ProgressBar
                  value={uploadProgress}
                  showValue={false}
                  style={{ height: '6px' }}
                />
                <span className="cv-text-xs cv-text-muted">
                  Mengupload... {uploadProgress}%
                </span>
              </div>
            )}
          </div>

          {/* ===== Actions ===== */}
          <div className="cv-card-actions">
            <Button
              label="Download"
              icon="pi pi-download"
              size="small"
              onClick={() => window.open(cvUrl!, '_blank')}
              disabled={disabled}
              type="button"
            />

            <Button
              label="Regenerate"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              size="small"
              onClick={onGenerate}
              disabled={disabled}
              type="button"
            />

            <Button
              label="Upload Ulang"
              icon="pi pi-upload"
              severity="secondary"
              text
              size="small"
              onClick={triggerFilePicker}
              disabled={disabled || isUploading}
              type="button"
            />
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleInputChange}
            hidden
          />
        </div>
      </div>

      {/* ============================================================
          ⭐ DELETE DIALOG — custom portal (pasti muncul)
          ============================================================ */}
      <CvDeleteDialog
        visible={showDeleteDialog}
        filename={cvUrl ? getFilename(cvUrl) : undefined}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}