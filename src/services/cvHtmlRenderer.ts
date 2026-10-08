// ============================================================
// cvHtmlRenderer — Render HTML CV di frontend
// ============================================================
// v5 FINAL:
// - HAPUS <base href="about:blank" />
// - Pakai <link> untuk font (bukan @import)
// - Support icon set: primeicons, lucide, emoji, mixed, none
// - Font override PrimeReact sudah di cvCssBuilder
// ============================================================

import { buildCvCss, resolveAccentDark } from './cvCssBuilder'
import { getPalette, getFontPair } from '@/types/cv'
import {
  formatMonthYear,
  formatFullDate,
  getEmploymentTypeLabel,
} from '@/types/cv'
import type { CvPreferences, CvTemplate, CvIconSet } from '@/types/cv'
import type { Profile, SocialLink } from '@/types/profile'
import type { WorkExperience, Education } from '@/types/cv'

import type { Experience } from '@/types/experience'
import type { Project } from '@/types/project'
import type { Skill, SkillGroup, SkillGrouped } from '@/types/skill'
import type { TechStack } from '@/types/techStack'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvRenderData {
  profile: Profile
  workExperiences: WorkExperience[]
  educations: Education[]
  experiences: Experience[]
  projects: Project[]
  skills: SkillGrouped
  techStack: TechStack[]
}

export interface CvRenderOptions {
  template?: CvTemplate
  accentColorOverride?: string
  themeOverride?: 'light' | 'dark'
}

/* ============================================================
   SYSTEM FONTS
   ============================================================ */

const SYSTEM_FONTS = [
  'Georgia',
  'Arial',
  'Helvetica',
  'Times New Roman',
  'system-ui',
  'serif',
  'sans-serif',
  'monospace',
]

function isSystemFont(name: string): boolean {
  return SYSTEM_FONTS.includes(name)
}

/* ============================================================
   ICON MAPPING — 5 icon set
   ============================================================
   Icon names: email, phone, location, user, briefcase, graduation,
   star, folder, chart, code, github, linkedin, globe, link, calendar,
   book, award, tag, sparkles
   ============================================================ */

const ICON_MAP_PRIME: Record<string, string> = {
  email: 'pi pi-envelope',
  phone: 'pi pi-phone',
  location: 'pi pi-map-marker',
  user: 'pi pi-user',
  briefcase: 'pi pi-briefcase',
  graduation: 'pi pi-graduation-cap',
  star: 'pi pi-star',
  folder: 'pi pi-folder',
  chart: 'pi pi-chart-bar',
  code: 'pi pi-code',
  github: 'pi pi-github',
  linkedin: 'pi pi-linkedin',
  globe: 'pi pi-globe',
  link: 'pi pi-link',
  calendar: 'pi pi-calendar',
  book: 'pi pi-book',
  award: 'pi pi-trophy',
  tag: 'pi pi-tag',
  sparkles: 'pi pi-sparkles',
}

const ICON_MAP_LUCIDE: Record<string, string> = {
  email: 'lucide-mail',
  phone: 'lucide-phone',
  location: 'lucide-map-pin',
  user: 'lucide-user',
  briefcase: 'lucide-briefcase',
  graduation: 'lucide-graduation-cap',
  star: 'lucide-star',
  folder: 'lucide-folder',
  chart: 'lucide-bar-chart-3',
  code: 'lucide-code-2',
  github: 'lucide-github',
  linkedin: 'lucide-linkedin',
  globe: 'lucide-globe',
  link: 'lucide-link',
  calendar: 'lucide-calendar',
  book: 'lucide-book-open',
  award: 'lucide-award',
  tag: 'lucide-tag',
  sparkles: 'lucide-sparkles',
}

const ICON_MAP_EMOJI: Record<string, string> = {
  email: '📧',
  phone: '📱',
  location: '📍',
  user: '👤',
  briefcase: '💼',
  graduation: '🎓',
  star: '⭐',
  folder: '📁',
  chart: '📊',
  code: '💻',
  github: '🐙',
  linkedin: '💼',
  globe: '🌐',
  link: '🔗',
  calendar: '📅',
  book: '📖',
  award: '🏆',
  tag: '🏷️',
  sparkles: '✨',
}

/**
 * Get icon HTML berdasarkan nama + icon set.
 * Return `<i>` untuk primeicons/lucide, `<span>` untuk emoji.
 */
function getIconHtml(
  name: keyof typeof ICON_MAP_PRIME,
  prefs: CvPreferences
): string {
  const set: CvIconSet = prefs.iconSet ?? 'primeicons'

  if (set === 'none') return ''

  // Mixed: pakai emoji untuk beberapa, prime untuk lainnya
  if (set === 'mixed') {
    const mixedIcons = ['email', 'phone', 'location', 'star', 'sparkles']
    if (mixedIcons.includes(name)) {
      return `<span class="cv-icon cv-icon-emoji">${ICON_MAP_EMOJI[name] ?? ''}</span>`
    }
    return `<i class="cv-icon ${ICON_MAP_PRIME[name] ?? ''}"></i>`
  }

  if (set === 'emoji') {
    return `<span class="cv-icon cv-icon-emoji">${ICON_MAP_EMOJI[name] ?? ''}</span>`
  }

  if (set === 'lucide') {
    return `<i class="cv-icon ${ICON_MAP_LUCIDE[name] ?? ICON_MAP_PRIME[name] ?? ''}"></i>`
  }

  // Default: primeicons
  return `<i class="cv-icon ${ICON_MAP_PRIME[name] ?? ''}"></i>`
}

/* ============================================================
   MAIN
   ============================================================ */

export function renderCvHtml(
  data: CvRenderData,
  preferences: CvPreferences,
  options: CvRenderOptions = {}
): string {
  const prefs: CvPreferences = {
    ...preferences,
    template: options.template ?? preferences.template,
    theme: options.themeOverride ?? preferences.theme,
  }

  const accentColor =
    options.accentColorOverride ??
    prefs.accentColor ??
    getPalette(prefs.palette)?.color ??
    '#3b82f6'

  const accentDark = resolveAccentDark(accentColor, prefs.palette)

  const css = buildCvCss({
    preferences: prefs,
    accentColor,
    accentColorDark: accentDark,
  })

  const body = renderBody(data, prefs)
  const fontLink = buildFontLink(prefs)
  const iconLink = buildIconLink(prefs)

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(data.profile.fullName ?? 'CV')} — CV</title>
  ${fontLink}
  ${iconLink}
  <style>${css}</style>
</head>
<body>
  ${body}
</body>
</html>`
}

/* ============================================================
   FONT LINK
   ============================================================ */

function buildFontLink(prefs: CvPreferences): string {
  const fontPair = getFontPair(prefs.fontPair)
  const heading = prefs.fontHeading ?? fontPair?.heading ?? 'Inter'
  const body = prefs.fontBody ?? fontPair?.body ?? 'Inter'

  const families = Array.from(new Set([heading, body])).filter(
    (f) => !isSystemFont(f)
  )

  if (families.length === 0) return ''

  const query = families
    .map((f) => {
      const encoded = f.replace(/\s+/g, '+')
      return `family=${encoded}:wght@300;400;500;600;700;800`
    })
    .join('&')

  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?${query}&display=swap" rel="stylesheet" />`
}

/* ============================================================
   ICON LINK — load PrimeIcons / Lucide jika diperlukan
   ============================================================ */

function buildIconLink(prefs: CvPreferences): string {
  const set = prefs.iconSet ?? 'primeicons'

  if (set === 'emoji' || set === 'none') return ''

  if (set === 'lucide') {
    // Lucide via CDN (unpkg)
    return `<link rel="stylesheet" href="https://unpkg.com/lucide-static@latest/font/lucide.css" />`
  }

  if (set === 'mixed') {
    // Mixed butuh primeicons
    return `<link rel="stylesheet" href="https://unpkg.com/primeicons@latest/primeicons.css" />`
  }

  // Default: primeicons
  return `<link rel="stylesheet" href="https://unpkg.com/primeicons@latest/primeicons.css" />`
}

/* ============================================================
   BODY ROUTER
   ============================================================ */

function renderBody(data: CvRenderData, prefs: CvPreferences): string {
  switch (prefs.template) {
    case 'classic':
      return renderClassic(data, prefs)
    case 'minimal':
      return renderMinimal(data, prefs)
    case 'elegant':
      return renderElegant(data, prefs)
    case 'creative':
      return renderCreative(data, prefs)
    case 'executive':
      return renderExecutive(data, prefs)
    case 'tech':
      return renderTech(data, prefs)
    case 'academic':
      return renderAcademic(data, prefs)
    case 'compact':
      return renderCompact(data, prefs)
    case 'sidebar-dark':
      return renderSidebarDark(data, prefs)
    case 'magazine':
      return renderMagazine(data, prefs)
    case 'infographic':
      return renderInfographic(data, prefs)
    case 'modern':
    default:
      return renderModern(data, prefs)
  }
}

/* ============================================================
   MODERN
   ============================================================ */

function renderModern(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout}">
  <aside class="cv-sidebar">
    ${renderAvatar(profile)}
    ${renderContact(profile, prefs)}
    ${prefs.showSkills ? renderSkills(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStack(data.techStack) : ''}
    ${renderSocials(profile.socials, prefs)}
  </aside>
  <main class="cv-main">
    ${renderHeader(profile, prefs)}
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
  </main>
</div>`
}

/* ============================================================
   CLASSIC
   ============================================================ */

function renderClassic(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-classic">
  <header class="cv-header cv-header-center">
    ${renderAvatar(profile)}
    <h1 class="cv-header-name">${escapeHtml(profile.fullName ?? '')}</h1>
    ${profile.role ? `<div class="cv-header-role">${escapeHtml(profile.role)}</div>` : ''}
    ${renderContactInline(profile, prefs)}
  </header>
  <main class="cv-main">
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
    ${prefs.showSkills ? renderSkillsClassic(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStackClassic(data.techStack) : ''}
  </main>
</div>`
}

/* ============================================================
   MINIMAL
   ============================================================ */

function renderMinimal(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-minimal">
  <main class="cv-main">
    <header class="cv-header">
      <h1 class="cv-header-name">${escapeHtml(profile.fullName ?? '')}</h1>
      ${profile.role ? `<div class="cv-header-role">${escapeHtml(profile.role)}</div>` : ''}
      ${renderContactInline(profile, prefs)}
    </header>
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
    ${prefs.showSkills ? renderSkillsMinimal(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStackMinimal(data.techStack) : ''}
  </main>
</div>`
}

/* ============================================================
   ELEGANT
   ============================================================ */

function renderElegant(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-elegant">
  <header class="cv-header cv-header-center cv-elegant-header">
    ${renderAvatar(profile)}
    <h1 class="cv-header-name">${escapeHtml(profile.fullName ?? '')}</h1>
    ${profile.role ? `<div class="cv-header-role">${escapeHtml(profile.role)}</div>` : ''}
    ${renderContactInline(profile, prefs)}
  </header>
  <main class="cv-main">
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
    ${prefs.showSkills ? renderSkillsClassic(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStackClassic(data.techStack) : ''}
  </main>
</div>`
}

/* ============================================================
   CREATIVE
   ============================================================ */

function renderCreative(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-creative">
  <aside class="cv-sidebar cv-creative-sidebar">
    ${renderAvatar(profile)}
    ${renderContact(profile, prefs)}
    ${prefs.showSkills ? renderSkills(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStack(data.techStack) : ''}
    ${renderSocials(profile.socials, prefs)}
  </aside>
  <main class="cv-main cv-creative-main">
    ${renderHeader(profile, prefs)}
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
  </main>
</div>`
}

/* ============================================================
   EXECUTIVE
   ============================================================ */

function renderExecutive(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-executive">
  <header class="cv-exec-header">
    <div class="cv-exec-header-left">
      <h1 class="cv-header-name">${escapeHtml(profile.fullName ?? '')}</h1>
      ${profile.role ? `<div class="cv-header-role">${escapeHtml(profile.role)}</div>` : ''}
    </div>
    <div class="cv-exec-header-right">
      ${renderContactInline(profile, prefs)}
    </div>
  </header>
  <main class="cv-main cv-exec-main">
    <div class="cv-exec-col cv-exec-col-left">
      ${prefs.showBio ? renderBio(profile, prefs) : ''}
      ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
      ${prefs.showSkills ? renderSkillsClassic(data.skills) : ''}
      ${prefs.showTechStack ? renderTechStackClassic(data.techStack) : ''}
    </div>
    <div class="cv-exec-col cv-exec-col-right">
      ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
      ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
      ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
      ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
    </div>
  </main>
</div>`
}

/* ============================================================
   TECH
   ============================================================ */

function renderTech(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-tech">
  <aside class="cv-sidebar cv-tech-sidebar">
    ${renderAvatar(profile)}
    ${renderContact(profile, prefs)}
    ${prefs.showSkills ? renderSkills(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStack(data.techStack) : ''}
    ${renderSocials(profile.socials, prefs)}
  </aside>
  <main class="cv-main cv-tech-main">
    ${renderHeader(profile, prefs)}
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
  </main>
</div>`
}

/* ============================================================
   ACADEMIC
   ============================================================ */

function renderAcademic(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-academic">
  <header class="cv-header cv-header-center cv-academic-header">
    <h1 class="cv-header-name">${escapeHtml(profile.fullName ?? '')}</h1>
    ${profile.role ? `<div class="cv-header-role">${escapeHtml(profile.role)}</div>` : ''}
    ${renderContactInline(profile, prefs)}
  </header>
  <main class="cv-main cv-academic-main">
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
    ${prefs.showSkills ? renderSkillsClassic(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStackClassic(data.techStack) : ''}
  </main>
</div>`
}

/* ============================================================
   COMPACT
   ============================================================ */

function renderCompact(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-compact">
  <aside class="cv-sidebar cv-compact-sidebar">
    ${renderAvatar(profile)}
    ${renderContact(profile, prefs)}
    ${prefs.showSkills ? renderSkills(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStack(data.techStack) : ''}
  </aside>
  <main class="cv-main cv-compact-main">
    ${renderHeader(profile, prefs)}
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
  </main>
</div>`
}

/* ============================================================
   SIDEBAR DARK
   ============================================================ */

function renderSidebarDark(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-sidebar-dark">
  <aside class="cv-sidebar cv-sd-sidebar">
    ${renderAvatar(profile)}
    ${renderContact(profile, prefs)}
    ${prefs.showSkills ? renderSkills(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStack(data.techStack) : ''}
    ${renderSocials(profile.socials, prefs)}
  </aside>
  <main class="cv-main cv-sd-main">
    ${renderHeader(profile, prefs)}
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
  </main>
</div>`
}

/* ============================================================
   MAGAZINE
   ============================================================ */

function renderMagazine(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-magazine">
  <header class="cv-mag-header">
    <h1 class="cv-header-name">${escapeHtml(profile.fullName ?? '')}</h1>
    ${profile.role ? `<div class="cv-header-role">${escapeHtml(profile.role)}</div>` : ''}
    ${renderContactInline(profile, prefs)}
  </header>
  <main class="cv-main cv-mag-main">
    <div class="cv-mag-grid">
      <div class="cv-mag-col-main">
        ${prefs.showBio ? renderBio(profile, prefs) : ''}
        ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
        ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
      </div>
      <div class="cv-mag-col-side">
        ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
        ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
        ${prefs.showSkills ? renderSkillsClassic(data.skills) : ''}
        ${prefs.showTechStack ? renderTechStackClassic(data.techStack) : ''}
        ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
      </div>
    </div>
  </main>
</div>`
}

/* ============================================================
   INFOGRAPHIC
   ============================================================ */

function renderInfographic(data: CvRenderData, prefs: CvPreferences): string {
  const { profile } = data

  return `<div class="cv-root layout-${prefs.layout} cv-template-infographic">
  <aside class="cv-sidebar cv-info-sidebar">
    ${renderAvatar(profile)}
    ${renderContact(profile, prefs)}
    ${prefs.showSkills ? renderSkills(data.skills) : ''}
    ${prefs.showTechStack ? renderTechStack(data.techStack) : ''}
    ${renderSocials(profile.socials, prefs)}
  </aside>
  <main class="cv-main cv-info-main">
    ${renderHeader(profile, prefs)}
    ${prefs.showBio ? renderBio(profile, prefs) : ''}
    ${prefs.showPersonalInfo ? renderPersonalInfo(profile, prefs) : ''}
    ${prefs.showWorkExperience ? renderWorkExperiences(data.workExperiences, prefs) : ''}
    ${prefs.showEducation ? renderEducations(data.educations, prefs) : ''}
    ${prefs.showExperiences ? renderAchievements(data.experiences, prefs) : ''}
    ${prefs.showProjects ? renderProjects(data.projects, prefs) : ''}
  </main>
</div>`
}

/* ============================================================
   SECTION RENDERERS
   ============================================================ */

function renderAvatar(profile: Profile): string {
  if (!profile.avatarUrl) return ''
  return `<img class="cv-avatar" src="${escapeAttr(profile.avatarUrl)}" alt="${escapeAttr(profile.fullName ?? '')}" crossorigin="anonymous" />`
}

function renderHeader(profile: Profile, _prefs: CvPreferences): string {
  return `<header class="cv-header">
  <h1 class="cv-header-name">${escapeHtml(profile.fullName ?? '')}</h1>
  ${profile.role ? `<div class="cv-header-role">${escapeHtml(profile.role)}</div>` : ''}
</header>`
}

function renderBio(profile: Profile, prefs: CvPreferences): string {
  const bio = profile.bio ?? profile.shortBio
  if (!bio) return ''
  const icon = getIconHtml('user', prefs)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">${icon}Tentang</h2>
  <p class="cv-header-bio">${escapeHtml(bio)}</p>
</section>`
}

function renderContact(profile: Profile, prefs: CvPreferences): string {
  const items: string[] = []
  if (profile.email)
    items.push(contactItem(getIconHtml('email', prefs), profile.email))
  if (profile.phone)
    items.push(contactItem(getIconHtml('phone', prefs), profile.phone))
  if (profile.city || profile.location)
    items.push(
      contactItem(
        getIconHtml('location', prefs),
        profile.city ?? profile.location ?? ''
      )
    )

  if (items.length === 0) return ''

  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">Kontak</h2>
  <div class="cv-contact">${items.join('')}</div>
</section>`
}

function renderContactInline(profile: Profile, prefs: CvPreferences): string {
  const parts: string[] = []
  if (profile.email) parts.push(profile.email)
  if (profile.phone) parts.push(profile.phone)
  if (profile.city || profile.location)
    parts.push(profile.city ?? profile.location ?? '')

  if (parts.length === 0) return ''

  // Inline contact pakai icon kecil kalau bukan none
  const sep = prefs.iconSet === 'emoji' ? '  ·  ' : ' · '
  return `<div class="cv-contact-inline cv-text-muted cv-text-sm">${parts.map(escapeHtml).join(sep)}</div>`
}

function contactItem(iconHtml: string, value: string): string {
  return `<div class="cv-contact-item">${iconHtml}<span>${escapeHtml(value)}</span></div>`
}

function renderPersonalInfo(profile: Profile, prefs: CvPreferences): string {
  const rows: string[] = []

  if (profile.birthPlace || profile.birthDate) {
    const birth = [profile.birthPlace, formatFullDate(profile.birthDate)]
      .filter(Boolean)
      .join(', ')
    rows.push(infoItem('Tempat, Tgl Lahir', birth))
  }
  if (profile.gender)
    rows.push(infoItem('Jenis Kelamin', genderLabel(profile.gender)))
  if (profile.religion) rows.push(infoItem('Agama', profile.religion))
  if (profile.maritalStatus)
    rows.push(infoItem('Status', maritalLabel(profile.maritalStatus)))
  if (profile.nationality)
    rows.push(infoItem('Kewarganegaraan', profile.nationality))

  if (rows.length === 0) return ''
  const icon = getIconHtml('user', prefs)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">${icon}Data Pribadi</h2>
  <div class="cv-info-list">${rows.join('')}</div>
</section>`
}

function infoItem(label: string, value: string): string {
  return `<div class="cv-info-item"><span class="cv-info-item-label">${escapeHtml(label)}</span><span class="cv-info-item-value">${escapeHtml(value)}</span></div>`
}

function renderWorkExperiences(
  items: WorkExperience[],
  prefs: CvPreferences
): string {
  if (!items || items.length === 0) return ''
  const sorted = [...items].sort((a, b) => {
    const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (so !== 0) return so
    return (b.startDate ?? '').localeCompare(a.startDate ?? '')
  })
  const icon = getIconHtml('briefcase', prefs)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">${icon}PENGALAMAN KERJA</h2>
  <div class="cv-section-body">${sorted.map(renderWorkItem).join('')}</div>
</section>`
}

function renderWorkItem(item: WorkExperience): string {
  const period = formatPeriod(item.startDate, item.endDate, item.currentlyHere)
  const subtitleParts: string[] = []
  if (item.employmentType)
    subtitleParts.push(getEmploymentTypeLabel(item.employmentType))
  if (item.location) subtitleParts.push(item.location)
  return `<div class="cv-item cv-avoid-break">
  <div class="cv-item-header">
    <div>
      <div class="cv-item-title">${escapeHtml(item.position)}</div>
      <div class="cv-item-subtitle">${escapeHtml(item.company)}${subtitleParts.length ? ` — ${escapeHtml(subtitleParts.join(' · '))}` : ''}</div>
    </div>
    ${period ? `<div class="cv-item-period">${escapeHtml(period)}</div>` : ''}
  </div>
  ${item.description ? `<p class="cv-item-desc">${escapeHtml(item.description)}</p>` : ''}
</div>`
}

function renderEducations(items: Education[], prefs: CvPreferences): string {
  if (!items || items.length === 0) return ''
  const sorted = [...items].sort((a, b) => {
    const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    if (so !== 0) return so
    return (b.startDate ?? '').localeCompare(a.startDate ?? '')
  })
  const icon = getIconHtml('graduation', prefs)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">${icon}Pendidikan</h2>
  <div class="cv-section-body">${sorted.map(renderEducationItem).join('')}</div>
</section>`
}

function renderEducationItem(item: Education): string {
  const period = formatPeriod(item.startDate, item.endDate, false)
  const subtitleParts: string[] = []
  if (item.degree) subtitleParts.push(item.degree)
  if (item.fieldOfStudy) subtitleParts.push(item.fieldOfStudy)
  return `<div class="cv-item cv-avoid-break">
  <div class="cv-item-header">
    <div>
      <div class="cv-item-title">${escapeHtml(item.institution)}</div>
      ${subtitleParts.length ? `<div class="cv-item-subtitle">${escapeHtml(subtitleParts.join(' · '))}</div>` : ''}
    </div>
    ${period ? `<div class="cv-item-period">${escapeHtml(period)}</div>` : ''}
  </div>
  ${item.gpa ? `<p class="cv-item-desc"><strong>GPA:</strong> ${escapeHtml(item.gpa)}</p>` : ''}
  ${item.description ? `<p class="cv-item-desc">${escapeHtml(item.description)}</p>` : ''}
</div>`
}

function renderAchievements(
  items: Experience[],
  prefs: CvPreferences
): string {
  if (!items || items.length === 0) return ''
  const sorted = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  )
  const icon = getIconHtml('star', prefs)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">${icon}Pencapaian</h2>
  <div class="cv-section-body">${sorted.map(renderAchievementItem).join('')}</div>
</section>`
}

function renderAchievementItem(item: Experience): string {
  return `<div class="cv-item cv-avoid-break">
  <div class="cv-item-header">
    <div>
      <div class="cv-item-title">${escapeHtml(item.title)}</div>
      ${item.subtitle ? `<div class="cv-item-subtitle">${escapeHtml(item.subtitle)}</div>` : ''}
    </div>
    ${item.year ? `<div class="cv-item-period">${escapeHtml(item.year)}</div>` : ''}
  </div>
  ${item.description ? `<p class="cv-item-desc">${escapeHtml(item.description)}</p>` : ''}
  ${renderTags(item.tags)}
</div>`
}

function renderProjects(items: Project[], prefs: CvPreferences): string {
  if (!items || items.length === 0) return ''
  const visible = items.filter((p) => p.published !== false)
  if (visible.length === 0) return ''
  const icon = getIconHtml('folder', prefs)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">${icon}Proyek</h2>
  <div class="cv-section-body">${visible.map(renderProjectItem).join('')}</div>
</section>`
}

function renderProjectItem(item: Project): string {
  const links: string[] = []
  if (item.githubUrl)
    links.push(`<a href="${escapeAttr(item.githubUrl)}">GitHub</a>`)
  if (item.demoUrl)
    links.push(`<a href="${escapeAttr(item.demoUrl)}">Demo</a>`)
  return `<div class="cv-item cv-avoid-break">
  <div class="cv-item-header">
    <div>
      <div class="cv-item-title">${escapeHtml(item.title)}</div>
      ${links.length ? `<div class="cv-item-subtitle">${links.join(' · ')}</div>` : ''}
    </div>
  </div>
  ${item.description ? `<p class="cv-item-desc">${escapeHtml(item.description)}</p>` : ''}
  ${renderTags(item.techStack)}
</div>`
}

function renderSkills(skills: SkillGrouped): string {
  if (!skills || Object.keys(skills).length === 0) return ''
  const groups = Object.values(skills)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">Skills</h2>
  <div class="cv-skills-group">${groups.map(renderSkillGroup).join('')}</div>
</section>`
}

function renderSkillGroup(group: SkillGroup): string {
  const sorted = [...group.items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  )
  return `<div class="cv-skills-category-group">
  ${group.category ? `<div class="cv-skills-category">${escapeHtml(group.category)}</div>` : ''}
  <div class="cv-skills-list">${sorted.map(renderSkillRow).join('')}</div>
</div>`
}

function renderSkillRow(skill: Skill): string {
  const level = Math.max(0, Math.min(100, skill.level ?? 0))
  return `<div class="cv-skill-row">
  <div class="cv-skill-head">
    <span>${escapeHtml(skill.name)}</span>
    <span class="cv-text-muted">${level}%</span>
  </div>
  <div class="cv-skill-bar"><div class="cv-skill-bar-fill" style="width: ${level}%"></div></div>
</div>`
}

function renderSkillsClassic(skills: SkillGrouped): string {
  if (!skills || Object.keys(skills).length === 0) return ''
  const groups = Object.values(skills)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">Skills</h2>
  <div class="cv-section-body">
    ${groups
      .map(
        (g) => `<div class="cv-item">
      ${g.category ? `<div class="cv-item-title">${escapeHtml(g.category)}</div>` : ''}
      <div class="cv-chips">${g.items.map((s) => `<span class="cv-chip">${escapeHtml(s.name)}</span>`).join('')}</div>
    </div>`
      )
      .join('')}
  </div>
</section>`
}

function renderSkillsMinimal(skills: SkillGrouped): string {
  if (!skills || Object.keys(skills).length === 0) return ''
  const allSkills = Object.values(skills).flatMap((g) => g.items)
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">Skills</h2>
  <div class="cv-chips">${allSkills.map((s) => `<span class="cv-chip">${escapeHtml(s.name)}</span>`).join('')}</div>
</section>`
}

function renderTechStack(items: TechStack[]): string {
  if (!items || items.length === 0) return ''
  const sorted = [...items].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  )
  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">Tech Stack</h2>
  <div class="cv-chips">${sorted.map((t) => `<span class="cv-chip">${escapeHtml(t.name)}</span>`).join('')}</div>
</section>`
}

function renderTechStackClassic(items: TechStack[]): string {
  return renderTechStack(items)
}

function renderTechStackMinimal(items: TechStack[]): string {
  return renderTechStack(items)
}

function renderSocials(
  socials: SocialLink[] | null,
  prefs: CvPreferences
): string {
  if (!socials || socials.length === 0) return ''

  return `<section class="cv-section cv-avoid-break">
  <h2 class="cv-section-title">Sosial</h2>
  <div class="cv-socials">
    ${socials
      .map(
        (s) => {
          // Kalau icon set = none, sembunyikan icon
          const iconHtml = prefs.iconSet === 'none' ? '' : `<i class="${escapeAttr(s.icon)}"></i>`
          return `<a class="cv-social-item" href="${escapeAttr(s.url)}">
      ${iconHtml}
      <span>${escapeHtml(s.label || s.url)}</span>
    </a>`
        }
      )
      .join('')}
  </div>
</section>`
}

function renderTags(tags: string[] | null | undefined): string {
  if (!tags || tags.length === 0) return ''
  return `<div class="cv-chips" style="margin-top: 4pt;">${tags.map((t) => `<span class="cv-chip">${escapeHtml(t)}</span>`).join('')}</div>`
}

/* ============================================================
   HELPERS
   ============================================================ */

function formatPeriod(
  start: string | null | undefined,
  end: string | null | undefined,
  current: boolean
): string {
  const s = formatMonthYear(start)
  const e = current ? 'Sekarang' : formatMonthYear(end)
  if (!s && !e) return ''
  if (s && !e) return s
  if (!s && e) return e
  return `${s} — ${e}`
}

function genderLabel(g: string): string {
  switch (g) {
    case 'MALE':
      return 'Laki-laki'
    case 'FEMALE':
      return 'Perempuan'
    case 'OTHER':
      return 'Lainnya'
    default:
      return g
  }
}

function maritalLabel(m: string): string {
  switch (m) {
    case 'SINGLE':
      return 'Belum Menikah'
    case 'MARRIED':
      return 'Menikah'
    case 'DIVORCED':
      return 'Cerai'
    case 'WIDOWED':
      return 'Janda / Duda'
    default:
      return m
  }
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttr(str: string | null | undefined): string {
  return escapeHtml(str)
}