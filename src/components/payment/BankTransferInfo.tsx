import { useState } from 'react'
import { Button } from 'primereact/button'
import type { PaymentInitResponse } from '@/types/payment'

interface Props {
  data: PaymentInitResponse
}

export function BankTransferInfo({ data }: Props) {
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
      <div className="pay-info-row">
        <span className="pay-info-label">Bank</span>
        <span className="pay-info-value">{data.bankName}</span>
      </div>

      <div className="pay-info-row">
        <span className="pay-info-label">No Rekening</span>
        <span className="pay-info-value pay-info-mono">
          {data.bankAccountNumber}
          <Button
            icon={copied === 'acc' ? 'pi pi-check' : 'pi pi-copy'}
            text
            rounded
            size="small"
            onClick={() => copy(data.bankAccountNumber!, 'acc')}
          />
        </span>
      </div>

      <div className="pay-info-row">
        <span className="pay-info-label">Atas Nama</span>
        <span className="pay-info-value">{data.bankAccountHolder}</span>
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
            onClick={() =>
              copy(String(data.amountIdr), 'amount')
            }
          />
        </span>
      </div>

      <p className="pay-hint">
        <i className="pi pi-info-circle" /> Transfer sesuai nominal tepat,
        lalu upload bukti di bawah.
      </p>
    </div>
  )
}