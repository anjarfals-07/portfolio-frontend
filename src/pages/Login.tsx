import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Checkbox } from 'primereact/checkbox'
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
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const from = (location.state as LocationState)?.from?.pathname || '/admin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validasi
    if (!username.trim() || !password.trim()) {
      setError('Username & password wajib diisi')
      return
    }

    setLoading(true)

    try {
      await login({ username: username.trim(), password })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      console.error(err)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg = axiosErr.response?.data?.message
      setError(msg || 'Login gagal. Cek username & password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          {/* ===== HEADER ===== */}
          <div className="login-header">
            <div className="login-logo">
              <i className="pi pi-lock text-3xl"></i>
            </div>
            <h1 className="login-title">Admin Login</h1>
            <p className="login-subtitle">Masuk untuk mengelola portfolio</p>
          </div>

          {/* ===== ERROR ===== */}
          {error && (
            <Message severity="error" text={error} className="w-full mb-3" />
          )}

          {/* ===== FORM ===== */}
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
                  className="login-input"
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="password" className="login-label">
                Password
              </label>
              <div className="login-input-wrapper">
                <i className="pi pi-lock login-input-icon-left"></i>
                <InputText
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="login-input"
                  disabled={loading}
                />
                <i
                  className={`pi ${
                    showPassword ? 'pi-eye-slash' : 'pi-eye'
                  } login-input-icon-right`}
                  onClick={() => setShowPassword(!showPassword)}
                  role="button"
                  aria-label="Toggle password visibility"
                ></i>
              </div>
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

          {/* ===== FOOTER ===== */}
          <div className="login-footer">
            <Link to="/" className="login-back-link">
              <i className="pi pi-arrow-left mr-1"></i>
              Kembali ke Home
            </Link>
          </div>
        </div>

        {/* ===== INFO DEFAULT LOGIN ===== */}
        <div className="login-info">
          <i className="pi pi-info-circle"></i>
          <div>
            <strong>Default Login:</strong>
            <p>
              Username: <code>admin</code> / Password: <code>admin123</code>
            </p>
            <small>⚠️ Ganti password setelah login pertama!</small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login