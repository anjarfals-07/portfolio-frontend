import { useEffect, useState } from 'react'
import { Skeleton } from 'primereact/skeleton'
import { themeService } from '@/services/themeService'
import type { ThemePreset } from '@/types/theme'

interface ThemePresetsProps {
  activePreset?: string | null
  onSelect: (presetName: string) => void
  disabled?: boolean
}

function ThemePresets({ activePreset, onSelect, disabled }: ThemePresetsProps) {
  const [presets, setPresets] = useState<ThemePreset[]>([])
  const [loading, setLoading] = useState(true)

  // ============================================================
  // FETCH PRESETS
  // ============================================================
  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setLoading(true)
        const data = await themeService.getPresets()
        setPresets(data)
      } catch (err) {
        console.error('Failed to load presets:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPresets()
  }, [])

  // ============================================================
  // LOADING
  // ============================================================
  if (loading) {
    return (
      <div className="theme-presets">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} height="120px" borderRadius="12px" />
        ))}
      </div>
    )
  }

  // ============================================================
  // EMPTY
  // ============================================================
  if (presets.length === 0) {
    return null
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="theme-presets">
      {presets.map((preset) => {
        const isActive = activePreset === preset.name

        return (
          <button
            key={preset.name}
            type="button"
            className={`theme-preset-card ${isActive ? 'is-active' : ''}`}
            onClick={() => !disabled && onSelect(preset.name)}
            disabled={disabled}
            aria-pressed={isActive}
          >
            {/* Color Preview */}
            <div className="theme-preset-preview">
              <div
                className="theme-preset-color theme-preset-color-primary"
                style={{ background: preset.colors.primaryColor }}
              />
              <div
                className="theme-preset-color theme-preset-color-accent"
                style={{ background: preset.colors.accentColor }}
              />
              <div
                className="theme-preset-color theme-preset-color-bg"
                style={{ background: preset.colors.bgColor }}
              >
                <span
                  className="theme-preset-color-text"
                  style={{ color: preset.colors.textColor }}
                >
                  Aa
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="theme-preset-info">
              <strong className="theme-preset-label">{preset.label}</strong>
              <span className="theme-preset-desc">
                {preset.description}
              </span>
            </div>

            {/* Check icon */}
            {isActive && (
              <div className="theme-preset-check">
                <i className="pi pi-check"></i>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default ThemePresets