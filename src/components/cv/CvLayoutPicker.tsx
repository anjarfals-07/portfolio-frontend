// ============================================================
// CvLayoutPicker — Pilih layout CV
// ============================================================
// 5 layout variant:
// - sidebar-left, sidebar-right, header-top, two-col, timeline
// ============================================================

import { useMemo } from 'react'
import { LAYOUTS, getLayout } from '@/types/cv'
import type { CvLayout } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvLayoutPickerProps {
  /** Layout aktif */
  value?: CvLayout

  /** Callback saat layout dipilih */
  onChange: (layout: CvLayout) => void

  /** Disabled */
  disabled?: boolean
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvLayoutPicker({
  value,
  onChange,
  disabled = false,
}: CvLayoutPickerProps) {
  const activeInfo = useMemo(
    () => (value ? getLayout(value) : null),
    [value]
  )

  const handleSelect = (layout: CvLayout) => {
    if (disabled) return
    onChange(layout)
  }

  return (
    <div className="cv-scope cv-layout-picker">
      {/* ===== Header info ===== */}
      {activeInfo && (
        <div className="cv-layout-header">
          <div className="cv-layout-header-icon">
            <i className={activeInfo.icon} />
          </div>
          <div className="cv-layout-header-text">
            <strong>{activeInfo.label}</strong>
            <span className="cv-text-muted cv-text-xs">
              {activeInfo.desc}
            </span>
          </div>
        </div>
      )}

      {/* ===== Grid ===== */}
      <div className="cv-layout-grid">
        {LAYOUTS.map((layout) => {
          const isActive = value === layout.key
          return (
            <button
              key={layout.key}
              type="button"
              className={`cv-layout-item ${isActive ? 'is-selected' : ''}`}
              onClick={() => handleSelect(layout.key)}
              disabled={disabled}
              aria-pressed={isActive}
              aria-label={`Layout ${layout.label}`}
            >
              {isActive && (
                <span className="cv-layout-item-check">
                  <i className="pi pi-check" />
                </span>
              )}

              <div className="cv-layout-item-icon">
                <i className={layout.icon} />
              </div>

              <span className="cv-layout-item-label">{layout.label}</span>
              <span className="cv-layout-item-desc">{layout.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}