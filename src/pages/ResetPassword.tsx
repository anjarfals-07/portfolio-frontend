import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Password } from 'primereact/password'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { ProgressSpinner } from 'primereact/progressspinner'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import { emailService } from '@/services/emailService'

interface FormErrors {
  password?: string
  confirmPassword?: string
  general?: string
}

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [verifyError, setVerifyError] = useState<string | null>(null)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false)
        setTokenValid(false)
        setVerifyError('Token tidak ditemukan di URL.')
        return
      }

      try {
        const data = await emailService.verifyResetToken(token)
        setTokenValid(data.valid)
        setUserEmail(data.email || '')
        if (!data.valid) {
          setVerifyError(data.message || 'Token tidak valid.')
        }
      } catch (err: any) {
        console.error('Verify token failed:', err)
        setTokenValid(false)
        setVerifyError('Gagal verify token. Coba lagi.')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token])

  const validate = (): boolean => {
    const errs: FormErrors = {}

    if (!password) {
      errs.password = 'Password wajib diisi'
    } else if (password.length < 8) {
      errs.password = 'Password minimal 8 karakter'
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Password & konfirmasi gak sama'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate() || !token) return

    try {
      setLoading(true)
      setErrors({})
      await emailService.resetPassword(token, password)
      setSuccess(true)

      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err: any) {
      console.error('Reset password failed:', err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Gagal reset password. Coba lagi.'
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  // ===== Loading state =====
  if (verifying) {
    return (
      <div className="auth-page">
        <SEO title="Memverifikasi Token — Portfolio" url="/reset-password" />
        <div
          className="auth-card"
          style={{ textAlign: 'center', padding: '4rem 2rem' }}
        >
          <ProgressSpinner />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Memverifikasi token...
          </p>
        </div>
      </div>
    )
  }

  // ===== Invalid token =====
  if (!tokenValid) {
    return (
      <div className="auth-page">
        <SEO title="Token Invalid — Portfolio" url="/reset-password" />
        <AnimatedSection variant="fade-up">
          <div className="auth-card">
            <div className="auth-header">
              <div className="forgot-icon-error">
                <i className="pi pi-times-circle"></i>
              </div>
              <h1 className="auth-title">Link Tidak Valid</h1>
              <p className="auth-subtitle">
                {verifyError || 'Token udah expired atau gak valid.'}
              </p>
            </div>

            <Divider />

            <div className="forgot-success-actions">
              <Link to="/forgot-password" className="w-full">
                <Button
                  label="Request Link Baru"
                  icon="pi pi-refresh"
                  className="w-full"
                />
              </Link>
              <Link to="/login" className="w-full">
                <Button
                  label="Kembali ke Login"
                  icon="pi pi-sign-in"
                  severity="secondary"
                  outlined
                  className="w-full"
                />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    )
  }

  // ===== Success state =====
  if (success) {
    return (
      <div className="auth-page">
        <SEO title="Password Berhasil Di-reset" url="/reset-password" />
        <AnimatedSection variant="fade-up">
          <div className="auth-card">
            <div className="auth-header">
              <div className="forgot-success-icon">
                <i className="pi pi-check-circle"></i>
              </div>
              <h1 className="auth-title">Password Berhasil Di-reset! 🎉</h1>
              <p className="auth-subtitle">
                Kamu bakal di-redirect ke halaman login...
              </p>
            </div>

            <Divider />

            <div className="forgot-success-actions">
              <Link to="/login" className="w-full">
                <Button
                  label="Login Sekarang"
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

  // ===== Form state =====
  return (
    <div className="auth-page">
      <SEO
        title="Reset Password — Portfolio"
        description="Bikin password baru untuk akun kamu."
        url="/reset-password"
      />

      <AnimatedSection variant="fade-up">
        <div className="auth-card">
          <div className="auth-header">
            <div className="forgot-icon">
              <i className="pi pi-lock"></i>
            </div>
            <h1 className="auth-title">Bikin Password Baru</h1>
            {userEmail && (
              <p className="auth-subtitle">
                Untuk akun <strong>{userEmail}</strong>
              </p>
            )}
          </div>

          {errors.general && (
            <Message
              severity="error"
              text={errors.general}
              className="w-full mb-3"
            />
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="password">Password Baru *</label>
              <Password
                inputId="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="Minimal 8 karakter"
                className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                inputClassName="w-full"
                toggleMask
                feedback={false}
                autoFocus
                autoComplete="new-password"
              />
              {errors.password && (
                <small className="p-error">{errors.password}</small>
              )}
            </div>

            <div className="auth-field">
              <label htmlFor="confirmPassword">Konfirmasi Password *</label>
              <Password
                inputId="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }))
                }}
                placeholder="Ketik ulang password"
                className={`w-full ${
                  errors.confirmPassword ? 'p-invalid' : ''
                }`}
                inputClassName="w-full"
                toggleMask
                feedback={false}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <small className="p-error">{errors.confirmPassword}</small>
              )}
            </div>

            <Button
              type="submit"
              label={loading ? 'Menyimpan...' : 'Simpan Password Baru'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              className="auth-submit-btn"
              disabled={loading}
            />
          </form>

          <Divider />

          <div className="auth-footer">
            <p>
              Ingat password kamu?{' '}
              <Link to="/login" className="auth-link">
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}

export default ResetPassword