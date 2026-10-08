import { useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { paymentMethodService } from '@/services/paymentMethodService'
import type { PaymentMethodFormData } from '@/types/payment'

interface Props {
  form: PaymentMethodFormData
  onChange: (field: keyof PaymentMethodFormData, value: any) => void
  onError: (msg: string) => void
}

export function QrisForm({ form, onChange, onError }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      onError('Ukuran file maksimal 5MB')
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      onError('Format file: JPG, PNG, WEBP')
      return
    }

    try {
      const url = await paymentMethodService.uploadQris(file)
      onChange('qrisImageUrl', url)
    } catch (err: any) {
      onError(err?.response?.data?.message || 'Gagal upload gambar')
    }
  }

  return (
    <div className="pmd-subform">
      {/* ===== NAMA MERCHANT ===== */}
      <div className="pmd-field">
        <label className="pmd-label">
          <i className="pi pi-shop pmd-label-icon" />
          Nama Merchant <span className="pmd-req">*</span>
        </label>
        <InputText
          value={form.qrisMerchantName || ''}
          onChange={(e) => onChange('qrisMerchantName', e.target.value)}
          placeholder="PT Nexus Digital"
          className="w-full"
          maxLength={100}
        />
        <small className="pmd-hint">
          <i className="pi pi-info-circle" />
          Muncul di halaman payment user
        </small>
      </div>

      {/* ===== GAMBAR QRIS ===== */}
      <div className="pmd-field">
        <label className="pmd-label">
          <i className="pi pi-qrcode pmd-label-icon" />
          Gambar QRIS <span className="pmd-req">*</span>
        </label>

        {form.qrisImageUrl ? (
          <div className="pmd-qris-preview">
            <div className="pmd-qris-preview-img">
              <img src={form.qrisImageUrl} alt="QRIS" />
            </div>
            <div className="pmd-qris-preview-info">
              <strong>
                <i className="pi pi-check-circle" /> QRIS uploaded
              </strong>
              <small>Klik tombol untuk ganti atau hapus</small>
            </div>
            <div className="pmd-qris-preview-actions">
              <Button
                icon="pi pi-refresh"
                rounded
                text
                size="small"
                onClick={() => fileRef.current?.click()}
                tooltip="Ganti"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                text
                size="small"
                onClick={() => onChange('qrisImageUrl', '')}
                tooltip="Hapus"
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="pmd-upload-zone"
            onClick={() => fileRef.current?.click()}
          >
            <span className="pmd-upload-icon">
              <i className="pi pi-cloud-upload" />
            </span>
            <strong>Drag & drop atau klik untuk upload</strong>
            <small>PNG, JPG, WEBP — Maks 5MB</small>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={handleUpload}
        />
      </div>
    </div>
  )
}