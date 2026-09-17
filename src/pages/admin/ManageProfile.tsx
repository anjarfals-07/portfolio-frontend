import { useEffect, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputSwitch } from 'primereact/inputswitch'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Toast } from 'primereact/toast'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import { profileService } from '@/services/profileService'
import type { Profile, SocialLink } from '@/types/profile'

interface ProfileForm {
  fullName: string
  role: string
  bio: string
  shortBio: string
  email: string
  location: string
  avatarUrl: string
  cvUrl: string
  availableForWork: boolean
  socials: SocialLink[]
}

const EMPTY_FORM: ProfileForm = {
  fullName: '',
  role: '',
  bio: '',
  shortBio: '',
  email: '',
  location: '',
  avatarUrl: '',
  cvUrl: '',
  availableForWork: true,
  socials: [],
}

function ManageProfile() {
  const toast = useRef<Toast>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ===== FETCH PROFILE =====
  const fetchProfile = async () => {
    try {
      setLoading(true)
      setNotFound(false)
      const data: Profile = await profileService.get()

      setForm({
        fullName: data.fullName || '',
        role: data.role || '',
        bio: data.bio || '',
        shortBio: data.shortBio || '',
        email: data.email || '',
        location: data.location || '',
        avatarUrl: data.avatarUrl || '',
        cvUrl: data.cvUrl || '',
        availableForWork: data.availableForWork ?? true,
        socials: data.socials || [],
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } }
      if (axiosErr.response?.status === 404) {
        // Profile belum ada — form kosong, bisa create
        setNotFound(true)
        setForm(EMPTY_FORM)
      } else {
        console.error(err)
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat profil',
          life: 3000,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  // ===== VALIDASI =====
  const validate = (): boolean => {
    const errs: Record<string, string> = {}

    if (!form.fullName.trim()) {
      errs.fullName = 'Nama lengkap wajib diisi'
    } else if (form.fullName.length > 200) {
      errs.fullName = 'Nama maksimal 200 karakter'
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Format email tidak valid'
    }

    if (form.shortBio && form.shortBio.length > 500) {
      errs.shortBio = 'Short bio maksimal 500 karakter'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ===== SAVE =====
  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      await profileService.save(form)
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Profil berhasil disimpan',
        life: 3000,
      })
      setNotFound(false)
      // Refresh data
      fetchProfile()
    } catch (err) {
      console.error(err)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: axiosErr.response?.data?.message || 'Terjadi kesalahan',
        life: 4000,
      })
    } finally {
      setSaving(false)
    }
  }

  // ===== SOCIALS HANDLER =====
  const addSocial = () => {
    setForm({
      ...form,
      socials: [...form.socials, { icon: 'pi pi-link', url: '', label: '' }],
    })
  }

  const updateSocial = (
    index: number,
    field: keyof SocialLink,
    value: string
  ) => {
    const newSocials = [...form.socials]
    newSocials[index] = { ...newSocials[index], [field]: value }
    setForm({ ...form, socials: newSocials })
  }

  const removeSocial = (index: number) => {
    setForm({
      ...form,
      socials: form.socials.filter((_, i) => i !== index),
    })
  }

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <Skeleton width="12rem" height="2.5rem" />
        </div>
        <Card>
          <Skeleton width="100%" height="3rem" className="mb-3" />
          <Skeleton width="100%" height="3rem" className="mb-3" />
          <Skeleton width="100%" height="6rem" />
        </Card>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <Toast ref={toast} />

      {/* ===== HEADER ===== */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage Profile</h1>
          <p className="admin-page-subtitle">
            Edit informasi profil kamu yang tampil di halaman About
          </p>
        </div>
        <Button
          label={saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
          onClick={handleSave}
          disabled={saving}
        />
      </div>

      {notFound && (
        <Message
          severity="info"
          text="Profil belum ada. Isi form di bawah, lalu klik Simpan untuk membuat profil pertama."
          className="w-full"
        />
      )}

      {/* ===== FORM ===== */}
      <div className="admin-form-page">
        {/* ===== SECTION 1: INFO DASAR ===== */}
        <Card className="admin-form-card">
          <h2 className="admin-form-section-title">
            <i className="pi pi-user mr-2"></i>
            Info Dasar
          </h2>
          <Divider />

          <div className="admin-form-grid">
            {/* Nama */}
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-form-label">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <InputText
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Anjar Fals"
                className={errors.fullName ? 'p-invalid w-full' : 'w-full'}
                maxLength={200}
              />
              {errors.fullName && (
                <small className="admin-form-error">{errors.fullName}</small>
              )}
            </div>

            {/* Role */}
            <div className="admin-form-field">
              <label className="admin-form-label">Role</label>
              <InputText
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Full-Stack Developer"
                className="w-full"
                maxLength={200}
              />
            </div>

            {/* Location */}
            <div className="admin-form-field">
              <label className="admin-form-label">Lokasi</label>
              <InputText
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Jakarta, Indonesia"
                className="w-full"
                maxLength={200}
              />
            </div>

            {/* Email */}
            <div className="admin-form-field">
              <label className="admin-form-label">Email</label>
              <InputText
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@kamu.com"
                className={errors.email ? 'p-invalid w-full' : 'w-full'}
                maxLength={200}
              />
              {errors.email && (
                <small className="admin-form-error">{errors.email}</small>
              )}
            </div>

            {/* Available for work */}
            <div className="admin-form-field">
              <label className="admin-form-label">Status</label>
              <div className="admin-form-toggle-inline">
                <InputSwitch
                  inputId="availableForWork"
                  checked={form.availableForWork}
                  onChange={(e) =>
                    setForm({ ...form, availableForWork: e.value || false })
                  }
                />
                <label htmlFor="availableForWork">
                  {form.availableForWork
                    ? '✅ Available for work'
                    : '❌ Not available'}
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* ===== SECTION 2: BIO ===== */}
        <Card className="admin-form-card">
          <h2 className="admin-form-section-title">
            <i className="pi pi-file-edit mr-2"></i>
            Bio
          </h2>
          <Divider />

          <div className="admin-form-grid">
            {/* Short Bio */}
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-form-label">Short Bio</label>
              <InputText
                value={form.shortBio}
                onChange={(e) => setForm({ ...form, shortBio: e.target.value })}
                placeholder="Passionate about building clean, scalable web applications."
                className={errors.shortBio ? 'p-invalid w-full' : 'w-full'}
                maxLength={500}
              />
              <small className="admin-form-hint">
                {form.shortBio.length} / 500
              </small>
              {errors.shortBio && (
                <small className="admin-form-error">{errors.shortBio}</small>
              )}
            </div>

            {/* Bio */}
            <div className="admin-form-field admin-form-field-full">
              <label className="admin-form-label">Bio Lengkap</label>
              <InputTextarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="Ceritakan tentang diri kamu..."
                rows={6}
                autoResize
                className="w-full"
              />
              <small className="admin-form-hint">
                {form.bio.length} karakter
              </small>
            </div>
          </div>
        </Card>

        {/* ===== SECTION 3: MEDIA ===== */}
        <Card className="admin-form-card">
          <h2 className="admin-form-section-title">
            <i className="pi pi-image mr-2"></i>
            Media
          </h2>
          <Divider />

          <div className="admin-form-grid">
            {/* Avatar URL */}
            <div className="admin-form-field">
              <label className="admin-form-label">Avatar URL</label>
              <InputText
                value={form.avatarUrl}
                onChange={(e) =>
                  setForm({ ...form, avatarUrl: e.target.value })
                }
                placeholder="https://example.com/avatar.jpg"
                className="w-full"
              />
              <small className="admin-form-hint">
                Link foto profil kamu (opsional)
              </small>
            </div>

            {/* CV URL */}
            <div className="admin-form-field">
              <label className="admin-form-label">CV URL</label>
              <InputText
                value={form.cvUrl}
                onChange={(e) => setForm({ ...form, cvUrl: e.target.value })}
                placeholder="https://example.com/cv.pdf"
                className="w-full"
              />
              <small className="admin-form-hint">
                Link CV untuk tombol download
              </small>
            </div>

            {/* Avatar Preview */}
            {form.avatarUrl && (
              <div className="admin-form-field admin-form-field-full">
                <label className="admin-form-label">Preview Avatar</label>
                <div className="admin-avatar-preview">
                  <img
                    src={form.avatarUrl}
                    alt="Avatar preview"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ===== SECTION 4: SOCIALS ===== */}
        <Card className="admin-form-card">
          <div className="admin-form-section-header">
            <h2 className="admin-form-section-title">
              <i className="pi pi-share-alt mr-2"></i>
              Social Links
            </h2>
            <Button
              label="Tambah"
              icon="pi pi-plus"
              size="small"
              onClick={addSocial}
            />
          </div>
          <Divider />

          {form.socials.length === 0 ? (
            <div className="admin-social-empty">
              <i className="pi pi-inbox text-4xl text-color-secondary"></i>
              <p className="text-color-secondary">
                Belum ada social link. Klik "Tambah" untuk mulai.
              </p>
            </div>
          ) : (
            <div className="admin-socials-list">
              {form.socials.map((social, index) => (
                <div key={index} className="admin-social-item">
                  <div className="admin-social-fields">
                    <InputText
                      value={social.icon}
                      onChange={(e) =>
                        updateSocial(index, 'icon', e.target.value)
                      }
                      placeholder="pi pi-github"
                      className="admin-social-input admin-social-icon"
                    />
                    <InputText
                      value={social.label}
                      onChange={(e) =>
                        updateSocial(index, 'label', e.target.value)
                      }
                      placeholder="Label (GitHub)"
                      className="admin-social-input"
                    />
                    <InputText
                      value={social.url}
                      onChange={(e) =>
                        updateSocial(index, 'url', e.target.value)
                      }
                      placeholder="https://github.com/..."
                      className="admin-social-input admin-social-url"
                    />
                  </div>
                  <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => removeSocial(index)}
                    tooltip="Hapus"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="admin-social-hint">
            <i className="pi pi-info-circle mr-1"></i>
            <strong>Tips:</strong> Icon pakai PrimeIcons (contoh:{' '}
            <code>pi pi-github</code>, <code>pi pi-linkedin</code>,{' '}
            <code>pi pi-twitter</code>, <code>pi pi-envelope</code>)
          </div>
        </Card>

        {/* ===== BOTTOM ACTION ===== */}
        <div className="admin-form-actions-bottom">
          <Button
            label="Reset"
            icon="pi pi-refresh"
            severity="secondary"
            outlined
            onClick={fetchProfile}
            disabled={saving}
          />
          <Button
            label={saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
            onClick={handleSave}
            disabled={saving}
          />
        </div>
      </div>
    </div>
  )
}

export default ManageProfile