import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import AnimatedSection from '@/components/AnimatedSection'
import { messageService } from '@/services/messageService'
import { profileService } from '@/services/profileService'
import { useAuth } from '@/context/AuthContext'
import type { ContactFormData } from '@/types/message'
import type { Profile } from '@/types/profile'
import SEO from '@/components/SEO'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function Contact() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()

  // ============================================================
  // ⭐ DETEKSI OWNER VIEW — TAHAN BANTING
  // ============================================================
  // Normalisasi role ke uppercase biar tahan casing
  const userRole = (user?.role || '').toUpperCase()

  // Cek apakah URL param cocok dengan username ATAU portfolioSlug
  const isUsernameMatch =
    !!username &&
    (user?.username === username || user?.portfolioSlug === username)

  // isOwnerView = true kalau:
  // 1. User login
  // 2. Role = OWNER (case-insensitive)
  // 3. URL param cocok dengan username / portfolioSlug
  const isOwnerView = userRole === 'OWNER' && isUsernameMatch

  // ============================================================
  // ⭐ DEBUG — hapus setelah fix confirmed
  // ============================================================
  console.log('[Contact Debug]', {
    urlUsername: username,
    authUser: user,
    userRole,
    userUsername: user?.username,
    userPortfolioSlug: user?.portfolioSlug,
    isUsernameMatch,
    isOwnerView,
  })

  const [profile, setProfile] = useState<Profile | null>(null)

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // ===== Fetch profile =====
  useEffect(() => {
    if (!username) return
    profileService
      .getPublicProfile(username)
      .then(setProfile)
      .catch(() => {})
  }, [username])

  // ===== Build contact info =====
  const contactInfo = [
    ...(profile?.email
      ? [
          {
            icon: 'pi pi-envelope',
            label: 'Email',
            value: profile.email,
            href: `mailto:${profile.email}`,
            color: '#3b82f6',
          },
        ]
      : []),
    ...(profile?.location
      ? [
          {
            icon: 'pi pi-map-marker',
            label: 'Lokasi',
            value: profile.location,
            href: null,
            color: '#ef4444',
          },
        ]
      : []),
    ...(profile?.socials || []).map((s) => ({
      icon: s.icon || 'pi pi-link',
      label: s.label || 'Link',
      value: s.url.replace(/^https?:\/\//, ''),
      href: s.url,
      color: '#8b5cf6',
    })),
  ]

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama wajib diisi'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nama minimal 2 karakter'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subjek wajib diisi'
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subjek minimal 3 karakter'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Pesan wajib diisi'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Pesan minimal 10 karakter'
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Pesan maksimal 2000 karakter'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    if (!username) {
      setSubmitError('Username tidak ditemukan di URL.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await messageService.send(username, formData)
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (err) {
      console.error('Submit error:', err)
      setSubmitError(
        'Gagal mengirim pesan. Coba lagi atau hubungi via email.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setSubmitError(null)
    setErrors({})
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const userPath = (path: string = '') => {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `/${username}${clean}`
  }

  // ⭐ Teks kondisional
  const heroBadgeText = isOwnerView
    ? 'Preview — Contact Page'
    : 'Open for Collaboration'

  const heroSubtitle = isOwnerView
    ? 'Ini halaman kontak publik kamu. Info kontak di bawah ini yang akan dilihat pengunjung portfolio kamu.'
    : 'Punya project, pertanyaan, atau mau kolaborasi? Kirim pesan di bawah. Saya biasanya balas dalam 1-2 hari kerja.'

  return (
    <div className={`contact-wrapper ${isOwnerView ? 'is-owner-view' : ''}`}>
      <SEO
        title={`Contact ${profile?.fullName || username || ''}`}
        description="Hubungi saya untuk kolaborasi, freelance, atau sekadar ngobrol soal tech."
        url={userPath('/contact')}
        keywords={['contact', 'hubungi', 'kolaborasi', 'freelance']}
      />

      {/* ===== HERO ===== */}
      <section className="contact-hero">
        <div className="contact-hero-bg">
          <div className="contact-hero-orb contact-hero-orb-1" />
          <div className="contact-hero-orb contact-hero-orb-2" />
          <div className="contact-hero-grid" />
        </div>

        <AnimatedSection variant="fade-up">
          <div className="contact-hero-container">
            <span className="contact-hero-badge">
              <span className="contact-hero-badge-dot"></span>
              {heroBadgeText}
            </span>

            <h1 className="contact-title">
              Let's <span className="contact-title-gradient">Talk</span>{' '}
              <span className="contact-title-emoji">👋</span>
            </h1>

            <p className="contact-subtitle">{heroSubtitle}</p>

            <div className="contact-hero-stats">
              <div className="contact-hero-stat">
                <i className="pi pi-clock"></i>
                <div>
                  <strong>1-2 hari</strong>
                  <span>Response time</span>
                </div>
              </div>
              <div className="contact-hero-stat-divider" />
              <div className="contact-hero-stat">
                <i className="pi pi-check-circle"></i>
                <div>
                  <strong>100%</strong>
                  <span>Balas semua pesan</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="contact-section">
        <div className="contact-section-inner">
          <div className="contact-grid">
            {/* FORM — hanya kalau BUKAN owner view */}
            {!isOwnerView && (
              <div className="contact-form-wrapper">
                <AnimatedSection variant="fade-right">
                  <div className="contact-form-card">
                    {submitted ? (
                      <div className="contact-success">
                        <div className="contact-success-icon">
                          <i className="pi pi-check-circle"></i>
                        </div>
                        <h2 className="contact-success-title">
                          Pesan Terkirim! 🎉
                        </h2>
                        <p className="contact-success-desc">
                          Terima kasih sudah menghubungi saya. Pesan kamu sudah
                          masuk. Saya bakal balas secepatnya via email.
                        </p>
                        <div className="contact-success-actions">
                          <Button
                            label="Kirim Pesan Lagi"
                            icon="pi pi-refresh"
                            onClick={handleReset}
                          />
                          <Button
                            label="Lihat Works"
                            icon="pi pi-briefcase"
                            severity="secondary"
                            outlined
                            onClick={() => {
                              window.location.href = userPath('/projects')
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="contact-form">
                        <div className="contact-form-header">
                          <div className="contact-form-header-icon">
                            <i className="pi pi-send"></i>
                          </div>
                          <div className="contact-form-header-text">
                            <h2 className="contact-form-title">Kirim Pesan</h2>
                            <p className="contact-form-subtitle">
                              Isi form di bawah, saya akan balas secepatnya.
                            </p>
                          </div>
                        </div>

                        {submitError && (
                          <Message
                            severity="error"
                            text={submitError}
                            className="w-full"
                          />
                        )}

                        <div className="contact-form-row">
                          <div className="contact-field">
                            <label htmlFor="name" className="contact-label">
                              Nama <span className="contact-required">*</span>
                            </label>
                            <InputText
                              id="name"
                              value={formData.name}
                              onChange={(e) =>
                                handleChange('name', e.target.value)
                              }
                              placeholder="Nama kamu"
                              className={
                                errors.name ? 'p-invalid w-full' : 'w-full'
                              }
                              maxLength={100}
                            />
                            {errors.name && (
                              <small className="contact-error">
                                <i className="pi pi-exclamation-circle"></i>
                                {errors.name}
                              </small>
                            )}
                          </div>

                          <div className="contact-field">
                            <label htmlFor="email" className="contact-label">
                              Email <span className="contact-required">*</span>
                            </label>
                            <InputText
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                handleChange('email', e.target.value)
                              }
                              placeholder="email@kamu.com"
                              className={
                                errors.email ? 'p-invalid w-full' : 'w-full'
                              }
                              maxLength={200}
                            />
                            {errors.email && (
                              <small className="contact-error">
                                <i className="pi pi-exclamation-circle"></i>
                                {errors.email}
                              </small>
                            )}
                          </div>
                        </div>

                        <div className="contact-field">
                          <label htmlFor="subject" className="contact-label">
                            Subjek <span className="contact-required">*</span>
                          </label>
                          <InputText
                            id="subject"
                            value={formData.subject}
                            onChange={(e) =>
                              handleChange('subject', e.target.value)
                            }
                            placeholder="Ada yang bisa saya bantu?"
                            className={
                              errors.subject ? 'p-invalid w-full' : 'w-full'
                            }
                            maxLength={200}
                          />
                          {errors.subject && (
                            <small className="contact-error">
                              <i className="pi pi-exclamation-circle"></i>
                              {errors.subject}
                            </small>
                          )}
                        </div>

                        <div className="contact-field">
                          <label htmlFor="message" className="contact-label">
                            Pesan <span className="contact-required">*</span>
                          </label>
                          <InputTextarea
                            id="message"
                            value={formData.message}
                            onChange={(e) =>
                              handleChange('message', e.target.value)
                            }
                            placeholder="Tulis pesan kamu di sini..."
                            rows={6}
                            autoResize
                            className={
                              errors.message ? 'p-invalid w-full' : 'w-full'
                            }
                            maxLength={2000}
                          />
                          <div className="contact-message-footer">
                            {errors.message ? (
                              <small className="contact-error">
                                <i className="pi pi-exclamation-circle"></i>
                                {errors.message}
                              </small>
                            ) : (
                              <span />
                            )}
                            <span className="contact-char-count">
                              {formData.message.length} / 2000
                            </span>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="contact-submit-btn"
                          disabled={submitting}
                        >
                          <span className="contact-submit-btn-icon">
                            <i
                              className={
                                submitting
                                  ? 'pi pi-spin pi-spinner'
                                  : 'pi pi-send'
                              }
                            ></i>
                          </span>
                          <span className="contact-submit-btn-content">
                            <span className="contact-submit-btn-label">
                              {submitting ? 'Mengirim...' : 'Kirim Pesan'}
                            </span>
                            <span className="contact-submit-btn-sub">
                              {submitting
                                ? 'Mohon tunggu sebentar'
                                : 'Saya akan balas via email'}
                            </span>
                          </span>
                          <i className="pi pi-arrow-right contact-submit-btn-arrow"></i>
                        </button>

                        <p className="contact-privacy">
                          <i className="pi pi-lock"></i>
                          Info kamu aman. Nggak akan di-share ke pihak lain.
                        </p>
                      </form>
                    )}
                  </div>
                </AnimatedSection>
              </div>
            )}

            {/* SIDEBAR — selalu tampil */}
            <div className="contact-info-wrapper">
              <AnimatedSection variant="fade-left" delay={100}>
                <div className="contact-info-card">
                  <div className="contact-info-header">
                    <div className="contact-info-header-icon">
                      <i className="pi pi-address-book"></i>
                    </div>
                    <div>
                      <h3 className="contact-info-title">Kontak Langsung</h3>
                      <p className="contact-info-desc">
                        {isOwnerView
                          ? 'Info ini yang akan dilihat pengunjung kamu:'
                          : 'Lebih suka kontak langsung? Bisa lewat:'}
                      </p>
                    </div>
                  </div>

                  <div className="contact-info-list">
                    {contactInfo.length === 0 ? (
                      <p className="text-color-secondary">
                        {isOwnerView
                          ? 'Kamu belum mengisi email, lokasi, atau social links di profile. Yuk lengkapi di halaman Profile.'
                          : 'Info kontak belum di-setup.'}
                      </p>
                    ) : (
                      contactInfo.map((info) => (
                        <div
                          key={`${info.label}-${info.value}`}
                          className="contact-info-item"
                        >
                          <div
                            className="contact-info-icon"
                            style={
                              {
                                '--info-color': info.color,
                              } as React.CSSProperties
                            }
                          >
                            <i className={info.icon}></i>
                          </div>
                          <div className="contact-info-content">
                            <span className="contact-info-label">
                              {info.label}
                            </span>
                            {info.href ? (
                              <a
                                href={info.href}
                                target={
                                  info.href.startsWith('http')
                                    ? '_blank'
                                    : undefined
                                }
                                rel="noopener noreferrer"
                                className="contact-info-value"
                              >
                                {info.value}
                                <i className="pi pi-arrow-up-right"></i>
                              </a>
                            ) : (
                              <span className="contact-info-value">
                                {info.value}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Divider className="contact-info-divider" />

                  <div className="contact-info-note">
                    <i className="pi pi-clock"></i>
                    <div>
                      <strong>Response Time</strong>
                      <p>Biasanya balas dalam 1-2 hari kerja.</p>
                    </div>
                  </div>

                  {/* Tombol edit profile hanya untuk owner */}
                  {isOwnerView && (
                    <>
                      <Divider className="contact-info-divider" />
                      <Button
                        label="Edit Info Kontak"
                        icon="pi pi-pencil"
                        outlined
                        className="w-full"
                        onClick={() => {
                          window.location.href = `/${username}/dashboard/profile`
                        }}
                      />
                    </>
                  )}
                </div>
              </AnimatedSection>

              <AnimatedSection variant="fade-left" delay={200}>
                <div className="contact-faq-card">
                  <div className="contact-faq-header">
                    <div className="contact-faq-header-icon">
                      <i className="pi pi-question-circle"></i>
                    </div>
                    <h4 className="contact-faq-title">
                      {isOwnerView ? 'Preview FAQ' : 'Sering Ditanya'}
                    </h4>
                  </div>
                  <div className="contact-faq-list">
                    <div className="contact-faq-item">
                      <div className="contact-faq-q">
                        <i className="pi pi-comment"></i>
                        <strong>Kamu open untuk freelance?</strong>
                      </div>
                      <p>Ya, saya open untuk freelance & full-time.</p>
                    </div>
                    <div className="contact-faq-item">
                      <div className="contact-faq-q">
                        <i className="pi pi-comment"></i>
                        <strong>Bisa bikin karya custom?</strong>
                      </div>
                      <p>
                        Bisa. Kirim detail project via form di samping.
                      </p>
                    </div>
                    <div className="contact-faq-item">
                      <div className="contact-faq-q">
                        <i className="pi pi-comment"></i>
                        <strong>Berapa lama prosesnya?</strong>
                      </div>
                      <p>
                        Tergantung kompleksitas. Diskusi dulu via email.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact