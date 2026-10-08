import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import { paymentService } from '@/services/paymentService'
import type { PaymentStatus } from '@/types/payment'

export default function PendingVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { referenceId?: string } | null
  const referenceId = state?.referenceId

  const [status, setStatus] = useState<PaymentStatus>('WAITING_VERIFICATION')
  const [checking, setChecking] = useState(false)

  // Polling status setiap 10 detik
  useEffect(() => {
    if (!referenceId) return

    const check = async () => {
      try {
        const result = await paymentService.getStatus(referenceId)
        setStatus(result.status)

        if (result.status === 'PAID') {
          setTimeout(() => navigate('/pending-approval'), 1500)
        }
        if (result.status === 'REJECTED') {
          navigate('/payment-rejected', {
            state: {
              referenceId,
              reason: result.rejectionReason,
            },
            replace: true,
          })
        }
      } catch (err) {
        console.error(err)
      }
    }

    check()
    const interval = setInterval(check, 10000)
    return () => clearInterval(interval)
  }, [referenceId, navigate])

  const handleManualCheck = async () => {
    if (!referenceId) return
    setChecking(true)
    try {
      const result = await paymentService.getStatus(referenceId)
      setStatus(result.status)
      if (result.status === 'PAID') {
        setTimeout(() => navigate('/pending-approval'), 800)
      }
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="pay-page">
      <SEO
        title="Menunggu Verifikasi"
        description="Bukti bayar sedang diverifikasi admin"
        url="/pending-verification"
      />

      <AnimatedSection variant="zoom-in">
        <div className="pay-container pay-container-center">
          <div className="pay-status-icon pay-status-icon-pending">
            <i className="pi pi-clock" />
          </div>

          <h1 className="pay-status-title">Bukti Sedang Diverifikasi</h1>
          <p className="pay-status-desc">
            Bukti bayar kamu sedang dicek admin. Biasanya 1×24 jam. Kamu akan
            dapat email setelah diverifikasi.
          </p>

          {referenceId && (
            <div className="pay-status-ref">
              <span>Reference ID</span>
              <code>{referenceId}</code>
            </div>
          )}

          {status === 'PAID' && (
            <Message
              severity="success"
              text="Pembayaran berhasil! Mengarahkan ke halaman berikutnya..."
              className="w-full my-3"
            />
          )}

          <div className="pay-status-actions">
            <Button
              label={checking ? 'Memeriksa...' : 'Cek Status'}
              icon={checking ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'}
              onClick={handleManualCheck}
              disabled={checking}
              outlined
            />
            <Link to="/login">
              <Button label="Ke Halaman Login" icon="pi pi-sign-in" />
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}