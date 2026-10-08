import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import { ProofUploader } from '@/components/payment/ProofUploader'
import { paymentService } from '@/services/paymentService'

export default function PaymentRejected() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as {
    referenceId?: string
    reason?: string
  } | null

  const referenceId = state?.referenceId
  const reason = state?.reason
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File, note: string) => {
    if (!referenceId) return
    try {
      setUploading(true)
      setError(null)
      await paymentService.uploadProof(referenceId, file, note)
      navigate('/pending-verification', {
        state: { referenceId },
        replace: true,
      })
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal upload ulang')
    } finally {
      setUploading(false)
    }
  }

  if (!referenceId) {
    return (
      <div className="pay-page">
        <div className="pay-container pay-container-center">
          <Message
            severity="error"
            text="Reference ID tidak ditemukan"
            className="w-full"
          />
          <Link to="/register" className="mt-3">
            <Button label="Ke Halaman Register" icon="pi pi-user-plus" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="pay-page">
      <SEO
        title="Bukti Ditolak"
        description="Bukti bayar ditolak, silakan upload ulang"
        url="/payment-rejected"
      />

      <AnimatedSection variant="fade-up">
        <div className="pay-container">
          <div className="pay-status-icon pay-status-icon-rejected">
            <i className="pi pi-times-circle" />
          </div>

          <h1 className="pay-status-title">Bukti Bayar Ditolak</h1>
          <p className="pay-status-desc">
            Admin menolak bukti bayar kamu. Silakan cek alasan di bawah, lalu
            upload ulang bukti yang benar.
          </p>

          {reason && (
            <Message
              severity="warn"
              text={
                <>
                  <strong>Alasan:</strong> {reason}
                </>
              }
              className="w-full my-3"
            />
          )}

          <div className="pay-status-ref">
            <span>Reference ID</span>
            <code>{referenceId}</code>
          </div>

          {error && (
            <Message severity="error" text={error} className="w-full mb-3" />
          )}

          <div className="pay-card mt-4">
            <ProofUploader onUpload={handleUpload} loading={uploading} />
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}