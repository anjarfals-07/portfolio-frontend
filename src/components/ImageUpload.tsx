import { useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { ProgressBar } from 'primereact/progressbar'
import { Message } from 'primereact/message'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Image } from 'primereact/image'
import { Toast } from 'primereact/toast'
import { uploadService } from '@/services/uploadService'
import ImageDeleteDialog from './ImageDeleteDialog'

/* ============================================================
   TYPES
   ============================================================ */

type AspectRatioKey = 'square' | 'video' | 'wide' | 'circle'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null, publicId?: string) => void
  label?: string
  aspectRatio?: AspectRatioKey
  maxSizeMB?: number
  disabled?: boolean
  compact?: boolean
}

interface AspectConfig {
  w: number
  h: number
  radius: string
  label: string
  isCircle?: boolean
}

const ASPECT_RATIOS: Record<AspectRatioKey, AspectConfig> = {
  square: { w: 200, h: 200, radius: '16px', label: '1:1' },
  video: { w: 280, h: 158, radius: '16px', label: '16:9' },
  wide: { w: 320, h: 180, radius: '16px', label: '16:9' },
  circle: { w: 200, h: 200, radius: '50%', label: 'Avatar', isCircle: true },
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function ImageUpload({
  value,
  onChange,
  label = 'Upload Gambar',
  aspectRatio = 'video',
  maxSizeMB = 10,
  disabled = false,
  compact = false,
}: ImageUploadProps) {
  const toast = useRef<Toast>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [showUrlDialog, setShowUrlDialog] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const aspect = ASPECT_RATIOS[aspectRatio]
  const isCircle = aspect.isCircle === true

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File harus berupa gambar (JPG, PNG, WEBP, GIF)'
    }
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB, file kamu ${formatBytes(file.size)}`
    }
    return null
  }

  const uploadFile = async (file: File) => {
    if (disabled) return
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      toast.current?.show({
        severity: 'error',
        summary: 'File Invalid',
        detail: validationError,
        life: 4000,
      })
      return
    }
    setError(null)
    setFileName(file.name)
    setFileSize(file.size)
    setUploading(true)
    setProgress(0)
    try {
      const result = await uploadService.uploadImage(file, (percent) => {
        setProgress(percent)
      })
      onChange(result.url, result.publicId)
      toast.current?.show({
        severity: 'success',
        summary: 'Upload Berhasil',
        detail: 'Gambar berhasil di-upload',
        life: 3000,
      })
    } catch (err) {
      console.error(err)
      setError('Gagal upload gambar. Coba lagi.')
      toast.current?.show({
        severity: 'error',
        summary: 'Upload Gagal',
        detail: 'Cek koneksi & coba lagi',
        life: 4000,
      })
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!uploading && !disabled) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (uploading || disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  // ⭐ Hapus gambar — pakai custom dialog
  const handleRemove = () => {
    if (disabled) return
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    onChange(null)
    setFileName(null)
    setFileSize(null)
    setShowDeleteDialog(false)
    toast.current?.show({
      severity: 'info',
      summary: 'Dihapus',
      detail: 'Gambar berhasil dihapus',
      life: 2000,
    })
  }

  const handleCancelDelete = () => {
    setShowDeleteDialog(false)
  }

  const handleUrlSubmit = () => {
    const url = urlInput.trim()
    if (!url) return
    const imageExtRegex = /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i
    if (!url.startsWith('http') || !imageExtRegex.test(url)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'URL Mencurigakan',
        detail: 'Pastikan URL mengarah ke gambar (JPG, PNG, dll)',
        life: 4000,
      })
    }
    onChange(url)
    setUrlInput('')
    setShowUrlDialog(false)
    toast.current?.show({
      severity: 'success',
      summary: 'URL Diterapkan',
      detail: 'Gambar dari URL berhasil dimuat',
      life: 2000,
    })
  }

  const triggerFileInput = () => {
    if (disabled || uploading) return
    fileInputRef.current?.click()
  }

  const openUrlDialog = () => {
    if (disabled || uploading) return
    setUrlInput(value || '')
    setShowUrlDialog(true)
  }

  const handlePreviewClick = () => {
    if (disabled || uploading) return
    if (value) {
      setShowPreview(true)
    } else {
      triggerFileInput()
    }
  }

  return (
    <>
      <Toast ref={toast} />

      <div
        className={`iu ${isCircle ? 'iu-circle-mode' : ''} ${
          compact ? 'iu-compact' : ''
        }`}
      >
        {label && (
          <div className="iu-label-row">
            <label className="iu-label">
              {isCircle && <i className="pi pi-user"></i>}
              <span>{label}</span>
              <span className="iu-badge">{aspect.label}</span>
            </label>
            {value && !uploading && (
              <button
                type="button"
                className="iu-remove-link"
                onClick={handleRemove}
                disabled={disabled}
              >
                <i className="pi pi-trash"></i>
                Hapus
              </button>
            )}
          </div>
        )}

        <div className={`iu-body ${isCircle ? 'iu-body-circle' : ''}`}>
          <div
            className={`iu-preview ${isDragging ? 'iu-dragging' : ''} ${
              uploading ? 'iu-busy' : ''
            } ${isCircle ? 'iu-circle' : ''} ${value ? 'iu-has-value' : ''}`}
            style={{
              width: aspect.w,
              height: aspect.h,
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handlePreviewClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handlePreviewClick()
              }
            }}
            aria-label={value ? 'Lihat gambar' : 'Upload gambar'}
          >
            {value ? (
              <>
                <img src={value} alt="Preview" />
                {!uploading && (
                  <div className="iu-overlay">
                    <div className="iu-overlay-actions">
                      <button
                        type="button"
                        className="iu-overlay-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          triggerFileInput()
                        }}
                        title="Ganti gambar"
                        disabled={disabled}
                      >
                        <i className="pi pi-refresh"></i>
                      </button>
                      <button
                        type="button"
                        className="iu-overlay-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowPreview(true)
                        }}
                        title="Lihat penuh"
                      >
                        <i className="pi pi-search-plus"></i>
                      </button>
                      <button
                        type="button"
                        className="iu-overlay-btn iu-overlay-btn-danger"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove()
                        }}
                        title="Hapus"
                        disabled={disabled}
                      >
                        <i className="pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="iu-placeholder">
                <div className="iu-placeholder-icon">
                  <i
                    className={`pi ${
                      isDragging
                        ? 'pi-cloud-upload'
                        : isCircle
                        ? 'pi-user'
                        : 'pi-image'
                    }`}
                  ></i>
                </div>
                <strong className="iu-placeholder-title">
                  {isDragging
                    ? 'Lepaskan untuk upload'
                    : isCircle
                    ? 'Upload Avatar'
                    : 'Drag & drop gambar'}
                </strong>
                <span className="iu-placeholder-hint">
                  atau klik untuk pilih file
                </span>
              </div>
            )}

            {uploading && (
              <div className="iu-progress-overlay">
                <div className="iu-progress-ring">
                  <svg viewBox="0 0 36 36">
                    <circle
                      className="iu-progress-ring-bg"
                      cx="18"
                      cy="18"
                      r="15.9155"
                    />
                    <circle
                      className="iu-progress-ring-fg"
                      cx="18"
                      cy="18"
                      r="15.9155"
                      strokeDasharray={`${progress}, 100`}
                    />
                  </svg>
                  <span className="iu-progress-value">{progress}%</span>
                </div>
                <span className="iu-progress-label">Mengupload...</span>
              </div>
            )}

            {isDragging && <div className="iu-drag-ring" />}
          </div>

          {!compact && (
            <div className="iu-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={disabled}
              />

              <Button
                type="button"
                label={value ? 'Ganti' : 'Pilih Gambar'}
                icon="pi pi-upload"
                onClick={triggerFileInput}
                disabled={uploading || disabled}
                size="small"
                className="iu-btn iu-btn-primary"
              />

              <Button
                type="button"
                label="URL"
                icon="pi pi-link"
                onClick={openUrlDialog}
                disabled={uploading || disabled}
                size="small"
                severity="secondary"
                outlined
                className="iu-btn"
              />

              {value && (
                <Button
                  type="button"
                  label="Hapus"
                  icon="pi pi-trash"
                  severity="danger"
                  outlined
                  onClick={handleRemove}
                  disabled={uploading || disabled}
                  size="small"
                  className="iu-btn"
                />
              )}

              {fileName && fileSize && !uploading && value && (
                <div className="iu-file-info">
                  <i className="pi pi-file"></i>
                  <div className="iu-file-details">
                    <span className="iu-file-name" title={fileName}>
                      {fileName.length > 18
                        ? fileName.substring(0, 15) + '...'
                        : fileName}
                    </span>
                    <span className="iu-file-size">
                      {formatBytes(fileSize)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {compact && (
            <div className="iu-compact-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={disabled}
              />
              <Button
                type="button"
                label={value ? 'Ganti' : 'Pilih'}
                icon="pi pi-upload"
                onClick={triggerFileInput}
                disabled={uploading || disabled}
                size="small"
                className="iu-btn iu-btn-primary"
              />
              <Button
                type="button"
                icon="pi pi-link"
                onClick={openUrlDialog}
                disabled={uploading || disabled}
                size="small"
                severity="secondary"
                outlined
                className="iu-btn"
                tooltip="Paste URL"
              />
            </div>
          )}
        </div>

        {uploading && !isCircle && (
          <div className="iu-progress-line">
            <ProgressBar
              value={progress}
              showValue={false}
              style={{ height: '4px' }}
              className="iu-progress-bar"
            />
          </div>
        )}

        {error && (
          <Message severity="error" text={error} className="w-full" />
        )}

        {!error && !compact && (
          <small className="iu-hint">
            <i className="pi pi-info-circle"></i>
            {isCircle
              ? `Format: JPG, PNG, WEBP. Maks ${maxSizeMB}MB. Rekomendasi 500×500px.`
              : `Format: JPG, PNG, WEBP, GIF. Maks ${maxSizeMB}MB. Bisa drag & drop atau paste URL.`}
          </small>
        )}
      </div>

      {/* Paste URL Dialog */}
      <Dialog
        header="Paste URL Gambar"
        visible={showUrlDialog}
        onHide={() => setShowUrlDialog(false)}
        style={{ width: '500px', maxWidth: '95vw' }}
        modal
        footer={
          <div className="iu-dialog-footer">
            <Button
              label="Batal"
              icon="pi pi-times"
              severity="secondary"
              outlined
              onClick={() => setShowUrlDialog(false)}
            />
            <Button
              label="Gunakan URL"
              icon="pi pi-check"
              onClick={handleUrlSubmit}
              disabled={!urlInput.trim()}
            />
          </div>
        }
      >
        <div className="iu-dialog-field">
          <label className="iu-dialog-label">URL Gambar</label>
          <InputText
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full"
            autoFocus
          />
          <small className="iu-dialog-hint">
            URL harus mengarah langsung ke file gambar
          </small>
        </div>

        {urlInput && (
          <div className="iu-url-preview">
            <label className="iu-dialog-label">Preview:</label>
            <div className="iu-url-preview-box">
              <img
                src={urlInput}
                alt="URL Preview"
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = 'none'
                  const p = t.parentElement
                  if (p) {
                    p.innerHTML =
                      '<div class="iu-url-error"><i class="pi pi-exclamation-triangle"></i><span>Gambar tidak bisa dimuat</span></div>'
                  }
                }}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Preview Full Dialog */}
      <Dialog
        visible={showPreview}
        onHide={() => setShowPreview(false)}
        modal
        dismissableMask
        style={{ maxWidth: '90vw' }}
        header="Preview Gambar"
        className="iu-preview-dialog"
      >
        {value && (
          <Image
            src={value}
            alt="Full preview"
            preview
            className="iu-full-preview"
            imageClassName="iu-full-preview-img"
          />
        )}
      </Dialog>

      {/* ⭐ Custom Delete Dialog — PASTI muncul */}
      <ImageDeleteDialog
        visible={showDeleteDialog}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}

export default ImageUpload