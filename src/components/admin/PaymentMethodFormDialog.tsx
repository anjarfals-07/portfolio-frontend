import { useEffect, useMemo, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputSwitch } from 'primereact/inputswitch'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { QrisForm } from './QrisForm'
import { BankTransferForm } from './BankTransferForm'
import { CryptoEvmForm } from './CryptoEvmForm'
import { EwalletForm } from './EwalletForm'
import type {
  PaymentMethod,
  PaymentMethodFormData,
  PaymentMethodType,
} from '@/types/payment'

interface Props {
  visible: boolean
  editing: PaymentMethod | null
  onHide: () => void
  onSubmit: (data: PaymentMethodFormData) => Promise<void>
}

interface TypeOption {
  value: PaymentMethodType
  label: string
  desc: string
  icon: string
  tone: string
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: 'QRIS',
    label: 'QRIS',
    desc: 'Scan & pay',
    icon: 'pi pi-qrcode',
    tone: 'blue',
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Bank Transfer',
    desc: 'Manual transfer',
    icon: 'pi pi-building-columns',
    tone: 'green',
  },
  {
    value: 'EWALLET',   
    label: 'E-Wallet',
    desc: 'GoPay, DANA, dll',
    icon: 'pi pi-wallet',
    tone: 'pink',
  },
  {
    value: 'CRYPTO_EVM',
    label: 'Crypto EVM',
    desc: 'On-chain',
    icon: 'pi pi-bitcoin',
    tone: 'amber',
  },
]

const EMPTY_FORM: PaymentMethodFormData = {
  type: 'QRIS',
  label: '',
  isActive: true,
  sortOrder: 0,
}

export function PaymentMethodFormDialog({
  visible,
  editing,
  onHide,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<PaymentMethodFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setForm(editing ? { ...editing } : EMPTY_FORM)
      setError(null)
    }
  }, [visible, editing])

  const updateField = (field: keyof PaymentMethodFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async () => {
    if (!form.label.trim()) {
      setError('Label wajib diisi')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await onSubmit(form)
      onHide()
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          'Gagal menyimpan'
      )
    } finally {
      setSaving(false)
    }
  }

  const activeType = useMemo(
    () => TYPE_OPTIONS.find((t) => t.value === form.type) || TYPE_OPTIONS[0],
    [form.type]
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="pmd-header">
          <span className="pmd-header-icon">
            <i className="pi pi-credit-card" />
          </span>
          <div className="pmd-header-text">
            <strong>
              {editing ? 'Edit Payment Method' : 'Tambah Payment Method'}
            </strong>
            <small>
              {editing
                ? 'Ubah konfigurasi metode pembayaran'
                : 'Tambahkan metode pembayaran baru'}
            </small>
          </div>
        </div>
      }
      style={{ width: '900px', maxWidth: '96vw' }}
      modal
    //   blockScroll
      className="pmd-dialog"
      footer={
        <div className="pmd-footer">
          <div className="pmd-footer-left">
            <i className="pi pi-shield" />
            <span>Data tersimpan aman</span>
          </div>
          <div className="pmd-footer-actions">
            <Button
              label="Batal"
              icon="pi pi-times"
              severity="secondary"
              text
              onClick={onHide}
              disabled={saving}
            />
            <button
              type="button"
              className="pmd-submit-btn"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="pi pi-spin pi-spinner" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <i className="pi pi-sparkles" />
                  <span>{editing ? 'Update Method' : 'Simpan Method'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      }
    >
      <div className="pmd-body">
        {error && (
          <div className="pmd-error">
            <i className="pi pi-exclamation-circle" />
            <span>{error}</span>
          </div>
        )}

        {/* ============ LEFT: FORM ============ */}
        <div className="pmd-form-col">
          {/* TYPE SELECTOR */}
          <div className="pmd-section">
            <label className="pmd-section-label">
              <span className="pmd-section-num">1</span>
              Pilih Tipe
            </label>

            <div className="pmd-type-grid">
              {TYPE_OPTIONS.map((opt) => {
                const isSelected = form.type === opt.value
                const isDisabled = !!editing && !isSelected

                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`pmd-type-card pmd-type-${opt.tone} ${
                      isSelected ? 'is-selected' : ''
                    }`}
                    onClick={() => !editing && updateField('type', opt.value)}
                    disabled={isDisabled}
                  >
                    <span className="pmd-type-icon">
                      <i className={opt.icon} />
                    </span>
                    <span className="pmd-type-label">{opt.label}</span>
                    <span className="pmd-type-desc">{opt.desc}</span>
                    {isSelected && (
                      <span className="pmd-type-check">
                        <i className="pi pi-check" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {editing && (
              <div className="pmd-lock-note">
                <i className="pi pi-lock" />
                Tipe tidak bisa diubah setelah dibuat.
              </div>
            )}
          </div>

          {/* LABEL */}
          <div className="pmd-section">
            <label className="pmd-section-label">
              <span className="pmd-section-num">2</span>
              Info Dasar
            </label>

            <div className="pmd-field">
              <label className="pmd-label">
                Label <span className="pmd-req">*</span>
              </label>
              <InputText
                value={form.label}
                onChange={(e) => updateField('label', e.target.value)}
                placeholder={
                  form.type === 'QRIS'
                    ? 'QRIS All Payment'
                    : form.type === 'BANK_TRANSFER'
                    ? 'BCA'
                    : 'USDT (Polygon)'
                }
                maxLength={100}
                className="w-full"
              />
              <small className="pmd-hint">
                Nama yang muncul di halaman register & payment.
              </small>
            </div>
          </div>

          {/* TYPE-SPECIFIC */}
          <div className="pmd-section">
            <label className="pmd-section-label">
              <span className="pmd-section-num">3</span>
              Detail {activeType.label}
            </label>

            {form.type === 'QRIS' && (
              <QrisForm
                form={form}
                onChange={updateField}
                onError={setError}
              />
            )}

            {form.type === 'BANK_TRANSFER' && (
              <BankTransferForm form={form} onChange={updateField} />
            )}
            {form.type === 'EWALLET' && (
              <EwalletForm form={form} onChange={updateField} />
            )}
            {form.type === 'CRYPTO_EVM' && (
              <CryptoEvmForm form={form} onChange={updateField} />
            )}
          </div>

          {/* INSTRUKSI + SETTINGS */}
          <div className="pmd-section">
            <label className="pmd-section-label">
              <span className="pmd-section-num">4</span>
              Pengaturan
            </label>

            <div className="pmd-field">
              <label className="pmd-label">
                Instruksi Tambahan
                <span className="pmd-optional">(opsional)</span>
              </label>
              <InputTextarea
                value={form.instructions || ''}
                onChange={(e) =>
                  updateField('instructions', e.target.value)
                }
                placeholder="Contoh: Transfer sesuai nominal tepat, lalu upload bukti."
                rows={2}
                autoResize
                maxLength={500}
                className="w-full"
              />
            </div>

            <div className="pmd-settings">
              <div className="pmd-settings-item">
                <label className="pmd-label">Sort Order</label>
                <div className="pmd-order-control">
                  <button
                    type="button"
                    className="pmd-order-btn"
                    onClick={() =>
                      updateField(
                        'sortOrder',
                        Math.max(0, (form.sortOrder ?? 0) - 1)
                      )
                    }
                  >
                    <i className="pi pi-minus" />
                  </button>
                  <span className="pmd-order-value">
                    {form.sortOrder ?? 0}
                  </span>
                  <button
                    type="button"
                    className="pmd-order-btn"
                    onClick={() =>
                      updateField('sortOrder', (form.sortOrder ?? 0) + 1)
                    }
                  >
                    <i className="pi pi-plus" />
                  </button>
                </div>
                <small className="pmd-hint">Angka kecil lebih dulu.</small>
              </div>

              <div className="pmd-settings-item">
                <label className="pmd-label">Status</label>
                <div className="pmd-status-control">
                  <InputSwitch
                    checked={form.isActive ?? true}
                    onChange={(e) => updateField('isActive', e.value)}
                  />
                  <span
                    className={`pmd-status-pill ${
                      form.isActive ? 'is-active' : 'is-inactive'
                    }`}
                  >
                    <span className="pmd-status-dot" />
                    {form.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <small className="pmd-hint">
                  Hanya yang aktif tampil di register.
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* ============ RIGHT: LIVE PREVIEW ============ */}
        <div className="pmd-preview-col">
          <div className="pmd-preview-header">
            <span className="pmd-preview-badge">
              <span className="pmd-preview-dot" />
              Live Preview
            </span>
          </div>

          <div className="pmd-preview-stage">
            <div className="pmd-preview-card">
              <div className={`pmd-preview-accent pmd-accent-${form.type.toLowerCase()}`} />

              <div className="pmd-preview-head">
                <span className={`pmd-preview-icon pmd-icon-${form.type.toLowerCase()}`}>
                  <i className={activeType.icon} />
                </span>
                <div className="pmd-preview-title">
                  <strong>
                    {form.label || (
                      <span className="pmd-preview-placeholder">
                        {activeType.label} Name
                      </span>
                    )}
                  </strong>
                  <span className="pmd-preview-type">{activeType.label}</span>
                </div>
                <span
                  className={`pmd-preview-status ${
                    form.isActive ? 'is-active' : 'is-inactive'
                  }`}
                />
              </div>

              <div className="pmd-preview-body">
                {form.type === 'QRIS' && (
                  <div className="pmd-preview-qris">
                    {form.qrisImageUrl ? (
                      <div className="pmd-preview-qris-thumb">
                        <img src={form.qrisImageUrl} alt="QRIS" />
                      </div>
                    ) : (
                      <div className="pmd-preview-qris-empty">
                        <i className="pi pi-qrcode" />
                      </div>
                    )}
                    <div className="pmd-preview-qris-info">
                      <span className="pmd-preview-line-label">Merchant</span>
                      <span className="pmd-preview-line-value">
                        {form.qrisMerchantName || (
                          <em className="pmd-preview-placeholder">
                            Belum diisi
                          </em>
                        )}
                      </span>
                    </div>
                  </div>
                )}

                {form.type === 'BANK_TRANSFER' && (
                  <div className="pmd-preview-lines">
                    <PreviewLine
                      label="Bank"
                      value={form.bankName}
                    />
                    <PreviewLine
                      label="No. Rekening"
                      value={form.bankAccountNumber}
                      mono
                    />
                    <PreviewLine
                      label="Atas Nama"
                      value={form.bankAccountHolder}
                    />
                  </div>
                )}
                {form.type === 'EWALLET' && (
                  <div className="pmd-preview-lines">
                    <PreviewLine
                      label="Provider"
                      value={form.ewalletProvider}
                    />
                    <PreviewLine
                      label="Nomor"
                      value={form.ewalletAccount}
                      mono
                    />
                    <PreviewLine
                      label="Atas Nama"
                      value={form.ewalletAccountHolder}
                    />
                  </div>
                )}
                {form.type === 'CRYPTO_EVM' && (
                  <div className="pmd-preview-lines">
                    <PreviewLine label="Chain" value={form.cryptoChain} capitalize />
                    <PreviewLine label="Token" value={form.cryptoToken} />
                    <PreviewLine
                      label="Address"
                      value={
                        form.cryptoAddress
                          ? `${form.cryptoAddress.slice(0, 10)}...${form.cryptoAddress.slice(-6)}`
                          : ''
                      }
                      mono
                    />
                  </div>
                )}
              </div>

              <div className="pmd-preview-foot">
                <span className="pmd-preview-order">
                  <i className="pi pi-sort-alt" />
                  #{form.sortOrder ?? 0}
                </span>
                <span
                  className={`pmd-preview-badge-status ${
                    form.isActive ? 'is-active' : 'is-inactive'
                  }`}
                >
                  {form.isActive ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          <div className="pmd-preview-note">
            <i className="pi pi-info-circle" />
            Preview ini yang akan tampil ke user saat register.
          </div>
        </div>
      </div>
    </Dialog>
  )
}

/* ============================================================
   SUB-COMPONENT
   ============================================================ */
function PreviewLine({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string
  value?: string
  mono?: boolean
  capitalize?: boolean
}) {
  return (
    <div className="pmd-preview-line">
      <span className="pmd-preview-line-label">{label}</span>
      <span
        className={`pmd-preview-line-value ${mono ? 'is-mono' : ''} ${
          capitalize ? 'is-cap' : ''
        }`}
      >
        {value || <em className="pmd-preview-placeholder">—</em>}
      </span>
    </div>
  )
}