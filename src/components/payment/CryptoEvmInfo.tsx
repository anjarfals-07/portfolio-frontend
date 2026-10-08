import { useState } from 'react'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import type { PaymentInitResponse } from '@/types/payment'

interface Props {
  data: PaymentInitResponse
}

export function CryptoEvmInfo({ data }: Props) {
  const [copied, setCopied] = useState<string | null>(null)

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
      <Message
        severity="warn"
        text={data.cryptoNetworkNote || 'Pastikan network & token sesuai.'}
        className="w-full mb-3"
      />

      <div className="pay-info-row">
        <span className="pay-info-label">Chain</span>
        <span className="pay-info-value">{data.cryptoChain}</span>
      </div>

      <div className="pay-info-row">
        <span className="pay-info-label">Token</span>
        <span className="pay-info-value">{data.cryptoToken}</span>
      </div>

      <div className="pay-info-row pay-info-column">
        <span className="pay-info-label">Wallet Address</span>
        <div className="pay-info-address">
          <code>{data.cryptoAddress}</code>
          <Button
            icon={copied === 'addr' ? 'pi pi-check' : 'pi pi-copy'}
            text
            rounded
            size="small"
            onClick={() => copy(data.cryptoAddress!, 'addr')}
          />
        </div>
      </div>

      <div className="pay-info-row pay-info-highlight">
        <span className="pay-info-label">Nominal (IDR)</span>
        <span className="pay-info-value pay-info-mono">
          Rp {data.amountIdr.toLocaleString('id-ID')}
        </span>
      </div>

      <p className="pay-hint">
        <i className="pi pi-info-circle" /> Kirim ke address di atas, lalu
        isi tx hash di kolom catatan saat upload bukti.
      </p>
    </div>
  )
}