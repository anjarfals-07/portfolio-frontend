// ============================================================
// CvCustomizerPanel — Clean Studio v15
// ============================================================
// Prinsip desain:
// - Minimalis, presisi, profesional
// - Spacing 4px grid system
// - Hierarchy jelas (1 primary action per view)
// - Mobile bottom tabs yang proper
// ============================================================

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'

import CvPalettePicker from './CvPalettePicker'
import CvFontPicker from './CvFontPicker'
import CvLayoutPicker from './CvLayoutPicker'
import CvSectionToggles from './CvSectionToggles'
import CvTemplatePicker from './CvTemplatePicker'
import CvPreviewIframe from './CvPreviewIframe'
import CvGenerateButton from './CvGenerateButton'
import CvPersonalInfoForm, {
  type PersonalInfoData,
} from './CvPersonalInfoForm'

import { useCvPreferences } from '@/hooks/useCvPreferences'
import { useCvRenderData } from '@/hooks/useCvRenderData'
import { profileService } from '@/services/profileService'
import { getPalette, getTemplate, getPreferenceSummary } from '@/types/cv'
import type { CvGenerateResult, CvPreferences } from '@/types/cv'
import type { Profile } from '@/types/profile'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvCustomizerPanelProps {
  visible: boolean
  onHide: () => void
  initialPreferences?: CvPreferences | null
  onGenerated?: (result: CvGenerateResult) => void
  autoSave?: boolean
  profile?: Profile | null
  onProfileUpdate?: (profile: Profile) => void
}

interface StepConfig {
  key: string
  label: string
  icon: string
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const STEPS: StepConfig[] = [
  { key: 'template',   label: 'Template', icon: 'pi pi-th-large' },
  { key: 'color',      label: 'Warna',    icon: 'pi pi-palette' },
  { key: 'typography', label: 'Font',     icon: 'pi pi-file-edit' },
  { key: 'layout',     label: 'Layout',   icon: 'pi pi-table' },
  { key: 'sections',   label: 'Section',  icon: 'pi pi-list' },
  { key: 'personal',   label: 'Data',     icon: 'pi pi-user' },
  { key: 'advanced',   label: 'Lainnya',  icon: 'pi pi-sliders-h' },
]

const CARD_OPTIONS = [
  'soft', 'flat', 'outline', 'glass', 'none',
  'elevated', 'gradient', 'bordered-accent',
] as const
const BADGE_OPTIONS = [
  'pill', 'square', 'outline', 'minimal', 'soft', 'gradient', 'dot',
] as const
const PATTERN_OPTIONS = [
  'none', 'dots', 'lines', 'mesh', 'grid', 'diagonal', 'wave', 'noise',
] as const
const ICON_OPTIONS = [
  'primeicons', 'lucide', 'emoji', 'mixed', 'none',
] as const
const DENSITY_OPTIONS = ['compact', 'normal', 'spacious'] as const
const THEME_OPTIONS = ['light', 'dark'] as const

/* ============================================================
   HELPERS
   ============================================================ */

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvCustomizerPanel({
  visible,
  onHide,
  initialPreferences,
  onGenerated,
  autoSave = false,
  profile,
  onProfileUpdate,
}: CvCustomizerPanelProps) {
  const toastRef = useRef<Toast>(null)

  const [activeStep, setActiveStep] = useState(0)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [savingPersonal, setSavingPersonal] = useState(false)
  const [previewExpanded, setPreviewExpanded] = useState(false)
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form')

  const {
    preferences, isDirty, isSaving,
    update, updateMany, save, resetRemote, discard,
  } = useCvPreferences({
    initial: initialPreferences,
    autoSave,
    onSaveSuccess: () => setPreviewKey((k) => k + 1),
  })

  const { data: renderData, loading: renderLoading, refresh: refreshRenderData } =
    useCvRenderData({ profile, autoFetch: visible })

  const accentColor = useMemo(
    () =>
      preferences.accentColor ??
      getPalette(preferences.palette)?.color ??
      '#3b82f6',
    [preferences.accentColor, preferences.palette]
  )

  const templateInfo = useMemo(
    () => getTemplate(preferences.template),
    [preferences.template]
  )
  const summary = useMemo(() => getPreferenceSummary(preferences), [preferences])
  const activeStepConfig = useMemo(
    () => STEPS[activeStep] ?? STEPS[0],
    [activeStep]
  )

  // Auto switch ke form view kalau user ganti step di mobile
  useEffect(() => {
    if (mobileView === 'preview') return
  }, [mobileView])

  /* ------------------------------------------------------------
     HANDLERS
     ------------------------------------------------------------ */

  const handlePaletteChange = useCallback(
    (key: string) => updateMany({ palette: key, accentColor: undefined }),
    [updateMany]
  )

  const handleCustomColor = useCallback(
    (hex: string) => update('accentColor', hex),
    [update]
  )

  const handleSavePersonal = useCallback(
    async (data: PersonalInfoData) => {
      try {
        setSavingPersonal(true)
        const updated = await profileService.partialUpdate(data)
        onProfileUpdate?.(updated)
        await refreshRenderData()
        setPreviewKey((k) => k + 1)
        toastRef.current?.show({
          severity: 'success',
          summary: 'Data tersimpan',
          life: 2500,
        })
      } catch (err) {
        console.error(err)
        toastRef.current?.show({
          severity: 'error',
          summary: 'Gagal menyimpan data',
          life: 3000,
        })
      } finally {
        setSavingPersonal(false)
      }
    },
    [onProfileUpdate, refreshRenderData]
  )

  const handleClose = useCallback(() => {
    if (isDirty) {
      confirmDialog({
        message: 'Ada perubahan yang belum disimpan. Keluar?',
        header: 'Konfirmasi',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Keluar',
        rejectLabel: 'Batal',
        acceptClassName: 'p-button-danger',
        accept: () => {
          discard()
          onHide()
        },
      })
    } else {
      onHide()
    }
  }, [isDirty, discard, onHide])

  const handleReset = useCallback(() => {
    confirmDialog({
      message: 'Reset semua preferensi ke default?',
      header: 'Konfirmasi Reset',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Reset',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await resetRemote()
          setPreviewKey((k) => k + 1)
          toastRef.current?.show({
            severity: 'success',
            summary: 'Reset berhasil',
            life: 2500,
          })
        } catch {
          toastRef.current?.show({
            severity: 'error',
            summary: 'Gagal reset',
            life: 2500,
          })
        }
      },
    })
  }, [resetRemote])

  const handleGenerate = useCallback(
    async (templateOverride?: string) => {
      if (!renderData) {
        toastRef.current?.show({
          severity: 'warn',
          summary: 'Data belum siap',
          life: 2500,
        })
        try { await refreshRenderData() } catch {}
        return
      }

      setGenerating(true)
      try {
        if (isDirty) await save()

        const { renderCvHtml } = await import('@/services/cvHtmlRenderer')
        const { generateAndDownloadPdf } = await import('@/services/cvPdfService')

        const finalTemplate = (templateOverride ||
          preferences.template) as typeof preferences.template

        const html = renderCvHtml(renderData, preferences, {
          template: finalTemplate,
        })

        const safeName = profile?.fullName?.replace(/\s+/g, '-') || 'User'

        await generateAndDownloadPdf({
          html,
          filename: `CV-${safeName}`,
          format: 'a4',
          orientation: 'portrait',
          scale: 2,
          userName: profile?.fullName ?? 'CV',
          templateLabel: getTemplate(finalTemplate)?.label ?? finalTemplate,
          margin: [14, 12, 14, 12],
        })

        toastRef.current?.show({
          severity: 'success',
          summary: 'CV berhasil di-download',
          detail: 'Tersimpan di folder Downloads',
          life: 3000,
        })

        onGenerated?.({
          url: '',
          publicId: '',
          source: 'GENERATED',
          template: finalTemplate,
          layout: preferences.layout,
          theme: preferences.theme,
          generatedAt: new Date().toISOString(),
          sizeBytes: 0,
        })

        setTimeout(() => onHide(), 400)
      } catch (err) {
        console.error(err)
        toastRef.current?.show({
          severity: 'error',
          summary: 'Gagal generate CV',
          life: 3000,
        })
      } finally {
        setGenerating(false)
      }
    },
    [
      renderData, refreshRenderData, isDirty, save,
      preferences, profile, onGenerated, onHide,
    ]
  )

  const handleSave = useCallback(async () => {
    try {
      await save()
      setPreviewKey((k) => k + 1)
      toastRef.current?.show({
        severity: 'success',
        summary: 'Tersimpan',
        life: 2000,
      })
    } catch {
      toastRef.current?.show({
        severity: 'error',
        summary: 'Gagal menyimpan',
        life: 2500,
      })
    }
  }, [save])

  const goNext = useCallback(
    () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1)),
    []
  )
  const goPrev = useCallback(
    () => setActiveStep((s) => Math.max(s - 1, 0)),
    []
  )

  /* ------------------------------------------------------------
     STEP CONTENT
     ------------------------------------------------------------ */

  const renderStepContent = () => {
    switch (activeStepConfig.key) {
      case 'template':
        return (
          <div className="cvs-panel">
            <PanelHeader
              icon={activeStepConfig.icon}
              title="Template"
              desc="Pilih gaya dasar tampilan CV"
            />

            <div className="cvs-template-card">
              <div className="cvs-template-card-header">
                <div
                  className="cvs-template-card-swatch"
                  style={{ background: accentColor }}
                />
                <div className="cvs-template-card-info">
                  <h4>{templateInfo?.label ?? 'Modern'}</h4>
                  <p>{templateInfo?.desc ?? ''}</p>
                </div>
              </div>

              <button
                type="button"
                className="cvs-btn cvs-btn-primary"
                style={{ background: accentColor }}
                onClick={() => setShowTemplatePicker(true)}
                disabled={isSaving || generating}
              >
                <i className="pi pi-refresh" />
                <span>Ganti Template</span>
              </button>
            </div>
          </div>
        )

      case 'color':
        return (
          <div className="cvs-panel">
            <PanelHeader
              icon={activeStepConfig.icon}
              title="Warna"
              desc="Palette atau warna custom"
            />
            <CvPalettePicker
              value={preferences.palette}
              customColor={preferences.accentColor}
              onChange={handlePaletteChange}
              onCustomColor={handleCustomColor}
              disabled={isSaving || generating}
            />
          </div>
        )

      case 'typography':
        return (
          <div className="cvs-panel">
            <PanelHeader
              icon={activeStepConfig.icon}
              title="Font"
              desc="Kombinasi font untuk CV"
            />
            <CvFontPicker
              value={preferences.fontPair}
              onChange={(key) => update('fontPair', key)}
              disabled={isSaving || generating}
            />
          </div>
        )

      case 'layout':
        return (
          <div className="cvs-panel">
            <PanelHeader
              icon={activeStepConfig.icon}
              title="Layout"
              desc="Susunan konten CV"
            />
            <CvLayoutPicker
              value={preferences.layout}
              onChange={(l) => update('layout', l)}
              disabled={isSaving || generating}
            />
          </div>
        )

      case 'sections':
        return (
          <div className="cvs-panel">
            <PanelHeader
              icon={activeStepConfig.icon}
              title="Section"
              desc="Pilih section yang muncul di CV"
            />
            <CvSectionToggles
              value={{
                showBio: preferences.showBio,
                showPersonalInfo: preferences.showPersonalInfo,
                showWorkExperience: preferences.showWorkExperience,
                showEducation: preferences.showEducation,
                showExperiences: preferences.showExperiences,
                showProjects: preferences.showProjects,
                showSkills: preferences.showSkills,
                showTechStack: preferences.showTechStack,
              }}
              onChange={(key, val) => update(key, val)}
              disabled={isSaving || generating}
              hideHeader
            />
          </div>
        )

      case 'personal':
        return (
          <div className="cvs-panel">
            <PanelHeader
              icon={activeStepConfig.icon}
              title="Data Pribadi"
              desc="Info personal yang tampil di CV"
            />
            <CvPersonalInfoForm
              profile={profile ?? null}
              onSave={handleSavePersonal}
              saving={savingPersonal}
              disabled={generating}
              hideHeader
            />
          </div>
        )

      case 'advanced':
        return (
          <div className="cvs-panel">
            <PanelHeader
              icon={activeStepConfig.icon}
              title="Lainnya"
              desc="Fine-tuning tampilan CV"
            />

            <div className="cvs-adv-stack">
              <AdvRow label="Theme" icon="pi pi-sun">
                {THEME_OPTIONS.map((t) => (
                  <SegBtn
                    key={t}
                    active={preferences.theme === t}
                    disabled={isSaving || generating}
                    onClick={() => update('theme', t)}
                  >
                    <i className={t === 'light' ? 'pi pi-sun' : 'pi pi-moon'} />
                    {t === 'light' ? 'Light' : 'Dark'}
                  </SegBtn>
                ))}
              </AdvRow>

              <AdvRow label="Density" icon="pi pi-arrows-v">
                {DENSITY_OPTIONS.map((d) => (
                  <SegBtn
                    key={d}
                    active={preferences.density === d}
                    disabled={isSaving || generating}
                    onClick={() => update('density', d)}
                  >
                    {formatLabel(d)}
                  </SegBtn>
                ))}
              </AdvRow>

              <AdvRow label="Card Style" icon="pi pi-box" wrap>
                {CARD_OPTIONS.map((c) => (
                  <SegBtn
                    key={c}
                    active={preferences.cardStyle === c}
                    disabled={isSaving || generating}
                    onClick={() => update('cardStyle', c)}
                  >
                    {formatLabel(c)}
                  </SegBtn>
                ))}
              </AdvRow>

              <AdvRow label="Badge Style" icon="pi pi-tag" wrap>
                {BADGE_OPTIONS.map((b) => (
                  <SegBtn
                    key={b}
                    active={preferences.badgeStyle === b}
                    disabled={isSaving || generating}
                    onClick={() => update('badgeStyle', b)}
                  >
                    {formatLabel(b)}
                  </SegBtn>
                ))}
              </AdvRow>

              <AdvRow label="Background" icon="pi pi-image" wrap>
                {PATTERN_OPTIONS.map((p) => (
                  <SegBtn
                    key={p}
                    active={preferences.backgroundPattern === p}
                    disabled={isSaving || generating}
                    onClick={() => update('backgroundPattern', p)}
                  >
                    {formatLabel(p)}
                  </SegBtn>
                ))}
              </AdvRow>

              <AdvRow label="Icon Set" icon="pi pi-star" wrap>
                {ICON_OPTIONS.map((i) => (
                  <SegBtn
                    key={i}
                    active={preferences.iconSet === i}
                    disabled={isSaving || generating}
                    onClick={() => update('iconSet', i)}
                  >
                    {formatLabel(i)}
                  </SegBtn>
                ))}
              </AdvRow>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  /* ------------------------------------------------------------
     RENDER
     ------------------------------------------------------------ */

  return (
    <>
      <Toast ref={toastRef} />

      <Dialog
        visible={visible}
        onHide={handleClose}
        header={null}
        footer={null}
        modal
        draggable={false}
        resizable={false}
        showHeader={false}
        className={`cvs-modal ${previewExpanded ? 'is-expanded' : ''}`}
        style={{ width: '1200px', maxWidth: '96vw' }}
        breakpoints={{ '1200px': '96vw', '768px': '100vw' }}
        closeOnEscape={!isSaving && !generating}
        dismissableMask={false}
        blockScroll
      >
        <div className="cv-scope cvs-root">
          {/* ============ HEADER ============ */}
          <header className="cvs-header">
            <div className="cvs-header-left">
              <div
                className="cvs-header-logo"
                style={{ background: accentColor }}
              >
                <i className="pi pi-palette" />
              </div>
              <div className="cvs-header-text">
                <h1>CV Customizer</h1>
                <p>{summary}</p>
              </div>
            </div>

            <div className="cvs-header-right">
              {isDirty && <span className="cvs-dot-unsaved" title="Belum disimpan" />}

              <button
                type="button"
                className="cvs-icon-btn"
                onClick={() => setPreviewExpanded((v) => !v)}
                title={previewExpanded ? 'Sembunyikan preview' : 'Tampilkan preview'}
              >
                <i
                  className={
                    previewExpanded
                      ? 'pi pi-window-minimize'
                      : 'pi pi-window-maximize'
                  }
                />
              </button>

              <button
                type="button"
                className="cvs-icon-btn is-close"
                onClick={handleClose}
                disabled={generating}
                title="Tutup"
              >
                <i className="pi pi-times" />
              </button>
            </div>
          </header>

          {/* ============ DESKTOP TABS ============ */}
          <nav className="cvs-tabs-desktop">
            {STEPS.map((step, idx) => (
              <button
                key={step.key}
                type="button"
                className={`cvs-tab ${idx === activeStep ? 'is-active' : ''}`}
                onClick={() => setActiveStep(idx)}
                disabled={generating}
                style={
                  idx === activeStep
                    ? { color: accentColor, borderColor: accentColor }
                    : undefined
                }
              >
                <i className={step.icon} />
                <span>{step.label}</span>
              </button>
            ))}
          </nav>

          {/* ============ MOBILE VIEW TOGGLE ============ */}
          <div className="cvs-view-toggle">
            <button
              type="button"
              className={`cvs-view-toggle-btn ${
                mobileView === 'form' ? 'is-active' : ''
              }`}
              onClick={() => setMobileView('form')}
            >
              <i className="pi pi-sliders-h" />
              <span>Kustomisasi</span>
            </button>
            <button
              type="button"
              className={`cvs-view-toggle-btn ${
                mobileView === 'preview' ? 'is-active' : ''
              }`}
              onClick={() => setMobileView('preview')}
            >
              <i className="pi pi-eye" />
              <span>Preview</span>
            </button>
          </div>

          {/* ============ MAIN ============ */}
          <main
            className={`cvs-main ${
              mobileView === 'preview' ? 'is-mobile-preview' : ''
            }`}
          >
            {/* FORM */}
            <section className="cvs-form">
              <div className="cvs-form-scroll">{renderStepContent()}</div>

              <footer className="cvs-form-footer">
                <button
                  type="button"
                  className="cvs-btn cvs-btn-ghost"
                  onClick={goPrev}
                  disabled={activeStep === 0 || generating}
                >
                  <i className="pi pi-arrow-left" />
                  <span>Sebelumnya</span>
                </button>

                <div className="cvs-dots">
                  {STEPS.map((_, idx) => (
                    <span
                      key={idx}
                      className={`cvs-dot-item ${
                        idx === activeStep ? 'is-active' : ''
                      } ${idx < activeStep ? 'is-done' : ''}`}
                      style={
                        idx === activeStep
                          ? { background: accentColor, width: '20px' }
                          : undefined
                      }
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="cvs-btn cvs-btn-primary"
                  onClick={goNext}
                  disabled={activeStep === STEPS.length - 1 || generating}
                  style={{ background: accentColor }}
                >
                  <span>Selanjutnya</span>
                  <i className="pi pi-arrow-right" />
                </button>
              </footer>
            </section>

            {/* PREVIEW */}
            <aside className="cvs-preview">
              <header className="cvs-preview-header">
                <div className="cvs-preview-title">
                  <span className="cvs-preview-live-dot" />
                  Live Preview
                </div>
                <span className="cvs-preview-badge">A4</span>
              </header>

              <div className="cvs-preview-body">
                {renderLoading && !renderData ? (
                  <SkeletonPreview />
                ) : (
                  <CvPreviewIframe
                    preferences={preferences}
                    renderData={renderData}
                    refreshKey={previewKey}
                    disabled={!visible}
                    hideDownloadButton
                  />
                )}
              </div>
            </aside>
          </main>

          {/* ============ DESKTOP FOOTER ============ */}
          <footer className="cvs-footer">
            <button
              type="button"
              className="cvs-btn cvs-btn-ghost"
              onClick={handleReset}
              disabled={isSaving || generating}
            >
              <i className="pi pi-refresh" />
              <span>Reset</span>
            </button>

            <div className="cvs-footer-actions">
              {!autoSave && (
                <button
                  type="button"
                  className="cvs-btn cvs-btn-ghost"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving || generating}
                >
                  <i
                    className={
                      isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'
                    }
                  />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
                </button>
              )}

              <CvGenerateButton
                onGenerate={handleGenerate}
                generating={generating}
                disabled={isSaving || renderLoading || !renderData}
                accentColor={accentColor}
              />
            </div>
          </footer>

          {/* ============ MOBILE BOTTOM TABS ============ */}
          <nav className="cvs-tabs-mobile">
            {STEPS.map((step, idx) => (
              <button
                key={step.key}
                type="button"
                className={`cvs-mtab ${
                  idx === activeStep ? 'is-active' : ''
                }`}
                onClick={() => {
                  setActiveStep(idx)
                  setMobileView('form')
                }}
                disabled={generating}
                style={
                  idx === activeStep ? { color: accentColor } : undefined
                }
              >
                <i className={step.icon} />
                <span>{step.label}</span>
              </button>
            ))}
          </nav>

          {/* ============ MOBILE FLOATING ACTIONS ============ */}
          {mobileView === 'form' && (
            <div className="cvs-fab-stack">
              {!autoSave && isDirty && (
                <button
                  type="button"
                  className="cvs-fab cvs-fab-secondary"
                  onClick={handleSave}
                  disabled={isSaving || generating}
                  title="Simpan"
                >
                  <i
                    className={
                      isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-save'
                    }
                  />
                </button>
              )}

              <CvGenerateButton
                onGenerate={handleGenerate}
                generating={generating}
                disabled={isSaving || renderLoading || !renderData}
                accentColor={accentColor}
                mobileFloating
              />
            </div>
          )}
        </div>
      </Dialog>

      <CvTemplatePicker
        visible={showTemplatePicker}
        onHide={() => setShowTemplatePicker(false)}
        value={preferences.template}
        onConfirm={(t) => {
          update('template', t)
          setShowTemplatePicker(false)
        }}
        accentColor={accentColor}
        defaultTheme={preferences.theme}
      />

      <ConfirmDialog />
    </>
  )
}

/* ============================================================
   SUB-COMPONENTS (LOCAL)
   ============================================================ */

function PanelHeader({
  icon,
  title,
  desc,
}: {
  icon: string
  title: string
  desc: string
}) {
  return (
    <div className="cvs-panel-head">
      <div className="cvs-panel-head-icon">
        <i className={icon} />
      </div>
      <div className="cvs-panel-head-text">
        <h3>{title}</h3>
        <p>{desc}</p>
      </div>
    </div>
  )
}

function AdvRow({
  label,
  icon,
  wrap,
  children,
}: {
  label: string
  icon: string
  wrap?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="cvs-adv-row">
      <div className="cvs-adv-row-head">
        <i className={icon} />
        <span>{label}</span>
      </div>
      <div className={`cvs-seg ${wrap ? 'is-wrap' : ''}`}>{children}</div>
    </div>
  )
}

function SegBtn({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      className={`cvs-seg-btn ${active ? 'is-active' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function SkeletonPreview() {
  return (
    <div className="cvs-skeleton">
      <div className="cvs-skeleton-line is-head" />
      <div className="cvs-skeleton-line" />
      <div className="cvs-skeleton-line is-short" />
      <div className="cvs-skeleton-block" />
      <div className="cvs-skeleton-line" />
      <div className="cvs-skeleton-line is-short" />
    </div>
  )
}