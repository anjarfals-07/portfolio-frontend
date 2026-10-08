// ============================================================
// CvPalettePicker — Pilih palette warna CV
// ============================================================
// v2 MODERN:
// - Grouping palette (Basic, Warm, Cool, Neutral, Special)
// - Live preview gradient warna aktif
// - Custom color panel lebih rapi
// - Compact & clean layout
// ============================================================

import { useMemo, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { PALETTES, isValidHex, getPalette } from '@/types/cv'
import type { PaletteInfo } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvPalettePickerProps {
  /** Palette key aktif (misal "ocean") */
  value?: string

  /** Custom hex override (kalau ada, palette dianggap "custom") */
  customColor?: string

  /** Callback saat palette dipilih */
  onChange: (paletteKey: string) => void

  /** Callback saat custom color dipakai */
  onCustomColor?: (hex: string) => void

  /** Disabled */
  disabled?: boolean

  /** Tampilkan section custom color */
  showCustom?: boolean
}

/* ============================================================
   GROUPING PALETTE
   ============================================================ */

interface PaletteGroup {
  key: string
  label: string
  desc: string
  icon: string
  palettes: string[]
}

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    key: 'basic',
    label: 'Basic',
    desc: 'Warna dasar yang serbaguna',
    icon: 'pi pi-circle-fill',
    palettes: ['ocean', 'forest', 'royal', 'indigo', 'teal', 'mint'],
  },
  {
    key: 'warm',
    label: 'Warm',
    desc: 'Nuansa hangat & energik',
    icon: 'pi pi-sun',
    palettes: ['sunset', 'amber', 'rose', 'crimson', 'sunset-warm', 'earth'],
  },
  {
    key: 'cool',
    label: 'Cool',
    desc: 'Nuansa sejuk & profesional',
    icon: 'pi pi-cloud',
    palettes: ['ocean-deep', 'neon', 'pastel', 'midnight'],
  },
  {
    key: 'neutral',
    label: 'Neutral',
    desc: 'Netral & elegan',
    icon: 'pi pi-minus-circle',
    palettes: ['slate', 'mono'],
  },
]

/* ============================================================
   HELPERS
   ============================================================ */

/** Cari palette by key dari list flat */
function findPalette(key: string): PaletteInfo | undefined {
  return PALETTES.find((p) => p.key === key)
}

/** Filter palette group hanya yang ada di PALETTES */
function filterExisting(paletteKeys: string[]): PaletteInfo[] {
  return paletteKeys
    .map((k) => findPalette(k))
    .filter((p): p is PaletteInfo => !!p)
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvPalettePicker({
  value,
  customColor,
  onChange,
  onCustomColor,
  disabled = false,
  showCustom = true,
}: CvPalettePickerProps) {
  const [showCustomPanel, setShowCustomPanel] = useState(false)
  const [customInput, setCustomInput] = useState(customColor || '')

  // ===== Deteksi palette aktif =====
  const isCustomActive = !!(customColor && isValidHex(customColor))

  const activeKey = useMemo(() => {
    if (isCustomActive) return null
    return value
  }, [value, isCustomActive])

  // ===== Info palette aktif =====
  const activeInfo = useMemo(() => {
    if (isCustomActive && customColor) {
      return {
        label: 'Custom',
        color: customColor,
        colorDark: customColor,
        desc: customColor,
      }
    }
    const palette = getPalette(value ?? 'ocean')
    return palette
      ? {
          label: palette.label,
          color: palette.color,
          colorDark: palette.colorDark,
          desc: 'Preset palette',
        }
      : null
  }, [value, customColor, isCustomActive])

  // ===== Handlers =====
  const handleSelectPreset = (key: string) => {
    if (disabled) return
    onChange(key)
    setShowCustomPanel(false)
  }

  const handleCustomApply = () => {
    if (!isValidHex(customInput)) return
    onCustomColor?.(customInput)
    setShowCustomPanel(false)
  }

  const handleRandomColor = () => {
    const random =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    setCustomInput(random)
  }

  // ===== Build groups =====
  const groups = useMemo(
    () =>
      PALETTE_GROUPS.map((g) => ({
        ...g,
        items: filterExisting(g.palettes),
      })).filter((g) => g.items.length > 0),
    []
  )

  return (
    <div className="cv-scope cv-palette-picker">
      {/* ============================================================
          HEADER — Live preview warna aktif
          ============================================================ */}
      {activeInfo && (
        <div className="cv-palette-header">
          <div
            className="cv-palette-header-preview"
            style={{
              background: `linear-gradient(135deg, ${activeInfo.color} 0%, ${activeInfo.colorDark} 100%)`,
            }}
          >
            <div className="cv-palette-header-preview-gloss" />
          </div>
          <div className="cv-palette-header-text">
            <strong>{activeInfo.label}</strong>
            <span className="cv-text-muted cv-text-xs">
              {activeInfo.desc}
            </span>
          </div>
          <div className="cv-palette-header-badge">
            <i className="pi pi-palette" />
            {PALETTES.length}
          </div>
        </div>
      )}

      {/* ============================================================
          GROUPED SWATCHES
          ============================================================ */}
      <div className="cv-palette-groups">
        {groups.map((group) => (
          <div key={group.key} className="cv-palette-group">
            <div className="cv-palette-group-head">
              <div className="cv-palette-group-head-icon">
                <i className={group.icon} />
              </div>
              <div className="cv-palette-group-head-text">
                <strong>{group.label}</strong>
                <span className="cv-text-muted cv-text-xs">
                  {group.desc}
                </span>
              </div>
            </div>

            <div className="cv-palette-group-grid">
              {group.items.map((palette) => {
                const isActive = activeKey === palette.key
                return (
                  <button
                    key={palette.key}
                    type="button"
                    className={`cv-palette-swatch ${
                      isActive ? 'is-selected' : ''
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${palette.color} 0%, ${palette.colorDark} 100%)`,
                    }}
                    onClick={() => handleSelectPreset(palette.key)}
                    disabled={disabled}
                    title={`${palette.label} — ${palette.color}`}
                    aria-label={`Palette ${palette.label}`}
                    aria-pressed={isActive}
                  >
                    {isActive && (
                      <span className="cv-palette-swatch-check">
                        <i className="pi pi-check" />
                      </span>
                    )}
                    <span className="cv-palette-swatch-label">
                      {palette.label}
                    </span>
                    <span className="cv-palette-swatch-hex">
                      {palette.color}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================
          CUSTOM COLOR SECTION
          ============================================================ */}
      {showCustom && (
        <div className="cv-palette-custom-section">
          {!showCustomPanel ? (
            <button
              type="button"
              className="cv-palette-custom-toggle"
              onClick={() => setShowCustomPanel(true)}
              disabled={disabled}
            >
              <span className="cv-palette-custom-toggle-icon">
                <i className="pi pi-eyedropper" />
              </span>
              <span className="cv-palette-custom-toggle-text">
                <strong>Warna Custom</strong>
                <span className="cv-text-muted cv-text-xs">
                  Pakai hex warna sendiri
                </span>
              </span>
              <i className="pi pi-chevron-down cv-palette-custom-arrow" />
            </button>
          ) : (
            <div className="cv-palette-custom-panel">
              {/* Header panel */}
              <div className="cv-palette-custom-head">
                <span className="cv-palette-custom-head-icon">
                  <i className="pi pi-eyedropper" />
                </span>
                <strong>Warna Custom</strong>
                <button
                  type="button"
                  className="cv-palette-custom-close"
                  onClick={() => {
                    setShowCustomPanel(false)
                    setCustomInput(customColor || '')
                  }}
                  disabled={disabled}
                  aria-label="Tutup"
                >
                  <i className="pi pi-times" />
                </button>
              </div>

              {/* Preview + Input */}
              <div className="cv-palette-custom-row">
                <label
                  className="cv-palette-custom-preview"
                  style={{
                    background: isValidHex(customInput)
                      ? customInput
                      : '#3b82f6',
                  }}
                >
                  <input
                    type="color"
                    value={isValidHex(customInput) ? customInput : '#3b82f6'}
                    onChange={(e) => setCustomInput(e.target.value)}
                    disabled={disabled}
                    className="cv-palette-custom-native"
                    aria-label="Color picker"
                  />
                </label>

                <InputText
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="#3b82f6"
                  maxLength={7}
                  className="cv-palette-custom-input"
                  disabled={disabled}
                />

                <Button
                  icon="pi pi-refresh"
                  severity="secondary"
                  text
                  onClick={handleRandomColor}
                  disabled={disabled}
                  tooltip="Random"
                  tooltipOptions={{ position: 'top' }}
                  size="small"
                  type="button"
                />

                <Button
                  icon="pi pi-check"
                  onClick={handleCustomApply}
                  disabled={!isValidHex(customInput) || disabled}
                  tooltip="Terapkan"
                  tooltipOptions={{ position: 'top' }}
                  size="small"
                  type="button"
                />
              </div>

              {/* Error */}
              {!isValidHex(customInput) && customInput && (
                <small className="cv-palette-custom-error">
                  <i className="pi pi-exclamation-circle" />
                  Format harus #RRGGBB (contoh: #3b82f6)
                </small>
              )}

              {/* Hint */}
              {isValidHex(customInput) && (
                <small className="cv-palette-custom-hint">
                  <i className="pi pi-info-circle" />
                  Preview: warna <strong>{customInput}</strong>
                </small>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}