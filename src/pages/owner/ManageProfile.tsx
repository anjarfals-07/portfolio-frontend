  import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
  import { InputText } from 'primereact/inputtext'
  import { InputTextarea } from 'primereact/inputtextarea'
  import { InputSwitch } from 'primereact/inputswitch'
  import { Button } from 'primereact/button'
  import { Toast } from 'primereact/toast'
  import { Skeleton } from 'primereact/skeleton'
  import { Message } from 'primereact/message'
  import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
  import { profileService } from '@/services/profileService'
  import type { Profile, SocialLink } from '@/types/profile'
  import type { CvPreferences } from '@/types/cv'
  import ImageUpload from '@/components/ImageUpload'

  // ⭐ CV Components (BARU)
  import CvCard from '@/components/cv/CvCard'
  import CvCustomizerPanel from '@/components/cv/CvCustomizerPanel'
  import CvPersonalInfoForm from '@/components/cv/CvPersonalInfoForm'
  import CvEducationList from '@/components/cv/CvEducationList'
  import CvWorkList from '@/components/cv/CvWorkList'
  import type { PersonalInfoData } from '@/components/cv/CvPersonalInfoForm'

  /* ============================================================
    TYPES
    ============================================================ */

  interface SocialItem extends SocialLink {
    _id: string
  }

  interface ProfileFormState {
    fullName: string
    role: string
    bio: string
    shortBio: string
    email: string
    location: string
    avatarUrl: string
    cvUrl: string
    availableForWork: boolean
    socials: SocialItem[]
  }

  /* ============================================================
    CONSTANTS
    ============================================================ */

  const genId = () =>
    `social-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  const EMPTY_FORM: ProfileFormState = {
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

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const URL_REGEX = /^https?:\/\/.+/i

  const ICON_PRESETS = [
    'pi pi-github',
    'pi pi-linkedin',
    'pi pi-twitter',
    'pi pi-instagram',
    'pi pi-facebook',
    'pi pi-youtube',
    'pi pi-envelope',
    'pi pi-globe',
    'pi pi-link',
  ]

  /* ============================================================
    HELPERS
    ============================================================ */

  const serialize = (form: ProfileFormState): string =>
    JSON.stringify({
      ...form,
      socials: form.socials.map(({ _id, ...rest }) => rest),
    })

  const toFormState = (data: Profile): ProfileFormState => ({
    fullName: data.fullName || '',
    role: data.role || '',
    bio: data.bio || '',
    shortBio: data.shortBio || '',
    email: data.email || '',
    location: data.location || '',
    avatarUrl: data.avatarUrl || '',
    cvUrl: data.cvUrl || '',
    availableForWork: data.availableForWork ?? true,
    socials: (data.socials || []).map((s) => ({ ...s, _id: genId() })),
  })

  const getCompletion = (form: ProfileFormState): number => {
    const checks = [
      form.fullName.trim(),
      form.role.trim(),
      form.shortBio.trim(),
      form.bio.trim(),
      form.email.trim(),
      form.location.trim(),
      form.avatarUrl.trim(),
      form.cvUrl.trim(),
      form.socials.length > 0 ? 'yes' : '',
    ]
    const filled = checks.filter((v) => String(v).length > 0).length
    return Math.round((filled / checks.length) * 100)
  }

  /* ============================================================
    COMPONENT
    ============================================================ */

  function ManageProfile() {
    const toast = useRef<Toast>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [notFound, setNotFound] = useState(false)
    const [form, setForm] = useState<ProfileFormState>(EMPTY_FORM)
    const [initialSnapshot, setInitialSnapshot] = useState<string>('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    // ⭐ Profile data (full) — untuk CV components
    const [profile, setProfile] = useState<Profile | null>(null)

    // ⭐ Modal customizer
    const [showCustomizer, setShowCustomizer] = useState(false)

    const isDirty = useMemo(
      () => serialize(form) !== initialSnapshot,
      [form, initialSnapshot]
    )

    const completion = useMemo(() => getCompletion(form), [form])

    /* ------------------------------------------------------------
      FETCH
      ------------------------------------------------------------ */
    const fetchProfile = useCallback(async () => {
      try {
        setLoading(true)
        setNotFound(false)
        const data: Profile = await profileService.get()
        const next = toFormState(data)
        setForm(next)
        setProfile(data)              // ⭐ simpan full profile
        setInitialSnapshot(serialize(next))
        setErrors({})
      } catch (err: unknown) {
        const axiosErr = err as { response?: { status?: number } }
        if (axiosErr.response?.status === 404) {
          setNotFound(true)
          setForm(EMPTY_FORM)
          setProfile(null)
          setInitialSnapshot(serialize(EMPTY_FORM))
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
    }, [])

    useEffect(() => {
      fetchProfile()
    }, [fetchProfile])

    /* ------------------------------------------------------------
      UPDATE
      ------------------------------------------------------------ */
    const update = useCallback(
      <K extends keyof ProfileFormState>(
        key: K,
        value: ProfileFormState[K]
      ) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        setErrors((prev) => {
          if (!prev[key as string]) return prev
          const next = { ...prev }
          delete next[key as string]
          return next
        })
      },
      []
    )

    /* ------------------------------------------------------------
      VALIDATE
      ------------------------------------------------------------ */
    const validate = (): boolean => {
      const errs: Record<string, string> = {}
      if (!form.fullName.trim()) errs.fullName = 'Nama lengkap wajib diisi'
      else if (form.fullName.length > 200)
        errs.fullName = 'Nama maksimal 200 karakter'
      if (form.email && !EMAIL_REGEX.test(form.email))
        errs.email = 'Format email tidak valid'
      if (form.shortBio && form.shortBio.length > 500)
        errs.shortBio = 'Short bio maksimal 500 karakter'
      form.socials.forEach((s, i) => {
        if (s.url && !URL_REGEX.test(s.url))
          errs[`social_${i}`] = `URL harus dimulai http:// atau https://`
      })
      setErrors(errs)
      return Object.keys(errs).length === 0
    }

    /* ------------------------------------------------------------
      SAVE
      ------------------------------------------------------------ */
    const handleSave = async () => {
      if (!validate()) {
        toast.current?.show({
          severity: 'warn',
          summary: 'Validasi Gagal',
          detail: 'Periksa kembali field yang bertanda merah',
          life: 3000,
        })
        return
      }
      setSaving(true)
      try {
        const payload = {
          ...form,
          socials: form.socials.map(({ _id, ...rest }) => rest),
        }
        await profileService.save(payload)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: notFound ? 'Profil berhasil dibuat' : 'Profil berhasil disimpan',
          life: 3000,
        })
        setNotFound(false)
        await fetchProfile()
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

    /* ------------------------------------------------------------
      RESET
      ------------------------------------------------------------ */
    const handleReset = () => {
      if (!isDirty) {
        fetchProfile()
        return
      }
      confirmDialog({
        message: 'Yakin ingin reset form? Perubahan yang belum disimpan akan hilang.',
        header: 'Konfirmasi Reset',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Ya, Reset',
        rejectLabel: 'Batal',
        acceptClassName: 'p-button-danger',
        accept: () => fetchProfile(),
      })
    }

      /* ------------------------------------------------------------
        PERSONAL INFO SAVE 
      ------------------------------------------------------------ */
    const handleSavePersonal = useCallback(
      async (data: PersonalInfoData) => {
        try {
          const updated = await profileService.partialUpdate(data)
          setProfile(updated)
          toast.current?.show({
            severity: 'success',
            summary: 'Data pribadi tersimpan',
            detail: 'Data berhasil disimpan',
            life: 3000,
          })
        } catch (err) {
          console.error('Failed to save personal info:', err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal menyimpan data pribadi',
            life: 3000,
          })
        }
      },
      []
    )

    /* ------------------------------------------------------------
      CV GENERATED 
      ------------------------------------------------------------ */
    const handleCvGenerated = useCallback(async () => {
      const updated = await profileService.get()
      setProfile(updated)
      const next = toFormState(updated)
      setForm(next)
      setInitialSnapshot(serialize(next))

      toast.current?.show({
        severity: 'success',
        summary: 'CV berhasil di-generate',
        detail: 'CV terbaru sudah tersimpan',
        life: 3000,
      })
    }, [])

    /* ------------------------------------------------------------
      SOCIALS
      ------------------------------------------------------------ */
    const addSocial = () => {
      update('socials', [
        ...form.socials,
        { _id: genId(), icon: 'pi pi-link', label: '', url: '' },
      ])
    }

    const updateSocial = (id: string, field: keyof SocialLink, value: string) => {
      update(
        'socials',
        form.socials.map((s) => (s._id === id ? { ...s, [field]: value } : s))
      )
    }

    const removeSocial = (id: string) => {
      update('socials', form.socials.filter((s) => s._id !== id))
    }

    /* ------------------------------------------------------------
      LOADING
      ------------------------------------------------------------ */
    if (loading) {
      return (
        <div className="admin-page">
          <div className="ap-skeleton">
            <Skeleton width="100%" height="8rem" borderRadius="20px" />
            <div className="ap-stats">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} width="100%" height="5rem" borderRadius="16px" />
              ))}
            </div>
            <Skeleton width="100%" height="12rem" borderRadius="20px" />
            <Skeleton width="100%" height="12rem" borderRadius="20px" />
          </div>
        </div>
      )
    }

    /* ------------------------------------------------------------
      RENDER
      ------------------------------------------------------------ */
    return (
      <div className="admin-page ap-page">
        <Toast ref={toast} />
        <ConfirmDialog />

        {/* ============================================
            HERO HEADER
          ============================================ */}
        <header className="ap-hero">
          <div className="ap-hero-bg">
            <span className="ap-hero-orb ap-hero-orb-1" />
            <span className="ap-hero-orb ap-hero-orb-2" />
          </div>

          <div className="ap-hero-inner">
            <div className="ap-hero-avatar">
              {form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" />
              ) : (
                <i className="pi pi-user"></i>
              )}
              {form.availableForWork && (
                <span className="ap-hero-avatar-dot" title="Available" />
              )}
            </div>

            <div className="ap-hero-text">
              <span className="ap-hero-eyebrow">
                <i className="pi pi-id-card"></i>
                Profil Publik
              </span>
              <h1 className="ap-hero-title">
                Manage <span className="ap-hero-title-gradient">Profile</span>
              </h1>
              <p className="ap-hero-subtitle">
                Atur informasi yang tampil di halaman About portfolio kamu
              </p>
            </div>

            <div className="ap-hero-actions">
              <span
                className={`ap-status-pill ${
                  isDirty ? 'is-dirty' : 'is-clean'
                }`}
              >
                <span className="ap-status-dot" />
                {isDirty ? 'Unsaved changes' : 'All saved'}
              </span>

              <Button
                label={
                  saving
                    ? 'Menyimpan...'
                    : notFound
                    ? 'Buat Profil'
                    : 'Simpan'
                }
                icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
                onClick={handleSave}
                disabled={saving || (!isDirty && !notFound)}
                className="ap-btn ap-btn-primary"
              />
            </div>
          </div>

          <div className="ap-hero-progress">
            <div
              className="ap-hero-progress-fill"
              style={{ width: `${completion}%` }}
            />
          </div>
        </header>

        {/* ============================================
            NOT FOUND BANNER
          ============================================ */}
        {notFound && (
          <div className="ap-banner">
            <div className="ap-banner-icon">
              <i className="pi pi-info-circle"></i>
            </div>
            <div className="ap-banner-text">
              <strong>Profil belum dibuat</strong>
              <p>
                Isi form di bawah lalu klik <em>Buat Profil</em> untuk membuat
                profil pertama.
              </p>
            </div>
          </div>
        )}

        {/* ============================================
            STATS
          ============================================ */}
        <div className="ap-stats">
          <StatCard
            icon="pi pi-user"
            label="Nama"
            value={form.fullName || '—'}
            tone="blue"
            filled={!!form.fullName.trim()}
          />
          <StatCard
            icon="pi pi-briefcase"
            label="Role"
            value={form.role || '—'}
            tone="purple"
            filled={!!form.role.trim()}
          />
          <StatCard
            icon="pi pi-map-marker"
            label="Lokasi"
            value={form.location || '—'}
            tone="green"
            filled={!!form.location.trim()}
          />
          <StatCard
            icon="pi pi-share-alt"
            label="Social"
            value={`${form.socials.length} link`}
            tone="orange"
            filled={form.socials.length > 0}
          />

          <div className="ap-completion">
            <div className="ap-completion-ring">
              <svg viewBox="0 0 36 36">
                <circle
                  className="ap-completion-ring-bg"
                  cx="18"
                  cy="18"
                  r="15.9155"
                />
                <circle
                  className="ap-completion-ring-fg"
                  cx="18"
                  cy="18"
                  r="15.9155"
                  strokeDasharray={`${completion}, 100`}
                />
              </svg>
              <span className="ap-completion-value">{completion}%</span>
            </div>
            <div className="ap-completion-label">
              <strong>Kelengkapan</strong>
              <span>Profil kamu</span>
            </div>
          </div>
        </div>

        {/* ============================================
            FORM
          ============================================ */}
        <div className="ap-form">
          {/* ===== SECTION 1: INFO DASAR ===== */}
          <Section
            icon="pi pi-user"
            title="Info Dasar"
            description="Identitas utama yang tampil di hero & about page"
            tone="blue"
          >
            <div className="ap-grid">
              <Field
                label="Nama Lengkap"
                required
                error={errors.fullName}
                hint={`${form.fullName.length} / 200`}
                full
              >
                <InputText
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder="Anjar Fals"
                  className={errors.fullName ? 'p-invalid w-full' : 'w-full'}
                  maxLength={200}
                  disabled={saving}
                />
              </Field>

              <Field label="Role / Posisi" hint="Contoh: Full-Stack Developer">
                <InputText
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                  placeholder="Full-Stack Developer"
                  className="w-full"
                  maxLength={200}
                  disabled={saving}
                />
              </Field>

              <Field label="Lokasi" hint="Kota, Negara">
                <InputText
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  placeholder="Jakarta, Indonesia"
                  className="w-full"
                  maxLength={200}
                  disabled={saving}
                />
              </Field>

              <Field label="Email Publik" error={errors.email}>
                <InputText
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="email@kamu.com"
                  className={errors.email ? 'p-invalid w-full' : 'w-full'}
                  maxLength={200}
                  disabled={saving}
                />
              </Field>

              <Field label="Status Ketersediaan" full>
                <div className="ap-toggle-row">
                  <InputSwitch
                    inputId="availableForWork"
                    checked={form.availableForWork}
                    onChange={(e) =>
                      update('availableForWork', e.value ?? false)
                    }
                    disabled={saving}
                  />
                  <label
                    htmlFor="availableForWork"
                    className={`ap-toggle-label ${
                      form.availableForWork ? 'is-on' : 'is-off'
                    }`}
                  >
                    <span className="ap-toggle-dot" />
                    {form.availableForWork
                      ? 'Available for work'
                      : 'Not available'}
                  </label>
                </div>
              </Field>
            </div>
          </Section>

          {/* ===== SECTION 2: BIO ===== */}
          <Section
            icon="pi pi-file-edit"
            title="Bio"
            description="Deskripsi singkat & lengkap tentang kamu"
            tone="purple"
          >
            <div className="ap-grid">
              <Field
                label="Short Bio"
                error={errors.shortBio}
                hint={`${form.shortBio.length} / 500`}
                full
              >
                <InputText
                  value={form.shortBio}
                  onChange={(e) => update('shortBio', e.target.value)}
                  placeholder="Passionate about building clean, scalable web applications."
                  className={errors.shortBio ? 'p-invalid w-full' : 'w-full'}
                  maxLength={500}
                  disabled={saving}
                />
              </Field>

              <Field
                label="Bio Lengkap"
                hint={`${form.bio.length} karakter`}
                full
              >
                <InputTextarea
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  placeholder="Ceritakan tentang diri kamu..."
                  rows={6}
                  autoResize
                  className="w-full"
                  disabled={saving}
                />
              </Field>
            </div>
          </Section>

          {/* ===== SECTION 3: MEDIA ===== */}
          <Section
            icon="pi pi-image"
            title="Media"
            description="Foto profil dan CV"
            tone="pink"
          >
            <div className="ap-avatar-block">
              <div className="ap-avatar-upload-wrap">
                <ImageUpload
                  value={form.avatarUrl || null}
                  onChange={(url) => update('avatarUrl', url || '')}
                  label="Upload Avatar"
                  aspectRatio="circle"
                  maxSizeMB={5}
                  disabled={saving}
                />

                <div className="ap-avatar-tips">
                  <div className="ap-avatar-tip">
                    <div className="ap-avatar-tip-icon">
                      <i className="pi pi-check-circle"></i>
                    </div>
                    <div>
                      <strong>Format</strong>
                      <span>JPG, PNG, WEBP</span>
                    </div>
                  </div>
                  <div className="ap-avatar-tip">
                    <div className="ap-avatar-tip-icon">
                      <i className="pi pi-expand"></i>
                    </div>
                    <div>
                      <strong>Resolusi</strong>
                      <span>500×500px</span>
                    </div>
                  </div>
                  <div className="ap-avatar-tip">
                    <div className="ap-avatar-tip-icon">
                      <i className="pi pi-database"></i>
                    </div>
                    <div>
                      <strong>Max Size</strong>
                      <span>5MB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ⭐ CV Card — ganti input manual */}
            <div className="ap-grid ap-mt">
              <Field
                label="Curriculum Vitae"
                hint="Upload PDF atau generate dari data portfolio"
                full
              >
                <CvCard
                  cvUrl={profile?.cvUrl}
                  cvSource={profile?.cvSource}
                  cvGeneratedAt={profile?.cvGeneratedAt}
                  onGenerate={() => setShowCustomizer(true)}
                  onUpload={async (file) => {
                    const { uploadService } = await import(
                      '@/services/uploadService'
                    )
                    await uploadService.uploadCv(file)
                    await fetchProfile()
                  }}
                  onDelete={async () => {
                    if (!profile?.cvUrl) return
                    const { uploadService } = await import(
                      '@/services/uploadService'
                    )
                    const publicId = uploadService.extractPublicId(profile.cvUrl)
                    if (publicId) {
                      await uploadService.deleteCv(publicId)
                      await fetchProfile()
                    }
                  }}
                  disabled={saving}
                />
              </Field>
            </div>
          </Section>

          {/* ===== ⭐ SECTION 4: PERSONAL INFO ===== */}
          <Section
            icon="pi pi-id-card"
            title="Data Pribadi"
            description="Info personal yang tampil di CV"
            tone="cyan"
          >
            <CvPersonalInfoForm
              profile={profile}
              onSave={handleSavePersonal}
              disabled={saving}
              hideHeader
            />
          </Section>

          {/* ===== ⭐ SECTION 5: EDUCATION ===== */}
          <Section
            icon="pi pi-graduation-cap"
            title="Riwayat Pendidikan"
            description="Tambah riwayat pendidikan kamu"
            tone="green"
          >
            <CvEducationList onChange={fetchProfile} disabled={saving} />
          </Section>

          {/* ===== ⭐ SECTION 6: WORK EXPERIENCE ===== */}
          <Section
            icon="pi pi-briefcase"
            title="Pengalaman Kerja"
            description="Tambah riwayat pekerjaan kamu"
            tone="orange"
          >
            <CvWorkList onChange={fetchProfile} disabled={saving} />
          </Section>

          {/* ===== SECTION 7: SOCIALS ===== */}
          <Section
            icon="pi pi-share-alt"
            title="Social Links"
            description="Link ke sosial media kamu"
            tone="green"
            badge={`${form.socials.length}`}
            action={
              <Button
                label="Tambah"
                icon="pi pi-plus"
                size="small"
                onClick={addSocial}
                disabled={saving}
                type="button"
                className="ap-btn ap-btn-primary ap-btn-sm"
              />
            }
          >
            {form.socials.length === 0 ? (
              <div className="ap-social-empty">
                <div className="ap-social-empty-icon">
                  <i className="pi pi-inbox"></i>
                </div>
                <strong>Belum ada social link</strong>
                <p>Klik "Tambah" untuk mulai menambahkan sosial media kamu.</p>
              </div>
            ) : (
              <div className="ap-socials-list">
                {form.socials.map((social, index) => (
                  <SocialRow
                    key={social._id}
                    social={social}
                    error={errors[`social_${index}`]}
                    disabled={saving}
                    onChange={(field, value) =>
                      updateSocial(social._id, field, value)
                    }
                    onRemove={() => removeSocial(social._id)}
                  />
                ))}
              </div>
            )}

            <div className="ap-social-hint">
              <i className="pi pi-info-circle"></i>
              <span>
                <strong>Tips:</strong> Icon pakai PrimeIcons (contoh:{' '}
                <code>pi pi-github</code>, <code>pi pi-linkedin</code>,{' '}
                <code>pi pi-twitter</code>)
              </span>
            </div>
          </Section>
        </div>

        {/* ============================================
            STICKY BOTTOM
          ============================================ */}
        <div className="ap-actions">
          <div
            className={`ap-actions-info ${
              isDirty ? 'is-dirty' : 'is-clean'
            }`}
          >
            <i
              className={`pi ${
                isDirty ? 'pi-exclamation-circle' : 'pi-check-circle'
              }`}
            ></i>
            <span>
              {isDirty
                ? 'Ada perubahan yang belum disimpan'
                : 'Semua perubahan tersimpan'}
            </span>
          </div>

          <div className="ap-actions-buttons">
            <Button
              label="Reset"
              icon="pi pi-refresh"
              severity="secondary"
              outlined
              onClick={handleReset}
              disabled={saving}
              type="button"
              className="ap-btn-reset"  
            />
            <Button
              label={saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="ap-btn ap-btn-primary"
              type="button"
            />
          </div>
        </div>

        {/* ============================================
            ⭐ CV CUSTOMIZER PANEL
          ============================================ */}
        <CvCustomizerPanel
          visible={showCustomizer}
          onHide={() => setShowCustomizer(false)}
          initialPreferences={profile?.cvPreferences}
          profile={profile}
          onProfileUpdate={setProfile}
          onGenerated={handleCvGenerated}
        />
      </div>
    )
  }

  /* ============================================================
    SUB-COMPONENTS
    ============================================================ */

  interface SectionProps {
    icon: string
    title: string
    description?: string
    tone?: 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan'
    badge?: string
    action?: React.ReactNode
    children: React.ReactNode
  }

  function Section({
    icon,
    title,
    description,
    tone = 'blue',
    badge,
    action,
    children,
  }: SectionProps) {
    return (
      <section className={`ap-section tone-${tone}`}>
        <header className="ap-section-header">
          <div className="ap-section-header-left">
            <div className="ap-section-icon">
              <i className={icon}></i>
            </div>
            <div className="ap-section-text">
              <div className="ap-section-title-row">
                <h2 className="ap-section-title">{title}</h2>
                {badge !== undefined && (
                  <span className="ap-section-badge">{badge}</span>
                )}
              </div>
              {description && (
                <p className="ap-section-desc">{description}</p>
              )}
            </div>
          </div>
          {action && <div className="ap-section-action">{action}</div>}
        </header>
        <div className="ap-section-body">{children}</div>
      </section>
    )
  }

  interface FieldProps {
    label: string
    required?: boolean
    error?: string
    hint?: string
    full?: boolean
    children: React.ReactNode
  }

  function Field({
    label,
    required,
    error,
    hint,
    full,
    children,
  }: FieldProps) {
    return (
      <div className={`ap-field ${full ? 'ap-field-full' : ''}`}>
        <label className="ap-label">
          {label}
          {required && <span className="ap-required">*</span>}
        </label>
        {children}
        {(hint || error) && (
          <div className="ap-field-footer">
            {error ? (
              <small className="ap-error">
                <i className="pi pi-exclamation-circle"></i>
                {error}
              </small>
            ) : (
              hint && <small className="ap-hint">{hint}</small>
            )}
          </div>
        )}
      </div>
    )
  }

  interface StatCardProps {
    icon: string
    label: string
    value: string
    tone: 'blue' | 'purple' | 'green' | 'orange'
    filled: boolean
  }

  function StatCard({ icon, label, value, tone, filled }: StatCardProps) {
    return (
      <div className={`ap-stat tone-${tone} ${filled ? 'is-filled' : ''}`}>
        <div className="ap-stat-icon">
          <i className={icon}></i>
        </div>
        <div className="ap-stat-info">
          <span className="ap-stat-label">{label}</span>
          <strong className="ap-stat-value">{value}</strong>
        </div>
        <span className="ap-stat-check">
          <i className={filled ? 'pi pi-check' : 'pi pi-minus'}></i>
        </span>
      </div>
    )
  }

  interface SocialRowProps {
    social: SocialItem
    error?: string
    disabled: boolean
    onChange: (field: keyof SocialLink, value: string) => void
    onRemove: () => void
  }

  function SocialRow({
    social,
    error,
    disabled,
    onChange,
    onRemove,
  }: SocialRowProps) {
    const [showPresets, setShowPresets] = useState(false)

    return (
      <div className={`ap-social-item ${error ? 'has-error' : ''}`}>
        <div className="ap-social-preview">
          <i className={social.icon || 'pi pi-link'}></i>
        </div>

        <div className="ap-social-fields">
          <div className="ap-social-icon-input">
            <InputText
              value={social.icon}
              onChange={(e) => onChange('icon', e.target.value)}
              placeholder="pi pi-github"
              className="ap-input"
              disabled={disabled}
              onFocus={() => setShowPresets(true)}
              onBlur={() => setTimeout(() => setShowPresets(false), 200)}
            />
            {showPresets && (
              <div className="ap-social-presets">
                {ICON_PRESETS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className={`ap-social-preset ${
                      social.icon === ic ? 'is-active' : ''
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      onChange('icon', ic)
                      setShowPresets(false)
                    }}
                    title={ic}
                  >
                    <i className={ic}></i>
                  </button>
                ))}
              </div>
            )}
          </div>

          <InputText
            value={social.label}
            onChange={(e) => onChange('label', e.target.value)}
            placeholder="Label (GitHub)"
            className="ap-input"
            disabled={disabled}
          />

          <InputText
            value={social.url}
            onChange={(e) => onChange('url', e.target.value)}
            placeholder="https://github.com/..."
            className={`ap-input ${error ? 'p-invalid' : ''}`}
            disabled={disabled}
          />
        </div>

        <Button
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          onClick={onRemove}
          tooltip="Hapus"
          tooltipOptions={{ position: 'top' }}
          disabled={disabled}
          type="button"
          aria-label="Hapus social link"
        />

        {error && (
          <div className="ap-social-error">
            <i className="pi pi-exclamation-circle"></i>
            {error}
          </div>
        )}
      </div>
    )
  }

  export default ManageProfile