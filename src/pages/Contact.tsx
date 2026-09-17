import { useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { Card } from 'primereact/card'
import { messageService } from '@/services/messageService'
import type { ContactFormData } from '@/types/message'

// ===== INFO KONTAK ALTERNATIF =====
// Nanti bisa di-fetch dari profile API kalau mau
const CONTACT_INFO = [
  {
    icon: 'pi pi-envelope',
    label: 'Email',
    value: 'anjar@email.com',
    href: 'mailto:anjar@email.com',
  },
  {
    icon: 'pi pi-map-marker',
    label: 'Lokasi',
    value: 'Jakarta, Indonesia',
    href: null,
  },
  {
    icon: 'pi pi-github',
    label: 'GitHub',
    value: 'github.com/anjarfals-07',
    href: 'https://github.com/anjarfals-07',
  },
  {
    icon: 'pi pi-linkedin',
    label: 'LinkedIn',
    value: 'linkedin.com/in/anjar',
    href: 'https://linkedin.com/in/anjar',
  },
]

// ===== VALIDASI =====
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

function Contact() {
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

  // ===== HANDLE CHANGE =====
  const handleChange = (
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error saat user ngetik
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // ===== VALIDASI =====
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

  // ===== SUBMIT =====
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!validate()) return

  setSubmitting(true)
  setSubmitError(null)

  try {
    // POST ke backend
    await messageService.send(formData)

    setSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  } catch (err) {
    console.error('Submit error:', err)
    setSubmitError('Gagal mengirim pesan. Coba lagi atau hubungi via email.')
  } finally {
    setSubmitting(false)
  }
}

  // ===== RESET =====
  const handleReset = () => {
    setSubmitted(false)
    setSubmitError(null)
    setErrors({})
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="contact-wrapper">
      {/* ===== HEADER ===== */}
      <section className="contact-hero">
        <div className="contact-hero-container">
          <h1 className="contact-title">Let's Talk! 👋</h1>
          <p className="contact-subtitle">
            Punya project, pertanyaan, atau mau kolaborasi? Kirim pesan di bawah.
            Saya biasanya balas dalam 1-2 hari.
          </p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="section">
        <div className="section-container">
          <div className="contact-grid">
            {/* ===== FORM ===== */}
            <div className="contact-form-wrapper">
              <Card className="contact-form-card">
                {submitted ? (
                  // ===== SUCCESS STATE =====
                  <div className="contact-success">
                    <div className="contact-success-icon">
                      <i className="pi pi-check-circle"></i>
                    </div>
                    <h2 className="contact-success-title">Pesan Terkirim! 🎉</h2>
                    <p className="contact-success-desc">
                      Terima kasih sudah menghubungi saya. Pesan kamu sudah masuk.
                      Saya bakal balas secepatnya via email.
                    </p>
                    <div className="flex gap-2 justify-content-center flex-wrap mt-4">
                      <Button
                        label="Kirim Pesan Lagi"
                        icon="pi pi-refresh"
                        onClick={handleReset}
                      />
                      <Button
                        label="Lihat Projects"
                        icon="pi pi-briefcase"
                        severity="secondary"
                        outlined
                        onClick={() => (window.location.href = '/projects')}
                      />
                    </div>
                  </div>
                ) : (
                  // ===== FORM STATE =====
                  <form onSubmit={handleSubmit} className="contact-form">
                    <h2 className="contact-form-title">
                      <i className="pi pi-send mr-2"></i>
                      Kirim Pesan
                    </h2>

                    {submitError && (
                      <Message
                        severity="error"
                        text={submitError}
                        className="w-full mb-3"
                      />
                    )}

                    {/* Name */}
                    <div className="contact-field">
                      <label htmlFor="name" className="contact-label">
                        Nama <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Nama kamu"
                        className={errors.name ? 'p-invalid w-full' : 'w-full'}
                        maxLength={100}
                      />
                      {errors.name && (
                        <small className="contact-error">{errors.name}</small>
                      )}
                    </div>

                    {/* Email */}
                    <div className="contact-field">
                      <label htmlFor="email" className="contact-label">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="email@kamu.com"
                        className={errors.email ? 'p-invalid w-full' : 'w-full'}
                        maxLength={200}
                      />
                      {errors.email && (
                        <small className="contact-error">{errors.email}</small>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="contact-field">
                      <label htmlFor="subject" className="contact-label">
                        Subjek <span className="text-red-500">*</span>
                      </label>
                      <InputText
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        placeholder="Ada yang bisa saya bantu?"
                        className={errors.subject ? 'p-invalid w-full' : 'w-full'}
                        maxLength={200}
                      />
                      {errors.subject && (
                        <small className="contact-error">{errors.subject}</small>
                      )}
                    </div>

                    {/* Message */}
                    <div className="contact-field">
                      <label htmlFor="message" className="contact-label">
                        Pesan <span className="text-red-500">*</span>
                      </label>
                      <InputTextarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder="Tulis pesan kamu di sini..."
                        rows={6}
                        autoResize
                        className={errors.message ? 'p-invalid w-full' : 'w-full'}
                        maxLength={2000}
                      />
                      <div className="contact-char-count">
                        {formData.message.length} / 2000
                      </div>
                      {errors.message && (
                        <small className="contact-error">{errors.message}</small>
                      )}
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      label={submitting ? 'Mengirim...' : 'Kirim Pesan'}
                      icon={submitting ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
                      disabled={submitting}
                      className="contact-submit-btn"
                    />

                    <p className="contact-privacy">
                      <i className="pi pi-lock mr-1"></i>
                      Info kamu aman. Nggak akan di-share ke pihak lain.
                    </p>
                  </form>
                )}
              </Card>
            </div>

            {/* ===== SIDEBAR INFO ===== */}
            <div className="contact-info-wrapper">
              <div className="contact-info-card">
                <h3 className="contact-info-title">Kontak Langsung</h3>
                <p className="contact-info-desc">
                  Lebih suka kontak langsung? Bisa lewat:
                </p>

                <div className="contact-info-list">
                  {CONTACT_INFO.map((info) => (
                    <div key={info.label} className="contact-info-item">
                      <div className="contact-info-icon">
                        <i className={info.icon}></i>
                      </div>
                      <div className="contact-info-content">
                        <span className="contact-info-label">{info.label}</span>
                        {info.href ? (
                          <a
                            href={info.href}
                            target={
                              info.href.startsWith('http') ? '_blank' : undefined
                            }
                            rel="noopener noreferrer"
                            className="contact-info-value"
                          >
                            {info.value}
                          </a>
                        ) : (
                          <span className="contact-info-value">{info.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Divider />

                <div className="contact-info-note">
                  <i className="pi pi-clock text-primary text-xl"></i>
                  <div>
                    <strong>Response Time</strong>
                    <p>Biasanya balas dalam 1-2 hari kerja.</p>
                  </div>
                </div>
              </div>

              {/* ===== FAQ ===== */}
              <div className="contact-faq-card">
                <h4 className="contact-faq-title">
                  <i className="pi pi-question-circle mr-2"></i>
                  Sering Ditanya
                </h4>
                <div className="contact-faq-item">
                  <strong>Kamu open untuk freelance?</strong>
                  <p>Ya, saya open untuk freelance & full-time.</p>
                </div>
                <div className="contact-faq-item">
                  <strong>Bisa bikin website custom?</strong>
                  <p>Bisa. Kirim detail project via form di samping.</p>
                </div>
                <div className="contact-faq-item">
                  <strong>Berapa lama bikin website?</strong>
                  <p>Tergantung kompleksitas. Diskusi dulu via email.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact