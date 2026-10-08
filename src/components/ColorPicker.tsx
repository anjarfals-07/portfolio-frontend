import { useState, useEffect } from 'react'
import { InputText } from 'primereact/inputtext'

interface ColorPickerProps {
  label: string
  description?: string
  value: string | null | undefined
  onChange: (color: string) => void
  defaultColor?: string
  presets?: string[]
  disabled?: boolean
}

const DEFAULT_COLOR_PRESETS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#f59e0b', // orange
  '#10b981', // green
  '#06b6d4', // cyan
  '#6366f1', // indigo
  '#1e293b', // slate
  '#64748b', // gray
  '#ffffff', // white
  '#0a0a0a', // black
]

function ColorPicker({
  label,
  description,
  value,
  onChange,
  defaultColor,
  presets = DEFAULT_COLOR_PRESETS,
  disabled = false,
}: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value || defaultColor || '#000000')

  // ============================================================
  // SYNC value dari parent
  // ============================================================
  useEffect(() => {
    setInputValue(value || defaultColor || '#000000')
  }, [value, defaultColor])

  // ============================================================
  // HANDLE color change
  // ============================================================
  const handleColorChange = (color: string) => {
    setInputValue(color)
    onChange(color)
  }

  const handleHexInput = (val: string) => {
    setInputValue(val)
    // Validate hex — cuma kirim ke parent kalau valid
    if (/^#[0-9a-fA-F]{3,8}$/.test(val) || val === '') {
      onChange(val)
    }
  }

  const isActivePreset = (color: string) =>
    inputValue?.toLowerCase() === color.toLowerCase()

  return (
    <div className="color-picker">
      {/* ===== LABEL ===== */}
      <div className="color-picker-header">
        <label className="color-picker-label">{label}</label>
        {description && (
          <small className="color-picker-desc">{description}</small>
        )}
      </div>

      {/* ===== PREVIEW + HEX INPUT ===== */}
      <div className="color-picker-input-row">
        {/* Color preview — clickable */}
        <label
          className="color-picker-preview"
          style={{ background: inputValue || '#000000' }}
        >
          <input
            type="color"
            value={inputValue || '#000000'}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={disabled}
            aria-label={`Pick ${label}`}
          />
        </label>

        {/* Hex input */}
        <InputText
          value={inputValue}
          onChange={(e) => handleHexInput(e.target.value)}
          placeholder="#3b82f6"
          className="color-picker-hex w-full"
          disabled={disabled}
          maxLength={20}
        />
      </div>

      {/* ===== PRESET SWATCHES ===== */}
      {presets.length > 0 && (
        <div className="color-picker-presets">
          {presets.map((color) => (
            <button
              key={color}
              type="button"
              className={`color-picker-swatch ${
                isActivePreset(color) ? 'is-active' : ''
              }`}
              style={{ background: color }}
              onClick={() => handleColorChange(color)}
              disabled={disabled}
              aria-label={`Pilih warna ${color}`}
              title={color}
            >
              {isActivePreset(color) && (
                <i className="pi pi-check"></i>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ColorPicker