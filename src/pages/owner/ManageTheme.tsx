import { useEffect, useState, useRef } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import ColorPicker from '@/components/ColorPicker'
import ThemePreview from '@/components/ThemePreview'
import ThemePresets from '@/components/ThemePresets'
import { LogoRenderer } from '@/components/LogoRenderer'
import { useUserTheme } from '@/hooks/useUserTheme'
import {
  COLOR_FIELDS,
  DEFAULT_THEME,
  FONT_OPTIONS,
  HEADING_FONT_OPTIONS,
  BORDER_RADIUS_OPTIONS,
  LAYOUT_OPTIONS,
  MODE_OPTIONS,
  LOGO_TEXT_MAX_LENGTH,
  LOGO_QUICK_PRESETS,
  SHAPE_OPTIONS,
  PRIMEICON_OPTIONS,
  parseLogo,
  buildLogo,
} from '@/types/theme'
import type {
  ThemeFormData,
  ThemeLayout,
  ThemeMode,
} from '@/types/theme'

function ManageTheme() {
  const toast = useRef<Toast>(null)

  const { theme, applyTheme, applyPreset, resetTheme } = useUserTheme()

  const [form, setForm] = useState<ThemeFormData>(DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form')
  const [logoContentTab, setLogoContentTab] = useState<'text' | 'icon'>('text')

  // ============================================================
  // SYNC form saat theme berubah
  // ============================================================
  useEffect(() => {
    if (theme) {
      setForm({
        primaryColor: theme.primaryColor,
        accentColor: theme.accentColor,
        bgColor: theme.bgColor,
        textColor: theme.textColor,
        fontFamily: theme.fontFamily,
        headingFont: theme.headingFont,
        borderRadius: theme.borderRadius,
        logoIcon: theme.logoIcon,
        layout: theme.layout,
        defaultMode: theme.defaultMode,
        preset: theme.preset,
      })
      setActivePreset(theme.preset)

      // Auto-detect tab dari logo
      const parsed = parseLogo(theme.logoIcon)
      if (parsed.text) {
        setLogoContentTab('text')
      } else if (parsed.icon) {
        setLogoContentTab('icon')
      } else {
        setLogoContentTab('text')
      }
    } else {
      setForm(DEFAULT_THEME)
      setActivePreset(null)
      setLogoContentTab('text')
    }
  }, [theme])

  // ============================================================
  // UPDATE FIELD
  // ============================================================
  const updateField = <K extends keyof ThemeFormData>(
    key: K,
    value: ThemeFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (key !== 'preset') setActivePreset(null)
  }

  // ============================================================
  // SAVE
  // ============================================================
  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('🚀 Form yang akan disimpan:', form)

      const result = await applyTheme(form)

      console.log('✅ Save result:', result)

      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Theme berhasil disimpan',
        life: 3000,
      })
    } catch (err: any) {
      console.error('❌ Save failed:', err)
      console.error('Response data:', err?.response?.data)
      console.error('Status:', err?.response?.status)

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Gagal menyimpan theme'

      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: backendMessage,
        life: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // PRESET
  // ============================================================
  const handlePresetSelect = async (presetName: string) => {
    try {
      setSaving(true)
      await applyPreset(presetName)
      setActivePreset(presetName)
      toast.current?.show({
        severity: 'success',
        summary: 'Preset diterapkan',
        detail: `Preset "${presetName}" berhasil`,
        life: 3000,
      })
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal menerapkan preset',
        life: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  // ============================================================
  // RESET
  // ============================================================
  const handleReset = () => {
    confirmDialog({
      message: 'Reset theme ke default? Semua customize bakal hilang.',
      header: 'Konfirmasi Reset',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          setSaving(true)
          await resetTheme()
          setForm(DEFAULT_THEME)
          setActivePreset(null)
          setLogoContentTab('text')
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Theme di-reset ke default',
            life: 3000,
          })
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal reset theme',
            life: 3000,
          })
        } finally {
          setSaving(false)
        }
      },
    })
  }

  // ============================================================
  // DERIVED
  // ============================================================
  const parsedLogo = parseLogo(form.logoIcon)

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dash theme-manage">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />
        <div className="dash-hero-inner">
          <div className="dash-hero-left">
            <span className="dash-hero-greeting">
              <i className="pi pi-palette" />
              Kustomisasi
            </span>
            <h1 className="dash-hero-title">
              Atur <span className="dash-hero-name">theme</span> portfolio
            </h1>
            <p className="dash-hero-desc">
              Custom warna, font, dan layout portfolio kamu. Perubahan
              langsung tampil di preview.
            </p>

            <div className="dash-hero-actions">
              <button
                type="button"
                className="dash-hero-btn primary"
                onClick={handleSave}
                disabled={saving}
              >
                <i
                  className={
                    saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'
                  }
                />
                <span>{saving ? 'Menyimpan…' : 'Simpan theme'}</span>
              </button>
              <button
                type="button"
                className="dash-hero-btn ghost"
                onClick={handleReset}
                disabled={saving}
              >
                <i className="pi pi-refresh" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="dash-hero-right">
            <div className="dash-hero-meta">
              <span className="dash-hero-meta-item">
                <span className="dash-hero-meta-dot" />
                Auto-save preview
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MOBILE TABS ===== */}
      <div className="theme-mobile-tabs">
        <button
          type="button"
          className={`theme-mobile-tab ${
            mobileTab === 'form' ? 'is-active' : ''
          }`}
          onClick={() => setMobileTab('form')}
        >
          <i className="pi pi-sliders-h" />
          <span>Kustomisasi</span>
        </button>
        <button
          type="button"
          className={`theme-mobile-tab ${
            mobileTab === 'preview' ? 'is-active' : ''
          }`}
          onClick={() => setMobileTab('preview')}
        >
          <i className="pi pi-eye" />
          <span>Preview</span>
        </button>
      </div>

      {/* ===== THEME EDITOR ===== */}
      <div
        className={`theme-editor ${
          mobileTab === 'preview' ? 'is-preview-mode' : ''
        }`}
      >
        {/* LEFT: FORM */}
        <div className="theme-editor-form">
          {/* PRESETS */}
          <section className="theme-editor-section">
            <header className="theme-editor-section-head">
              <span className="theme-editor-section-icon tone-blue">
                <i className="pi pi-sparkles" />
              </span>
              <div className="theme-editor-section-head-text">
                <strong>Preset tema</strong>
                <span>Pilih preset, atau custom manual di bawah</span>
              </div>
            </header>
            <ThemePresets
              activePreset={activePreset}
              onSelect={handlePresetSelect}
              disabled={saving}
            />
          </section>

          {/* COLORS */}
          <section className="theme-editor-section">
            <header className="theme-editor-section-head">
              <span className="theme-editor-section-icon tone-purple">
                <i className="pi pi-palette" />
              </span>
              <div className="theme-editor-section-head-text">
                <strong>Warna</strong>
                <span>Atur warna utama portfolio</span>
              </div>
            </header>
            <div className="theme-editor-color-grid">
              {COLOR_FIELDS.map((field) => (
                <ColorPicker
                  key={field.key}
                  label={field.label}
                  description={field.description}
                  value={form[field.key]}
                  defaultColor={field.defaultColor}
                  onChange={(color) => updateField(field.key, color)}
                  disabled={saving}
                />
              ))}
            </div>
          </section>

          {/* TYPOGRAPHY */}
          <section className="theme-editor-section">
            <header className="theme-editor-section-head">
              <span className="theme-editor-section-icon tone-green">
                <i className="pi pi-file-edit" />
              </span>
              <div className="theme-editor-section-head-text">
                <strong>Typography</strong>
                <span>Font buat body & heading</span>
              </div>
            </header>
            <div className="theme-editor-grid">
              <div className="theme-editor-field">
                <label className="theme-editor-label">Font body</label>
                <Dropdown
                  value={form.fontFamily}
                  options={FONT_OPTIONS}
                  onChange={(e) => updateField('fontFamily', e.value)}
                  placeholder="Pilih font"
                  className="w-full"
                  disabled={saving}
                />
              </div>
              <div className="theme-editor-field">
                <label className="theme-editor-label">Font heading</label>
                <Dropdown
                  value={form.headingFont}
                  options={HEADING_FONT_OPTIONS}
                  onChange={(e) => updateField('headingFont', e.value)}
                  placeholder="Pilih font"
                  className="w-full"
                  disabled={saving}
                />
              </div>
            </div>
          </section>

          {/* LAYOUT & STYLE */}
          <section className="theme-editor-section">
            <header className="theme-editor-section-head">
              <span className="theme-editor-section-icon tone-amber">
                <i className="pi pi-th-large" />
              </span>
              <div className="theme-editor-section-head-text">
                <strong>Layout & style</strong>
                <span>Border radius, layout, dan mode</span>
              </div>
            </header>
            <div className="theme-editor-grid">
              <div className="theme-editor-field">
                <label className="theme-editor-label">Border radius</label>
                <Dropdown
                  value={form.borderRadius}
                  options={BORDER_RADIUS_OPTIONS}
                  onChange={(e) => updateField('borderRadius', e.value)}
                  placeholder="Pilih radius"
                  className="w-full"
                  disabled={saving}
                />
              </div>

              {/* ============================================
                  LOGO PICKER — Shape + Content (Text/Icon)
                  ============================================ */}
              <div className="theme-editor-field theme-editor-field-full">
                <label className="theme-editor-label">
                  Logo{' '}
                  <span className="theme-editor-hint">
                    (kombinasi bentuk, nama, dan icon)
                  </span>
                </label>

                <div className="theme-logo-picker">
                  {/* Preview */}
                  <div className="theme-logo-preview-wrap">
                    <div className="theme-logo-preview">
                      <LogoRenderer
                        value={form.logoIcon}
                        size={64}
                        gradient={[
                          form.primaryColor || '#3b82f6',
                          form.accentColor || '#8b5cf6',
                        ]}
                      />
                    </div>
                    <div className="theme-logo-preview-info">
                      <strong>{form.logoIcon || 'text:A'}</strong>
                      <span>Preview logo kamu</span>
                    </div>
                  </div>

                  {/* ============ 1. BENTUK ============ */}
                  <div className="theme-logo-section">
                    <div className="theme-logo-section-head">
                      <i className="pi pi-stop" />
                      <span>1. Bentuk background</span>
                    </div>
                    <div className="theme-shape-grid">
                      {SHAPE_OPTIONS.map((opt) => {
                        const active = parsedLogo.shape === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            className={`theme-shape-btn ${
                              active ? 'is-active' : ''
                            }`}
                            onClick={() => {
                              const current = parseLogo(form.logoIcon)
                              updateField(
                                'logoIcon',
                                buildLogo({
                                  icon: current.icon,
                                  shape: active ? null : opt.value,
                                  text: current.text,
                                })
                              )
                            }}
                            disabled={saving}
                            title={opt.label}
                            aria-label={opt.label}
                          >
                            <div className="theme-shape-btn-preview">
                              <LogoRenderer
                                value={buildLogo({ shape: opt.value })}
                                size={32}
                                gradient={[
                                  form.primaryColor || '#3b82f6',
                                  form.accentColor || '#8b5cf6',
                                ]}
                              />
                            </div>
                            <span>{opt.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* ============ 2. ISI LOGO ============ */}
                  <div className="theme-logo-section">
                    <div className="theme-logo-section-head">
                      <i className="pi pi-pencil" />
                      <span>2. Isi logo</span>
                    </div>

                    {/* Sub-tab: Teks / Icon */}
                    <div className="theme-logo-tabs">
                      <button
                        type="button"
                        className={`theme-logo-tab ${
                          logoContentTab === 'text' ? 'is-active' : ''
                        }`}
                        onClick={() => setLogoContentTab('text')}
                        disabled={saving}
                      >
                        <i className="pi pi-font" />
                        <span>Teks / Nama</span>
                      </button>
                      <button
                        type="button"
                        className={`theme-logo-tab ${
                          logoContentTab === 'icon' ? 'is-active' : ''
                        }`}
                        onClick={() => setLogoContentTab('icon')}
                        disabled={saving}
                      >
                        <i className="pi pi-star" />
                        <span>Icon</span>
                      </button>
                    </div>

                    {/* === Konten: Teks === */}
                    {logoContentTab === 'text' && (
                      <>
                        <div className="theme-logo-input-wrap">
                          <i className="pi pi-pencil theme-logo-input-icon" />
                          <input
                            type="text"
                            className="theme-logo-input"
                            value={parsedLogo.text || ''}
                            onChange={(e) => {
                              const cleaned = e.target.value
                                .toUpperCase()
                                .slice(0, LOGO_TEXT_MAX_LENGTH)
                              const current = parseLogo(form.logoIcon)
                              updateField(
                                'logoIcon',
                                buildLogo({
                                  icon: current.icon,
                                  shape: current.shape,
                                  text: cleaned,
                                })
                              )
                            }}
                            placeholder="Anjar, Rizky..."
                            maxLength={LOGO_TEXT_MAX_LENGTH}
                            disabled={saving}
                            autoComplete="off"
                          />
                          <span className="theme-logo-input-counter">
                            {(parsedLogo.text || '').length}/
                            {LOGO_TEXT_MAX_LENGTH}
                          </span>
                        </div>

                        <div className="theme-logo-quick">
                          <span className="theme-logo-quick-label">
                            Cepat:
                          </span>
                          {LOGO_QUICK_PRESETS.map((text) => (
                            <button
                              key={text}
                              type="button"
                              className="theme-logo-quick-btn"
                              onClick={() => {
                                const current = parseLogo(form.logoIcon)
                                updateField(
                                  'logoIcon',
                                  buildLogo({
                                    icon: current.icon,
                                    shape: current.shape,
                                    text,
                                  })
                                )
                              }}
                              disabled={saving}
                            >
                              {text}
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* === Konten: Icon === */}
                    {logoContentTab === 'icon' && (
                      <div className="theme-prime-grid">
                        {PRIMEICON_OPTIONS.map((opt) => {
                          const active = parsedLogo.icon === opt.value
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              className={`theme-prime-btn ${
                                active ? 'is-active' : ''
                              }`}
                              onClick={() => {
                                const current = parseLogo(form.logoIcon)
                                updateField(
                                  'logoIcon',
                                  buildLogo({
                                    icon: active ? null : opt.value,
                                    shape: current.shape,
                                    text: current.text,
                                  })
                                )
                              }}
                              disabled={saving}
                              title={opt.label}
                              aria-label={opt.label}
                            >
                              <i className={opt.value} />
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="theme-logo-info">
                    <i className="pi pi-info-circle" />
                    <span>
                      Pilih <strong>bentuk</strong>, lalu isi dengan{' '}
                      <strong>nama</strong> atau <strong>icon</strong>. Bisa
                      juga keduanya!
                    </span>
                  </div>
                </div>
              </div>

              {/* Layout Picker */}
              <div className="theme-editor-field theme-editor-field-full">
                <label className="theme-editor-label">
                  Layout projects/blog
                </label>
                <div className="theme-layout-picker">
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`theme-layout-btn ${
                        form.layout === opt.value ? 'is-active' : ''
                      }`}
                      onClick={() =>
                        updateField('layout', opt.value as ThemeLayout)
                      }
                      disabled={saving}
                    >
                      <div className="theme-layout-preview">
                        <i className={opt.icon} />
                      </div>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode Picker */}
              <div className="theme-editor-field theme-editor-field-full">
                <label className="theme-editor-label">Mode default</label>
                <div className="theme-mode-picker">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`theme-mode-btn ${
                        form.defaultMode === opt.value ? 'is-active' : ''
                      }`}
                      onClick={() =>
                        updateField('defaultMode', opt.value as ThemeMode)
                      }
                      disabled={saving}
                    >
                      <div
                        className={`theme-mode-preview ${
                          opt.value === 'DARK'
                            ? 'is-dark-preview'
                            : 'is-light-preview'
                        }`}
                      >
                        <span className="theme-mode-preview-bar" />
                        <span className="theme-mode-preview-bar short" />
                        <span className="theme-mode-preview-dot" />
                      </div>
                      <div className="theme-mode-info">
                        <i className={opt.icon} />
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="theme-editor-preview">
          <div className="theme-editor-preview-sticky">
            <header className="theme-editor-preview-head">
              <span className="theme-editor-preview-eyebrow">
                <i className="pi pi-eye" />
                Live preview
              </span>
              <strong className="theme-editor-preview-title">
                Preview portfolio kamu
              </strong>
            </header>

            <ThemePreview theme={form} />

            <div className="theme-editor-preview-hint">
              <i className="pi pi-info-circle" />
              <span>
                Perubahan tampil otomatis. Klik <strong>Simpan theme</strong>{' '}
                untuk apply.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE FLOATING ACTION ===== */}
      <div className="theme-mobile-actions">
        <button
          type="button"
          className="theme-mobile-btn ghost"
          onClick={handleReset}
          disabled={saving}
          aria-label="Reset"
        >
          <i className="pi pi-refresh" />
        </button>
        <button
          type="button"
          className="theme-mobile-btn primary"
          onClick={handleSave}
          disabled={saving}
        >
          <i
            className={
              saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'
            }
          />
          <span>{saving ? 'Menyimpan…' : 'Simpan theme'}</span>
        </button>
      </div>
    </div>
  )
}

export default ManageTheme