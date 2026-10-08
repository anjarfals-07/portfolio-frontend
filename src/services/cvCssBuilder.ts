// ============================================================
// cvCssBuilder — Generate CSS string untuk CV
// ============================================================
// v5 FINAL:
// - @font-face override (fix OTS error)
// - Force html, body = 210mm x 297mm (fix PDF A4)
// - 8 card style, 7 badge style, 8 pattern
// - CSS var --cv-accent-on untuk text di atas accent
// - Icon styles (primeicons, lucide, emoji, mixed, none)
// ============================================================

import type {
  CvPreferences,
  CvDensity,
  CvTheme,
  CvCardStyle,
  CvBadgeStyle,
  CvPattern,
} from '@/types/cv'
import { getFontPair, getPalette, isValidHex } from '@/types/cv'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvCssOptions {
  preferences: CvPreferences
  accentColor: string
  accentColorDark?: string
}

interface ThemeTokens {
  bg: string
  bgSubtle: string
  text: string
  textStrong: string
  textMuted: string
  border: string
  divider: string
}

interface SpacingTokens {
  gap: string
  gapSm: string
  gapLg: string
  padSection: string
  padCard: string
  lineHeight: string
  fontSize: string
}

/* ============================================================
   MAIN
   ============================================================ */

export function buildCvCss(options: CvCssOptions): string {
  const { preferences, accentColor, accentColorDark } = options

  const palette = getPalette(preferences.palette)
  const accentDark =
    accentColorDark ?? palette?.colorDark ?? darken(accentColor, 0.25)

  const fontPair = getFontPair(preferences.fontPair)
  const fontHeading = preferences.fontHeading ?? fontPair?.heading ?? 'Inter'
  const fontBody = preferences.fontBody ?? fontPair?.body ?? 'Inter'

  const theme = resolveTheme(preferences.theme)
  const spacing = resolveDensity(preferences.density)

  const parts: string[] = [
    buildFontOverrides(),
    buildBase(theme, fontHeading, fontBody),
    buildVariables(theme, accentColor, accentDark, spacing),
    buildLayout(preferences.layout),
    buildSections(),
    buildCardStyle(preferences.cardStyle),
    buildBadgeStyle(preferences.badgeStyle),
    buildThemeOverrides(theme),
    buildBackgroundPattern(preferences.backgroundPattern),
    buildPrintRules(),
  ]

  return parts.filter(Boolean).join('\n\n')
}

/* ============================================================
   FONT OVERRIDES
   ============================================================ */

function buildFontOverrides(): string {
  return `
/* Block @font-face PrimeReact yang resolve ke /themes/... */
@font-face {
  font-family: 'Inter';
  src: local('Inter'), local('Inter-Regular'), local('Arial');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
  unicode-range: U+0000-FFFF;
}

@font-face {
  font-family: 'Inter var';
  src: local('Inter'), local('Inter-Regular'), local('Arial');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
  unicode-range: U+0000-FFFF;
}

@font-face {
  font-family: 'InterVariable';
  src: local('Inter'), local('Inter-Regular'), local('Arial');
  font-weight: 100 900;
  font-style: normal;
  font-display: block;
  unicode-range: U+0000-FFFF;
}

@font-face {
  font-family: 'InterVariable-Italic';
  src: local('Inter Italic'), local('Inter-Italic');
  font-weight: 100 900;
  font-style: italic;
  font-display: block;
  unicode-range: U+0000-FFFF;
}

:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`.trim()
}

/* ============================================================
   BASE
   ============================================================ */

function buildBase(
  theme: ThemeTokens,
  fontHeading: string,
  fontBody: string
): string {
  return `
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  width: 210mm;
  height: 297mm;
  overflow: hidden;
  background: ${theme.bg};
  color: ${theme.text};
  font-family: '${fontBody}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4, h5, h6 {
  font-family: '${fontHeading}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-weight: 700;
  line-height: 1.2;
  color: ${theme.textStrong};
}

h1 { font-size: 22pt; letter-spacing: -0.02em; }
h2 { font-size: 14pt; letter-spacing: -0.01em; }
h3 { font-size: 11.5pt; }
h4 { font-size: 10.5pt; }

p { margin: 0; }
a { color: inherit; text-decoration: none; }
img { max-width: 100%; height: auto; display: block; }
ul, ol { list-style: none; padding: 0; }
strong { font-weight: 600; color: ${theme.textStrong}; }
`.trim()
}

/* ============================================================
   THEME / DENSITY TOKENS
   ============================================================ */

function resolveTheme(theme: CvTheme): ThemeTokens {
  if (theme === 'dark') {
    return {
      bg: '#0f172a',
      bgSubtle: '#1e293b',
      text: '#cbd5e1',
      textStrong: '#f1f5f9',
      textMuted: '#94a3b8',
      border: '#334155',
      divider: '#1e293b',
    }
  }
  return {
    bg: '#ffffff',
    bgSubtle: '#f8fafc',
    text: '#334155',
    textStrong: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    divider: '#f1f5f9',
  }
}

function resolveDensity(density: CvDensity): SpacingTokens {
  switch (density) {
    case 'compact':
      return {
        gap: '6pt',
        gapSm: '3pt',
        gapLg: '10pt',
        padSection: '10pt',
        padCard: '8pt',
        lineHeight: '1.4',
        fontSize: '9.5pt',
      }
    case 'spacious':
      return {
        gap: '14pt',
        gapSm: '8pt',
        gapLg: '22pt',
        padSection: '20pt',
        padCard: '16pt',
        lineHeight: '1.65',
        fontSize: '11pt',
      }
    default:
      return {
        gap: '10pt',
        gapSm: '5pt',
        gapLg: '16pt',
        padSection: '14pt',
        padCard: '12pt',
        lineHeight: '1.5',
        fontSize: '10.5pt',
      }
  }
}

function buildVariables(
  theme: ThemeTokens,
  accent: string,
  accentDark: string,
  spacing: SpacingTokens
): string {
  const accentOn = isLightColor(accent) ? '#0f172a' : '#ffffff'

  return `
:root {
  --cv-accent: ${accent};
  --cv-accent-dark: ${accentDark};
  --cv-accent-on: ${accentOn};
  --cv-bg: ${theme.bg};
  --cv-bg-subtle: ${theme.bgSubtle};
  --cv-text: ${theme.text};
  --cv-text-strong: ${theme.textStrong};
  --cv-text-muted: ${theme.textMuted};
  --cv-border: ${theme.border};
  --cv-divider: ${theme.divider};

  --cv-gap: ${spacing.gap};
  --cv-gap-sm: ${spacing.gapSm};
  --cv-gap-lg: ${spacing.gapLg};
  --cv-pad-section: ${spacing.padSection};
  --cv-pad-card: ${spacing.padCard};
  --cv-line-height: ${spacing.lineHeight};
  --cv-font-size: ${spacing.fontSize};
}
`.trim()
}

/* ============================================================
   LAYOUT
   ============================================================ */

function buildLayout(layout: CvPreferences['layout']): string {
  const base = `
.cv-root {
  width: 210mm;
  min-height: 297mm;
  display: grid;
  background: var(--cv-bg);
}

.cv-sidebar {
  padding: var(--cv-pad-section);
  background: var(--cv-accent);
  color: var(--cv-accent-on);
  display: flex;
  flex-direction: column;
  gap: var(--cv-gap-lg);
}

.cv-sidebar h1, .cv-sidebar h2, .cv-sidebar h3,
.cv-sidebar strong, .cv-sidebar a {
  color: var(--cv-accent-on);
}

.cv-sidebar .cv-text-muted {
  color: color-mix(in srgb, var(--cv-accent-on) 75%, transparent);
}

.cv-main {
  padding: var(--cv-pad-section);
  display: flex;
  flex-direction: column;
  gap: var(--cv-gap-lg);
}
`.trim()

  switch (layout) {
    case 'sidebar-right':
      return `${base}

.cv-root { grid-template-columns: 1fr 70mm; }
.cv-sidebar { order: 2; }
.cv-main    { order: 1; }
`
    case 'header-top':
      return `${base}

.cv-root {
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
}
.cv-sidebar {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--cv-gap);
}
.cv-sidebar > * { flex: 1 1 auto; }
`
    case 'two-col':
      return `${base}

.cv-root { grid-template-columns: 1fr 1fr; }
.cv-sidebar {
  background: var(--cv-bg-subtle);
  color: var(--cv-text);
  border-right: 1px solid var(--cv-border);
}
.cv-sidebar h1, .cv-sidebar h2, .cv-sidebar h3,
.cv-sidebar strong, .cv-sidebar a { color: var(--cv-text-strong); }
.cv-sidebar .cv-text-muted { color: var(--cv-text-muted); }
`
    case 'timeline':
      return `${base}

.cv-root { grid-template-columns: 60mm 1fr; }
.cv-main .cv-section-body {
  border-left: 2px solid var(--cv-accent);
  padding-left: var(--cv-gap);
}
`
    default:
      return `${base}

.cv-root { grid-template-columns: 70mm 1fr; }
`
  }
}

/* ============================================================
   SECTIONS
   ============================================================ */

function buildSections(): string {
  return `
.cv-section { display: flex; flex-direction: column; gap: var(--cv-gap-sm); }

.cv-section-title {
  font-size: 11pt;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--cv-accent);
  padding-bottom: 4pt;
  border-bottom: 2px solid var(--cv-accent);
  margin-bottom: var(--cv-gap-sm);
  display: flex;
  align-items: center;
  gap: 4pt;
}

.cv-sidebar .cv-section-title {
  color: var(--cv-accent-on);
  border-bottom-color: color-mix(in srgb, var(--cv-accent-on) 40%, transparent);
}

.cv-section-body { display: flex; flex-direction: column; gap: var(--cv-gap); }

.cv-header { display: flex; flex-direction: column; gap: var(--cv-gap-sm); }
.cv-header-center { align-items: center; text-align: center; }

.cv-header-name {
  font-size: 24pt;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--cv-text-strong);
}

.cv-header-role {
  font-size: 11pt;
  font-weight: 500;
  color: var(--cv-accent);
  letter-spacing: 0.02em;
}

.cv-header-bio {
  font-size: var(--cv-font-size);
  color: var(--cv-text);
  line-height: var(--cv-line-height);
  margin-top: var(--cv-gap-sm);
}

.cv-avatar {
  width: 90pt;
  height: 90pt;
  border-radius: 50%;
  object-fit: cover;
  border: 3pt solid color-mix(in srgb, var(--cv-accent-on) 30%, transparent);
  margin: 0 auto;
}

.cv-contact-inline {
  font-size: 9.5pt;
  margin-top: 4pt;
}

.cv-info-list { display: flex; flex-direction: column; gap: var(--cv-gap-sm); }

.cv-info-item {
  display: flex;
  gap: 6pt;
  font-size: 10pt;
  align-items: flex-start;
}

.cv-info-item-label {
  font-weight: 600;
  min-width: 70pt;
  flex-shrink: 0;
  color: var(--cv-text-strong);
}

.cv-sidebar .cv-info-item-label { color: color-mix(in srgb, var(--cv-accent-on) 90%, transparent); }
.cv-info-item-value { color: var(--cv-text); word-break: break-word; }
.cv-sidebar .cv-info-item-value { color: color-mix(in srgb, var(--cv-accent-on) 85%, transparent); }

.cv-item { display: flex; flex-direction: column; gap: 3pt; }

.cv-item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--cv-gap-sm);
}

.cv-item-title { font-size: 11pt; font-weight: 600; color: var(--cv-text-strong); }
.cv-item-subtitle { font-size: 10pt; font-weight: 500; color: var(--cv-accent); }
.cv-item-period { font-size: 9pt; font-weight: 500; color: var(--cv-text-muted); white-space: nowrap; flex-shrink: 0; }
.cv-item-desc { font-size: 10pt; color: var(--cv-text); line-height: var(--cv-line-height); margin-top: 2pt; }

.cv-contact { display: flex; flex-direction: column; gap: 5pt; font-size: 9.5pt; }

.cv-contact-item {
  display: flex;
  align-items: center;
  gap: 6pt;
  color: color-mix(in srgb, var(--cv-accent-on) 90%, transparent);
  word-break: break-word;
}

.cv-contact-item .cv-icon { font-size: 10pt; opacity: 0.9; flex-shrink: 0; }

.cv-skills-group { display: flex; flex-direction: column; gap: var(--cv-gap-sm); }

.cv-skills-category {
  font-size: 9.5pt;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--cv-text-muted);
}

.cv-skill-row { display: flex; flex-direction: column; gap: 2pt; }

.cv-skill-head { display: flex; justify-content: space-between; font-size: 9.5pt; }

.cv-skill-bar {
  height: 4pt;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.cv-sidebar .cv-skill-bar { background: color-mix(in srgb, var(--cv-accent-on) 20%, transparent); }

.cv-skill-bar-fill { height: 100%; background: var(--cv-accent); border-radius: 999px; }
.cv-sidebar .cv-skill-bar-fill { background: var(--cv-accent-on); }

.cv-chips { display: flex; flex-wrap: wrap; gap: 5pt; }

.cv-socials { display: flex; flex-direction: column; gap: 4pt; }

.cv-social-item {
  display: flex;
  align-items: center;
  gap: 6pt;
  font-size: 9.5pt;
  color: color-mix(in srgb, var(--cv-accent-on) 90%, transparent);
}

.cv-text-muted { color: var(--cv-text-muted); }
.cv-text-xs    { font-size: 9pt; }
.cv-text-sm    { font-size: 9.5pt; }
.cv-text-lg    { font-size: 11pt; }

.cv-avoid-break { page-break-inside: avoid; break-inside: avoid; }

/* ===== ICON STYLES ===== */
.cv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11pt;
  line-height: 1;
  flex-shrink: 0;
  font-style: normal;
  vertical-align: middle;
}

.cv-icon-emoji {
  font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'EmojiOne Color', 'Android Emoji', sans-serif;
  font-size: 10pt;
  line-height: 1;
  font-style: normal;
  font-weight: normal;
  display: inline-block;
}

.cv-section-title .cv-icon {
  font-size: 10pt;
  margin-right: 2pt;
}

.cv-section-title .cv-icon-emoji {
  font-size: 10pt;
}

.cv-contact-item .cv-icon {
  font-size: 10pt;
  opacity: 0.9;
}

.cv-contact-item .cv-icon-emoji {
  font-size: 10pt;
  opacity: 1;
}

.cv-social-item .cv-icon {
  font-size: 10pt;
  opacity: 0.9;
}

/* Lucide sizing override */
.cv-icon.lucide,
.cv-icon[class*="lucide-"] {
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  stroke-width: 2;
}
`.trim()
}

/* ============================================================
   CARD STYLE — 8 style
   ============================================================ */

function buildCardStyle(style: CvCardStyle): string {
  switch (style) {
    case 'flat':
      return `.cv-card { padding: var(--cv-pad-card); background: transparent; border: none; border-radius: 0; }`

    case 'outline':
      return `.cv-card { padding: var(--cv-pad-card); background: transparent; border: 1.5pt solid var(--cv-accent); border-radius: 6pt; }`

    case 'glass':
      return `.cv-card { padding: var(--cv-pad-card); background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1pt solid rgba(255, 255, 255, 0.15); border-radius: 8pt; }`

    case 'none':
      return `.cv-card { padding: 0; background: transparent; border: none; border-radius: 0; }`

    case 'elevated':
      return `.cv-card { padding: var(--cv-pad-card); background: var(--cv-bg); border: 1px solid var(--cv-border); border-radius: 10pt; box-shadow: 0 4pt 12pt -3pt rgba(0, 0, 0, 0.12), 0 2pt 4pt -1pt rgba(0, 0, 0, 0.06); }`

    case 'gradient':
      return `.cv-card { padding: var(--cv-pad-card); background: linear-gradient(135deg, color-mix(in srgb, var(--cv-accent) 8%, var(--cv-bg)) 0%, var(--cv-bg) 100%); border: 1px solid color-mix(in srgb, var(--cv-accent) 15%, var(--cv-border)); border-radius: 10pt; }`

    case 'bordered-accent':
      return `.cv-card { padding: var(--cv-pad-card); padding-left: calc(var(--cv-pad-card) + 4pt); background: var(--cv-bg-subtle); border: none; border-left: 4pt solid var(--cv-accent); border-radius: 0 8pt 8pt 0; }`

    default:
      return `.cv-card { padding: var(--cv-pad-card); background: var(--cv-bg-subtle); border: 1pt solid var(--cv-border); border-radius: 8pt; }`
  }
}

/* ============================================================
   BADGE STYLE — 7 style
   ============================================================ */

function buildBadgeStyle(style: CvBadgeStyle): string {
  switch (style) {
    case 'square':
      return `.cv-chip, .cv-badge { display: inline-flex; align-items: center; gap: 3pt; background: var(--cv-accent); color: var(--cv-accent-on); padding: 3pt 7pt; border-radius: 2pt; font-size: 9pt; font-weight: 500; }`

    case 'outline':
      return `.cv-chip, .cv-badge { display: inline-flex; align-items: center; gap: 3pt; background: transparent; color: var(--cv-accent); padding: 3pt 8pt; border: 1pt solid var(--cv-accent); border-radius: 999px; font-size: 9pt; font-weight: 500; }`

    case 'minimal':
      return `.cv-chip, .cv-badge { display: inline-flex; align-items: center; gap: 3pt; background: transparent; color: var(--cv-text); padding: 0; border: none; font-size: 9.5pt; font-weight: 500; }`

    case 'soft':
      return `.cv-chip, .cv-badge { display: inline-flex; align-items: center; gap: 3pt; background: color-mix(in srgb, var(--cv-accent) 15%, transparent); color: var(--cv-accent); padding: 3pt 9pt; border-radius: 999px; font-size: 9pt; font-weight: 600; }`

    case 'gradient':
      return `.cv-chip, .cv-badge { display: inline-flex; align-items: center; gap: 3pt; background: linear-gradient(135deg, var(--cv-accent) 0%, var(--cv-accent-dark) 100%); color: var(--cv-accent-on); padding: 3pt 10pt; border-radius: 999px; font-size: 9pt; font-weight: 600; box-shadow: 0 1pt 3pt -1pt color-mix(in srgb, var(--cv-accent) 40%, transparent); }`

    case 'dot':
      return `.cv-chip, .cv-badge { display: inline-flex; align-items: center; gap: 5pt; background: transparent; color: var(--cv-text); padding: 2pt 0; border: none; font-size: 9.5pt; font-weight: 500; } .cv-chip::before, .cv-badge::before { content: ''; width: 5pt; height: 5pt; border-radius: 50%; background: var(--cv-accent); flex-shrink: 0; }`

    default:
      return `.cv-chip, .cv-badge { display: inline-flex; align-items: center; gap: 3pt; background: var(--cv-accent); color: var(--cv-accent-on); padding: 3pt 9pt; border-radius: 999px; font-size: 9pt; font-weight: 500; }`
  }
}

/* ============================================================
   THEME OVERRIDES
   ============================================================ */

function buildThemeOverrides(theme: ThemeTokens): string {
  const isDark = theme.bg === '#0f172a'
  if (!isDark) return ''
  return `
.cv-skill-bar { background: rgba(255, 255, 255, 0.1); }
.cv-card { background: rgba(255, 255, 255, 0.03); border-color: rgba(255, 255, 255, 0.08); }
`.trim()
}

/* ============================================================
   BACKGROUND PATTERN — 8 pattern
   ============================================================ */

function buildBackgroundPattern(pattern: CvPattern): string {
  switch (pattern) {
    case 'dots':
      return `.cv-root { background-image: radial-gradient(circle, var(--cv-border) 1px, transparent 1px); background-size: 16px 16px; }`

    case 'lines':
      return `.cv-root { background-image: linear-gradient(var(--cv-border) 1px, transparent 1px); background-size: 100% 20px; }`

    case 'mesh':
      return `.cv-root { background-image: radial-gradient(at 20% 10%, color-mix(in srgb, var(--cv-accent) 15%, transparent) 0%, transparent 40%), radial-gradient(at 80% 90%, color-mix(in srgb, var(--cv-accent-dark) 15%, transparent) 0%, transparent 40%); }`

    case 'grid':
      return `.cv-root { background-image: linear-gradient(var(--cv-border) 1px, transparent 1px), linear-gradient(90deg, var(--cv-border) 1px, transparent 1px); background-size: 20px 20px; }`

    case 'diagonal':
      return `.cv-root { background-image: repeating-linear-gradient(45deg, transparent 0, transparent 14px, color-mix(in srgb, var(--cv-border) 60%, transparent) 14px, color-mix(in srgb, var(--cv-border) 60%, transparent) 15px); }`

    case 'wave':
      return `.cv-root { background-image: repeating-linear-gradient(-45deg, transparent 0, transparent 10px, color-mix(in srgb, var(--cv-accent) 5%, transparent) 10px, color-mix(in srgb, var(--cv-accent) 5%, transparent) 20px); }`

    case 'noise':
      return `.cv-root { background-image: radial-gradient(circle at 20% 30%, color-mix(in srgb, var(--cv-accent) 3%, transparent) 0%, transparent 20%), radial-gradient(circle at 70% 70%, color-mix(in srgb, var(--cv-accent-dark) 3%, transparent) 0%, transparent 25%), radial-gradient(circle at 40% 80%, color-mix(in srgb, var(--cv-border) 20%, transparent) 0%, transparent 15%); }`

    default:
      return ''
  }
}

/* ============================================================
   PRINT RULES
   ============================================================ */

function buildPrintRules(): string {
  return `
@media print {
  html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
  .cv-card, .cv-item, .cv-section { page-break-inside: avoid; break-inside: avoid; }
  .cv-section-title { page-break-after: avoid; break-after: avoid; }
}
@page { size: A4; margin: 0; }
`.trim()
}

/* ============================================================
   HELPERS
   ============================================================ */

function isLightColor(hex: string): boolean {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return false
  const r = parseInt(hex.substring(1, 3), 16) / 255
  const g = parseInt(hex.substring(3, 5), 16) / 255
  const b = parseInt(hex.substring(5, 7), 16) / 255

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

  const R = toLinear(r)
  const G = toLinear(g)
  const B = toLinear(b)

  const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B
  return luminance > 0.5
}

function darken(hex: string, amount: number): string {
  if (!isValidHex(hex)) return hex
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)
  const factor = 1 - amount
  const nr = Math.max(0, Math.round(r * factor))
  const ng = Math.max(0, Math.round(g * factor))
  const nb = Math.max(0, Math.round(b * factor))
  return `#${[nr, ng, nb].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

export function resolveAccentDark(
  accentColor: string,
  paletteKey: string
): string {
  const palette = getPalette(paletteKey)
  if (palette && palette.color === accentColor) return palette.colorDark
  return darken(accentColor, 0.25)
}