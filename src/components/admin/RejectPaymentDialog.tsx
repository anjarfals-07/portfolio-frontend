import { useEffect, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'

interface Props {
  visible: boolean
  onHide: () => void
  onSubmit: (reason: string) => Promise<void>
  loading?: boolean
}

const QUICK_REASONS = [
  'Nominal tidak sesuai',
  'Bukti tidak jelas / blur',
  'Bukan bukti transfer yang valid',
  'Bukti sudah pernah dipakai',
  'Transfer ke rekening lain',
]

export function RejectPaymentDialog({
  visible,
  onHide,
  onSubmit,
  loading,
}: Props) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setReason('')
      setError(null)
    }
  }, [visible])

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Alasan wajib diisi')
      return
    }
    try {
      setError(null)
      await onSubmit(reason.trim())
      onHide()
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal menolak')
    }
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="pm-dialog-header">
          <span
            className="pm-dialog-icon"
            style={{
              background: 'rgba(239,68,68,0.12)',
              color: '#ef4444',
            }}
          >
            <i className="pi pi-times-circle" />
          </span>
          <div>
            <strong>Tolak Pembayaran</strong>
            <small>Alasan akan dikirim ke user</small>
          </div>
        </div>
      }
      style={{ width: '480px', maxWidth: '95vw' }}
      modal
      blockScroll
      footer={
        <div className="pm-dialog-footer">
          <Button
            label="Batal"
            icon="pi pi-times"
            severity="secondary"
            outlined
            onClick={onHide}
            disabled={loading}
          />
          <Button
            label={loading ? 'Memproses...' : 'Tolak'}
            icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            severity="danger"
            onClick={handleSubmit}
            disabled={loading}
          />
        </div>
      }
    >
      <div className="reject-body">
        {error && (
          <Message severity="error" text={error} className="w-full mb-3" />
        )}

        <label className="reject-label">Alasan Penolakan *</label>
        <InputTextarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Contoh: Nominal tidak sesuai dengan yang diminta"
          rows={3}
          autoResize
          maxLength={500}
          className="w-full"
        />

        <div className="reject-quick">
          <span className="reject-quick-label">Cepat:</span>
          <div className="reject-quick-chips">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                className="reject-chip"
                onClick={() => setReason(r)}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  )
}