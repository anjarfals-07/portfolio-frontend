// ============================================================
// CvGenerateButton — Clean Studio
// ============================================================

import './cv.css'

export interface CvGenerateButtonProps {
  onGenerate: (templateOverride?: string) => void | Promise<void>
  generating?: boolean
  disabled?: boolean
  accentColor?: string
  label?: string
  mobileFloating?: boolean
}

function shouldUseDarkText(hex: string): boolean {
  if (!hex || hex.length < 7) return false
  const r = parseInt(hex.substring(1, 3), 16) / 255
  const g = parseInt(hex.substring(3, 5), 16) / 255
  const b = parseInt(hex.substring(5, 7), 16) / 255
  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const R = toLinear(r)
  const G = toLinear(g)
  const B = toLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B > 0.5
}

export default function CvGenerateButton({
  onGenerate,
  generating = false,
  disabled = false,
  accentColor = '#3b82f6',
  label = 'Download PDF',
  mobileFloating = false,
}: CvGenerateButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof onGenerate !== 'function') {
      console.error('[CvGenerateButton] onGenerate bukan function!')
      return
    }
    onGenerate()
  }

  const useDarkText = shouldUseDarkText(accentColor)
  const fgColor = useDarkText ? '#0f172a' : '#ffffff'

  // ===== MOBILE FAB =====
  if (mobileFloating) {
    return (
      <button
        type="button"
        className="cvg-fab"
        onClick={handleClick}
        disabled={disabled || generating}
        style={{ background: accentColor, color: fgColor }}
        aria-label={generating ? 'Generating...' : label}
      >
        <i className={generating ? 'pi pi-spin pi-spinner' : 'pi pi-download'} />
      </button>
    )
  }

  // ===== DEFAULT =====
  return (
    <button
      type="button"
      className="cvg-btn"
      onClick={handleClick}
      disabled={disabled || generating}
      style={{ background: accentColor, color: fgColor }}
    >
      <i className={generating ? 'pi pi-spin pi-spinner' : 'pi pi-download'} />
      <span>{generating ? 'Generating...' : label}</span>
    </button>
  )
}