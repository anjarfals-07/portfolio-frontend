import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { userService } from '@/services/userService'
import type { CreateUserRequest, UserAdmin } from '@/types/user'

interface FormState {
  username: string
  email: string
  password: string
  displayName: string
  portfolioSlug: string
  role: 'OWNER' | 'SUPER_ADMIN'
}

const ROLE_OPTIONS = [
  {
    label: 'Owner',
    value: 'OWNER',
    desc: 'User biasa dengan portfolio',
  },
  {
    label: 'Super Admin',
    value: 'SUPER_ADMIN',
    desc: 'Akses penuh ke admin panel',
  },
]

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)

const generatePassword = (): string => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// ============================================================
// FLOATING FIELD
// ============================================================
interface FloatingFieldProps {
  id: string
  label: string
  icon: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  required?: boolean
  type?: string
  maxLength?: number
  autoFocus?: boolean
  autoComplete?: string
}

function FloatingField({
  id,
  label,
  icon,
  value,
  onChange,
  error,
  hint,
  required,
  type = 'text',
  maxLength,
  autoFocus,
  autoComplete,
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false)
  const hasValue = value.length > 0
  const isFloating = focused || hasValue

  return (
    <div className={`ff-field ${error ? 'has-error' : ''}`}>
      <div
        className={`ff-wrap ${isFloating ? 'is-floating' : ''} ${
          focused ? 'is-focused' : ''
        }`}
      >
        <span className="ff-icon">
          <i className={icon} />
        </span>
        <input
          id={id}
          type={type}
          className="ff-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          placeholder=" "
        />
        <label htmlFor={id} className="ff-label">
          {label}
          {required && <span className="ff-required">*</span>}
        </label>
      </div>

      {error ? (
        <small className="ff-error">
          <i className="pi pi-exclamation-circle" />
          {error}
        </small>
      ) : hint ? (
        <small className="ff-hint">{hint}</small>
      ) : null}
    </div>
  )
}

// ============================================================
// COMPONENT
// ============================================================
function AddUser() {
  const navigate = useNavigate()
  const toast = useRef<Toast>(null)

  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    displayName: '',
    portfolioSlug: '',
    role: 'OWNER',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [createdUser, setCreatedUser] = useState<UserAdmin | null>(null)
  const [createdPassword, setCreatedPassword] = useState<string>('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  // ============================================================
  // FORM HANDLERS
  // ============================================================
  const updateField = <K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field as string]
      delete next.general
      return next
    })
  }

  const handleUsernameChange = (value: string) => {
    updateField('username', value)
    if (!slugTouched) {
      updateField('portfolioSlug', slugify(value))
    }
  }

  const handleGeneratePassword = () => {
    const pwd = generatePassword()
    updateField('password', pwd)
    setShowPassword(true)
  }

  // ============================================================
  // VALIDATE
  // ============================================================
  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!form.username.trim()) errs.username = 'Username wajib diisi'
    else if (form.username.length < 3)
      errs.username = 'Username minimal 3 karakter'
    else if (!/^[a-z0-9_-]+$/.test(form.username))
      errs.username = 'Cuma boleh lowercase, angka, dash, underscore'

    if (!form.email.trim()) errs.email = 'Email wajib diisi'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Format email tidak valid'

    if (!form.password.trim()) errs.password = 'Password wajib diisi'
    else if (form.password.length < 8)
      errs.password = 'Password minimal 8 karakter'

    if (
      form.portfolioSlug &&
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.portfolioSlug)
    )
      errs.portfolioSlug = 'Format slug tidak valid'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ============================================================
  // SUBMIT
  // ============================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload: CreateUserRequest = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        displayName: form.displayName.trim() || undefined,
        portfolioSlug: form.portfolioSlug.trim() || undefined,
        role: form.role,
      }

      const created = await userService.createByAdmin(payload)

      setCreatedUser(created)
      setCreatedPassword(form.password)
      setShowSuccessDialog(true)

      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: `User "${created.username}" berhasil dibuat`,
        life: 3000,
      })
    } catch (err: unknown) {
      console.error(err)
      const axiosErr = err as {
        response?: { data?: { message?: string; error?: string } }
      }
      const msg =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        'Gagal membuat user'
      setErrors({ general: msg })
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // COPY CREDENTIALS
  // ============================================================
  const handleCopyCredentials = async () => {
    if (!createdUser) return

    const text = `Username: ${createdUser.username}
Email: ${createdUser.email}
Password: ${createdPassword}
Portfolio: /${createdUser.portfolioSlug}`

    try {
      await navigator.clipboard.writeText(text)
      toast.current?.show({
        severity: 'success',
        summary: 'Tersalin',
        detail: 'Kredensial di-copy ke clipboard',
        life: 2000,
      })
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  // ============================================================
  // AFTER CREATE
  // ============================================================
  const handleGoToList = () => {
    setShowSuccessDialog(false)
    navigate('/admin/users')
  }

  const handleGoToDetail = () => {
    if (!createdUser) return
    setShowSuccessDialog(false)
    navigate(`/admin/users/${createdUser.id}`)
  }

  const handleCreateAnother = () => {
    setShowSuccessDialog(false)
    setForm({
      username: '',
      email: '',
      password: '',
      displayName: '',
      portfolioSlug: '',
      role: 'OWNER',
    })
    setSlugTouched(false)
    setShowPassword(false)
    setErrors({})
  }

  // ============================================================
  // PROGRESS
  // ============================================================
  const progress = (() => {
    const checks = [
      form.username.length >= 3,
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
      form.password.length >= 8,
      form.role === 'OWNER' || form.role === 'SUPER_ADMIN',
    ]
    const done = checks.filter(Boolean).length
    return {
      done,
      total: checks.length,
      percent: (done / checks.length) * 100,
    }
  })()

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dash">
      <Toast ref={toast} />

      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />
        <div className="dash-hero-inner">
          <div className="dash-hero-left">
            <Link to="/admin/users" className="ud-back">
              <i className="pi pi-arrow-left" />
              <span>Manage users</span>
            </Link>

            <span className="dash-hero-greeting">
              <i className="pi pi-user-plus" />
              Create user
            </span>
            <h1 className="dash-hero-title">
              Tambah <span className="dash-hero-name">user baru</span>
            </h1>
            <p className="dash-hero-desc">
              Bikin akun portfolio baru. Kredensial akan ditampilkan setelah
              user berhasil dibuat.
            </p>
          </div>

          <div className="dash-hero-right">
            <div className="add-user-progress">
              <div className="add-user-progress-head">
                <span className="add-user-progress-label">Progress</span>
                <span className="add-user-progress-count">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <div className="add-user-progress-bar">
                <div
                  className="add-user-progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FORM LAYOUT ===== */}
      <div className="add-user-layout">
        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="add-user-form">
          {errors.general && (
            <div className="add-user-alert is-error">
              <i className="pi pi-exclamation-circle" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* ===== Section 1: Akun ===== */}
          <section className="add-user-section">
            <header className="add-user-section-head">
              <span className="add-user-section-icon tone-blue">
                <i className="pi pi-user" />
              </span>
              <div className="add-user-section-head-text">
                <strong>Informasi akun</strong>
                <span>Username & email untuk login</span>
              </div>
            </header>

            <div className="add-user-fields">
              <FloatingField
                id="username"
                label="Username"
                icon="pi pi-at"
                value={form.username}
                onChange={handleUsernameChange}
                error={errors.username}
                hint="Cuma lowercase, angka, dash, underscore"
                required
                maxLength={50}
                autoFocus
                autoComplete="off"
              />

              <FloatingField
                id="email"
                label="Email"
                icon="pi pi-envelope"
                type="email"
                value={form.email}
                onChange={(v) => updateField('email', v)}
                error={errors.email}
                required
                maxLength={200}
                autoComplete="off"
              />

              {/* ===== PASSWORD FIELD — FULL WIDTH + TOGGLE MASK ===== */}
              <div className={`ff-field ${errors.password ? 'has-error' : ''}`}>
                <label className="ff-label-static">
                  Password <span className="ff-required">*</span>
                </label>

                <div className="add-user-password-row">
                  <div className="add-user-password-wrap">
                    <span className="add-user-password-icon">
                      <i className="pi pi-key" />
                    </span>
                    <Password
                      value={form.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Minimal 8 karakter"
                      toggleMask                                    // ← show/hide otomatis
                      feedback={false}
                      className="add-user-password-full"
                      inputClassName="add-user-password-input"
                      autoComplete="new-password"
                      appendTo="self"                               // ← ⭐ FIX: bikin icon muncul di dalam wrapper
                    />
                  </div>

                  <button
                    type="button"
                    className="add-user-generate-btn"
                    onClick={handleGeneratePassword}
                    title="Auto-generate password"
                  >
                    <i className="pi pi-refresh" />
                    <span>Generate</span>
                  </button>
                </div>

                {errors.password && (
                  <small className="ff-error">
                    <i className="pi pi-exclamation-circle" />
                    {errors.password}
                  </small>
                )}

                {showPassword && form.password && (
                  <div className="add-user-password-hint">
                    <i className="pi pi-check-circle" />
                    <span>Password:</span>
                    <strong>{form.password}</strong>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ===== Section 2: Profil ===== */}
          <section className="add-user-section">
            <header className="add-user-section-head">
              <span className="add-user-section-icon tone-purple">
                <i className="pi pi-id-card" />
              </span>
              <div className="add-user-section-head-text">
                <strong>Profil portfolio</strong>
                <span>Nama tampilan & URL portfolio</span>
              </div>
            </header>

            <div className="add-user-fields">
              <FloatingField
                id="displayName"
                label="Nama tampilan (opsional)"
                icon="pi pi-id-card"
                value={form.displayName}
                onChange={(v) => updateField('displayName', v)}
                hint="Kalau kosong, pakai username"
                maxLength={100}
              />

              <div
                className={`ff-field ${
                  errors.portfolioSlug ? 'has-error' : ''
                }`}
              >
                <label className="ff-label-static">URL portfolio</label>
                <div className="add-user-slug">
                  <span className="add-user-slug-prefix">
                    portfolio.com/
                  </span>
                  <input
                    type="text"
                    className="add-user-slug-input"
                    value={form.portfolioSlug}
                    onChange={(e) => {
                      updateField('portfolioSlug', e.target.value)
                      setSlugTouched(true)
                    }}
                    placeholder="budi"
                    maxLength={50}
                  />
                </div>
                {errors.portfolioSlug ? (
                  <small className="ff-error">
                    <i className="pi pi-exclamation-circle" />
                    {errors.portfolioSlug}
                  </small>
                ) : (
                  <small className="ff-hint">
                    Auto-generate dari username
                  </small>
                )}
              </div>
            </div>
          </section>

          {/* ===== Section 3: Role ===== */}
          <section className="add-user-section">
            <header className="add-user-section-head">
              <span className="add-user-section-icon tone-amber">
                <i className="pi pi-shield" />
              </span>
              <div className="add-user-section-head-text">
                <strong>Role & akses</strong>
                <span>Tentukan akses user ke platform</span>
              </div>
            </header>

            <div className="add-user-role-grid">
              {ROLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`add-user-role-card ${
                    form.role === opt.value ? 'is-active' : ''
                  }`}
                  onClick={() =>
                    updateField('role', opt.value as FormState['role'])
                  }
                >
                  <span
                    className={`add-user-role-icon tone-${
                      opt.value === 'SUPER_ADMIN' ? 'amber' : 'blue'
                    }`}
                  >
                    <i
                      className={
                        opt.value === 'SUPER_ADMIN'
                          ? 'pi pi-shield'
                          : 'pi pi-user'
                      }
                    />
                  </span>
                  <div className="add-user-role-body">
                    <strong className="add-user-role-label">
                      {opt.label}
                    </strong>
                    <span className="add-user-role-desc">{opt.desc}</span>
                  </div>
                  <span className="add-user-role-check">
                    <i className="pi pi-check" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ===== Actions ===== */}
          <div className="add-user-actions">
            <Link to="/admin/users" className="add-user-btn ghost">
              <i className="pi pi-times" />
              <span>Batal</span>
            </Link>
            <button
              type="submit"
              className="add-user-btn primary"
              disabled={saving}
            >
              <i
                className={
                  saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'
                }
              />
              <span>{saving ? 'Menyimpan…' : 'Buat user'}</span>
            </button>
          </div>
        </form>

        {/* SIDEBAR — Tips */}
        <aside className="add-user-aside">
          <div className="add-user-tip-card">
            <div className="add-user-tip-icon">
              <i className="pi pi-lightbulb" />
            </div>
            <strong className="add-user-tip-title">Tips cepat</strong>
            <ul className="add-user-tip-list">
              <li>
                <i className="pi pi-check" />
                Username cuma lowercase & angka
              </li>
              <li>
                <i className="pi pi-check" />
                Password minimal 8 karakter
              </li>
              <li>
                <i className="pi pi-check" />
                Slug bisa auto-generate
              </li>
            </ul>
          </div>

          <div className="add-user-info-card">
            <div className="add-user-info-row">
              <span className="add-user-info-label">
                <i className="pi pi-info-circle" />
                Setelah dibuat
              </span>
            </div>
            <p className="add-user-info-desc">
              Kredensial login akan ditampilkan. Kasih ke user — mereka bisa
              langsung login.
            </p>
          </div>
        </aside>
      </div>

      {/* ============================================================
          SUCCESS DIALOG
         ============================================================ */}
      <Dialog
        visible={showSuccessDialog}
        onHide={() => setShowSuccessDialog(false)}
        header={
          <div className="add-user-success-head">
            <span className="add-user-success-icon">
              <i className="pi pi-check-circle" />
            </span>
            <div className="add-user-success-head-text">
              <strong>User berhasil dibuat!</strong>
              <span>Simpan kredensial di bawah</span>
            </div>
          </div>
        }
        style={{ width: '540px', maxWidth: '95vw' }}
        modal
        blockScroll
        closable={false}
        className="ap-dialog"
        headerStyle={{ background: 'var(--bg-primary)' }}
        contentStyle={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
      >
        {createdUser && (
          <div className="add-user-success-body">
            <p className="add-user-success-desc">
              User <strong>{createdUser.username}</strong> berhasil dibuat.
              Kasih kredensial ini ke user.
            </p>

            <div className="add-user-credentials">
              <div className="add-user-credential-item">
                <span className="add-user-credential-label">
                  <i className="pi pi-user" />
                  Username
                </span>
                <strong className="add-user-credential-value">
                  {createdUser.username}
                </strong>
              </div>

              <div className="add-user-credential-item">
                <span className="add-user-credential-label">
                  <i className="pi pi-envelope" />
                  Email
                </span>
                <strong className="add-user-credential-value">
                  {createdUser.email}
                </strong>
              </div>

              <div className="add-user-credential-item is-password">
                <span className="add-user-credential-label">
                  <i className="pi pi-key" />
                  Password
                </span>
                <strong className="add-user-credential-value">
                  {createdPassword}
                </strong>
              </div>

              <div className="add-user-credential-item">
                <span className="add-user-credential-label">
                  <i className="pi pi-link" />
                  Portfolio
                </span>
                <strong className="add-user-credential-value">
                  /{createdUser.portfolioSlug}
                </strong>
              </div>
            </div>

            <div className="add-user-warning">
              <i className="pi pi-exclamation-triangle" />
              <span>
                Password <strong>tidak bisa dilihat lagi</strong> setelah
                dialog ini ditutup.
              </span>
            </div>

            <div className="add-user-success-actions">
              <button
                type="button"
                className="add-user-btn primary full"
                onClick={handleCopyCredentials}
              >
                <i className="pi pi-copy" />
                <span>Copy kredensial</span>
              </button>

              <div className="add-user-success-actions-row">
                <button
                  type="button"
                  className="add-user-btn ghost"
                  onClick={handleGoToDetail}
                >
                  <i className="pi pi-eye" />
                  <span>Lihat detail</span>
                </button>
                <button
                  type="button"
                  className="add-user-btn ghost"
                  onClick={handleGoToList}
                >
                  <i className="pi pi-list" />
                  <span>Ke daftar</span>
                </button>
              </div>

              <button
                type="button"
                className="add-user-success-link"
                onClick={handleCreateAnother}
              >
                <i className="pi pi-plus" />
                Buat user lagi
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default AddUser