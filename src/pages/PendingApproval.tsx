import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'

interface LocationState {
  username?: string
  slug?: string
}

function PendingApproval() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as LocationState) || {}

  const [username] = useState(state.username || '')
  const [slug] = useState(state.slug || '')

  // Kalau gak ada state, redirect ke register
  useEffect(() => {
    if (!state.username) {
      navigate('/register', { replace: true })
    }
  }, [state, navigate])

  return (
    <div className="pending-page">
      <SEO
        title="Menunggu Approval — Portfolio"
        description="Akun kamu sedang menunggu approval admin."
        url="/pending-approval"
      />

      <AnimatedSection variant="fade-up">
        <div className="pending-card">
          {/* ICON */}
          <div className="pending-icon">
            <i className="pi pi-clock"></i>
            <div className="pending-icon-ring" />
          </div>

          {/* TITLE */}
          <h1 className="pending-title">Akun Sedang Ditinjau</h1>
          <p className="pending-subtitle">
            Terima kasih sudah mendaftar{username ? `, ${username}` : ''}!
            Akun kamu sedang menunggu approval admin.
          </p>

          {/* INFO */}
          {(username || slug) && (
            <div className="pending-info">
              {username && (
                <div className="pending-info-item">
                  <div className="pending-info-icon">
                    <i className="pi pi-user"></i>
                  </div>
                  <div className="pending-info-content">
                    <strong>Username</strong>
                    <span>@{username}</span>
                  </div>
                </div>
              )}

              {slug && (
                <div className="pending-info-item">
                  <div className="pending-info-icon">
                    <i className="pi pi-link"></i>
                  </div>
                  <div className="pending-info-content">
                    <strong>Portfolio URL</strong>
                    <span>/{slug}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEPS */}
          <div className="pending-steps">
            <h3 className="pending-steps-title">
              Apa yang terjadi selanjutnya?
            </h3>

            <div className="pending-step pending-step-done">
              <div className="pending-step-number">
                <i className="pi pi-check"></i>
              </div>
              <div className="pending-step-content">
                <strong>Pendaftaran diterima</strong>
                <span>Data kamu udah masuk sistem</span>
              </div>
            </div>

            <div className="pending-step pending-step-active">
              <div className="pending-step-number">2</div>
              <div className="pending-step-content">
                <strong>Review admin</strong>
                <span>Admin bakal review akun kamu dalam 1-2 hari kerja</span>
              </div>
            </div>

            <div className="pending-step">
              <div className="pending-step-number">3</div>
              <div className="pending-step-content">
                <strong>Notifikasi</strong>
                <span>Kamu bakal dapat email setelah akun di-approve</span>
              </div>
            </div>
          </div>

          {/* CONTACT */}
          <div className="pending-contact">
            <i className="pi pi-info-circle"></i>
            <span>
              Ada pertanyaan? Hubungi admin di{' '}
              <a href="mailto:admin@portfolio.com">admin@portfolio.com</a>
            </span>
          </div>

          {/* ACTIONS */}
          <div className="pending-actions">
            <Link to="/" className="w-full">
              <Button
                label="Kembali ke Home"
                icon="pi pi-home"
                severity="secondary"
                outlined
                className="w-full"
              />
            </Link>
            <Link to="/login" className="w-full">
              <Button
                label="Coba Login"
                icon="pi pi-sign-in"
                className="w-full"
              />
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}

export default PendingApproval