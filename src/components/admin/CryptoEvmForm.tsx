import { useEffect, useMemo, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import type { PaymentMethodFormData } from '@/types/payment'

/* ============================================================
   CHAIN CONFIG
   ============================================================ */
interface TokenOption {
  label: string
  value: string
}

interface ChainConfig {
  label: string
  value: string
  icon: string
  color: string
  tokens: TokenOption[]
}

const CHAIN_CONFIG: ChainConfig[] = [
  {
    label: 'Ethereum',
    value: 'ethereum',
    icon: 'pi pi-ethereum',
    color: '#627eea',
    tokens: [
      { label: 'ETH', value: 'ETH' },
      { label: 'USDT', value: 'USDT' },
      { label: 'USDC', value: 'USDC' },
      { label: 'DAI', value: 'DAI' },
      { label: 'WBTC', value: 'WBTC' },
    ],
  },
  {
    label: 'Polygon',
    value: 'polygon',
    icon: 'pi pi-shield',
    color: '#8247e5',
    tokens: [
      { label: 'MATIC', value: 'MATIC' },
      { label: 'USDT', value: 'USDT' },
      { label: 'USDC', value: 'USDC' },
      { label: 'WETH', value: 'WETH' },
      { label: 'DAI', value: 'DAI' },
    ],
  },
  {
    label: 'BSC',
    value: 'bsc',
    icon: 'pi pi-box',
    color: '#f3ba2f',
    tokens: [
      { label: 'BNB', value: 'BNB' },
      { label: 'USDT', value: 'USDT' },
      { label: 'USDC', value: 'USDC' },
      { label: 'BUSD', value: 'BUSD' },
    ],
  },
  {
    label: 'Base',
    value: 'base',
    icon: 'pi pi-circle',
    color: '#0052ff',
    tokens: [
      { label: 'ETH', value: 'ETH' },
      { label: 'USDT', value: 'USDT' },
      { label: 'USDC', value: 'USDC' },
      { label: 'DAI', value: 'DAI' },
    ],
  },
  {
    label: 'Arbitrum',
    value: 'arbitrum',
    icon: 'pi pi-compass',
    color: '#28a0f0',
    tokens: [
      { label: 'ETH', value: 'ETH' },
      { label: 'USDT', value: 'USDT' },
      { label: 'USDC', value: 'USDC' },
      { label: 'ARB', value: 'ARB' },
      { label: 'DAI', value: 'DAI' },
    ],
  },
  {
    label: 'XPL (Plasma)',
    value: 'plasma',
    icon: 'pi pi-bolt',
    color: '#a855f7',
    tokens: [
      { label: 'XPL', value: 'XPL' },
      { label: 'USDT', value: 'USDT' },
      { label: 'USDC', value: 'USDC' },
    ],
  },
]

const CHAIN_OPTIONS = CHAIN_CONFIG.map((c) => ({
  label: c.label,
  value: c.value,
}))

/* ============================================================
   COMPONENT
   ============================================================ */
interface Props {
  form: PaymentMethodFormData
  onChange: (field: keyof PaymentMethodFormData, value: any) => void
}

export function CryptoEvmForm({ form, onChange }: Props) {
  const [localChain, setLocalChain] = useState<string>('')
  const [localToken, setLocalToken] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLocalChain(form.cryptoChain || '')
  }, [form.cryptoChain])

  useEffect(() => {
    setLocalToken(form.cryptoToken || '')
  }, [form.cryptoToken])

  const availableTokens = useMemo<TokenOption[]>(() => {
    if (!localChain) return []
    const config = CHAIN_CONFIG.find((c) => c.value === localChain)
    return config?.tokens || []
  }, [localChain])

  const activeChain = useMemo(
    () => CHAIN_CONFIG.find((c) => c.value === localChain),
    [localChain]
  )

  // Reset token kalau gak valid
  useEffect(() => {
    if (!localChain) return
    const stillValid = availableTokens.some((t) => t.value === localToken)
    if (localToken && !stillValid) {
      setLocalToken('')
      onChange('cryptoToken', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localChain, availableTokens])

  const handleChainChange = (value: string) => {
    setLocalChain(value)
    onChange('cryptoChain', value)
  }

  const handleTokenChange = (value: string) => {
    setLocalToken(value)
    onChange('cryptoToken', value)
  }

  const handleCopyAddress = async () => {
    if (!form.cryptoAddress) return
    try {
      await navigator.clipboard.writeText(form.cryptoAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="pmd-subform">
      {/* ===== CHAIN & TOKEN ===== */}
      <div className="pmd-subform-grid">
        <div className="pmd-field">
          <label className="pmd-label">
            <i className="pi pi-link pmd-label-icon" />
            Chain <span className="pmd-req">*</span>
          </label>

          <Dropdown
            value={localChain}
            options={CHAIN_OPTIONS}
            onChange={(e) => handleChainChange(e.value)}
            placeholder="Pilih chain"
            className="w-full pmd-dropdown"
            scrollHeight="240px"
            showClear={false}
            itemTemplate={(option) => {
              const cfg = CHAIN_CONFIG.find((c) => c.value === option.value)
              return (
                <div className="pmd-dd-item">
                  <span
                    className="pmd-dd-item-icon"
                    style={{
                      background: `${cfg?.color}20`,
                      color: cfg?.color,
                    }}
                  >
                    <i className={cfg?.icon || 'pi pi-circle'} />
                  </span>
                  <span>{option.label}</span>
                </div>
              )
            }}
            valueTemplate={(option) => {
              if (!option) return <span>Pilih chain</span>
              const cfg = CHAIN_CONFIG.find((c) => c.value === option.value)
              return (
                <div className="pmd-dd-item">
                  <span
                    className="pmd-dd-item-icon"
                    style={{
                      background: `${cfg?.color}20`,
                      color: cfg?.color,
                    }}
                  >
                    <i className={cfg?.icon || 'pi pi-circle'} />
                  </span>
                  <span>{option.label}</span>
                </div>
              )
            }}
          />

          <small className="pmd-hint">
            <i className="pi pi-info-circle" />
            {availableTokens.length > 0
              ? `${availableTokens.length} token tersedia`
              : 'Pilih chain dulu'}
          </small>
        </div>

        <div className="pmd-field">
          <label className="pmd-label">
            <i className="pi pi-coins pmd-label-icon" />
            Token <span className="pmd-req">*</span>
          </label>

          <Dropdown
            value={localToken}
            options={availableTokens}
            onChange={(e) => handleTokenChange(e.value)}
            placeholder={localChain ? 'Pilih token' : 'Pilih chain dulu'}
            className="w-full pmd-dropdown"
            scrollHeight="240px"
            showClear={false}
            disabled={!localChain}
          />

          <small className="pmd-hint">
            <i className="pi pi-info-circle" />
            {!localChain
              ? 'Token muncul setelah pilih chain'
              : activeChain
              ? `Support di ${activeChain.label}`
              : ''}
          </small>
        </div>
      </div>

      {/* ===== INFO BANNER ===== */}
      {activeChain && localToken && (
        <div
          className="pmd-chain-banner"
          style={{
            borderColor: `${activeChain.color}40`,
            background: `linear-gradient(135deg, ${activeChain.color}10, ${activeChain.color}05)`,
          }}
        >
          <span
            className="pmd-chain-banner-icon"
            style={{
              background: activeChain.color,
              color: '#fff',
            }}
          >
            <i className={activeChain.icon} />
          </span>
          <div className="pmd-chain-banner-text">
            <strong>
              {localToken} on {activeChain.label}
            </strong>
            <small>Pastikan user kirim di network yang benar</small>
          </div>
        </div>
      )}

      {/* ===== ADDRESS ===== */}
      <div className="pmd-field">
        <label className="pmd-label">
          <i className="pi pi-wallet pmd-label-icon" />
          Wallet Address (EVM) <span className="pmd-req">*</span>
        </label>

        <div className="pmd-input-with-action">
          <InputText
            value={form.cryptoAddress || ''}
            onChange={(e) => onChange('cryptoAddress', e.target.value)}
            placeholder="0x1234567890abcdef1234567890abcdef12345678"
            className="w-full pmd-input-mono"
          />
          {form.cryptoAddress && (
            <button
              type="button"
              className="pmd-input-action"
              onClick={handleCopyAddress}
              title={copied ? 'Tersalin!' : 'Copy address'}
            >
              <i className={copied ? 'pi pi-check' : 'pi pi-copy'} />
            </button>
          )}
        </div>

        <small className="pmd-hint">
          <i className="pi pi-info-circle" />
          Format EVM: <code>0x</code> + 40 karakter hex.
        </small>
      </div>

      {/* ===== NETWORK NOTE ===== */}
      <div className="pmd-field">
        <label className="pmd-label">
          <i className="pi pi-comment pmd-label-icon" />
          Network Note
          <span className="pmd-optional">(opsional)</span>
        </label>
        <InputText
          value={form.cryptoNetworkNote || ''}
          onChange={(e) => onChange('cryptoNetworkNote', e.target.value)}
          placeholder={
            localChain && localToken
              ? `Only send ${localToken} on ${activeChain?.label} network`
              : 'Only send [TOKEN] on [CHAIN] network'
          }
          className="w-full"
        />
        <small className="pmd-hint">
          <i className="pi pi-info-circle" />
          Info penting biar user gak salah network
        </small>
      </div>
    </div>
  )
}