// src/components/LogoRenderer.tsx

import { parseLogo, type ShapeName, LOGO_TEXT_MAX_LENGTH } from '@/types/theme'

interface LogoRendererProps {
  value: string | null | undefined
  size?: number
  className?: string
  gradient?: [string, string]
}

/**
 * Logo renderer — support banyak kombinasi:
 * 1. Text saja (kotak gradient + text)
 * 2. Icon saja (kotak gradient + icon)
 * 3. Icon + Text (kotak kecil icon + text di kanan)
 * 4. Shape + Text (SVG shape dengan text di tengah)
 * 5. Shape + Icon (SVG shape dengan icon overlay)
 * 6. Shape + Icon + Text (icon di atas, text di bawah)
 */
export function LogoRenderer({
  value,
  size = 40,
  className = '',
  gradient = ['#3b82f6', '#8b5cf6'],
}: LogoRendererProps) {
  const parsed = parseLogo(value)
  const safeGradient: [string, string] = [
    gradient[0] || '#3b82f6',
    gradient[1] || '#8b5cf6',
  ]

  const gradId = `logo-${Math.random().toString(36).slice(2, 8)}`
  const fill = `url(#${gradId})`

  // ============================================================
  // CASE 1: Icon + Text (tanpa shape) → flex row
  // ============================================================
  if (parsed.icon && parsed.text && !parsed.shape) {
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${size * 0.18}px`,
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            borderRadius: `${size * 0.25}px`,
            background: `linear-gradient(135deg, ${safeGradient[0]}, ${safeGradient[1]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: `${size * 0.5}px`,
            flexShrink: 0,
            boxShadow: `0 6px 16px -6px ${safeGradient[0]}80`,
          }}
        >
          <i className={parsed.icon} />
        </div>

        <span
          style={{
            fontSize: `${size * 0.55}px`,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {parsed.text}
        </span>
      </div>
    )
  }

  // ============================================================
  // CASE 2: Icon saja / Text saja (tanpa shape)
  // ============================================================
  if (!parsed.shape && (parsed.icon || parsed.text)) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: `${size * 0.25}px`,
          background: `linear-gradient(135deg, ${safeGradient[0]}, ${safeGradient[1]})`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: `${size * (parsed.icon ? 0.5 : 0.42)}px`,
          fontWeight: parsed.icon ? 400 : 800,
          letterSpacing: '-0.02em',
          boxShadow: `0 6px 16px -6px ${safeGradient[0]}80`,
          padding: '0 6%',
          overflow: 'hidden',
        }}
      >
        {parsed.icon ? (
          <i className={parsed.icon} />
        ) : (
          <span
            style={{
              fontSize: `${size * 0.42}px`,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {parsed.text!.slice(0, 4)}
          </span>
        )}
      </div>
    )
  }

  // ============================================================
  // CASE 3: Shape + (Text dan/atau Icon)
  // ============================================================
  const renderShape = (shape: ShapeName | null) => {
    switch (shape) {
      case 'circle':
        return <circle cx="50" cy="50" r="45" fill={fill} />
      case 'hexagon':
        return (
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill={fill}
          />
        )
      case 'diamond':
        return <path d="M50 5 L95 50 L50 95 L5 50 Z" fill={fill} />
      case 'triangle':
        return <path d="M50 8 L92 88 L8 88 Z" fill={fill} />
      case 'square':
        return <rect x="5" y="5" width="90" height="90" fill={fill} />
      case 'star':
        return (
          <path
            d="M50 5 L61 38 L96 38 L68 60 L79 93 L50 72 L21 93 L32 60 L4 38 L39 38 Z"
            fill={fill}
          />
        )
      case 'shield':
        return (
          <path
            d="M50 5 L90 20 L90 50 C90 75 70 90 50 95 C30 90 10 75 10 50 L10 20 Z"
            fill={fill}
          />
        )
      case 'pentagon':
        return (
          <path d="M50 5 L95 38 L82 90 L18 90 L5 38 Z" fill={fill} />
        )
      case 'octagon':
        return (
          <path
            d="M30 5 L70 5 L95 30 L95 70 L70 95 L30 95 L5 70 L5 30 Z"
            fill={fill}
          />
        )
      case 'rounded':
      default:
        return <rect width="100" height="100" rx="22" fill={fill} />
    }
  }

  const hasIcon = !!parsed.icon
  const hasText = !!parsed.text

  const renderText = () => {
    if (!hasText) return null

    const display = parsed.text!.slice(0, LOGO_TEXT_MAX_LENGTH)

    // Kalau ada icon juga, text diposisikan lebih kecil & lebih ke bawah
    let fontSize: number
    if (display.length <= 2) fontSize = hasIcon ? 24 : 44
    else if (display.length <= 3) fontSize = hasIcon ? 18 : 32
    else if (display.length <= 5) fontSize = hasIcon ? 14 : 22
    else if (display.length <= 8) fontSize = hasIcon ? 11 : 16
    else fontSize = hasIcon ? 8 : 12

    const baselineY = hasIcon ? 72 : 50 + fontSize * 0.35

    return (
      <text
        x="50"
        y={baselineY}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize={fontSize}
        fontWeight="800"
        fill="white"
        textAnchor="middle"
        letterSpacing={display.length <= 2 ? '-1.5' : '-0.5'}
      >
        {display}
      </text>
    )
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* SVG shape + text */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={size}
        height={size}
        style={{ position: 'absolute', inset: 0 }}
        fill="none"
        role="img"
        aria-label={`Logo ${parsed.raw}`}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={safeGradient[0]} />
            <stop offset="100%" stopColor={safeGradient[1]} />
          </linearGradient>
        </defs>

        {renderShape(parsed.shape || 'rounded')}
        {renderText()}
      </svg>

      {/* Icon overlay (HTML, lebih reliable dari foreignObject) */}
      {hasIcon && (
        <i
          className={parsed.icon!}
          style={{
            position: 'absolute',
            top: hasText ? '30%' : '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: `${size * (hasText ? 0.26 : 0.42)}px`,
            zIndex: 1,
            lineHeight: 1,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}