import { InputText } from 'primereact/inputtext'
import type { PaymentMethodFormData } from '@/types/payment'

interface Props {
  form: PaymentMethodFormData
  onChange: (field: keyof PaymentMethodFormData, value: any) => void
}

const QUICK_BANKS = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB', 'Permata']

export function BankTransferForm({ form, onChange }: Props) {
  return (
    <div className="pmd-subform">
      {/* ===== NAMA BANK ===== */}
      <div className="pmd-field">
        <label className="pmd-label">
          <i className="pi pi-building-columns pmd-label-icon" />
          Nama Bank <span className="pmd-req">*</span>
        </label>

        <InputText
          value={form.bankName || ''}
          onChange={(e) => onChange('bankName', e.target.value)}
          placeholder="BCA"
          className="w-full"
          maxLength={50}
        />

        {/* Quick pick bank */}
        <div className="pmd-quick-chips">
          {QUICK_BANKS.map((bank) => (
            <button
              key={bank}
              type="button"
              className={`pmd-quick-chip ${
                form.bankName === bank ? 'is-active' : ''
              }`}
              onClick={() => onChange('bankName', bank)}
            >
              {bank}
            </button>
          ))}
        </div>
      </div>

      {/* ===== NO REK + ATAS NAMA ===== */}
      <div className="pmd-subform-grid">
        <div className="pmd-field">
          <label className="pmd-label">
            <i className="pi pi-hashtag pmd-label-icon" />
            No Rekening <span className="pmd-req">*</span>
          </label>
          <InputText
            value={form.bankAccountNumber || ''}
            onChange={(e) => onChange('bankAccountNumber', e.target.value)}
            placeholder="1234567890"
            className="w-full pmd-input-mono"
            maxLength={30}
          />
          <small className="pmd-hint">
            <i className="pi pi-info-circle" />
            Tanpa spasi / tanda baca
          </small>
        </div>

        <div className="pmd-field">
          <label className="pmd-label">
            <i className="pi pi-user pmd-label-icon" />
            Atas Nama <span className="pmd-req">*</span>
          </label>
          <InputText
            value={form.bankAccountHolder || ''}
            onChange={(e) => onChange('bankAccountHolder', e.target.value)}
            placeholder="PT Nexus Digital"
            className="w-full"
            maxLength={100}
          />
          <small className="pmd-hint">
            <i className="pi pi-info-circle" />
            Sesuai buku tabungan
          </small>
        </div>
      </div>

      {/* ===== INFO CARD ===== */}
      {form.bankName && form.bankAccountNumber && (
        <div className="pmd-info-banner pmd-info-banner-green">
          <span className="pmd-info-banner-icon">
            <i className="pi pi-check-circle" />
          </span>
          <div className="pmd-info-banner-text">
            <strong>
              {form.bankName} • {form.bankAccountNumber}
            </strong>
            <small>
              a/n {form.bankAccountHolder || 'Belum diisi'}
            </small>
          </div>
        </div>
      )}
    </div>
  )
}