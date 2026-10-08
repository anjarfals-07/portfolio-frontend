// ============================================================
// CvSectionToggles — Toggle show/hide section CV
// ============================================================
// Section yang bisa di-toggle (8 total):
// - Bio, Personal Info, Work Experience, Education,
//   Experiences, Projects, Skills, Tech Stack
// ============================================================

import { useMemo } from 'react'
import { InputSwitch } from 'primereact/inputswitch'
import { SECTION_TOGGLES } from '@/types/cv'
import type { CvPreferences, SectionToggleInfo } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

type SectionKey = SectionToggleInfo['key']

export interface CvSectionTogglesProps {
  /** Preferences aktif — untuk baca nilai toggle */
  value: Pick<CvPreferences, SectionKey>

  /** Callback saat 1 toggle berubah */
  onChange: <K extends SectionKey>(key: K, value: boolean) => void

  /** Disabled */
  disabled?: boolean

  /** Sembunyikan header (kalau dipakai di dalam section lain) */
  hideHeader?: boolean
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvSectionToggles({
  value,
  onChange,
  disabled = false,
  hideHeader = false,
}: CvSectionTogglesProps) {
  // Hitung berapa section aktif
  const activeCount = useMemo(
    () => SECTION_TOGGLES.filter((s) => value[s.key]).length,
    [value]
  )

  const totalCount = SECTION_TOGGLES.length

  return (
    <div className="cv-scope cv-toggles">
      {/* ===== Header ===== */}
      {!hideHeader && (
        <div className="cv-toggles-header">
          <div className="cv-toggles-header-text">
            <strong>Section CV</strong>
            <span className="cv-text-muted cv-text-xs">
              Pilih section mana yang muncul di CV
            </span>
          </div>
          <span className="cv-toggles-header-count">
            {activeCount}/{totalCount} aktif
          </span>
        </div>
      )}

      {/* ===== List toggles ===== */}
      <div className="cv-toggles-list">
        {SECTION_TOGGLES.map((section) => {
          const isOn = value[section.key]

          return (
            <div
              key={section.key}
              className={`cv-toggle-row ${isOn ? 'is-on' : ''}`}
            >
              <div className="cv-toggle-row-info">
                <div className="cv-toggle-row-icon">
                  <i className={section.icon} />
                </div>
                <div className="cv-toggle-row-text">
                  <span className="cv-toggle-row-label">
                    {section.label}
                  </span>
                  <span className="cv-toggle-row-desc">
                    {section.desc}
                  </span>
                </div>
              </div>

              <InputSwitch
                checked={isOn}
                onChange={(e) => onChange(section.key, e.value ?? false)}
                disabled={disabled}
                aria-label={`Toggle ${section.label}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}