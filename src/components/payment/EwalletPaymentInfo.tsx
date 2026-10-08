import { useState } from 'react'
import { Button } from 'primereact/button'
import type { PaymentInitResponse } from '@/types/payment'

interface Props {
  data: PaymentInitResponse
}

const PROVIDER_META: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  GOPAY: { icon: 'pi pi-wallet', color: '#00aed6', label: 'GoPay' },
  DANA: { icon: 'pi pi-wallet', color: '#108ee9', label: 'DANA' },
  OVO: { icon: 'pi pi-wallet', color: '#4c3494', label: 'OVO' },
  SHOPEEPAY: {
    icon: 'pi pi-shopping-bag',
    color: '#ee4d2d',
    label: 'ShopeePay',
  },
  LINKAJA: { icon: 'pi pi-wallet', color: '#e32119', label: 'LinkAja' },
}

export function EwalletPaymentInfo({ data }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

  const providerKey = data.ewalletProvider?.toUpperCase() || ''
  const meta = PROVIDER_META[providerKey] || {
    icon: 'pi pi-wallet',
    color: '#64748b',
    label: data.ewalletProvider || 'E-Wallet',
  }

  const copy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="pay-info">
      {/* Provider header */}
      <div
        className="pay-ewallet-header"
        style={{
          background: `linear-gradient(135deg, ${meta.color}15, ${meta.color}05)`,
          borderColor: `${meta.color}30`,
        }}
      >
        <span
          className="pay-ewallet-icon"
          style={{ background: meta.color, color: '#fff' }}
        >
          <i className={meta.icon} />
        </span>
        <div className="pay-ewallet-info">
          <strong>{meta.label}</strong>
          <small>E-Wallet Transfer</small>
        </div>
      </div>

      <div className="pay-info-row">
        <span className="pay-info-label">Nomor Akun</span>
        <span className="pay-info-value pay-info-mono">
          {data.ewalletAccount}
          <Button
            icon={copied === 'acc' ? 'pi pi-check' : 'pi pi-copy'}
            text
            rounded
            size="small"
            onClick={() => copy(data.ewalletAccount || '', 'acc')}
          />
        </span>
      </div>

      <div className="pay-info-row">
        <span className="pay-info-label">Atas Nama</span>
        <span className="pay-info-value">{data.ewalletAccountHolder}</span>
      </div>

      <div className="pay-info-row pay-info-highlight">
        <span className="pay-info-label">Nominal</span>
        <span className="pay-info-value pay-info-mono">
          Rp {data.amountIdr.toLocaleString('id-ID')}
          <Button
            icon={copied === 'amount' ? 'pi pi-check' : 'pi pi-copy'}
            text
            rounded
            size="small"
            onClick={() => copy(String(data.amountIdr), 'amount')}
          />
        </span>
      </div>

      <p className="pay-hint">
        <i className="pi pi-info-circle" />
        Buka aplikasi {meta.label} → kirim ke nomor di atas → upload bukti
        transfer di bawah.
      </p>
    </div>
  )
}