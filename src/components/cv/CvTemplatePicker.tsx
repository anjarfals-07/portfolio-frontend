// ============================================================
// CvTemplatePicker — Modal untuk pilih template CV
// ============================================================
// Fitur:
// - Modal dengan preview 12 template
// - Theme toggle (light/dark) untuk preview
// - Sync dengan accent color dari preferences
// - Confirm + cancel
// - Max height + scroll biar tidak overflow
// ============================================================

import { useEffect, useMemo, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { CvTemplateGrid } from './CvTemplateCard'
import { getPalette, getTemplate, TEMPLATES } from '@/types/cv'
import type { CvTemplate } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvTemplatePickerProps {
  /** Modal visible */
  visible: boolean

  /** Callback untuk tutup modal */
  onHide: () => void

  /** Template yang aktif saat ini */
  value?: CvTemplate

  /** Callback saat user konfirmasi pilih */
  onConfirm?: (template: CvTemplate) => void

  /** Callback saat user ganti template (live) */
  onChange?: (template: CvTemplate) => void

  /** Accent color untuk preview */
  accentColor?: string

  /** Palette key (untuk auto-derive accent kalau accentColor nggak ada) */
  palette?: string

  /** Theme preview default */
  defaultTheme?: 'light' | 'dark'

  /** Disabled state */
  disabled?: boolean

  /** Compact mode — grid lebih kecil */
  compact?: boolean
}

/* ============================================================
   ALL TEMPLATES — 12
   ============================================================ */

const ALL_TEMPLATES: CvTemplate[] = [
  'modern',
  'classic',
  'minimal',
  'elegant',
  'creative',
  'executive',
  'tech',
  'academic',
  'compact',
  'sidebar-dark',
  'magazine',
  'infographic',
]

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvTemplatePicker({
  visible,
  onHide,
  value,
  onConfirm,
  onChange,
  accentColor,
  palette,
  defaultTheme = 'light',
  disabled = false,
  compact = false,
}: CvTemplatePickerProps) {
  // ===== Local state (draft) =====
  const [draft, setDraft] = useState<CvTemplate | undefined>(value)
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>(
    defaultTheme
  )

  // Sync draft saat modal dibuka / value berubah
  useEffect(() => {
    if (visible) {
      setDraft(value)
      setPreviewTheme(defaultTheme)
    }
  }, [visible, value, defaultTheme])

  // ===== Resolve accent color =====
  const resolvedAccent = useMemo(() => {
    if (accentColor) return accentColor
    if (palette) return getPalette(palette)?.color ?? '#3b82f6'
    return '#3b82f6'
  }, [accentColor, palette])

  // ===== Info template aktif =====
  const draftInfo = useMemo(
    () => (draft ? getTemplate(draft) : null),
    [draft]
  )

  // ===== Template list =====
  // Pakai TEMPLATES dari types/cv.ts kalau ada, fallback ke ALL_TEMPLATES
  const templateList = useMemo(() => {
    const fromTypes = TEMPLATES.map((t) => t.id)
    return fromTypes.length > 0 ? fromTypes : ALL_TEMPLATES
  }, [])

  // ===== Handlers =====
  const handleSelect = (template: CvTemplate) => {
    setDraft(template)
    onChange?.(template)
  }

  const handleConfirm = () => {
    if (!draft) return
    onConfirm?.(draft)
    onHide()
  }

  const handleCancel = () => {
    setDraft(value) // reset draft
    onHide()
  }

  // ===== Footer =====
  const footer = (
    <div className="cv-picker-footer">
      <div className="cv-picker-footer-info">
        {draftInfo ? (
          <>
            <strong>{draftInfo.label}</strong>
            <span>{draftInfo.desc}</span>
          </>
        ) : (
          <>
            <strong>Belum dipilih</strong>
            <span>Pilih salah satu template di atas</span>
          </>
        )}
      </div>

      <div className="cv-picker-footer-actions">
        <Button
          label="Batal"
          severity="secondary"
          outlined
          onClick={handleCancel}
          disabled={disabled}
        />
        <Button
          label="Pilih Template"
          icon="pi pi-check"
          onClick={handleConfirm}
          disabled={!draft || draft === value || disabled}
        />
      </div>
    </div>
  )

  // ===== Header (custom) =====
  const header = (
    <div className="cv-picker-header">
      <div className="cv-picker-header-icon">
        <i className="pi pi-palette" />
      </div>
      <div className="cv-picker-header-text">
        <h3 className="cv-picker-header-title">Pilih Template CV</h3>
        <p className="cv-picker-header-desc">
          {templateList.length} template siap dipakai — pilih yang cocok
        </p>
      </div>
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={handleCancel}
      header={header}
      footer={footer}
      modal
      draggable={false}
      resizable={false}
      className="cv-picker-modal cv-picker-modal-wide"
      style={{ width: '1080px', maxWidth: '95vw' }}
      breakpoints={{ '1200px': '95vw', '768px': '95vw' }}
      closeOnEscape={!disabled}
      dismissableMask={!disabled}
    >
      <div className={`cv-picker cv-scope ${compact ? 'is-compact' : ''}`}>
        {/* ===== Toolbar ===== */}
        <div className="cv-picker-toolbar">
          <div className="cv-picker-toolbar-left">
            <span className="cv-picker-toolbar-label">Preview</span>
            <div className="cv-picker-theme-toggle">
              <button
                type="button"
                className={`cv-picker-theme-btn ${
                  previewTheme === 'light' ? 'is-active' : ''
                }`}
                onClick={() => setPreviewTheme('light')}
                disabled={disabled}
              >
                <i className="pi pi-sun" />
                Light
              </button>
              <button
                type="button"
                className={`cv-picker-theme-btn ${
                  previewTheme === 'dark' ? 'is-active' : ''
                }`}
                onClick={() => setPreviewTheme('dark')}
                disabled={disabled}
              >
                <i className="pi pi-moon" />
                Dark
              </button>
            </div>
          </div>

          <div className="cv-picker-preview-badge">
            <span className="cv-picker-preview-badge-dot" />
            Live preview
          </div>
        </div>

        {/* ===== Grid 12 template ===== */}
        <CvTemplateGrid
          templates={templateList}
          value={draft}
          onChange={handleSelect}
          disabled={disabled}
          accentColor={resolvedAccent}
          theme={previewTheme}
        />
      </div>
    </Dialog>
  )
}