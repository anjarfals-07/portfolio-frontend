// ============================================================
// CV TYPES — Frontend Integration v4
// ============================================================
// v4: Tambah 6 palette, 4 pattern, 3 card style, 3 badge style
// ============================================================

/* ============================================================
   ENUM-LIKE TYPES
   ============================================================ */

export type CvTemplate =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'elegant'
  | 'creative'
  | 'executive'
  | 'tech'
  | 'academic'
  | 'compact'
  | 'sidebar-dark'
  | 'magazine'
  | 'infographic'

export type CvLayout =
  | 'sidebar-left'
  | 'sidebar-right'
  | 'header-top'
  | 'two-col'
  | 'timeline'

export type CvTheme = 'light' | 'dark'

export type CvDensity = 'compact' | 'normal' | 'spacious'

export type CvCardStyle =
  | 'soft'
  | 'flat'
  | 'outline'
  | 'glass'
  | 'none'
  | 'elevated'
  | 'gradient'
  | 'bordered-accent'

export type CvBadgeStyle =
  | 'pill'
  | 'square'
  | 'outline'
  | 'minimal'
  | 'soft'
  | 'gradient'
  | 'dot'

export type CvIconSet = 'primeicons' | 'lucide' | 'none' | 'emoji' | 'mixed'

export type CvPattern =
  | 'none'
  | 'dots'
  | 'lines'
  | 'mesh'
  | 'grid'
  | 'diagonal'
  | 'wave'
  | 'noise'

export type CvSource = 'UPLOAD' | 'GENERATED'

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'INTERNSHIP'

/* ============================================================
   MAIN INTERFACE
   ============================================================ */

export interface CvPreferences {
  // Core
  template: CvTemplate
  layout: CvLayout
  theme: CvTheme
  density: CvDensity

  // Visual
  palette: string
  accentColor?: string
  fontPair: string
  fontHeading?: string
  fontBody?: string
  iconSet: CvIconSet
  cardStyle: CvCardStyle
  badgeStyle: CvBadgeStyle
  backgroundPattern: CvPattern

  // Section toggles
  showBio: boolean
  showPersonalInfo: boolean
  showWorkExperience: boolean
  showEducation: boolean
  showExperiences: boolean
  showProjects: boolean
  showSkills: boolean
  showTechStack: boolean
}

/* ============================================================
   ENTITY TYPES
   ============================================================ */

export interface Education {
  id: number
  institution: string
  degree?: string | null
  fieldOfStudy?: string | null
  startDate?: string | null
  endDate?: string | null
  gpa?: string | null
  description?: string | null
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export interface EducationFormData {
  institution: string
  degree?: string
  fieldOfStudy?: string
  startDate?: string
  endDate?: string
  gpa?: string
  description?: string
}

export interface WorkExperience {
  id: number
  company: string
  position: string
  employmentType?: EmploymentType | null
  location?: string | null
  startDate?: string | null
  endDate?: string | null
  currentlyHere: boolean
  description?: string | null
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

export interface WorkExperienceFormData {
  company: string
  position: string
  employmentType?: EmploymentType
  location?: string
  startDate?: string
  endDate?: string
  currentlyHere: boolean
  description?: string
}

/* ============================================================
   API RESPONSE TYPES
   ============================================================ */

export interface CvOptions {
  templates: CvTemplateOption[]
  layouts: CvLayout[]
  palettes: string[]
  fontPairs: string[]
  themes: CvTheme[]
  densities: CvDensity[]
  cardStyles: CvCardStyle[]
  badgeStyles: CvBadgeStyle[]
  iconSets: CvIconSet[]
  backgroundPatterns: CvPattern[]
}

export interface CvTemplateOption {
  id: CvTemplate
  label: string
  desc: string
}

export interface CvGenerateResult {
  url: string
  publicId: string
  source: CvSource
  template: CvTemplate
  layout: CvLayout
  theme: CvTheme
  generatedAt: string
  sizeBytes: number
}

/* ============================================================
   DEFAULTS
   ============================================================ */

export const DEFAULT_CV_PREFERENCES: CvPreferences = {
  template: 'modern',
  layout: 'sidebar-left',
  theme: 'light',
  density: 'normal',
  palette: 'ocean',
  fontPair: 'inter-inter',
  iconSet: 'primeicons',
  cardStyle: 'soft',
  badgeStyle: 'pill',
  backgroundPattern: 'none',
  showBio: true,
  showPersonalInfo: true,
  showWorkExperience: true,
  showEducation: true,
  showExperiences: true,
  showProjects: true,
  showSkills: true,
  showTechStack: true,
}

/* ============================================================
   PALETTES — 18 palet (12 lama + 6 baru)
   ============================================================ */

export interface PaletteInfo {
  key: string
  label: string
  color: string
  colorDark: string
  /** Warna default untuk text di atas palette */
  onColor?: string
}

export const PALETTES: PaletteInfo[] = [
  // ===== Existing 12 =====
  { key: 'ocean',    label: 'Ocean',    color: '#3b82f6', colorDark: '#1e40af', onColor: '#ffffff' },
  { key: 'sunset',   label: 'Sunset',   color: '#f97316', colorDark: '#9a3412', onColor: '#ffffff' },
  { key: 'forest',   label: 'Forest',   color: '#10b981', colorDark: '#065f46', onColor: '#ffffff' },
  { key: 'royal',    label: 'Royal',    color: '#8b5cf6', colorDark: '#5b21b6', onColor: '#ffffff' },
  { key: 'rose',     label: 'Rose',     color: '#f43f5e', colorDark: '#9f1239', onColor: '#ffffff' },
  { key: 'slate',    label: 'Slate',    color: '#475569', colorDark: '#1e293b', onColor: '#ffffff' },
  { key: 'amber',    label: 'Amber',    color: '#f59e0b', colorDark: '#78350f', onColor: '#0f172a' },
  { key: 'teal',     label: 'Teal',     color: '#14b8a6', colorDark: '#134e4a', onColor: '#ffffff' },
  { key: 'indigo',   label: 'Indigo',   color: '#6366f1', colorDark: '#3730a3', onColor: '#ffffff' },
  { key: 'crimson',  label: 'Crimson',  color: '#dc2626', colorDark: '#7f1d1d', onColor: '#ffffff' },
  { key: 'midnight', label: 'Midnight', color: '#0f172a', colorDark: '#020617', onColor: '#ffffff' },
  { key: 'mint',     label: 'Mint',     color: '#34d399', colorDark: '#047857', onColor: '#0f172a' },

  // ===== NEW: 6 palette baru =====
  { key: 'pastel',      label: 'Pastel',      color: '#a5b4fc', colorDark: '#6366f1', onColor: '#1e1b4b' },
  { key: 'neon',        label: 'Neon',        color: '#22d3ee', colorDark: '#0891b2', onColor: '#0f172a' },
  { key: 'earth',       label: 'Earth',       color: '#a16207', colorDark: '#422006', onColor: '#ffffff' },
  { key: 'ocean-deep',  label: 'Ocean Deep',  color: '#0e7490', colorDark: '#164e63', onColor: '#ffffff' },
  { key: 'sunset-warm', label: 'Sunset Warm', color: '#fb7185', colorDark: '#be123c', onColor: '#ffffff' },
  { key: 'mono',        label: 'Mono',        color: '#1e293b', colorDark: '#000000', onColor: '#ffffff' },
]

/* ============================================================
   FONT PAIRS
   ============================================================ */

export interface FontPairInfo {
  key: string
  label: string
  heading: string
  body: string
}

export const FONT_PAIRS: FontPairInfo[] = [
  { key: 'inter-inter',          label: 'Inter + Inter',        heading: 'Inter',              body: 'Inter' },
  { key: 'inter-lora',           label: 'Inter + Lora',         heading: 'Inter',              body: 'Lora' },
  { key: 'playfair-source',      label: 'Playfair + Source',    heading: 'Playfair Display',   body: 'Source Sans 3' },
  { key: 'montserrat-roboto',    label: 'Montserrat + Roboto',  heading: 'Montserrat',         body: 'Roboto' },
  { key: 'poppins-open',         label: 'Poppins + Open Sans',  heading: 'Poppins',            body: 'Open Sans' },
  { key: 'dm-serif-dm-sans',     label: 'DM Serif + DM Sans',   heading: 'DM Serif Display',   body: 'DM Sans' },
  { key: 'merriweather-georgia', label: 'Merriweather + Georgia', heading: 'Merriweather',     body: 'Georgia' },
  { key: 'jetbrains-inter',      label: 'JetBrains + Inter',    heading: 'JetBrains Mono',     body: 'Inter' },
]

/* ============================================================
   LAYOUTS
   ============================================================ */

export interface LayoutInfo {
  key: CvLayout
  label: string
  desc: string
  icon: string
}

export const LAYOUTS: LayoutInfo[] = [
  { key: 'sidebar-left',  label: 'Sidebar Kiri',  desc: 'Konten utama di kanan',    icon: 'pi pi-align-left' },
  { key: 'sidebar-right', label: 'Sidebar Kanan', desc: 'Konten utama di kiri',     icon: 'pi pi-align-right' },
  { key: 'header-top',    label: 'Header Atas',   desc: 'Full width, header besar', icon: 'pi pi-align-center' },
  { key: 'two-col',       label: 'Dua Kolom',     desc: 'Seimbang kiri-kanan',      icon: 'pi pi-th-large' },
  { key: 'timeline',      label: 'Timeline',      desc: 'Format timeline',          icon: 'pi pi-list' },
]

/* ============================================================
   CARD STYLES — 8 (5 lama + 3 baru)
   ============================================================ */

export interface CardStyleInfo {
  key: CvCardStyle
  label: string
  desc: string
}

export const CARD_STYLES: CardStyleInfo[] = [
  { key: 'soft',            label: 'Soft',            desc: 'Rounded + subtle bg' },
  { key: 'flat',            label: 'Flat',            desc: 'Tanpa shadow/border' },
  { key: 'outline',         label: 'Outline',         desc: 'Border accent' },
  { key: 'glass',           label: 'Glass',           desc: 'Glassmorphism' },
  { key: 'none',            label: 'None',            desc: 'Tanpa card wrapper' },
  { key: 'elevated',        label: 'Elevated',        desc: 'Shadow tebal, terangkat' },
  { key: 'gradient',        label: 'Gradient',        desc: 'Background gradient halus' },
  { key: 'bordered-accent', label: 'Bordered Accent', desc: 'Border kiri accent tebal' },
]

/* ============================================================
   BADGE STYLES — 7 (4 lama + 3 baru)
   ============================================================ */

export interface BadgeStyleInfo {
  key: CvBadgeStyle
  label: string
  desc: string
}

export const BADGE_STYLES: BadgeStyleInfo[] = [
  { key: 'pill',     label: 'Pill',     desc: 'Rounded penuh' },
  { key: 'square',   label: 'Square',   desc: 'Kotak tajam' },
  { key: 'outline',  label: 'Outline',  desc: 'Border aja' },
  { key: 'minimal',  label: 'Minimal',  desc: 'Tanpa background' },
  { key: 'soft',     label: 'Soft',     desc: 'Background accent lembut' },
  { key: 'gradient', label: 'Gradient', desc: 'Gradient accent → dark' },
  { key: 'dot',      label: 'Dot',      desc: 'Titik warna + teks' },
]

/* ============================================================
   DENSITIES
   ============================================================ */

export interface DensityInfo {
  key: CvDensity
  label: string
  desc: string
}

export const DENSITIES: DensityInfo[] = [
  { key: 'compact',  label: 'Compact',  desc: 'Padat, hemat ruang' },
  { key: 'normal',   label: 'Normal',   desc: 'Seimbang' },
  { key: 'spacious', label: 'Spacious', desc: 'Lega, banyak whitespace' },
]

/* ============================================================
   THEMES
   ============================================================ */

export interface ThemeInfo {
  key: CvTheme
  label: string
  icon: string
}

export const THEMES: ThemeInfo[] = [
  { key: 'light', label: 'Light', icon: 'pi pi-sun' },
  { key: 'dark',  label: 'Dark',  icon: 'pi pi-moon' },
]

/* ============================================================
   ICON SETS
   ============================================================ */

export interface IconSetInfo {
  key: CvIconSet
  label: string
}

export const ICON_SETS: IconSetInfo[] = [
  { key: 'primeicons', label: 'PrimeIcons' },
  { key: 'lucide',     label: 'Lucide' },
  { key: 'emoji',      label: 'Emoji' },
  { key: 'mixed',      label: 'Mixed' },
  { key: 'none',       label: 'Tanpa Icon' },
]

/* ============================================================
   PATTERNS — 8 (4 lama + 4 baru)
   ============================================================ */

export interface PatternInfo {
  key: CvPattern
  label: string
}

export const PATTERNS: PatternInfo[] = [
  { key: 'none',     label: 'Polos' },
  { key: 'dots',     label: 'Dots' },
  { key: 'lines',    label: 'Lines' },
  { key: 'mesh',     label: 'Mesh Gradient' },
  { key: 'grid',     label: 'Grid' },
  { key: 'diagonal', label: 'Diagonal' },
  { key: 'wave',     label: 'Wave' },
  { key: 'noise',    label: 'Noise' },
]

/* ============================================================
   SECTION TOGGLES
   ============================================================ */

export interface SectionToggleInfo {
  key: keyof Pick<
    CvPreferences,
    | 'showBio'
    | 'showPersonalInfo'
    | 'showWorkExperience'
    | 'showEducation'
    | 'showExperiences'
    | 'showProjects'
    | 'showSkills'
    | 'showTechStack'
  >
  label: string
  desc: string
  icon: string
}

export const SECTION_TOGGLES: SectionToggleInfo[] = [
  { key: 'showBio',            label: 'Bio / Tentang',      desc: 'Deskripsi singkat tentang kamu', icon: 'pi pi-user' },
  { key: 'showPersonalInfo',   label: 'Data Pribadi',       desc: 'Agama, marital, lahir, dll',      icon: 'pi pi-id-card' },
  { key: 'showWorkExperience', label: 'Pengalaman Kerja',   desc: 'Riwayat pekerjaan formal',        icon: 'pi pi-briefcase' },
  { key: 'showEducation',      label: 'Pendidikan',         desc: 'Riwayat pendidikan',              icon: 'pi pi-graduation-cap' },
  { key: 'showExperiences',    label: 'Pencapaian',         desc: 'Achievement & milestone',         icon: 'pi pi-star' },
  { key: 'showProjects',       label: 'Proyek',             desc: 'Karya pilihan',                   icon: 'pi pi-folder' },
  { key: 'showSkills',         label: 'Skills',             desc: 'Keahlian',                        icon: 'pi pi-chart-bar' },
  { key: 'showTechStack',      label: 'Tech Stack',         desc: 'Tools & software',                icon: 'pi pi-code' },
]

/* ============================================================
   TEMPLATES
   ============================================================ */

export interface TemplateInfo {
  id: CvTemplate
  label: string
  desc: string
  accentHint: string
}

export const TEMPLATES: TemplateInfo[] = [
  { id: 'modern',       label: 'Modern',       desc: 'Sidebar berwarna, bold, cocok tech/startup', accentHint: 'Vibrant' },
  { id: 'classic',      label: 'Classic',      desc: 'Formal, serif, ATS-friendly, cocok korporat', accentHint: 'Formal' },
  { id: 'minimal',      label: 'Minimal',      desc: 'Clean, banyak whitespace, cocok creative', accentHint: 'Clean' },
  { id: 'elegant',      label: 'Elegant',      desc: 'Serif mewah, aksen emas, cocok executive', accentHint: 'Luxury' },
  { id: 'creative',     label: 'Creative',     desc: 'Warna bold, geometri, cocok designer', accentHint: 'Bold' },
  { id: 'executive',    label: 'Executive',    desc: 'Dua kolom rapi, formal, cocok manager', accentHint: 'Corporate' },
  { id: 'tech',         label: 'Tech',         desc: 'Dark mode, code-style, cocok developer', accentHint: 'Dark' },
  { id: 'academic',     label: 'Academic',     desc: 'Formal, banyak section, cocok dosen', accentHint: 'Scholarly' },
  { id: 'compact',      label: 'Compact',      desc: 'Padat, 1 halaman, cocok fresh graduate', accentHint: 'Compact' },
  { id: 'sidebar-dark', label: 'Sidebar Dark', desc: 'Sidebar gelap + accent, modern tech', accentHint: 'Contrast' },
  { id: 'magazine',     label: 'Magazine',     desc: 'Layout majalah, kolom kiri-kanan', accentHint: 'Editorial' },
  { id: 'infographic',  label: 'Infographic',  desc: 'Visual, banyak icon & chart', accentHint: 'Visual' },
]

/* ============================================================
   EMPLOYMENT TYPES
   ============================================================ */

export const EMPLOYMENT_TYPES: Array<{ value: EmploymentType; label: string }> = [
  { value: 'FULL_TIME',  label: 'Full-Time' },
  { value: 'PART_TIME',  label: 'Part-Time' },
  { value: 'CONTRACT',   label: 'Contract' },
  { value: 'FREELANCE',  label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
]

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

export function isValidHex(hex: string | undefined | null): boolean {
  if (!hex) return false
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}

export function getPalette(key: string): PaletteInfo | undefined {
  return PALETTES.find((p) => p.key === key)
}

export function getFontPair(key: string): FontPairInfo | undefined {
  return FONT_PAIRS.find((f) => f.key === key)
}

export function getLayout(key: CvLayout): LayoutInfo | undefined {
  return LAYOUTS.find((l) => l.key === key)
}

export function getTemplate(id: CvTemplate): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === id)
}

export function getEmploymentTypeLabel(
  type: EmploymentType | string | null | undefined
): string {
  if (!type) return ''
  return EMPLOYMENT_TYPES.find((t) => t.value === type)?.label ?? type
}

/**
 * Get default color dari palette atau fallback.
 * Prioritas: custom accentColor > palette color > default #3b82f6
 */
export function getDefaultColor(
  paletteKey: string | null | undefined,
  customColor?: string | null
): string {
  if (customColor && isValidHex(customColor)) return customColor
  if (paletteKey) {
    const palette = getPalette(paletteKey)
    if (palette) return palette.color
  }
  return '#3b82f6'
}

/**
 * Get default dark color dari palette.
 */
export function getDefaultColorDark(
  paletteKey: string | null | undefined,
  customColor?: string | null
): string {
  if (paletteKey) {
    const palette = getPalette(paletteKey)
    if (palette && palette.color === customColor) return palette.colorDark
    if (palette && !customColor) return palette.colorDark
  }
  return '#1e40af'
}

/**
 * Get warna text yang cocok di atas palette color.
 */
export function getOnColor(
  paletteKey: string | null | undefined,
  customColor?: string | null
): string {
  if (customColor && isValidHex(customColor)) {
    // Hitung luminance manual
    return isLightColor(customColor) ? '#0f172a' : '#ffffff'
  }
  if (paletteKey) {
    const palette = getPalette(paletteKey)
    if (palette?.onColor) return palette.onColor
    if (palette) return isLightColor(palette.color) ? '#0f172a' : '#ffffff'
  }
  return '#ffffff'
}

/**
 * Cek apakah warna terang (untuk tentukan text color).
 */
export function isLightColor(hex: string): boolean {
  if (!isValidHex(hex)) return false
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

export function mergePreferences(
  partial: Partial<CvPreferences> | null | undefined
): CvPreferences {
  return {
    ...DEFAULT_CV_PREFERENCES,
    ...(partial || {}),
  }
}

export function serializePreferences(
  prefs: CvPreferences
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  Object.entries(prefs).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      result[key] = value
    }
  })
  return result
}

export function hasChanges(a: CvPreferences, b: CvPreferences): boolean {
  const keys: Array<keyof CvPreferences> = [
    'template', 'layout', 'theme', 'density',
    'palette', 'accentColor', 'fontPair', 'fontHeading', 'fontBody',
    'iconSet', 'cardStyle', 'badgeStyle', 'backgroundPattern',
    'showBio', 'showPersonalInfo', 'showWorkExperience', 'showEducation',
    'showExperiences', 'showProjects', 'showSkills', 'showTechStack',
  ]
  return keys.some((k) => a[k] !== b[k])
}

export function getActiveSectionCount(prefs: CvPreferences): number {
  return SECTION_TOGGLES.filter((s) => prefs[s.key]).length
}

export function getPreferenceSummary(prefs: CvPreferences): string {
  const t = getTemplate(prefs.template)?.label ?? prefs.template
  const l = getLayout(prefs.layout)?.label ?? prefs.layout
  const p = getPalette(prefs.palette)?.label ?? prefs.palette
  return `${t} · ${l} · ${p}`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

export function formatFullDate(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}