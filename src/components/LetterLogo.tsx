// src/components/LetterLogo.tsx

interface LetterLogoProps {
  text: string
  size?: number
  gradient?: [string, string]
  className?: string
}

/**
 * Logo monogram teks — bisa 1-4 karakter (huruf/angka/simbol).
 * Font otomatis resize sesuai panjang teks.
 */
export function LetterLogo({
  text,
  size = 40,
  gradient = ['#3b82f6', '#8b5cf6'],
  className = '',
}: LetterLogoProps) {
  const display = (text || 'A').toUpperCase().slice(0, 4)
  const safeGradient: [string, string] = [
    gradient[0] || '#3b82f6',
    gradient[1] || '#8b5cf6',
  ]

  const gradId = `lg-${display.replace(/[^A-Z0-9]/g, '')}-${safeGradient[0].replace('#', '')}`

  const fontSize =
    display.length === 1
      ? 58
      : display.length === 2
        ? 46
        : display.length === 3
          ? 36
          : 30

  const baselineY =
    display.length === 1
      ? 72
      : display.length === 2
        ? 70
        : display.length === 3
          ? 68
          : 66

  const letterSpacing = display.length === 1 ? '-3' : '-1.5'

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
      role="img"
      aria-label={`Logo ${display}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={safeGradient[0]} />
          <stop offset="100%" stopColor={safeGradient[1]} />
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="22" fill={`url(#${gradId})`} />

      <text
        x="50"
        y={baselineY}
        fontFamily="Inter, system-ui, -apple-system, sans-serif"
        fontSize={fontSize}
        fontWeight="800"
        fill="white"
        textAnchor="middle"
        letterSpacing={letterSpacing}
      >
        {display}
      </text>
    </svg>
  )
}