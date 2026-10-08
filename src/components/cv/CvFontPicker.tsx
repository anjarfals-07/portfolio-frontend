// ============================================================
// CvFontPicker — Pilih font pairing CV
// ============================================================
// Fitur:
// - List 8 preset font pairing
// - Preview real — heading + body dengan font aslinya
// - Auto-load Google Fonts (via hook)
// ============================================================

import { useEffect, useMemo } from 'react'
import { FONT_PAIRS, getFontPair } from '@/types/cv'
import type { FontPairInfo } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvFontPickerProps {
  /** Font pair key aktif (misal "inter-lora") */
  value?: string

  /** Callback saat font pair dipilih */
  onChange: (fontPairKey: string) => void

  /** Disabled */
  disabled?: boolean
}

/* ============================================================
   HOOK: LOAD GOOGLE FONTS DYNAMICALLY
   ============================================================ */

/**
 * Load Google Fonts untuk semua font yang ada di FONT_PAIRS.
 * Cuma di-inject sekali per session.
 */
function useGoogleFontsLoader(pairs: FontPairInfo[]) {
  useEffect(() => {
    const fontFamilies = new Set<string>()
    pairs.forEach((p) => {
      fontFamilies.add(p.heading)
      fontFamilies.add(p.body)
    })

    // Build URL dengan semua font sekaligus
    const families = Array.from(fontFamilies)
      .map((f) => `family=${f.replace(/ /g, '+')}:wght@400;600;700`)
      .join('&')

    const url = `https://fonts.googleapis.com/css2?${families}&display=swap`

    // Cek apakah udah di-inject
    const existing = document.querySelector(`link[data-cv-fonts="true"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = url
    link.setAttribute('data-cv-fonts', 'true')
    document.head.appendChild(link)
  }, [pairs])
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvFontPicker({
  value,
  onChange,
  disabled = false,
}: CvFontPickerProps) {
  // Load semua font sekali
  useGoogleFontsLoader(FONT_PAIRS)

  const activeInfo = useMemo(() => getFontPair(value ?? ''), [value])

  const handleSelect = (key: string) => {
    if (disabled) return
    onChange(key)
  }

  return (
    <div className="cv-scope cv-font-picker">
      {/* ===== Header info ===== */}
      {activeInfo && (
        <div className="cv-font-header">
          <div className="cv-font-header-icon">
            <i className="pi pi-file-edit" />
          </div>
          <div className="cv-font-header-text">
            <strong>{activeInfo.label}</strong>
            <span className="cv-text-muted cv-text-xs">
              Heading: {activeInfo.heading} · Body: {activeInfo.body}
            </span>
          </div>
        </div>
      )}

      {/* ===== List ===== */}
      <div className="cv-font-list">
        {FONT_PAIRS.map((pair) => {
          const isActive = value === pair.key
          return (
            <button
              key={pair.key}
              type="button"
              className={`cv-font-item ${isActive ? 'is-selected' : ''}`}
              onClick={() => handleSelect(pair.key)}
              disabled={disabled}
              aria-pressed={isActive}
            >
              <div className="cv-font-item-preview">
                <span
                  className="cv-font-item-heading"
                  style={{ fontFamily: `'${pair.heading}', sans-serif` }}
                >
                  {pair.heading}
                </span>
                <span
                  className="cv-font-item-body"
                  style={{ fontFamily: `'${pair.body}', sans-serif` }}
                >
                  The quick brown fox — {pair.body}
                </span>
              </div>

              {isActive && (
                <i className="pi pi-check cv-font-item-check" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}