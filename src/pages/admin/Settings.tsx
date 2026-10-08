import { useEffect, useState, useRef } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { InputSwitch } from 'primereact/inputswitch'
import { InputNumber } from 'primereact/inputnumber'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { Skeleton } from 'primereact/skeleton'
import { settingService } from '@/services/settingService'
import { BackupTab } from '@/components/admin/BackupTab'   // ⭐ NEW
import type {
  PlatformSetting,
  PlatformSettingFormData,
} from '@/types/setting'

type SectionKey =
  | 'branding'
  | 'defaultUser'
  | 'domain'
  | 'email'
  | 'security'
  | 'storage'
  | 'payment'

interface SectionConfig {
  key: SectionKey
  icon: string
  tone: string
  title: string
  desc: string
}

const SECTIONS: SectionConfig[] = [
  {
    key: 'branding',
    icon: 'pi pi-palette',
    tone: 'blue',
    title: 'Platform branding',
    desc: 'Nama, logo, dan warna brand platform.',
  },
  {
    key: 'defaultUser',
    icon: 'pi pi-users',
    tone: 'purple',
    title: 'Default role user',
    desc: 'Role & approval otomatis untuk user baru.',
  },
  {
    key: 'domain',
    icon: 'pi pi-globe',
    tone: 'cyan',
    title: 'Domain & subdomain',
    desc: 'Domain utama dan pattern portfolio user.',
  },
  {
    key: 'email',
    icon: 'pi pi-envelope',
    tone: 'green',
    title: 'Email notifications',
    desc: 'Notifikasi email untuk event penting.',
  },
  {
    key: 'security',
    icon: 'pi pi-lock',
    tone: 'amber',
    title: 'Security & auth',
    desc: 'Kebijakan password & session timeout.',
  },
  {
    key: 'storage',
    icon: 'pi pi-database',
    tone: 'pink',
    title: 'Storage & backup',
    desc: 'Info storage dan backup data platform.',
  },
  {
    key: 'payment',
    icon: 'pi pi-credit-card',
    tone: 'green',
    title: 'Payment & registration',
    desc: 'Biaya registrasi dan metode pembayaran.',
  },
]

const LOGO_ICONS = [
  'pi pi-bolt',
  'pi pi-sparkles',
  'pi pi-code',
  'pi pi-star',
  'pi pi-heart',
  'pi pi-shield',
  'pi pi-crown',
  'pi pi-globe',
]

const ROLE_OPTIONS = [
  { label: 'Owner', value: 'OWNER' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
]

function AdminSettings() {
  const toast = useRef<Toast>(null)

  const [settings, setSettings] = useState<PlatformSetting | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null)
  const [form, setForm] = useState<PlatformSettingFormData>({})
  const [saving, setSaving] = useState(false)
  const [storageTab, setStorageTab] = useState<'info' | 'backup'>('info')  // ⭐ NEW

  // ============================================================
  // FETCH
  // ============================================================
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await settingService.getSettings()
        setSettings(data)
      } catch (err) {
        console.error(err)
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Gagal memuat settings',
          life: 3000,
        })
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // ============================================================
  // OPEN EDIT
  // ============================================================
  const openEdit = (key: SectionKey) => {
    if (!settings) return
    setForm({ ...settings })
    setEditingSection(key)
    setStorageTab('info')  // ⭐ reset tab setiap buka
  }

  const closeEdit = () => {
    setEditingSection(null)
    setForm({})
    setStorageTab('info')  // ⭐ reset tab setiap tutup
  }

  // ============================================================
  // SAVE
  // ============================================================
  const handleSave = async () => {
    if (!editingSection) return

    try {
      setSaving(true)
      const updated = await settingService.updateSettings(form)
      setSettings(updated)
      closeEdit()
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Settings berhasil disimpan',
        life: 3000,
      })
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal menyimpan settings',
        life: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = <K extends keyof PlatformSettingFormData>(
    key: K,
    value: PlatformSettingFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="dash">
        <Skeleton height="180px" borderRadius="20px" />
        <div className="set-grid">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} height="90px" borderRadius="14px" />
          ))}
        </div>
      </div>
    )
  }

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
            <span className="dash-hero-greeting">
              <i className="pi pi-cog" />
              Configuration
            </span>
            <h1 className="dash-hero-title">
              Platform <span className="dash-hero-name">settings</span>
            </h1>
            <p className="dash-hero-desc">
              Konfigurasi global platform. Ubah branding, keamanan, dan
              preferensi default user.
            </p>
          </div>

          <div className="dash-hero-right">
            <div className="dash-hero-meta">
              <span className="dash-hero-meta-item">
                <span
                  className="dash-hero-meta-dot"
                  style={{
                    background: '#10b981',
                    boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                  }}
                />
                {settings?.updatedAt
                  ? `Updated ${new Date(settings.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'Default settings'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SETTINGS GRID ===== */}
      <section className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-head-left">
            <span className="dash-section-eyebrow">
              <i className="pi pi-sliders-h" />
              Configuration
            </span>
            <h2 className="dash-section-title">Pengaturan platform</h2>
          </div>
        </div>

        <div className="set-grid">
          {SECTIONS.map((item, i) => {
            let preview = ''
            if (item.key === 'branding') {
              preview = settings?.platformName || 'Nexus'
            } else if (item.key === 'defaultUser') {
              preview = settings?.autoApproveUsers
                ? 'Auto-approve'
                : 'Manual approval'
            } else if (item.key === 'domain') {
              preview = settings?.primaryDomain || 'portfolio.com'
            } else if (item.key === 'email') {
              const enabled = [
                settings?.emailNewUser,
                settings?.emailNewMessage,
                settings?.emailUserApproved,
              ].filter(Boolean).length
              preview = `${enabled}/4 aktif`
            } else if (item.key === 'security') {
              preview = `Min ${settings?.minPasswordLength || 8} karakter`
            } else if (item.key === 'storage') {
              preview = 'Backup & restore'   // ⭐ UPDATE
            } else if (item.key === 'payment') {
              preview = settings?.registrationPaymentEnabled
                ? `Rp ${(settings.registrationFeeIdr || 0).toLocaleString('id-ID')}`
                : 'Nonaktif'
            }

            return (
              <button
                key={item.key}
                type="button"
                className="set-item"
                style={{ animationDelay: `${i * 40}ms` }}
                onClick={() => openEdit(item.key)}
              >
                <span className={`set-item-icon tone-${item.tone}`}>
                  <i className={item.icon} />
                </span>
                <div className="set-item-body">
                  <strong className="set-item-title">{item.title}</strong>
                  <span className="set-item-desc">{item.desc}</span>
                  <span className="set-item-preview">{preview}</span>
                </div>
                <span className="set-item-badge is-action">
                  <i className="pi pi-pencil" />
                  Edit
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ============================================================
          EDIT DIALOG
         ============================================================ */}
      <Dialog
        visible={editingSection !== null}
        onHide={closeEdit}
        header={
          <div className="set-dialog-head">
            <span
              className={`set-dialog-head-icon tone-${
                SECTIONS.find((s) => s.key === editingSection)?.tone || 'blue'
              }`}
            >
              <i
                className={
                  SECTIONS.find((s) => s.key === editingSection)?.icon ||
                  'pi pi-cog'
                }
              />
            </span>
            <div className="set-dialog-head-text">
              <strong>
                {SECTIONS.find((s) => s.key === editingSection)?.title}
              </strong>
              <span>
                {SECTIONS.find((s) => s.key === editingSection)?.desc}
              </span>
            </div>
          </div>
        }
        style={{ width: '600px', maxWidth: '95vw' }}
        modal
        blockScroll
        className="ap-dialog"
        headerStyle={{ background: 'var(--bg-primary)' }}
        contentStyle={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
        }}
        footer={
          // ⭐ Sembunyikan footer saat tab Backup aktif (karena backup punya tombol sendiri)
          editingSection === 'storage' && storageTab === 'backup' ? null : (
            <div className="set-dialog-foot">
              <button
                type="button"
                className="add-user-btn ghost"
                onClick={closeEdit}
                disabled={saving}
              >
                <i className="pi pi-times" />
                <span>Batal</span>
              </button>
              <button
                type="button"
                className="add-user-btn primary"
                onClick={handleSave}
                disabled={saving}
              >
                <i
                  className={
                    saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'
                  }
                />
                <span>{saving ? 'Menyimpan…' : 'Simpan'}</span>
              </button>
            </div>
          )
        }
      >
        {/* ===== BRANDING ===== */}
        {editingSection === 'branding' && (
          <div className="set-dialog-body">
            <div className="set-form-field">
              <label className="set-form-label">Nama platform</label>
              <InputText
                value={form.platformName || ''}
                onChange={(e) => updateField('platformName', e.target.value)}
                placeholder="Nexus"
                maxLength={100}
                className="w-full"
              />
              <small className="set-form-hint">
                Muncul di logo, title, dan footer.
              </small>
            </div>

            <div className="set-form-field">
              <label className="set-form-label">Tagline</label>
              <InputText
                value={form.tagline || ''}
                onChange={(e) => updateField('tagline', e.target.value)}
                placeholder="Portfolio Platform"
                maxLength={200}
                className="w-full"
              />
            </div>

            <div className="set-form-field">
              <label className="set-form-label">Logo icon</label>
              <Dropdown
                value={form.logoIcon}
                options={LOGO_ICONS.map((icon) => ({
                  label: icon,
                  value: icon,
                }))}
                onChange={(e) => updateField('logoIcon', e.value)}
                itemTemplate={(option) => (
                  <div className="set-icon-option">
                    <i className={option.value} />
                    <span>{option.label}</span>
                  </div>
                )}
                className="w-full"
              />
            </div>

            <div className="set-form-grid">
              <div className="set-form-field">
                <label className="set-form-label">Primary color</label>
                <div className="set-color-field">
                  <input
                    type="color"
                    value={form.primaryColor || '#3b82f6'}
                    onChange={(e) =>
                      updateField('primaryColor', e.target.value)
                    }
                  />
                  <InputText
                    value={form.primaryColor || '#3b82f6'}
                    onChange={(e) =>
                      updateField('primaryColor', e.target.value)
                    }
                    maxLength={20}
                  />
                </div>
              </div>

              <div className="set-form-field">
                <label className="set-form-label">Accent color</label>
                <div className="set-color-field">
                  <input
                    type="color"
                    value={form.accentColor || '#8b5cf6'}
                    onChange={(e) =>
                      updateField('accentColor', e.target.value)
                    }
                  />
                  <InputText
                    value={form.accentColor || '#8b5cf6'}
                    onChange={(e) =>
                      updateField('accentColor', e.target.value)
                    }
                    maxLength={20}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== DEFAULT USER ===== */}
        {editingSection === 'defaultUser' && (
          <div className="set-dialog-body">
            <div className="set-form-field">
              <label className="set-form-label">Default role user baru</label>
              <Dropdown
                value={form.defaultRole}
                options={ROLE_OPTIONS}
                onChange={(e) => updateField('defaultRole', e.value)}
                placeholder="Pilih role"
                className="w-full"
              />
              <small className="set-form-hint">
                Role yang otomatis diberikan ke user baru.
              </small>
            </div>

            <div className="set-toggle-row">
              <div className="set-toggle-info">
                <strong>Auto-approve user baru</strong>
                <span>
                  Kalau aktif, user langsung ACTIVE tanpa perlu approval admin.
                </span>
              </div>
              <InputSwitch
                checked={form.autoApproveUsers || false}
                onChange={(e) => updateField('autoApproveUsers', e.value)}
              />
            </div>
          </div>
        )}

        {/* ===== DOMAIN ===== */}
        {editingSection === 'domain' && (
          <div className="set-dialog-body">
            <div className="set-form-field">
              <label className="set-form-label">Domain utama</label>
              <InputText
                value={form.primaryDomain || ''}
                onChange={(e) =>
                  updateField('primaryDomain', e.target.value)
                }
                placeholder="portfolio.com"
                maxLength={200}
                className="w-full"
              />
            </div>

            <div className="set-form-field">
              <label className="set-form-label">Pattern slug</label>
              <InputText
                value={form.slugPattern || ''}
                onChange={(e) => updateField('slugPattern', e.target.value)}
                placeholder="portfolio.com/{slug}"
                maxLength={100}
                className="w-full"
              />
              <small className="set-form-hint">
                Gunakan <code>{'{slug}'}</code> untuk placeholder slug user.
              </small>
            </div>

            <div className="set-form-field">
              <label className="set-form-label">
                Default portfolio username
              </label>
              <InputText
                value={form.defaultPortfolioUsername || ''}
                onChange={(e) =>
                  updateField('defaultPortfolioUsername', e.target.value)
                }
                placeholder="muhammad-anjar"
                maxLength={50}
                className="w-full"
              />
              <small className="set-form-hint">
                Username yang tampil saat user buka root domain (/).
              </small>
            </div>

            <div className="set-toggle-row">
              <div className="set-toggle-info">
                <strong>Allow custom slug</strong>
                <span>User boleh ganti URL portfolio mereka sendiri.</span>
              </div>
              <InputSwitch
                checked={form.allowCustomSlug || false}
                onChange={(e) => updateField('allowCustomSlug', e.value)}
              />
            </div>
          </div>
        )}

        {/* ===== EMAIL ===== */}
        {editingSection === 'email' && (
          <div className="set-dialog-body">
            <div className="set-toggle-list">
              <div className="set-toggle-row">
                <div className="set-toggle-info">
                  <strong>User baru mendaftar</strong>
                  <span>Kirim notifikasi ke admin saat ada user baru.</span>
                </div>
                <InputSwitch
                  checked={form.emailNewUser || false}
                  onChange={(e) => updateField('emailNewUser', e.value)}
                />
              </div>

              <div className="set-toggle-row">
                <div className="set-toggle-info">
                  <strong>Pesan baru masuk</strong>
                  <span>Kirim notifikasi saat ada pesan kontak baru.</span>
                </div>
                <InputSwitch
                  checked={form.emailNewMessage || false}
                  onChange={(e) =>
                    updateField('emailNewMessage', e.value)
                  }
                />
              </div>

              <div className="set-toggle-row">
                <div className="set-toggle-info">
                  <strong>User di-approve</strong>
                  <span>Email konfirmasi ke user setelah di-approve.</span>
                </div>
                <InputSwitch
                  checked={form.emailUserApproved || false}
                  onChange={(e) =>
                    updateField('emailUserApproved', e.value)
                  }
                />
              </div>

              <div className="set-toggle-row">
                <div className="set-toggle-info">
                  <strong>User di-reject</strong>
                  <span>Email pemberitahuan saat user di-reject.</span>
                </div>
                <InputSwitch
                  checked={form.emailUserRejected || false}
                  onChange={(e) =>
                    updateField('emailUserRejected', e.value)
                  }
                />
              </div>
            </div>

            <div className="set-form-field">
              <label className="set-form-label">Email notifikasi admin</label>
              <InputText
                value={form.notificationEmail || ''}
                onChange={(e) =>
                  updateField('notificationEmail', e.target.value)
                }
                placeholder="admin@portfolio.com"
                maxLength={200}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* ===== SECURITY ===== */}
        {editingSection === 'security' && (
          <div className="set-dialog-body">
            <div className="set-form-grid">
              <div className="set-form-field">
                <label className="set-form-label">
                  Minimal panjang password
                </label>
                <InputNumber
                  value={form.minPasswordLength || 8}
                  onValueChange={(e) =>
                    updateField('minPasswordLength', e.value ?? 8)
                  }
                  min={6}
                  max={32}
                  showButtons
                  className="w-full"
                />
              </div>

              <div className="set-form-field">
                <label className="set-form-label">
                  Session timeout (menit)
                </label>
                <InputNumber
                  value={form.sessionTimeoutMinutes || 60}
                  onValueChange={(e) =>
                    updateField('sessionTimeoutMinutes', e.value ?? 60)
                  }
                  min={5}
                  max={1440}
                  showButtons
                  className="w-full"
                />
              </div>

              <div className="set-form-field">
                <label className="set-form-label">
                  Maks login attempts
                </label>
                <InputNumber
                  value={form.maxLoginAttempts || 5}
                  onValueChange={(e) =>
                    updateField('maxLoginAttempts', e.value ?? 5)
                  }
                  min={1}
                  max={20}
                  showButtons
                  className="w-full"
                />
              </div>
            </div>

            <div className="set-toggle-list">
              <div className="set-toggle-row">
                <div className="set-toggle-info">
                  <strong>Wajib huruf besar</strong>
                  <span>Password harus mengandung A-Z.</span>
                </div>
                <InputSwitch
                  checked={form.requireUppercase || false}
                  onChange={(e) =>
                    updateField('requireUppercase', e.value)
                  }
                />
              </div>

              <div className="set-toggle-row">
                <div className="set-toggle-info">
                  <strong>Wajib angka</strong>
                  <span>Password harus mengandung 0-9.</span>
                </div>
                <InputSwitch
                  checked={form.requireNumber || false}
                  onChange={(e) => updateField('requireNumber', e.value)}
                />
              </div>

              <div className="set-toggle-row">
                <div className="set-toggle-info">
                  <strong>Wajib karakter spesial</strong>
                  <span>Password harus mengandung simbol (!@#$).</span>
                </div>
                <InputSwitch
                  checked={form.requireSpecialChar || false}
                  onChange={(e) =>
                    updateField('requireSpecialChar', e.value)
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ===== STORAGE ⭐ UPDATED — dengan tab ===== */}
        {editingSection === 'storage' && (
          <div className="set-dialog-body">
            {/* TABS */}
            <div className="set-tabs">
              <button
                type="button"
                className={`set-tab ${
                  storageTab === 'info' ? 'is-active' : ''
                }`}
                onClick={() => setStorageTab('info')}
              >
                <i className="pi pi-info-circle" />
                Info
              </button>
              <button
                type="button"
                className={`set-tab ${
                  storageTab === 'backup' ? 'is-active' : ''
                }`}
                onClick={() => setStorageTab('backup')}
              >
                <i className="pi pi-cloud-download" />
                Backup
              </button>
            </div>

            {/* TAB: INFO */}
            {storageTab === 'info' && (
              <div className="set-storage-card">
                <div className="set-storage-row">
                  <span className="set-storage-label">
                    <i className="pi pi-database" />
                    Database
                  </span>
                  <span className="set-storage-value">
                    PostgreSQL (active)
                  </span>
                </div>
                <div className="set-storage-row">
                  <span className="set-storage-label">
                    <i className="pi pi-folder" />
                    Storage files
                  </span>
                  <span className="set-storage-value">
                    Local / Cloudinary
                  </span>
                </div>
                <div className="set-storage-row">
                  <span className="set-storage-label">
                    <i className="pi pi-clock" />
                    Last backup
                  </span>
                  <span className="set-storage-value">—</span>
                </div>
              </div>
            )}

            {/* TAB: BACKUP */}
            {storageTab === 'backup' && <BackupTab />}
          </div>
        )}

        {/* ===== PAYMENT ===== */}
        {editingSection === 'payment' && (
          <div className="set-dialog-body">
            <div className="set-toggle-row">
              <div className="set-toggle-info">
                <strong>Aktifkan payment di registrasi</strong>
                <span>
                  User baru wajib bayar sebelum di-review admin.
                </span>
              </div>
              <InputSwitch
                checked={form.registrationPaymentEnabled || false}
                onChange={(e) =>
                  updateField('registrationPaymentEnabled', e.value)
                }
              />
            </div>

            <div className="set-form-field">
              <label className="set-form-label">Biaya registrasi (Rp)</label>
              <InputNumber
                value={form.registrationFeeIdr || 0}
                onValueChange={(e) =>
                  updateField('registrationFeeIdr', e.value ?? 0)
                }
                mode="currency"
                currency="IDR"
                locale="id-ID"
                min={0}
                className="w-full"
              />
              <small className="set-form-hint">
                Nominal yang harus dibayar user saat registrasi.
              </small>
            </div>

            <div className="set-form-field">
              <label className="set-form-label">
                Expiry pembayaran (menit)
              </label>
              <InputNumber
                value={form.paymentExpiryMinutes || 15}
                onValueChange={(e) =>
                  updateField('paymentExpiryMinutes', e.value ?? 15)
                }
                min={1}
                max={1440}
                showButtons
                className="w-full"
              />
              <small className="set-form-hint">
                QR / VA otomatis expired setelah durasi ini.
              </small>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}

export default AdminSettings