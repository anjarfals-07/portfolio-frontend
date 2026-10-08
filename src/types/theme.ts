// src/types/theme.ts

// ============================================================
// THEME TYPES
// ============================================================

export type ThemeLayout = 'GRID' | 'LIST' | 'COMPACT'
export type ThemeMode = 'LIGHT' | 'DARK'

export interface Theme {
  id: number

  // ⭐ OWNER INFO — untuk white-label
  username: string | null
  displayName: string | null

  // Colors
  primaryColor: string | null
  accentColor: string | null
  bgColor: string | null
  textColor: string | null

  // Typography
  fontFamily: string | null
  headingFont: string | null

  // Layout
  borderRadius: string | null
  logoIcon: string | null
  layout: ThemeLayout | null
  defaultMode: ThemeMode | null
  preset: string | null

  // Timestamps
  updatedAt: string
}

export type ThemeFormData = Partial<Omit<Theme, 'id' | 'updatedAt'>>

export interface ThemePreset {
  name: string
  label: string
  description: string
  colors: {
    primaryColor: string
    accentColor: string
    bgColor: string
    textColor: string
  }
}

export interface ColorField {
  key: keyof Pick<
    ThemeFormData,
    'primaryColor' | 'accentColor' | 'bgColor' | 'textColor'
  >
  label: string
  description: string
  defaultColor: string
}

// ============================================================
// RESOLVED THEME
// ============================================================

export interface ResolvedTheme {
  primaryColor: string
  accentColor: string
  bgColor: string
  textColor: string
  borderRadius: string
  logoIcon: string
  layout: ThemeLayout
  defaultMode: ThemeMode
}

// ============================================================
// LOGO — STRUCTURED
// ============================================================

export interface ParsedLogo {
  icon: string | null
  shape: ShapeName | null
  text: string | null
  raw: string
}

export type ShapeName =
  | 'rounded'
  | 'circle'
  | 'hexagon'
  | 'diamond'
  | 'triangle'
  | 'square'
  | 'star'
  | 'shield'
  | 'pentagon'
  | 'octagon'

export interface ShapeOption {
  value: ShapeName
  label: string
}

export const SHAPE_OPTIONS: ShapeOption[] = [
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'square', label: 'Square' },
  { value: 'star', label: 'Star' },
  { value: 'shield', label: 'Shield' },
  { value: 'pentagon', label: 'Pentagon' },
  { value: 'octagon', label: 'Octagon' },
]

export interface PrimeIconOption {
  value: string
  label: string
}

export const PRIMEICON_OPTIONS: PrimeIconOption[] = [
  { value: 'pi pi-code', label: 'Code' },
  { value: 'pi pi-bolt', label: 'Bolt' },
  { value: 'pi pi-database', label: 'Database' },
  { value: 'pi pi-server', label: 'Server' },
  { value: 'pi pi-cloud', label: 'Cloud' },
  { value: 'pi pi-desktop', label: 'Desktop' },
  { value: 'pi pi-microchip', label: 'Chip' },
  { value: 'pi pi-user', label: 'User' },
  { value: 'pi pi-star', label: 'Star' },
  { value: 'pi pi-heart', label: 'Heart' },
  { value: 'pi pi-sparkles', label: 'Sparkles' },
  { value: 'pi pi-crown', label: 'Crown' },
  { value: 'pi pi-briefcase', label: 'Briefcase' },
  { value: 'pi pi-palette', label: 'Palette' },
  { value: 'pi pi-lightbulb', label: 'Lightbulb' },
  { value: 'pi pi-compass', label: 'Compass' },
  { value: 'pi pi-globe', label: 'Globe' },
  { value: 'pi pi-camera', label: 'Camera' },
  { value: 'pi pi-image', label: 'Image' },
  { value: 'pi pi-box', label: 'Box' },
  { value: 'pi pi-shield', label: 'Shield' },
  { value: 'pi pi-key', label: 'Key' },
  { value: 'pi pi-gift', label: 'Gift' },
  { value: 'pi pi-book', label: 'Book' },
]

// ============================================================
// CONSTANTS
// ============================================================

export const COLOR_FIELDS: ColorField[] = [
  {
    key: 'primaryColor',
    label: 'Warna Utama',
    description: 'Buat button, link, aksen',
    defaultColor: '#3b82f6',
  },
  {
    key: 'accentColor',
    label: 'Warna Aksen',
    description: 'Buat gradient, highlight',
    defaultColor: '#8b5cf6',
  },
  {
    key: 'bgColor',
    label: 'Warna Background',
    description: 'Warna latar halaman',
    defaultColor: '#ffffff',
  },
  {
    key: 'textColor',
    label: 'Warna Text',
    description: 'Warna tulisan utama',
    defaultColor: '#1e293b',
  },
]

export const FONT_OPTIONS = [
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Lato', value: "'Lato', sans-serif" },
  { label: 'System', value: 'system-ui, -apple-system, sans-serif' },
]

export const HEADING_FONT_OPTIONS = FONT_OPTIONS

export const BORDER_RADIUS_OPTIONS = [
  { label: 'Kotak', value: '0px' },
  { label: 'Kecil', value: '6px' },
  { label: 'Sedang', value: '12px' },
  { label: 'Besar', value: '16px' },
  { label: 'Ekstra Besar', value: '24px' },
  { label: 'Bulat', value: '9999px' },
]

export const LAYOUT_OPTIONS = [
  { label: 'Grid', value: 'GRID' as ThemeLayout, icon: 'pi pi-th-large' },
  { label: 'List', value: 'LIST' as ThemeLayout, icon: 'pi pi-list' },
  { label: 'Compact', value: 'COMPACT' as ThemeLayout, icon: 'pi pi-table' },
]

export const MODE_OPTIONS = [
  { label: 'Terang', value: 'LIGHT' as ThemeMode, icon: 'pi pi-sun' },
  { label: 'Gelap', value: 'DARK' as ThemeMode, icon: 'pi pi-moon' },
]

export const LOGO_TEXT_MAX_LENGTH = 20

export const LOGO_QUICK_PRESETS = ['A', 'AB', 'Anjar', 'Rizky', 'AZ']

// ============================================================
// LOGO HELPERS
// ============================================================

export function parseLogo(value: string | null | undefined): ParsedLogo {
  const result: ParsedLogo = {
    icon: null,
    shape: null,
    text: null,
    raw: value || '',
  }

  if (!value) {
    result.text = 'A'
    return result
  }

  if (value.startsWith('pi pi-')) {
    result.icon = value
    return result
  }

  if (value.startsWith('letter:')) {
    result.text = value.slice(7).trim() || 'A'
    return result
  }

  if (value.startsWith('shape:') && !value.includes('|')) {
    const name = value.slice(6) as ShapeName
    if (SHAPE_OPTIONS.some((s) => s.value === name)) {
      result.shape = name
    }
    result.text = 'A'
    return result
  }

  if (value.startsWith('prime:') && !value.includes('|')) {
    result.icon = value.slice(6).trim() || null
    return result
  }

  if (value.includes('|')) {
    const parts = value.split('|')
    for (const part of parts) {
      if (part.startsWith('icon:')) {
        result.icon = part.slice(5).trim() || null
      } else if (part.startsWith('prime:')) {
        result.icon = part.slice(6).trim() || null
      } else if (part.startsWith('shape:')) {
        const name = part.slice(6) as ShapeName
        if (SHAPE_OPTIONS.some((s) => s.value === name)) {
          result.shape = name
        }
      } else if (part.startsWith('text:')) {
        result.text = part.slice(5).trim() || null
      }
    }
    if (!result.icon && !result.text && !result.shape) result.text = 'A'
    return result
  }

  result.text = value.trim().slice(0, LOGO_TEXT_MAX_LENGTH) || 'A'
  return result
}

export function buildLogo(opts: {
  icon?: string | null
  shape?: ShapeName | null
  text?: string | null
}): string {
  const parts: string[] = []

  if (opts.icon) parts.push(`icon:${opts.icon}`)
  if (opts.shape) parts.push(`shape:${opts.shape}`)
  if (opts.text)
    parts.push(
      `text:${opts.text.toUpperCase().slice(0, LOGO_TEXT_MAX_LENGTH)}`
    )

  if (parts.length === 0) return 'text:A'
  return parts.join('|')
}

export function sanitizeLogoText(input: string): string {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .slice(0, LOGO_TEXT_MAX_LENGTH)
}

export const isLetterLogo = (v: string | null | undefined): boolean => {
  const p = parseLogo(v)
  return !!p.text && !p.icon && !p.shape
}

export const isShapeLogo = (v: string | null | undefined): boolean => {
  const p = parseLogo(v)
  return !!p.shape
}

export const isPrimeIconLogo = (v: string | null | undefined): boolean => {
  const p = parseLogo(v)
  return !!p.icon && !p.text
}

export function getLetterFromLogo(value: string | null | undefined): string {
  return parseLogo(value).text || ''
}

export function getShapeFromLogo(
  value: string | null | undefined
): ShapeName | null {
  return parseLogo(value).shape
}

export function buildLetterLogo(text: string): string {
  return buildLogo({ text: text || 'A' })
}

export function buildShapeLogo(shape: ShapeName): string {
  return buildLogo({ shape, text: 'A' })
}

// ============================================================
// DEFAULTS
// ============================================================

export const DEFAULT_THEME: ResolvedTheme = {
  primaryColor: '#3b82f6',
  accentColor: '#8b5cf6',
  bgColor: '#ffffff',
  textColor: '#1e293b',
  borderRadius: '12px',
  logoIcon: 'text:A',
  layout: 'GRID',
  defaultMode: 'LIGHT',
}