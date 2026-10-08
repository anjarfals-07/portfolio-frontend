import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import type { PaymentMethodFormData } from '@/types/payment'

/* ============================================================
   PROVIDER PRESETS
   ============================================================ */
interface ProviderOption {
  label: string
  value: string
  icon: string
  color: string
}

const PROVIDERS: ProviderOption[] = [
  {
    label: 'GoPay',
    value: 'GOPAY',
    icon: 'pi pi-wallet',
    color: '#00aed6',
  },
  {
    label: 'DANA',
    value: 'DANA',
    icon: 'pi pi-wallet',
    color: '#108ee9',
  },
  {
    label: 'OVO',
    value: 'OVO',
    icon: 'pi pi-wallet',
    color: '#4c3494',
  },
  {
    label: 'ShopeePay',
    value: 'SHOPEEPAY',
    icon: 'pi pi-shopping-bag',
    color: '#ee4d2d',
  },
  {
    label: 'LinkAja',
    value: 'LINKAJA',
    icon: 'pi pi-wallet',
    color: '#e32119',
  },
]

interface Props {
  form: PaymentMethodFormData
  onChange: (field: keyof PaymentMethodFormData, value: any) => void
}

export function EwalletForm({ form, onChange }: Props) {
  const activeProvider = PROVIDERS.find(
    (p) => p.value === form.ewalletProvider
  )

  return (
    <div className="pmd-subform">
      {/* ===== PROVIDER ===== */}
      <div className="pmd-field">
        <label className="pmd-label">
          <i className="pi pi-wallet pmd-label-icon" />
          Provider E-Wallet <span className="pmd-req">*</span>
        </label>

        <Dropdown
          value={form.ewalletProvider}
          options={PROVIDERS}
          onChange={(e) => onChange('ewalletProvider', e.value)}
          placeholder="Pilih provider"
          className="w-full pmd-dropdown"
          scrollHeight="240px"
          showClear={false}
          itemTemplate={(option) => (
            <div className="pmd-dd-item">
              <span
                className="pmd-dd-item-icon"
                style={{
                  background: `${option.color}20`,
                  color: option.color,
                }}
              >
                <i className={option.icon} />
              </span>
              <span>{option.label}</span>
            </div>
          )}
          valueTemplate={(option) => {
            if (!option) return <span>Pilih provider</span>
            return (
              <div className="pmd-dd-item">
                <span
                  className="pmd-dd-item-icon"
                  style={{
                    background: `${option.color}20`,
                    color: option.color,
                  }}
                >
                  <i className={option.icon} />
                </span>
                <span>{option.label}</span>
              </div>
            )
          }}
        />

        <div className="pmd-quick-chips">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`pmd-quick-chip ${
                form.ewalletProvider === p.value ? 'is-active' : ''
              }`}
              onClick={() => onChange('ewalletProvider', p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== NOMOR AKUN ===== */}
      <div className="pmd-subform-grid">
        <div className="pmd-field">
          <label className="pmd-label">
            <i className="pi pi-mobile pmd-label-icon" />
            Nomor HP / Akun <span className="pmd-req">*</span>
          </label>
          <InputText
            value={form.ewalletAccount || ''}
            onChange={(e) => onChange('ewalletAccount', e.target.value)}
            placeholder="08123456789"
            className="w-full pmd-input-mono"
            maxLength={30}
          />
          <small className="pmd-hint">
            <i className="pi pi-info-circle" />
            Nomor yang terdaftar di aplikasi
          </small>
        </div>

        <div className="pmd-field">
          <label className="pmd-label">
            <i className="pi pi-user pmd-label-icon" />
            Atas Nama <span className="pmd-req">*</span>
          </label>
          <InputText
            value={form.ewalletAccountHolder || ''}
            onChange={(e) =>
              onChange('ewalletAccountHolder', e.target.value)
            }
            placeholder="PT Nexus Digital"
            className="w-full"
            maxLength={100}
          />
          <small className="pmd-hint">
            <i className="pi pi-info-circle" />
            Sesuai nama di aplikasi
          </small>
        </div>
      </div>

      {/* ===== INFO BANNER ===== */}
      {activeProvider && form.ewalletAccount && (
        <div
          className="pmd-chain-banner"
          style={{
            borderColor: `${activeProvider.color}40`,
            background: `linear-gradient(135deg, ${activeProvider.color}10, ${activeProvider.color}05)`,
          }}
        >
          <span
            className="pmd-chain-banner-icon"
            style={{
              background: activeProvider.color,
              color: '#fff',
            }}
          >
            <i className={activeProvider.icon} />
          </span>
          <div className="pmd-chain-banner-text">
            <strong>
              {activeProvider.label} • {form.ewalletAccount}
            </strong>
            <small>
              a/n {form.ewalletAccountHolder || 'Belum diisi'}
            </small>
          </div>
        </div>
      )}
    </div>
  )
}