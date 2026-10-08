import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { databaseStatusService } from '@/services/databaseStatusService'
import { backupService } from '@/services/backupService'
import { autoDownloadBlob, formatBytes } from '@/utils/download'
import { RestoreDialog } from './RestoreDialog'
import type { DatabaseStatus, BackupProgress } from '@/types/backup'

export function BackupTab() {
  const toast = useRef<Toast>(null)

  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [progress, setProgress] = useState<BackupProgress>({
    phase: 'idle',
  })

  const [restoreVisible, setRestoreVisible] = useState(false)

  // ============================================================
  // FETCH STATUS
  // ============================================================
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setStatusLoading(true)
      setStatusError(null)
      const data = await databaseStatusService.getStatus()
      setStatus(data)
    } catch (err: any) {
      console.error(err)
      setStatusError(err?.response?.data?.message || 'Gagal cek status DB')
    } finally {
      setStatusLoading(false)
    }
  }

  // ============================================================
  // BACKUP
  // ============================================================
  const handleBackup = async () => {
    if (progress.phase === 'generating' || progress.phase === 'downloading') {
      return
    }

    try {
      setProgress({
        phase: 'generating',
        message: 'Membuat backup di server...',
      })

      const result = await backupService.streamBackup()

      setProgress({
        phase: 'downloading',
        message: 'Menyimpan file ke folder Download...',
      })

      autoDownloadBlob(result.blob, result.filename)

      setProgress({
        phase: 'done',
        message: `Backup tersimpan: ${result.filename}`,
      })

      toast.current?.show({
        severity: 'success',
        summary: '✅ Backup Berhasil',
        detail: `${result.filename} (${formatBytes(result.sizeBytes)})`,
        life: 5000,
      })

      setTimeout(() => setProgress({ phase: 'idle' }), 3000)
    } catch (err: any) {
      console.error(err)

      let errMsg = 'Backup gagal. Coba lagi.'
      if (err?.response?.data?.message) {
        errMsg = err.response.data.message
      } else if (err?.message) {
        errMsg = err.message
      }

      setProgress({ phase: 'error', message: errMsg })

      toast.current?.show({
        severity: 'error',
        summary: '❌ Backup Gagal',
        detail: errMsg,
        life: 5000,
      })

      setTimeout(() => setProgress({ phase: 'idle' }), 5000)
    }
  }

  const isWorking =
    progress.phase === 'generating' || progress.phase === 'downloading'

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <>
      <Toast ref={toast} />

      <div className="backup-tab">
        {/* STATUS */}
        <div className="backup-section">
          <h4 className="backup-section-title">
            <i className="pi pi-database" />
            Status Database
          </h4>

          {statusLoading && (
            <div className="backup-status-card backup-status-loading">
              <i className="pi pi-spin pi-spinner" />
              <span>Memeriksa koneksi...</span>
            </div>
          )}

          {!statusLoading && statusError && (
            <div className="backup-status-card backup-status-error">
              <span className="backup-status-icon">
                <i className="pi pi-times-circle" />
              </span>
              <div className="backup-status-info">
                <strong>Tidak Terhubung</strong>
                <small>{statusError}</small>
              </div>
              <Button
                icon="pi pi-refresh"
                rounded
                text
                onClick={fetchStatus}
                tooltip="Coba lagi"
              />
            </div>
          )}

          {!statusLoading && status?.connected && (
            <div className="backup-status-card backup-status-connected">
              <span className="backup-status-icon">
                <i className="pi pi-check-circle" />
              </span>
              <div className="backup-status-info">
                <strong>✅ Terhubung</strong>
                <small>
                  {status.version} • {status.databaseName}
                </small>
                <small className="backup-status-host">
                  {status.host}:{status.port}
                </small>
              </div>
              <Button
                icon="pi pi-refresh"
                rounded
                text
                onClick={fetchStatus}
                tooltip="Refresh status"
              />
            </div>
          )}
        </div>

        {/* BACKUP */}
        <div className="backup-section">
          <h4 className="backup-section-title">
            <i className="pi pi-cloud-download" />
            Backup Database
          </h4>

          <div className="backup-info-box">
            <i className="pi pi-info-circle" />
            <span>
              File backup akan <strong>otomatis terunduh</strong> ke folder{' '}
              <strong>Download</strong> browser kamu.
            </span>
          </div>

          <Button
            label={
              progress.phase === 'generating'
                ? 'Membuat backup...'
                : progress.phase === 'downloading'
                ? 'Menyimpan file...'
                : '💾 Backup Sekarang'
            }
            icon={
              isWorking
                ? 'pi pi-spin pi-spinner'
                : 'pi pi-cloud-download'
            }
            onClick={handleBackup}
            disabled={isWorking || !status?.connected}
            className="backup-button"
          />

          {progress.phase !== 'idle' && (
            <div
              className={`backup-progress backup-progress-${progress.phase}`}
            >
              <div className="backup-progress-bar">
                <div
                  className="backup-progress-bar-fill"
                  style={{
                    width:
                      progress.phase === 'generating'
                        ? '40%'
                        : progress.phase === 'downloading'
                        ? '80%'
                        : '100%',
                    background:
                      progress.phase === 'error'
                        ? '#ef4444'
                        : progress.phase === 'done'
                        ? '#10b981'
                        : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                  }}
                />
              </div>
              <p className="backup-progress-text">
                {progress.phase === 'generating' && (
                  <>
                    <i className="pi pi-spin pi-spinner" /> {progress.message}
                  </>
                )}
                {progress.phase === 'downloading' && (
                  <>
                    <i className="pi pi-spin pi-spinner" /> {progress.message}
                  </>
                )}
                {progress.phase === 'done' && (
                  <>
                    <i className="pi pi-check-circle" /> {progress.message}
                  </>
                )}
                {progress.phase === 'error' && (
                  <>
                    <i className="pi pi-times-circle" /> {progress.message}
                  </>
                )}
              </p>
            </div>
          )}

          <small className="backup-hint">
            <i className="pi pi-shield" /> File akan otomatis dihapus dari
            server setelah kamu download.
          </small>
        </div>

        {/* ⭐ RESTORE */}
        <div className="backup-section">
          <h4 className="backup-section-title backup-section-title-danger">
            <i className="pi pi-exclamation-triangle" />
            Restore Database
          </h4>

          <div className="backup-danger-box">
            <i className="pi pi-exclamation-triangle" />
            <div>
              <strong>⚠️ Operasi Berbahaya</strong>
              <p>
                Restore akan <strong>MENIMPA semua data</strong> dengan data
                dari file backup. Tindakan ini tidak bisa di-undo.
              </p>
              <p>
                Auto-backup akan dibuat sebelum restore (safety net).
              </p>
            </div>
          </div>

          <Button
            label="📁 Restore dari File"
            icon="pi pi-upload"
            severity="danger"
            outlined
            onClick={() => setRestoreVisible(true)}
            disabled={!status?.connected}
            className="backup-button backup-button-danger"
          />
        </div>
      </div>

      {/* RESTORE DIALOG */}
      <RestoreDialog
        visible={restoreVisible}
        onHide={() => setRestoreVisible(false)}
        onSuccess={fetchStatus}
      />
    </>
  )
}