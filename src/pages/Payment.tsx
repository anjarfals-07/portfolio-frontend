import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { Button } from 'primereact/button'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import { QrisPaymentInfo } from '@/components/payment/QrisPaymentInfo'
import { BankTransferInfo } from '@/components/payment/BankTransferInfo'
import { CryptoEvmInfo } from '@/components/payment/CryptoEvmInfo'
import { ProofUploader } from '@/components/payment/ProofUploader'
import { paymentService } from '@/services/paymentService'
import type { PaymentInitResponse } from '@/types/payment'

export default function Payment() {
  const { referenceId } = useParams<{ referenceId: string }>()
  const navigate = useNavigate()

  const [data, setData] = useState<PaymentInitResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Fetch detail
  useEffect(() => {
    if (!referenceId) return

    const fetch = async () => {
      try {
        setLoading(true)
        const result = await paymentService.getDetail(referenceId)
        setData(result)
      } catch (err: any) {
        setError(
          err?.response?.data?.message || 'Gagal memuat data pembayaran'
        )
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [referenceId])

  const handleUpload = async (file: File, note: string) => {
    if (!referenceId) return
    try {
      setUploading(true)
      await paymentService.uploadProof(referenceId, file, note)
      navigate('/pending-verification', {
        state: { referenceId },
        replace: true,
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal upload bukti')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="pay-page">
        <div className="pay-container">
          <Skeleton height="3rem" className="mb-3" />
          <Skeleton height="400px" />
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="pay-page">
        <div className="pay-container">
          <Message severity="error" text={error} className="w-full" />
          <Button
            label="Kembali"
            icon="pi pi-arrow-left"
            className="mt-3"
            onClick={() => navigate('/register')}
          />
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="pay-page">
      <SEO
        title="Selesaikan Pembayaran"
        description="Selesaikan pembayaran registrasi"
        url={`/payment/${referenceId}`}
      />

      <AnimatedSection variant="fade-up">
        <div className="pay-container">
          {/* HEADER */}
          <div className="pay-header">
            <span className="pay-eyebrow">
              <i className="pi pi-credit-card" /> Pembayaran
            </span>
            <h1 className="pay-title">Selesaikan Pembayaran</h1>
            <p className="pay-subtitle">
              Transfer sesuai nominal, lalu upload bukti bayar.
            </p>
          </div>

          {/* SUMMARY */}
          <div className="pay-summary">
            <div className="pay-summary-item">
              <span className="pay-summary-label">Reference</span>
              <span className="pay-summary-value pay-info-mono">
                {data.referenceId}
              </span>
            </div>
            <div className="pay-summary-item">
              <span className="pay-summary-label">Metode</span>
              <span className="pay-summary-value">{data.methodLabel}</span>
            </div>
            <div className="pay-summary-item pay-summary-amount">
              <span className="pay-summary-label">Total</span>
              <span className="pay-summary-value">
                Rp {data.amountIdr.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {error && (
            <Message severity="error" text={error} className="w-full mb-3" />
          )}

          {/* PAYMENT INFO */}
          <div className="pay-card">
            {data.method === 'QRIS' && <QrisPaymentInfo data={data} />}
            {data.method === 'BANK_TRANSFER' && (
              <BankTransferInfo data={data} />
            )}
            {data.method === 'CRYPTO_EVM' && <CryptoEvmInfo data={data} />}
          </div>

          {/* INSTRUCTIONS */}
          {data.instructions && (
            <div className="pay-card pay-card-instructions">
              <strong>Catatan dari Admin</strong>
              <p>{data.instructions}</p>
            </div>
          )}

          {/* PROOF UPLOAD */}
          <div className="pay-card">
            <ProofUploader onUpload={handleUpload} loading={uploading} />
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}