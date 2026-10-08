// ============================================================
// CvTemplateCard — Kartu pilihan template CV
// ============================================================
// Menampilkan preview mini + label + deskripsi.
// Support 12 template: modern, classic, minimal, elegant,
// creative, executive, tech, academic, compact,
// sidebar-dark, magazine, infographic.
// ============================================================

import { useMemo } from 'react'
import type { CvTemplate } from '@/types/cv'
import { getTemplate } from '@/types/cv'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvTemplateCardProps {
  template: CvTemplate
  selected?: boolean
  onSelect?: (template: CvTemplate) => void
  disabled?: boolean
  accentColor?: string
  theme?: 'light' | 'dark'
  compact?: boolean
  className?: string
}

/* ============================================================
   TEMPLATE MINI PREVIEW — 12 TEMPLATE
   ============================================================ */

function TemplatePreview({
  template,
  accentColor,
  theme,
}: {
  template: CvTemplate
  accentColor: string
  theme: 'light' | 'dark'
}) {
  const isDark = theme === 'dark'
  const bg = isDark ? '#1e293b' : '#ffffff'
  const text = isDark ? '#94a3b8' : '#cbd5e1'
  const textStrong = isDark ? '#f1f5f9' : '#334155'
  const divider = isDark ? '#334155' : '#e2e8f0'

  const commonProps = {
    viewBox: '0 0 160 200',
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'cv-tpl-svg',
  }

  /* ===== 1. MODERN ===== */
  if (template === 'modern') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect width="54" height="200" fill={accentColor} />
        <circle cx="27" cy="28" r="12" fill={bg} opacity="0.9" />
        <rect x="14" y="46" width="26" height="4" rx="2" fill={bg} opacity="0.9" />
        <rect x="18" y="53" width="18" height="2.5" rx="1.2" fill={bg} opacity="0.6" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="8" y={68 + i * 9} width="4" height="4" rx="1" fill={bg} opacity="0.85" />
            <rect x="15" y={69 + i * 9} width="26" height="2.5" rx="1.2" fill={bg} opacity="0.7" />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="8" y={115 + i * 10} width="38" height="2" rx="1" fill={bg} opacity="0.4" />
            <rect x="8" y={115 + i * 10} width={28 - i * 5} height="2" rx="1" fill={bg} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={8 + i * 14} y={150} width="12" height="5" rx="2.5" fill={bg} opacity="0.3" />
        ))}
        <rect x="64" y="20" width="60" height="4" rx="2" fill={accentColor} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="64" y={34 + i * 6} width={70 - i * 10} height="2" rx="1" fill={text} />
        ))}
        <rect x="64" y="60" width="40" height="3" rx="1.5" fill={accentColor} />
        <rect x="64" y="68" width="82" height="16" rx="4" fill={text} opacity="0.15" />
        <rect x="70" y="73" width="40" height="2" rx="1" fill={textStrong} />
        <rect x="70" y="78" width="60" height="2" rx="1" fill={text} />
        <rect x="64" y="94" width="36" height="3" rx="1.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="64" y={102 + i * 22} width="82" height="16" rx="4" fill={text} opacity="0.15" />
            <rect x="70" y={107 + i * 22} width="30" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="70" y={113 + i * 22} width="50" height="2" rx="1" fill={text} />
          </g>
        ))}
      </svg>
    )
  }

  /* ===== 2. CLASSIC ===== */
  if (template === 'classic') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect x="40" y="16" width="80" height="5" rx="2" fill={textStrong} />
        <rect x="55" y="26" width="50" height="3" rx="1.5" fill={text} />
        <rect x="45" y="34" width="70" height="2" rx="1" fill={text} opacity="0.7" />
        <rect x="55" y="39" width="50" height="2" rx="1" fill={text} opacity="0.7" />
        <rect x="20" y="46" width="120" height="1" fill={textStrong} />
        <rect x="20" y="56" width="35" height="3" rx="1.5" fill={textStrong} />
        <rect x="20" y="64" width="120" height="1" fill={divider} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="20" y={70 + i * 5} width={120 - i * 15} height="2" rx="1" fill={text} />
        ))}
        <rect x="20" y="92" width="45" height="3" rx="1.5" fill={textStrong} />
        <rect x="20" y="100" width="120" height="1" fill={divider} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="20" y={108 + i * 30} width="55" height="3" rx="1.5" fill={textStrong} />
            <rect x="115" y={108 + i * 30} width="25" height="2.5" rx="1.2" fill={text} opacity="0.6" />
            <rect x="20" y={115 + i * 30} width="40" height="2.5" rx="1.2" fill={text} opacity="0.8" />
            {[0, 1, 2].map((j) => (
              <rect key={j} x="20" y={123 + i * 30 + j * 4} width={110 - j * 20} height="1.8" rx="0.9" fill={text} />
            ))}
          </g>
        ))}
        <rect x="20" y="172" width="30" height="3" rx="1.5" fill={textStrong} />
        <rect x="20" y="180" width="120" height="1" fill={divider} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={20 + (i % 2) * 62} y={188 + Math.floor(i / 2) * 5} width="55" height="2" rx="1" fill={text} />
        ))}
      </svg>
    )
  }

  /* ===== 3. MINIMAL ===== */
  if (template === 'minimal') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect x="20" y="24" width="70" height="6" rx="3" fill={textStrong} />
        <rect x="20" y="36" width="50" height="2.5" rx="1.2" fill={accentColor} />
        <rect x="20" y="44" width="80" height="2" rx="1" fill={text} opacity="0.6" />
        <rect x="20" y="49" width="60" height="2" rx="1" fill={text} opacity="0.6" />
        <rect x="20" y="68" width="24" height="2.5" rx="1.2" fill={text} opacity="0.5" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="20" y={78 + i * 5} width={115 - i * 10} height="2" rx="1" fill={text} />
        ))}
        <rect x="20" y="104" width="34" height="2.5" rx="1.2" fill={text} opacity="0.5" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="20" y={114 + i * 20} width="50" height="3" rx="1.5" fill={textStrong} />
            <rect x="115" y={114 + i * 20} width="20" height="2.5" rx="1.2" fill={text} opacity="0.5" />
            <rect x="20" y={120 + i * 20} width="40" height="2" rx="1" fill={accentColor} opacity="0.7" />
            <rect x="20" y={126 + i * 20} width="100" height="2" rx="1" fill={text} opacity="0.8" />
          </g>
        ))}
        <rect x="20" y="178" width="24" height="2.5" rx="1.2" fill={text} opacity="0.5" />
        {[0, 1].map((i) => (
          <rect key={i} x="20" y={188 + i * 5} width={100 - i * 20} height="2" rx="1" fill={text} />
        ))}
      </svg>
    )
  }

  /* ===== 4. ELEGANT ===== */
  if (template === 'elegant') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect x="35" y="18" width="90" height="4" rx="2" fill={textStrong} />
        <rect x="50" y="26" width="60" height="2.5" rx="1.2" fill={accentColor} />
        <rect x="45" y="38" width="70" height="2" rx="1" fill={text} opacity="0.6" />
        <rect x="55" y="43" width="50" height="2" rx="1" fill={text} opacity="0.6" />
        <rect x="30" y="52" width="100" height="1" fill={accentColor} />
        <rect x="30" y="55" width="100" height="0.5" fill={accentColor} />
        <rect x="20" y="68" width="35" height="3" rx="1.5" fill={accentColor} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="20" y={78 + i * 5} width={120 - i * 15} height="2" rx="1" fill={text} />
        ))}
        <rect x="20" y="100" width="45" height="3" rx="1.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="20" y={110 + i * 30} width="55" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="115" y={110 + i * 30} width="25" height="2" rx="1" fill={text} opacity="0.6" />
            <rect x="20" y={117 + i * 30} width="40" height="2" rx="1" fill={text} opacity="0.8" />
            {[0, 1, 2].map((j) => (
              <rect key={j} x="20" y={125 + i * 30 + j * 4} width={110 - j * 20} height="1.8" rx="0.9" fill={text} />
            ))}
          </g>
        ))}
        <rect x="20" y="174" width="30" height="3" rx="1.5" fill={accentColor} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={20 + (i % 2) * 62} y={184 + Math.floor(i / 2) * 5} width="55" height="2" rx="1" fill={text} />
        ))}
      </svg>
    )
  }

  /* ===== 5. CREATIVE ===== */
  if (template === 'creative') {
    return (
      <svg {...commonProps}>
        <defs>
          <linearGradient id="creative-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect width="160" height="200" fill={bg} />
        <rect width="60" height="200" fill="url(#creative-grad)" />
        <circle cx="55" cy="-5" r="25" fill={bg} opacity="0.15" />
        <circle cx="30" cy="30" r="14" fill={bg} opacity="0.9" />
        <rect x="15" y="52" width="30" height="4" rx="2" fill={bg} opacity="0.9" />
        <rect x="20" y="60" width="20" height="2.5" rx="1.2" fill={bg} opacity="0.6" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx="12" cy={80 + i * 10} r="2" fill={bg} opacity="0.85" />
            <rect x="18" y={79 + i * 10} width="32" height="2.5" rx="1.2" fill={bg} opacity="0.7" />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="10" y={115 + i * 10} width="40" height="2" rx="1" fill={bg} opacity="0.4" />
            <rect x="10" y={115 + i * 10} width={30 - i * 6} height="2" rx="1" fill={bg} />
          </g>
        ))}
        <rect x="72" y="24" width="60" height="4" rx="2" fill={accentColor} />
        {[0, 1].map((i) => (
          <rect key={i} x="72" y={38 + i * 5} width={70 - i * 15} height="2" rx="1" fill={text} />
        ))}
        <rect x="70" y="60" width="48" height="8" rx="4" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="70" y={78 + i * 25} width="78" height="18" rx="4" fill={text} opacity="0.12" />
            <rect x="76" y={84 + i * 25} width="35" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="76" y={90 + i * 25} width="55" height="2" rx="1" fill={text} />
          </g>
        ))}
      </svg>
    )
  }

  /* ===== 6. EXECUTIVE ===== */
  if (template === 'executive') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect x="14" y="14" width="70" height="5" rx="2" fill={textStrong} />
        <rect x="14" y="24" width="45" height="2.5" rx="1.2" fill={accentColor} />
        <rect x="115" y="16" width="32" height="2" rx="1" fill={text} opacity="0.6" />
        <rect x="115" y="21" width="28" height="2" rx="1" fill={text} opacity="0.6" />
        <rect x="115" y="26" width="30" height="2" rx="1" fill={text} opacity="0.6" />
        <rect x="14" y="38" width="132" height="2" fill={accentColor} />
        <rect x="14" y="48" width="35" height="3" rx="1.5" fill={accentColor} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="14" y={58 + i * 5} width={55 - i * 8} height="2" rx="1" fill={text} />
        ))}
        <rect x="14" y="82" width="30" height="3" rx="1.5" fill={accentColor} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="14" y={92 + i * 8} width="50" height="2" rx="1" fill={text} />
            <rect x="14" y={96 + i * 8} width={35 - i * 3} height="1.5" rx="0.75" fill={accentColor} opacity="0.7" />
          </g>
        ))}
        <rect x="80" y="48" width="45" height="3" rx="1.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="80" y={58 + i * 30} width="55" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="80" y={64 + i * 30} width="40" height="2" rx="1" fill={text} opacity="0.8" />
            {[0, 1].map((j) => (
              <rect key={j} x="80" y={70 + i * 30 + j * 4} width={60 - j * 15} height="1.8" rx="0.9" fill={text} />
            ))}
          </g>
        ))}
        <rect x="80" y="130" width="45" height="3" rx="1.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="80" y={140 + i * 18} width="55" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="80" y={146 + i * 18} width="40" height="2" rx="1" fill={text} opacity="0.7" />
          </g>
        ))}
      </svg>
    )
  }

  /* ===== 7. TECH ===== */
  if (template === 'tech') {
    const techBg = '#0f172a'
    const techSidebar = '#1e293b'
    const techText = '#94a3b8'
    const techStrong = '#f1f5f9'
    const techAccent = '#38bdf8'
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={techBg} />
        <rect width="50" height="200" fill={techSidebar} />
        <circle cx="25" cy="26" r="11" fill="#334155" />
        <rect x="14" y="42" width="22" height="3" rx="1.5" fill={techStrong} />
        <rect x="18" y="48" width="14" height="2" rx="1" fill={techAccent} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="8" y={62 + i * 8} width="36" height="2" rx="1" fill={techText} opacity="0.6" />
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="8" y={100 + i * 12} width="36" height="2" rx="1" fill="#334155" />
            <rect x="8" y={100 + i * 12} width={26 - i * 5} height="2" rx="1" fill={techAccent} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={8 + i * 12} y={145} width="10" height="4" rx="2" fill={techAccent} opacity="0.6" />
        ))}
        <rect x="60" y="20" width="50" height="4" rx="2" fill={techStrong} />
        <rect x="60" y="28" width="35" height="2.5" rx="1.2" fill={techAccent} />
        {[0, 1].map((i) => (
          <rect key={i} x="60" y={40 + i * 5} width={80 - i * 15} height="2" rx="1" fill={techText} />
        ))}
        <rect x="60" y="60" width="35" height="2.5" rx="1.2" fill={techAccent} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="60" y={68 + i * 22} width="86" height="16" rx="3" fill={techSidebar} />
            <rect x="66" y={73 + i * 22} width="30" height="2.5" rx="1.2" fill={techStrong} />
            <rect x="66" y={79 + i * 22} width="55" height="2" rx="1" fill={techText} />
          </g>
        ))}
      </svg>
    )
  }

  /* ===== 8. ACADEMIC ===== */
  if (template === 'academic') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect x="35" y="16" width="90" height="5" rx="2" fill={textStrong} />
        <rect x="55" y="26" width="50" height="2.5" rx="1.2" fill={text} />
        <rect x="40" y="33" width="80" height="1.5" rx="0.75" fill={text} opacity="0.6" />
        <rect x="20" y="42" width="120" height="1.5" fill={textStrong} />
        <rect x="20" y="52" width="40" height="3" rx="1.5" fill={textStrong} />
        <rect x="20" y="58" width="120" height="0.5" fill={textStrong} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x="20" y={64 + i * 5} width={120 - i * 15} height="2" rx="1" fill={text} />
        ))}
        <rect x="20" y="84" width="42" height="3" rx="1.5" fill={textStrong} />
        <rect x="20" y="90" width="120" height="0.5" fill={textStrong} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="20" y={96 + i * 26} width="50" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="115" y={96 + i * 26} width="25" height="2" rx="1" fill={text} opacity="0.6" />
            <rect x="20" y={102 + i * 26} width="35" height="2" rx="1" fill={text} opacity="0.7" />
            {[0, 1].map((j) => (
              <rect key={j} x="20" y={108 + i * 26 + j * 4} width={110 - j * 20} height="1.5" rx="0.75" fill={text} />
            ))}
          </g>
        ))}
        <rect x="20" y="152" width="30" height="3" rx="1.5" fill={textStrong} />
        <rect x="20" y="158" width="120" height="0.5" fill={textStrong} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={20 + (i % 2) * 62} y={164 + Math.floor(i / 2) * 6} width="55" height="2" rx="1" fill={text} />
        ))}
      </svg>
    )
  }

  /* ===== 9. COMPACT ===== */
  if (template === 'compact') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect width="44" height="200" fill={accentColor} />
        <circle cx="22" cy="20" r="9" fill={bg} opacity="0.9" />
        <rect x="10" y="34" width="24" height="3" rx="1.5" fill={bg} opacity="0.9" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x="6" y={46 + i * 7} width="32" height="1.8" rx="0.9" fill={bg} opacity="0.7" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x="6" y={96 + i * 8} width="32" height="1.5" rx="0.75" fill={bg} opacity="0.4" />
            <rect x="6" y={96 + i * 8} width={24 - i * 3} height="1.5" rx="0.75" fill={bg} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={6 + i * 12} y={155} width="10" height="4" rx="2" fill={bg} opacity="0.4" />
        ))}
        <rect x="52" y="14" width="70" height="3.5" rx="1.75" fill={accentColor} />
        {[0, 1].map((i) => (
          <rect key={i} x="52" y={24 + i * 5} width={90 - i * 15} height="2" rx="1" fill={text} />
        ))}
        <rect x="52" y="42" width="30" height="2.5" rx="1.2" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="52" y={50 + i * 16} width="94" height="12" rx="3" fill={text} opacity="0.12" />
            <rect x="56" y={54 + i * 16} width="35" height="2" rx="1" fill={textStrong} />
            <rect x="56" y={58 + i * 16} width="60" height="1.5" rx="0.75" fill={text} />
          </g>
        ))}
        <rect x="52" y="88" width="30" height="2.5" rx="1.2" fill={accentColor} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="52" y={96 + i * 14} width="94" height="10" rx="3" fill={text} opacity="0.12" />
            <rect x="56" y={99 + i * 14} width="30" height="2" rx="1" fill={textStrong} />
            <rect x="56" y={103 + i * 14} width="55" height="1.5" rx="0.75" fill={text} />
          </g>
        ))}
      </svg>
    )
  }

  /* ===== 10. SIDEBAR DARK ===== */
  if (template === 'sidebar-dark') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect width="58" height="200" fill="#1e293b" />
        <circle cx="29" cy="28" r="13" fill="#334155" />
        <rect x="16" y="48" width="26" height="3.5" rx="1.75" fill="#f1f5f9" />
        <rect x="20" y="55" width="18" height="2" rx="1" fill={accentColor} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx="12" cy={72 + i * 9} r="2" fill={accentColor} />
            <rect x="18" y={71 + i * 9} width="30" height="2.2" rx="1.1" fill="#94a3b8" />
          </g>
        ))}
        <rect x="8" y="115" width="42" height="2.5" rx="1.2" fill={accentColor} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="8" y={124 + i * 10} width="42" height="2" rx="1" fill="#334155" />
            <rect x="8" y={124 + i * 10} width={32 - i * 6} height="2" rx="1" fill={accentColor} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={8 + i * 14} y={160} width="12" height="5" rx="2.5" fill={accentColor} opacity="0.5" />
        ))}
        <rect x="68" y="22" width="70" height="4" rx="2" fill={textStrong} />
        {[0, 1].map((i) => (
          <rect key={i} x="68" y={34 + i * 5} width={80 - i * 15} height="2" rx="1" fill={text} />
        ))}
        <rect x="68" y="58" width="40" height="3" rx="1.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="68" y={68 + i * 22} width="82" height="16" rx="4" fill={text} opacity="0.12" />
            <rect x="74" y={73 + i * 22} width="35" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="74" y={79 + i * 22} width="55" height="2" rx="1" fill={text} />
          </g>
        ))}
        <rect x="68" y="120" width="34" height="3" rx="1.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <rect key={i} x="68" y={130 + i * 6} width={75 - i * 12} height="2" rx="1" fill={text} />
        ))}
      </svg>
    )
  }

  /* ===== 11. MAGAZINE ===== */
  if (template === 'magazine') {
    return (
      <svg {...commonProps}>
        <rect width="160" height="200" fill={bg} />
        <rect x="14" y="14" width="132" height="2.5" fill={accentColor} />
        <rect x="14" y="22" width="90" height="6" rx="3" fill={textStrong} />
        <rect x="14" y="34" width="60" height="3" rx="1.5" fill={accentColor} />
        <rect x="14" y="44" width="132" height="0.8" fill={text} opacity="0.4" />
        <rect x="14" y="54" width="35" height="3" rx="1.5" fill={accentColor} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="14" y={62 + i * 5} width={70 - i * 8} height="1.8" rx="0.9" fill={text} />
        ))}
        <rect x="14" y="90" width="45" height="3" rx="1.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="14" y={100 + i * 26} width="70" height="22" rx="4" fill={text} opacity="0.1" />
            <rect x="20" y={106 + i * 26} width="42" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="20" y={112 + i * 26} width="55" height="1.8" rx="0.9" fill={text} />
            <rect x="20" y={117 + i * 26} width="40" height="1.8" rx="0.9" fill={text} />
          </g>
        ))}
        <rect x="94" y="54" width="52" height="2.5" fill={accentColor} />
        <rect x="94" y="62" width="52" height="20" rx="4" fill={text} opacity="0.12" />
        <rect x="98" y="68" width="30" height="2.2" rx="1.1" fill={textStrong} />
        <rect x="98" y="74" width="42" height="1.8" rx="0.9" fill={text} />
        <rect x="94" y="88" width="52" height="2.5" fill={accentColor} />
        <rect x="94" y="96" width="52" height="20" rx="4" fill={text} opacity="0.12" />
        <rect x="98" y="102" width="30" height="2.2" rx="1.1" fill={textStrong} />
        <rect x="98" y="108" width="42" height="1.8" rx="0.9" fill={text} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="94" y={124 + i * 8} width="52" height="1.5" rx="0.75" fill={text} opacity="0.5" />
            <rect x="94" y={124 + i * 8} width={40 - i * 5} height="1.5" rx="0.75" fill={text} />
          </g>
        ))}
      </svg>
    )
  }

  /* ===== 12. INFOGRAPHIC ===== */
  if (template === 'infographic') {
    return (
      <svg {...commonProps}>
        <defs>
          <linearGradient id="info-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <rect width="160" height="200" fill={bg} />
        <rect width="54" height="200" fill="url(#info-grad)" />
        <circle cx="27" cy="26" r="12" fill={bg} opacity="0.9" />
        <rect x="14" y="44" width="26" height="3.5" rx="1.75" fill={bg} opacity="0.9" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx="10" cy={64 + i * 10} r="2.5" fill={bg} opacity="0.9" />
            <rect x="16" y={63 + i * 10} width="30" height="2.2" rx="1.1" fill={bg} opacity="0.7" />
          </g>
        ))}
        <rect x="8" y="112" width="42" height="2.5" rx="1.2" fill={bg} opacity="0.5" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <rect x="8" y={122 + i * 12} width="42" height="2" rx="1" fill={bg} opacity="0.3" />
            <rect x="8" y={122 + i * 12} width={34 - i * 6} height="2" rx="1" fill={bg} />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={10 + i * 16} cy="170" r="4" fill={bg} opacity="0.8" />
          </g>
        ))}
        <rect x="64" y="20" width="60" height="4" rx="2" fill={accentColor} />
        {[0, 1].map((i) => (
          <rect key={i} x="64" y={32 + i * 5} width={70 - i * 15} height="2" rx="1" fill={text} />
        ))}
        <rect x="64" y="54" width="48" height="7" rx="3.5" fill={accentColor} />
        {[0, 1].map((i) => (
          <g key={i}>
            <rect x="64" y={68 + i * 22} width="82" height="16" rx="4" fill={text} opacity="0.12" />
            <rect x="70" y={73 + i * 22} width="35" height="2.5" rx="1.2" fill={textStrong} />
            <rect x="70" y={79 + i * 22} width="55" height="2" rx="1" fill={text} />
          </g>
        ))}
        <rect x="64" y="120" width="48" height="7" rx="3.5" fill={accentColor} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={72 + i * 15} cy="145" r="5" fill={accentColor} opacity="0.3" />
            <rect x="66" y={155 + i * 6} width="70" height="2" rx="1" fill={text} opacity="0.7" />
          </g>
        ))}
      </svg>
    )
  }

  // Fallback (shouldn't happen with 12 template)
  return (
    <svg {...commonProps}>
      <rect width="160" height="200" fill={bg} />
      <rect x="20" y="20" width="120" height="5" rx="2.5" fill={textStrong} />
      <rect x="20" y="40" width="80" height="3" rx="1.5" fill={accentColor} />
      <text
        x="80"
        y="110"
        textAnchor="middle"
        fill={text}
        fontSize="10"
        fontFamily="sans-serif"
      >
        {template}
      </text>
    </svg>
  )
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function CvTemplateCard({
  template,
  selected = false,
  onSelect,
  disabled = false,
  accentColor = '#3b82f6',
  theme = 'light',
  compact = false,
  className = '',
}: CvTemplateCardProps) {
  const info = useMemo(() => getTemplate(template), [template])

  const handleClick = () => {
    if (disabled) return
    onSelect?.(template)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(template)
    }
  }

  if (!info) return null

  return (
    <button
      type="button"
      className={[
        'cv-tpl-card',
        selected && 'is-selected',
        disabled && 'is-disabled',
        compact && 'is-compact',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Pilih template ${info.label}`}
    >
      <div className="cv-tpl-preview">
        <TemplatePreview
          template={template}
          accentColor={accentColor}
          theme={theme}
        />

        {selected && (
          <div className="cv-tpl-check">
            <i className="pi pi-check" />
          </div>
        )}

        <span className="cv-tpl-hint">{info.accentHint}</span>
      </div>

      <div className="cv-tpl-info">
        <div className="cv-tpl-info-header">
          <strong className="cv-tpl-label">{info.label}</strong>
        </div>
        <p className="cv-tpl-desc">{info.desc}</p>
      </div>
    </button>
  )
}

/* ============================================================
   GRID WRAPPER
   ============================================================ */

export interface CvTemplateGridProps {
  templates: CvTemplate[]
  value?: CvTemplate
  onChange?: (template: CvTemplate) => void
  disabled?: boolean
  accentColor?: string
  theme?: 'light' | 'dark'
}

export function CvTemplateGrid({
  templates,
  value,
  onChange,
  disabled,
  accentColor,
  theme,
}: CvTemplateGridProps) {
  return (
    <div className="cv-tpl-grid">
      {templates.map((t) => (
        <CvTemplateCard
          key={t}
          template={t}
          selected={value === t}
          onSelect={onChange}
          disabled={disabled}
          accentColor={accentColor}
          theme={theme}
        />
      ))}
    </div>
  )
}