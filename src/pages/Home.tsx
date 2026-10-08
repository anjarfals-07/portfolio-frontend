// src/pages/Home.tsx
import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import ProjectCard from '@/components/ProjectCard'
import BlogCard from '@/components/BlogCard'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import StructuredData from '@/components/StructuredData'
import { LogoRenderer } from '@/components/LogoRenderer'
import { projectService } from '@/services/projectService'
import { blogService } from '@/services/blogService'
import { profileService } from '@/services/profileService'
import { skillService } from '@/services/skillService'
import { themeService } from '@/services/themeService'
import { useUserThemeContext } from '@/context/UserThemeContext'
import type { Project } from '@/types/project'
import type { BlogPost } from '@/types/blog'
import type { Profile } from '@/types/profile'
import type { Skill, SkillGrouped } from '@/types/skill'
import type { Theme, ResolvedTheme } from '@/types/theme'

function Home() {
  const { username } = useParams<{ username: string }>()

  // ⭐ Ambil tenant context — notFound + loading
  const { notFound: tenantNotFound, loading: tenantLoading } =
    useUserThemeContext()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [featured, setFeatured] = useState<Project[]>([])
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([])
  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===== Helper: generate path user =====
  const userPath = (path: string = '') => {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `/${username}${clean}`
  }

  // ===== Fetch data by username =====
  useEffect(() => {
    // ⭐ Guard 1: Tunggu tenant selesai loading
    if (tenantLoading) return

    // ⭐ Guard 2: username kosong
    if (!username) {
      setLoading(false)
      return
    }

    // ⭐ Guard 3: tenant notFound → skip fetch
    if (tenantNotFound) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [profileData, projects, posts, themeData] = await Promise.all([
          profileService.getPublicProfile(username).catch(() => null),
          projectService.getPublicFeatured(username).catch(() => []),
          blogService.getPublishedByUser(username).catch(() => []),
          themeService.getPublicTheme(username).catch(() => null),
        ])

        if (!profileData) {
          setError('Profile belum di-setup. Hubungi admin untuk bantuan.')
          setLoading(false)
          return
        }

        setProfile(profileData)
        setFeatured(projects)
        setLatestPosts(posts.slice(0, 3))
        setTheme(themeData)
      } catch (err) {
        console.error('Failed to load portfolio:', err)
        setError('Gagal memuat data portfolio.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [username, tenantNotFound, tenantLoading])

  // ============================================================
  // LOADING STATE
  // ============================================================
  if (loading) {
    return (
      <div className="home-wrapper">
        <section id="home" className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <Skeleton height="2rem" width="150px" className="mb-3" />
              <Skeleton height="3rem" className="mb-3" />
              <Skeleton height="1.5rem" width="60%" className="mb-3" />
              <Skeleton height="1rem" className="mb-2" />
              <Skeleton height="1rem" width="80%" className="mb-4" />
              <div className="flex gap-3">
                <Skeleton height="3rem" width="150px" />
                <Skeleton height="3rem" width="150px" />
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error) {
    return (
      <div className="home-wrapper">
        <div className="section-container" style={{ paddingTop: '4rem' }}>
          <Message severity="error" text={error} className="w-full" />
        </div>
      </div>
    )
  }

  // ============================================================
  // NOT FOUND
  // ============================================================
  if (!profile) {
    return (
      <div className="home-wrapper">
        <div
          className="section-container"
          style={{ paddingTop: '4rem', textAlign: 'center' }}
        >
          <i className="pi pi-user text-6xl text-color-secondary"></i>
          <h2 className="mt-3">Portfolio tidak ditemukan</h2>
          <p className="text-color-secondary">
            User dengan username "{username}" tidak ada.
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // EXTRACT DATA
  // ============================================================
  const displayName = profile.fullName || username || 'User'
  const role = profile.role || 'Creative Professional'
  const shortBio =
    profile.shortBio || profile.bio || 'Selamat datang di portfolio saya.'
  const avatarUrl = profile.avatarUrl
  const availableForWork = profile.availableForWork

  // ===== Resolved theme (dengan fallback default) =====
  const resolvedTheme: ResolvedTheme = {
    primaryColor: theme?.primaryColor || '#3b82f6',
    accentColor: theme?.accentColor || '#8b5cf6',
    bgColor: theme?.bgColor || '#ffffff',
    textColor: theme?.textColor || '#1e293b',
    borderRadius: theme?.borderRadius || '12px',
    logoIcon: theme?.logoIcon || 'text:A',
    layout: theme?.layout || 'GRID',
    defaultMode: theme?.defaultMode || 'LIGHT',
  }

  const logoGradient: [string, string] = [
    resolvedTheme.primaryColor,
    resolvedTheme.accentColor,
  ]

  const sameAs =
    profile.socials?.filter((s) => s.url).map((s) => s.url) || []

  const avatarAbsoluteUrl = avatarUrl
    ? avatarUrl.startsWith('http')
      ? avatarUrl
      : `https://portfolio-kamu.vercel.app${avatarUrl}`
    : undefined

  return (
    <div className="home-wrapper">
      {/* SEO + STRUCTURED DATA */}
      <SEO
        title={`${displayName} — Portfolio`}
        description={shortBio}
        url={userPath('')}
        keywords={['portfolio', displayName, role, 'developer', 'creative']}
      />

      <StructuredData
        type="Person"
        name={displayName}
        url={userPath('')}
        jobTitle={role}
        description={shortBio}
        image={avatarAbsoluteUrl}
        sameAs={sameAs}
      />

      {/* ⭐ HERO — id="home" */}
      <section id="home" className="hero-section">
        <div className="hero-bg-blob hero-bg-blob-1" />
        <div className="hero-bg-blob hero-bg-blob-2" />
        <div className="hero-bg-blob hero-bg-blob-3" />
        <div className="hero-grid-pattern" />

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge-row">
              <div className="hero-logo-badge">
                <LogoRenderer
                  value={resolvedTheme.logoIcon}
                  size={36}
                  gradient={logoGradient}
                />
              </div>

              {availableForWork && (
                <span className="hero-badge">
                  <span className="hero-badge-dot" />
                  Available for work
                </span>
              )}
            </div>

            <h1 className="hero-title">
              Hi, saya{' '}
              <span className="hero-title-gradient">{displayName}</span>{' '}
              <span className="hero-title-wave">👋</span>
            </h1>

            <h2 className="hero-subtitle">
              <span className="hero-subtitle-prefix">—</span> {role}
            </h2>

            <p className="hero-desc">{shortBio}</p>

            <div className="hero-actions">
              <Link to={userPath('/projects')}>
                <Button
                  label="Lihat Works"
                  icon="pi pi-briefcase"
                  size="large"
                  className="hero-btn-primary"
                />
              </Link>
              <Link to={userPath('/contact')}>
                <Button
                  label="Hubungi Saya"
                  icon="pi pi-envelope"
                  severity="secondary"
                  outlined
                  size="large"
                  className="hero-btn-secondary"
                />
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">3+</span>
                <span className="hero-stat-label">Tahun Pengalaman</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">{featured.length}+</span>
                <span className="hero-stat-label">Projects</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-value">{latestPosts.length}+</span>
                <span className="hero-stat-label">Articles</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-avatar-wrapper">
              <div className="hero-avatar-ring" />
              <div className="hero-avatar-ring hero-avatar-ring-2" />
              <div className="hero-avatar">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                    }}
                  />
                ) : (
                  <div className="hero-avatar-logo">
                    <LogoRenderer
                      value={resolvedTheme.logoIcon}
                      size={200}
                      gradient={logoGradient}
                    />
                  </div>
                )}
              </div>
              <div className="hero-avatar-badge">
                <i className="pi pi-sparkles"></i>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card-1">
              <div className="hero-floating-card-icon">
                <i className="pi pi-code"></i>
              </div>
              <div>
                <strong>Clean Code</strong>
                <small>Best practice</small>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card-2">
              <div className="hero-floating-card-icon hero-floating-card-icon-yellow">
                <i className="pi pi-bolt"></i>
              </div>
              <div>
                <strong>Fast</strong>
                <small>Performance</small>
              </div>
            </div>

            <div className="hero-floating-card hero-floating-card-3">
              <div className="hero-floating-card-icon hero-floating-card-icon-green">
                <i className="pi pi-verified"></i>
              </div>
              <div>
                <strong>Reliable</strong>
                <small>On time</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ SKILLS — id="skills" */}
      {username && <SkillsSection username={username} />}

      <Divider className="section-divider" />

      {/* ⭐ HIGHLIGHTED WORKS — id="projects" */}
      <section id="projects" className="section">
        <div className="section-container">
          <AnimatedSection variant="fade-up">
            <div className="section-header-flex">
              <div>
                <span className="section-eyebrow">Portfolio</span>
                <h2 className="section-title">
                  Highlighted{' '}
                  <span className="section-title-gradient">Works</span>
                </h2>
                <p className="section-subtitle">
                  Karya pilihan yang saya banggakan
                </p>
              </div>
              <Link to={userPath('/projects')}>
                <Button
                  label="Lihat Semua"
                  icon="pi pi-arrow-right"
                  iconPos="right"
                  text
                  className="section-view-all"
                />
              </Link>
            </div>
          </AnimatedSection>

          {featured.length === 0 ? (
            <Message
              severity="info"
              text="Belum ada karya unggulan."
              className="w-full"
            />
          ) : (
            <div className="grid">
              {featured.map((project, idx) => (
                <AnimatedSection
                  key={project.id}
                  variant="fade-up"
                  delay={idx * 100}
                  className="col-12 md:col-6 lg:col-4"
                >
                  <ProjectCard project={project} username={username!} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ⭐ LATEST ARTICLES — id="blog" */}
      {latestPosts.length > 0 && (
        <>
          <Divider className="section-divider" />
          <section id="blog" className="section">
            <div className="section-container">
              <AnimatedSection variant="fade-up">
                <div className="section-header-flex">
                  <div>
                    <span className="section-eyebrow">Blog</span>
                    <h2 className="section-title">
                      Latest{' '}
                      <span className="section-title-gradient">Articles</span>
                    </h2>
                    <p className="section-subtitle">
                      Tulisan & tutorial terbaru
                    </p>
                  </div>
                  <Link to={userPath('/blog')}>
                    <Button
                      label="Lihat Semua"
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      text
                      className="section-view-all"
                    />
                  </Link>
                </div>
              </AnimatedSection>

              <div className="grid">
                {latestPosts.map((post, idx) => (
                  <AnimatedSection
                    key={post.id}
                    variant="fade-up"
                    delay={idx * 100}
                    className="col-12 md:col-6 lg:col-4"
                  >
                    <BlogCard post={post} username={username!} />
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* ⭐ CTA — id="contact" */}
      <section id="contact" className="cta-section">
        <div className="section-container">
          <AnimatedSection variant="zoom-in">
            <div className="cta-card">
              <div className="cta-bg-grid" />
              <div className="cta-orb cta-orb-1" />
              <div className="cta-orb cta-orb-2" />

              <div className="cta-content">
                <span className="cta-badge">
                  <i className="pi pi-sparkles"></i>
                  Let's Work Together
                </span>
                <h2 className="cta-title">
                  Punya project atau mau{' '}
                  <span className="cta-title-gradient">kolaborasi?</span>
                </h2>
                <p className="cta-desc">
                  Saya terbuka untuk freelance, full-time, atau sekadar ngobrol
                  soal karya.
                </p>

                <div className="cta-actions">
                  <Link
                    to={userPath('/contact')}
                    className="cta-btn cta-btn-primary"
                  >
                    <span className="cta-btn-icon">
                      <i className="pi pi-send"></i>
                    </span>
                    <span className="cta-btn-content">
                      <span className="cta-btn-label">Kirim Pesan</span>
                      <span className="cta-btn-sub">Balas dalam 24 jam</span>
                    </span>
                    <i className="pi pi-arrow-right cta-btn-arrow"></i>
                  </Link>

                  <Link
                    to={userPath('/blog')}
                    className="cta-btn cta-btn-secondary"
                  >
                    <span className="cta-btn-icon">
                      <i className="pi pi-book"></i>
                    </span>
                    <span className="cta-btn-content">
                      <span className="cta-btn-label">Baca Blog</span>
                      <span className="cta-btn-sub">Tulisan terbaru</span>
                    </span>
                    <i className="pi pi-arrow-right cta-btn-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default Home

/* ============================================================
   SKILLS SECTION
   ============================================================ */

interface SkillsSectionProps {
  username: string
}

function SkillsSection({ username }: SkillsSectionProps) {
  const [skills, setSkills] = useState<SkillGrouped>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchSkills = async () => {
      try {
        setLoading(true)
        const data = await skillService.getPublicGrouped(username)
        if (!cancelled) setSkills(data)
      } catch (err) {
        console.error('Failed to load skills:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSkills()
    return () => {
      cancelled = true
    }
  }, [username])

  const categories = Object.values(skills)

  if (loading) {
    return (
      <section id="skills" className="section">
        <div className="section-container">
          <Skeleton height="2rem" width="200px" className="mb-3" />
          <Skeleton height="1rem" width="300px" className="mb-4" />
          <div className="skills-grid">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height="80px" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) return null

  return (
    <section id="skills" className="section">
      <div className="section-container">
        <AnimatedSection variant="fade-up">
          <div className="section-header">
            <span className="section-eyebrow">What I Do</span>
            <h2 className="section-title">
              Skills & <span className="section-title-gradient">Tools</span>
            </h2>
            <p className="section-subtitle">
              Keahlian & tools yang saya pakai sehari-hari
            </p>
          </div>
        </AnimatedSection>

        {categories.map((cat, catIdx) => (
          <div key={cat.category} className="mb-4">
            <h3 className="skill-category-title">
              {cat.categoryIcon && <i className={cat.categoryIcon}></i>}{' '}
              {cat.category}
            </h3>

            <div className="skills-grid">
              {cat.items.map((skill: Skill, idx: number) => (
                <AnimatedSection
                  key={skill.id}
                  variant="fade-up"
                  delay={catIdx * 100 + idx * 50}
                >
                  <div
                    className="skill-item"
                    style={
                      {
                        '--skill-color': 'var(--accent)',
                      } as CSSProperties
                    }
                  >
                    <div className="skill-item-content">
                      <span className="skill-item-label">{skill.name}</span>
                      <div className="skill-item-bar">
                        <div
                          className="skill-item-bar-fill"
                          style={
                            {
                              width: `${skill.level}%`,
                            } as CSSProperties
                          }
                        />
                      </div>
                    </div>
                    <span className="skill-item-level">{skill.level}%</span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}