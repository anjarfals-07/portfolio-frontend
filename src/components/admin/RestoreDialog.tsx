import { useEffect, useRef, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { backupService } from '@/services/backupService'
import { formatBytes } from '@/utils/download'
import type { RestoreProgress } from '@/types/backup'

interface Props {
  visible: boolean
  onHide: () => void
  onSuccess?: () => void
}

const CONFIRM_WORD = 'RESTORE'
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500 MB

export function RestoreDialog({ visible, onHide, onSuccess }: Props) {
  const toast = useRef<Toast>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [checked, setChecked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<RestoreProgress>({
    phase: 'idle',
    percent: 0,
  })

  // Reset saat dialog dibuka
  useEffect(() => {
    if (visible) {
      setFile(null)
      setConfirmText('')
      setChecked(false)
      setError(null)
      setProgress({ phase: 'idle', percent: 0 })
    }
  }, [visible])

  // ============================================================
  // FILE HANDLER
  // ============================================================
  const handleFileSelect = (selectedFile: File | null) => {
    setError(null)
    if (!selectedFile) return

    // Validasi size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`File terlalu besar. Max: ${formatBytes(MAX_FILE_SIZE)}`)
      return
    }

    // Validasi extension
    const lower = selectedFile.name.toLowerCase()
    const isValid =
      lower.endsWith('.sql') ||
      lower.endsWith('.sql.gz') ||
      lower.endsWith('.gz')

    if (!isValid) {
      setError('Format file harus .sql, .sql.gz, atau .gz')
      return
    }

    setFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleFileSelect(e.dataTransfer.files?.[0] || null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // ============================================================
  // SUBMIT
  // ============================================================
  const isProcessing =
    progress.phase === 'uploading' || progress.phase === 'restoring'

  const canSubmit =
    file !== null &&
    checked &&
    confirmText.trim().toUpperCase() === CONFIRM_WORD &&
    !isProcessing

  const handleSubmit = async () => {
    if (!file) return

    try {
      setError(null)
      setProgress({
        phase: 'uploading',
        percent: 10,
        message: 'Mengupload file...',
      })

      setTimeout(() => {
        setProgress({
          phase: 'restoring',
          percent: 40,
          message: 'Restore sedang berjalan...',
        })
      }, 500)

      const result = await backupService.restoreFromFile(file)

      setProgress({
        phase: 'done',
        percent: 100,
        message: result.message,
      })

      toast.current?.show({
        severity: 'success',
        summary: '✅ Restore Berhasil',
        detail: `${result.tablesRestored} tables, ${result.userCount} users`,
        life: 6000,
      })

      onSuccess?.()

      // Auto-close + prompt logout
      setTimeout(() => {
        onHide()
        setTimeout(() => {
          const doLogout = window.confirm(
            'Restore berhasil! Logout untuk refresh session?'
          )
          if (doLogout) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
        }, 300)
      }, 2500)
    } catch (err: any) {
      console.error(err)

      let errMsg = 'Restore gagal. Coba lagi.'
      if (err?.response?.data?.message) {
        errMsg = err.response.data.message
      } else if (err?.message) {
        errMsg = err.message
      }

      setProgress({ phase: 'error', percent: 0, message: errMsg })
      setError(errMsg)

      toast.current?.show({
        severity: 'error',
        summary: '❌ Restore Gagal',
        detail: errMsg,
        life: 6000,
      })
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <Toast ref={toast} />

      <Dialog
        visible={visible}
        onHide={onHide}
        closable={!isProcessing}
        closeOnEscape={!isProcessing}
        dismissableMask={false}
        header={
          <div className="restore-dialog-header">
            <span className="restore-dialog-icon">
              <i className="pi pi-exclamation-triangle" />
            </span>
            <div className="restore-dialog-text">
              <strong>Restore Database</strong>
              <small>Operasi ini akan MENIMPA semua data</small>
            </div>
          </div>
        }
        style={{ width: '540px', maxWidth: '95vw' }}
        modal
        blockScroll
        className="restore-dialog"
        footer={
          <div className="restore-dialog-footer">
            <Button
              label="Batal"
              icon="pi pi-times"
              severity="secondary"
              outlined
              onClick={onHide}
              disabled={isProcessing}
            />
            <Button
              label={isProcessing ? 'Memproses...' : 'Restore Sekarang'}
              icon={
                isProcessing
                  ? 'pi pi-spin pi-spinner'
                  : 'pi pi-exclamation-triangle'
              }
              severity="danger"
              onClick={handleSubmit}
              disabled={!canSubmit}
            />
          </div>
        }
      >
        <div className="restore-body">
          {/* ERROR */}
          {error && (
            <div className="restore-error">
              <i className="pi pi-times-circle" />
              <span>{error}</span>
            </div>
          )}

          {/* WARNING */}
          {!isProcessing && progress.phase !== 'done' && (
            <div className="restore-warning">
              <i className="pi pi-exclamation-triangle" />
              <div>
                <strong>⚠️ PERINGATAN</strong>
                <p>
                  Restore akan <strong>MENIMPA semua data</strong> saat ini
                  dengan data dari file backup. Tindakan ini{' '}
                  <strong>TIDAK BISA di-undo</strong>.
                </p>
                <p>
                  Auto-backup akan dibuat sebelum restore (safety net).
                </p>
              </div>
            </div>
          )}

          {/* UPLOAD AREA */}
          {!file && !isProcessing && progress.phase !== 'done' && (
            <div
              className="restore-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="pi pi-cloud-upload" />
              <strong>Klik untuk pilih file atau drag & drop</strong>
              <small>Format: .sql, .sql.gz, .gz (max 500MB)</small>
            </div>
          )}

          {/* FILE PREVIEW */}
          {file && !isProcessing && progress.phase !== 'done' && (
            <div className="restore-file-preview">
              <span className="restore-file-icon">
                <i className="pi pi-file" />
              </span>
              <div className="restore-file-info">
                <strong>{file.name}</strong>
                <small>{formatBytes(file.size)}</small>
              </div>
              <Button
                icon="pi pi-times"
                rounded
                text
                severity="secondary"
                onClick={() => setFile(null)}
                tooltip="Ganti file"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.gz,.sql.gz"
            hidden
            onChange={(e) =>
              handleFileSelect(e.target.files?.[0] || null)
            }
          />

          {/* CONFIRM CHECKBOX */}
          {file && !isProcessing && progress.phase !== 'done' && (
            <>
              <label className="restore-checkbox">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <span>
                  Saya paham tindakan ini akan <strong>menimpa semua data</strong>{' '}
                  dan tidak bisa di-undo.
                </span>
              </label>

              <div className="restore-confirm-input">
                <label>
                  Ketik <strong>{CONFIRM_WORD}</strong> untuk konfirmasi:
                </label>
                <InputText
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={CONFIRM_WORD}
                  className={`w-full ${
                    confirmText &&
                    confirmText.trim().toUpperCase() !== CONFIRM_WORD
                      ? 'p-invalid'
                      : ''
                  }`}
                  disabled={isProcessing}
                  autoComplete="off"
                />
              </div>
            </>
          )}

          {/* PROGRESS */}
          {isProcessing && (
            <div className="restore-progress">
              <div className="restore-progress-bar">
                <div
                  className="restore-progress-bar-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="restore-progress-text">
                <i className="pi pi-spin pi-spinner" /> {progress.message}
              </p>
              <small className="restore-progress-hint">
                ⓘ Jangan tutup halaman ini
              </small>
            </div>
          )}

          {/* DONE */}
          {progress.phase === 'done' && (
            <div className="restore-success">
              <i className="pi pi-check-circle" />
              <strong>Restore Berhasil!</strong>
              <p>{progress.message}</p>
            </div>
          )}
        </div>
      </Dialog>
    </>
  )
}