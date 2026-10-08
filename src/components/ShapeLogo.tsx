// src/components/ShapeLogo.tsx

import type { ShapeName } from '@/types/theme'

interface ShapeLogoProps {
  shape: ShapeName
  size?: number
  gradient?: [string, string]
  className?: string
}

/**
 * Logo berbentuk geometric SVG.
 */
export function ShapeLogo({
  shape,
  size = 40,
  gradient = ['#3b82f6', '#8b5cf6'],
  className = '',
}: ShapeLogoProps) {
  const safeGradient: [string, string] = [
    gradient[0] || '#3b82f6',
    gradient[1] || '#8b5cf6',
  ]

  const gradId = `sg-${shape}-${safeGradient[0].replace('#', '')}`
  const fill = `url(#${gradId})`

  const renderShape = () => {
    switch (shape) {
      case 'hexagon':
        return (
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            fill={fill}
          />
        )
      case 'circle':
        return <circle cx="50" cy="50" r="45" fill={fill} />
      case 'diamond':
        return <path d="M50 5 L95 50 L50 95 L5 50 Z" fill={fill} />
      case 'triangle':
        return <path d="M50 8 L92 88 L8 88 Z" fill={fill} />
      case 'square':
        return (
          <rect x="8" y="8" width="84" height="84" rx="14" fill={fill} />
        )
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
      default:
        return <circle cx="50" cy="50" r="45" fill={fill} />
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Logo ${shape}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={safeGradient[0]} />
          <stop offset="100%" stopColor={safeGradient[1]} />
        </linearGradient>
      </defs>
      {renderShape()}
    </svg>
  )
}