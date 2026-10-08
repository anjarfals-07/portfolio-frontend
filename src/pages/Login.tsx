import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Checkbox } from 'primereact/checkbox'
import SEO from '@/components/SEO'
import { useAuth } from '@/context/AuthContext'

interface LocationState {
  from?: { pathname: string }
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorType, setErrorType] = useState<
    'pending' | 'rejected' | 'suspended' | 'general' | null
  >(null)

  const from = (location.state as LocationState)?.from?.pathname

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setErrorType(null)

    if (!username.trim() || !password.trim()) {
      setError('Username & password wajib diisi')
      setErrorType('general')
      return
    }

    setLoading(true)

    try {
      const data = await login({ username: username.trim(), password })

      if (from) {
        navigate(from, { replace: true })
      } else if (data.role === 'SUPER_ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate(`/${data.portfolioSlug}/dashboard`, { replace: true })
      }
    } catch (err: unknown) {
      console.error(err)
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string }; status?: number }
      }

      const status = axiosErr.response?.status
      const errorCode = axiosErr.response?.data?.error
      const msg = axiosErr.response?.data?.message || axiosErr.response?.data?.error

      // ===== Handle error spesifik =====
      if (errorCode === 'Account Pending' || msg?.toLowerCase().includes('pending') || msg?.toLowerCase().includes('approval')) {
        setError(msg || 'Akun kamu masih menunggu approval admin.')
        setErrorType('pending')
      } else if (msg?.toLowerCase().includes('rejected') || msg?.toLowerCase().includes('ditolak')) {
        setError(msg || 'Akun kamu ditolak oleh admin.')
        setErrorType('rejected')
      } else if (msg?.toLowerCase().includes('suspend')) {
        setError(msg || 'Akun kamu di-suspend.')
        setErrorType('suspended')
      } else {
        setError(msg || 'Login gagal. Cek username & password.')
        setErrorType('general')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <SEO
        title="Masuk — Portfolio"
        description="Masuk ke dashboard portfolio kamu."
        url="/login"
      />

      <div className="login-container">
        <div className="login-card">
          {/* HEADER */}
          <div className="login-header">
            <div className="login-logo">
              <i className="pi pi-sign-in text-3xl"></i>
            </div>
            <h1 className="login-title">Masuk</h1>
            <p className="login-subtitle">
              Masuk untuk kelola portfolio kamu
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <div className="login-error-wrapper">
              <Message severity="error" text={error} className="w-full" />

              {/* ACTION KHUSUS PENDING */}
              {errorType === 'pending' && (
                <Link to="/" className="login-pending-link">
                  <i className="pi pi-arrow-left"></i>
                  Kembali ke Home
                </Link>
              )}

              {/* ACTION KHUSUS REJECTED */}
              {errorType === 'rejected' && (
                <div className="login-rejected-info">
                  <i className="pi pi-info-circle"></i>
                  <span>
                    Hubungi admin untuk info lebih lanjut, atau buat akun baru
                    dengan{' '}
                    <Link to="/register" className="login-link">
                      username berbeda
                    </Link>
                    .
                  </span>
                </div>
              )}

              {/* ACTION KHUSUS SUSPENDED */}
              {errorType === 'suspended' && (
                <div className="login-suspended-info">
                  <i className="pi pi-ban"></i>
                  <span>
                    Hubungi admin di{' '}
                    <a href="mailto:admin@portfolio.com">
                      admin@portfolio.com
                    </a>{' '}
                    untuk info lebih lanjut.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username */}
            <div className="login-field">
              <label htmlFor="username" className="login-label">
                Username
              </label>
              <div className="login-input-wrapper">
                <i className="pi pi-user login-input-icon-left"></i>
                <InputText
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="login-input w-full"
                  autoFocus
                  disabled={loading}
                  autoComplete="username"
                />
              </div>
            </div>

           {/* Password */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <Password
              inputId="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="login-password w-full"
              inputClassName="login-password-input w-full"
              toggleMask
              feedback={false}
              disabled={loading}
              autoComplete="current-password"
              inputStyle={{ width: '100%' }}
            />
          </div>

            {/* Remember Me */}
            <div className="login-remember">
              <Checkbox
                inputId="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.checked || false)}
              />
              <label htmlFor="rememberMe" className="login-remember-label">
                Ingat saya
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              label={loading ? 'Masuk...' : 'Masuk'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
              disabled={loading}
              className="login-submit-btn"
            />
          </form>

          {/* FOOTER */}
          <div className="login-footer">
            <p className="login-register-link">
              Belum punya akun?{' '}
              <Link to="/register" className="login-link">
                Daftar di sini
              </Link>
            </p>
            <Link to="/" className="login-back-link">
              <i className="pi pi-arrow-left mr-1"></i>
              Kembali ke Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login