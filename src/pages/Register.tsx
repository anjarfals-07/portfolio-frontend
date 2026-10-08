import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { Skeleton } from 'primereact/skeleton'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import { authService } from '@/services/authService'
import { paymentMethodService } from '@/services/paymentMethodService'
import type { PaymentMethod } from '@/types/payment'

interface FormState {
  username: string
  email: string
  password: string
  displayName: string
  portfolioSlug: string
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
  portfolioSlug?: string
  general?: string
}

function Register() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'form' | 'method'>('form')

  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    displayName: '',
    portfolioSlug: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  // Payment methods
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [methodsLoading, setMethodsLoading] = useState(true)
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(
    null
  )
  // const [requiresPayment, setRequiresPayment] = useState(false)

  // Load payment methods saat mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await paymentMethodService.getActive()
        setMethods(data)
      } catch (err) {
        console.error('Failed to load payment methods:', err)
      } finally {
        setMethodsLoading(false)
      }
    }
    load()
  }, [])

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
  }

  const slugify = (input: string) =>
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50)

  const handleUsernameChange = (value: string) => {
    updateField('username', value)
    if (!form.portfolioSlug || form.portfolioSlug === slugify(form.username)) {
      updateField('portfolioSlug', slugify(value))
    }
  }

  const validate = (): boolean => {
    const errs: FormErrors = {}

    if (!form.username) {
      errs.username = 'Username wajib diisi'
    } else if (form.username.length < 3) {
      errs.username = 'Username minimal 3 karakter'
    } else if (!/^[a-z0-9_-]+$/.test(form.username)) {
      errs.username = 'Username cuma boleh lowercase, angka, dash, underscore'
    }

    if (!form.email) {
      errs.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Format email tidak valid'
    }

    if (!form.password) {
      errs.password = 'Password wajib diisi'
    } else if (form.password.length < 8) {
      errs.password = 'Password minimal 8 karakter'
    }

    if (form.portfolioSlug) {
      if (form.portfolioSlug.length < 3) {
        errs.portfolioSlug = 'Slug minimal 3 karakter'
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.portfolioSlug)) {
        errs.portfolioSlug = 'Slug cuma boleh lowercase, angka, dan dash'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Step 1 → Step 2 (pilih metode kalau perlu)
  const handleGoToMethod = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    // Kalau ada metode bayar aktif → lanjut ke step 2
    if (methods.length > 0) {
      setStep('method')
    } else {
      // Gak ada metode → langsung submit tanpa payment
      handleSubmit()
    }
  }

  // Submit final
  const handleSubmit = async () => {
    try {
      setLoading(true)
      setErrors({})

      const payload: any = {
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.displayName || undefined,
        portfolioSlug: form.portfolioSlug || undefined,
      }

      // Kalau step 2 & ada metode dipilih
      if (step === 'method') {
        if (!selectedMethodId) {
          setErrors({ general: 'Pilih metode pembayaran dulu' })
          return
        }
        payload.paymentMethodId = selectedMethodId
      }

      const data = await authService.register(payload)

      // Kalau butuh payment → redirect ke halaman payment
      if (data.requiresPayment && data.payment) {
        navigate(`/payment/${data.payment.referenceId}`, {
          replace: true,
        })
      } else {
        // Langsung pending approval
        navigate('/pending-approval', {
          state: {
            username: data.username,
            slug: data.portfolioSlug,
          },
          replace: true,
        })
      }
    } catch (err: any) {
      console.error('Register failed:', err)
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Registrasi gagal. Coba lagi.'
      setErrors({ general: msg })
      // Kembali ke step form kalau error di step 2
      if (step === 'method') setStep('form')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="auth-page">
      <SEO
        title="Daftar — Buat Portfolio"
        description="Daftar gratis dan buat portfolio kamu sendiri."
        url="/register"
      />

      <AnimatedSection variant="fade-up">
        <div className="auth-card">
          {/* HEADER */}
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <i className="pi pi-sparkles"></i>
              <span>Portfolio</span>
            </Link>
            <h1 className="auth-title">
              {step === 'form' ? 'Buat Portfolio Kamu' : 'Pilih Metode Bayar'}
            </h1>
            <p className="auth-subtitle">
              {step === 'form'
                ? 'Gratis, cepat, dan langsung punya subdomain sendiri.'
                : 'Pilih metode pembayaran yang paling nyaman.'}
            </p>
          </div>

          {errors.general && (
            <Message
              severity="error"
              text={errors.general}
              className="w-full mb-3"
            />
          )}

          {/* STEP 1 — FORM */}
          {step === 'form' && (
            <>
              <Message
                severity="info"
                text={
                  methods.length > 0
                    ? 'Akun kamu bakal di-review admin dulu sebelum bisa login.'
                    : 'Akun kamu bakal di-review admin dulu sebelum bisa login.'
                }
                className="w-full mb-3"
              />

              <form onSubmit={handleGoToMethod} className="auth-form">
                {/* Username */}
                <div className="auth-field">
                  <label htmlFor="username">Username *</label>
                  <InputText
                    id="username"
                    value={form.username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    placeholder="anjar"
                    className={`w-full ${errors.username ? 'p-invalid' : ''}`}
                    autoComplete="username"
                  />
                  {errors.username && (
                    <small className="p-error">{errors.username}</small>
                  )}
                </div>

                {/* Email */}
                <div className="auth-field">
                  <label htmlFor="email">Email *</label>
                  <InputText
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="anjar@example.com"
                    className={`w-full ${errors.email ? 'p-invalid' : ''}`}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <small className="p-error">{errors.email}</small>
                  )}
                </div>

                {/* Password */}
                <div className="auth-field">
                  <label htmlFor="password">Password *</label>
                  <Password
                    inputId="password"
                    value={form.password}
                    onChange={(e) =>
                      updateField('password', e.target.value)
                    }
                    placeholder="Minimal 8 karakter"
                    className={`w-full ${errors.password ? 'p-invalid' : ''}`}
                    inputClassName="w-full"
                    toggleMask
                    feedback={false}
                    autoComplete="new-password"
                  />
                  {errors.password && (
                    <small className="p-error">{errors.password}</small>
                  )}
                </div>

                {/* Display Name */}
                <div className="auth-field">
                  <label htmlFor="displayName">Nama Tampilan</label>
                  <InputText
                    id="displayName"
                    value={form.displayName}
                    onChange={(e) =>
                      updateField('displayName', e.target.value)
                    }
                    placeholder="Anjar Fals"
                    className="w-full"
                    autoComplete="name"
                  />
                </div>

                {/* Slug */}
                <div className="auth-field">
                  <label htmlFor="portfolioSlug">URL Portfolio</label>
                  <div className="auth-slug-input">
                    <span className="auth-slug-prefix">portfolio.com/</span>
                    <InputText
                      id="portfolioSlug"
                      value={form.portfolioSlug}
                      onChange={(e) =>
                        updateField('portfolioSlug', e.target.value)
                      }
                      placeholder="anjar"
                      className={`w-full ${
                        errors.portfolioSlug ? 'p-invalid' : ''
                      }`}
                    />
                  </div>
                  {errors.portfolioSlug && (
                    <small className="p-error">
                      {errors.portfolioSlug}
                    </small>
                  )}
                </div>

                <Button
                  type="submit"
                  label={
                    methods.length > 0
                      ? 'Lanjut Pilih Pembayaran'
                      : loading
                      ? 'Mendaftar...'
                      : 'Daftar'
                  }
                  icon={
                    methods.length > 0
                      ? 'pi pi-arrow-right'
                      : loading
                      ? 'pi pi-spin pi-spinner'
                      : 'pi pi-user-plus'
                  }
                  iconPos={methods.length > 0 ? 'right' : 'left'}
                  className="auth-submit-btn"
                  disabled={loading || methodsLoading}
                />
              </form>
            </>
          )}

          {/* STEP 2 — PILIH METODE BAYAR */}
          {step === 'method' && (
            <>
              {methodsLoading ? (
                <div className="pm-list">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} height="70px" borderRadius="10px" />
                  ))}
                </div>
              ) : (
                <div className="pay-method-list">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`pay-method-card ${
                        selectedMethodId === m.id ? 'is-selected' : ''
                      }`}
                      onClick={() => setSelectedMethodId(m.id)}
                    >
                      <span className="pay-method-icon">
                        <i
                          className={
                            m.type === 'QRIS'
                              ? 'pi pi-qrcode'
                              : m.type === 'BANK_TRANSFER'
                              ? 'pi pi-building-columns'
                              : m.type === 'EWALLET'
                              ? 'pi pi-wallet'
                              : 'pi pi-bitcoin'
                          }
                        />
                      </span>
                      <div className="pay-method-info">
                        <strong>{m.label}</strong>
                        <small>
                        {m.type === 'QRIS'
                          ? 'Scan QR pakai aplikasi apapun'
                          : m.type === 'BANK_TRANSFER'
                          ? `${m.bankName} • ${m.bankAccountNumber}`
                          : m.type === 'EWALLET'
                          ? `${m.ewalletProvider} • ${m.ewalletAccount}`
                          : `${m.cryptoChain} • ${m.cryptoToken}`}
                      </small>
                      </div>
                      {selectedMethodId === m.id && (
                        <i className="pi pi-check-circle pay-method-check" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              <div className="pay-method-actions">
                <Button
                  type="button"
                  label="Kembali"
                  icon="pi pi-arrow-left"
                  severity="secondary"
                  outlined
                  onClick={() => setStep('form')}
                  disabled={loading}
                />
                <Button
                  type="button"
                  label={loading ? 'Memproses...' : 'Daftar & Bayar'}
                  icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                  onClick={handleSubmit}
                  disabled={loading || !selectedMethodId}
                />
              </div>
            </>
          )}

          <Divider />

          <div className="auth-footer">
            <p>
              Udah punya akun?{' '}
              <Link to="/login" className="auth-link">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  )
}

export default Register