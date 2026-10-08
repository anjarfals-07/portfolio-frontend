import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import { emailService } from '@/services/emailService'

interface FormErrors {
  email?: string
  general?: string
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!email.trim()) {
      setErrors({ email: 'Email wajib diisi' })
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: 'Format email tidak valid' })
      return
    }

    try {
      setLoading(true)
      await emailService.forgotPassword(email.trim())
      setSubmitted(true)
    } catch (err: any) {
      console.error('Forgot password failed:', err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Gagal mengirim link reset. Coba lagi.'
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setSubmitted(false)
    setErrors({})
  }

  return (
    <div className="auth-page">
      <SEO
        title="Lupa Password — Portfolio"
        description="Reset password akun kamu."
        url="/forgot-password"
      />

      <AnimatedSection variant="fade-up">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <i className="pi pi-sparkles"></i>
              <span>Portfolio</span>
            </Link>

            {submitted ? (
              <>
                <div className="forgot-success-icon">
                  <i className="pi pi-check-circle"></i>
                </div>
                <h1 className="auth-title">Email Terkirim!</h1>
                <p className="auth-subtitle">
                  Cek inbox <strong>{email}</strong> untuk link reset password.
                </p>
              </>
            ) : (
              <>
                <div className="forgot-icon">
                  <i className="pi pi-key"></i>
                </div>
                <h1 className="auth-title">Lupa Password?</h1>
                <p className="auth-subtitle">
                  Masukkan email kamu, kami bakal kirim link reset password.
                </p>
              </>
            )}
          </div>

          {errors.general && (
            <Message
              severity="error"
              text={errors.general}
              className="w-full mb-3"
            />
          )}

          {submitted ? (
            <div className="forgot-success">
              <div className="forgot-success-info">
                <i className="pi pi-info-circle"></i>
                <div>
                  <strong>Gak terima email?</strong>
                  <p>
                    Cek folder spam atau{' '}
                    <button
                      type="button"
                      className="forgot-resend-btn"
                      onClick={handleResend}
                    >
                      coba kirim ulang
                    </button>
                    .
                  </p>
                </div>
              </div>

              <Divider />

              <div className="forgot-success-actions">
                <Link to="/login" className="w-full">
                  <Button
                    label="Kembali ke Login"
                    icon="pi pi-sign-in"
                    className="w-full"
                  />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email">Email</label>
                <InputText
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="email@kamu.com"
                  className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                  autoFocus
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && (
                  <small className="p-error">{errors.email}</small>
                )}
                <small className="auth-hint">
                  Pakai email yang kamu daftarkan waktu register.
                </small>
              </div>

              <Button
                type="submit"
                label={loading ? 'Mengirim...' : 'Kirim Link Reset'}
                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                className="auth-submit-btn"
                disabled={loading}
              />
            </form>
          )}

          <Divider />

          <div className="auth-footer">
            <p>
              Ingat password kamu?{' '}
              <Link to="/login" className="auth-link">
                Login di sini
              </Link>
            </p>
            <p>
              Belum punya akun?{' '}
              <Link to="/register" className="auth-link">
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}

export default ForgotPassword