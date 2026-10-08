import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

type AnimationVariant =
  | 'fade-up'
  | 'fade-in'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'

interface AnimatedSectionProps {
  children: ReactNode
  variant?: AnimationVariant
  delay?: number
  duration?: number
  className?: string
  as?: ElementType
  style?: CSSProperties
}

export default function AnimatedSection({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 600,
  className = '',
  as: Component = 'div',
  style,
}: AnimatedSectionProps) {
  const { ref, isInView } = useInView<HTMLDivElement>()

  return (
    <Component
      ref={ref}
      className={`animated-section animate-${variant} ${
        isInView ? 'is-visible' : ''
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: `${duration}ms`,
        ...style,
      }}
    >
      {children}
    </Component>
  )
}