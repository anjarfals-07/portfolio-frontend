import { Button } from 'primereact/button'
import type { PaymentInitResponse } from '@/types/payment'

interface Props {
  data: PaymentInitResponse
}

export function QrisPaymentInfo({ data }: Props) {
  const handleDownload = () => {
    if (!data.qrisImageUrl) return
    const link = document.createElement('a')
    link.href = data.qrisImageUrl
    link.download = `qris-${data.referenceId}.png`
    link.click()
  }

  return (
    <div className="pay-info">
      <div className="pay-qris-wrapper">
        {data.qrisImageUrl ? (
          <img
            src={data.qrisImageUrl}
            alt="QRIS"
            className="pay-qris-image"
          />
        ) : (
          <div className="pay-qris-empty">
            <i className="pi pi-qrcode" />
            <p>QR code belum tersedia</p>
          </div>
        )}
      </div>

      {data.qrisMerchantName && (
        <div className="pay-info-row">
          <span className="pay-info-label">Merchant</span>
          <span className="pay-info-value">{data.qrisMerchantName}</span>
        </div>
      )}

      <div className="pay-actions">
        <Button
          label="Download QR"
          icon="pi pi-download"
          outlined
          onClick={handleDownload}
          disabled={!data.qrisImageUrl}
        />
      </div>

      <p className="pay-hint">
        <i className="pi pi-info-circle" /> Scan pakai aplikasi bank atau
        e-wallet apapun yang support QRIS.
      </p>
    </div>
  )
}