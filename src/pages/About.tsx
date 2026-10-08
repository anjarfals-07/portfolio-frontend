import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Timeline } from 'primereact/timeline'
import { ProgressBar } from 'primereact/progressbar'
import { Chip } from 'primereact/chip'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'

import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'

import { profileService } from '@/services/profileService'
import { experienceService } from '@/services/experienceService'
import { skillService } from '@/services/skillService'
import { techStackService } from '@/services/techStackService'
import { educationService } from '@/services/educationService'
import { workExperienceService } from '@/services/workExperienceService'

import type { Profile } from '@/types/profile'
import type { Experience } from '@/types/experience'
import type { SkillGrouped } from '@/types/skill'
import type { TechStack } from '@/types/techStack'
import type { Education, WorkExperience } from '@/types/cv'

import { formatMonthYear, getEmploymentTypeLabel } from '@/types/cv'

/* ============================================================
   COMPONENT
   ============================================================ */

function About() {
  const { username } = useParams<{ username: string }>()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [skills, setSkills] = useState<SkillGrouped>({})
  const [techStack, setTechStack] = useState<TechStack[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const userPath = (path: string = '') => {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `/${username}${clean}`
  }

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  useEffect(() => {
    if (!username) return

    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)

        const [
          profileData,
          expData,
          skillData,
          techData,
          eduData,
          workData,
        ] = await Promise.all([
          profileService.getPublicProfile(username),
          experienceService.getPublicList(username).catch(() => []),
          skillService.getPublicGrouped(username).catch(() => ({})),
          techStackService.getPublicList(username).catch(() => []),
          educationService.listPublic(username).catch(() => []),
          workExperienceService.listPublic(username).catch(() => []),
        ])

        setProfile(profileData)
        setExperiences(expData)
        setSkills(skillData)
        setTechStack(techData)
        setEducations(eduData)
        setWorkExperiences(workData)
      } catch (err) {
        console.error('Failed to fetch about data:', err)
        setError('Gagal memuat data.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [username])

  /* ------------------------------------------------------------
     LOADING
     ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="page-container">
        <div className="about-hero-container" style={{ marginBottom: '3rem' }}>
          <Skeleton shape="circle" size="200px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="8rem" height="1.5rem" className="mb-2" />
            <Skeleton width="60%" height="3rem" className="mb-2" />
            <Skeleton width="40%" height="1.5rem" className="mb-3" />
            <Skeleton width="100%" height="1rem" className="mb-2" />
            <Skeleton width="100%" height="1rem" className="mb-2" />
            <Skeleton width="70%" height="1rem" />
          </div>
        </div>
        <Skeleton height="400px" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="page-container">
        <Message
          severity="error"
          text={error || 'Profil belum di-setup.'}
          className="w-full"
        />
      </div>
    )
  }

  /* ------------------------------------------------------------
     TIMELINE HELPERS (untuk Experiences existing)
     ------------------------------------------------------------ */
  const customMarker = (item: Experience) => (
    <span
      className="timeline-marker"
      style={{
        background: `linear-gradient(135deg, ${item.color || '#3b82f6'}, ${item.color || '#8b5cf6'})`,
        boxShadow: `0 8px 20px -6px ${item.color || '#3b82f6'}`,
      }}
    >
      <i className={item.icon || 'pi pi-circle'}></i>
    </span>
  )

  const customContent = (item: Experience) => (
    <div className="timeline-content">
      <div className="timeline-content-header">
        {item.year && (
          <span className="timeline-year">
            <i className="pi pi-calendar"></i>
            {item.year}
          </span>
        )}
        {item.subtitle && (
          <span className="timeline-subtitle">{item.subtitle}</span>
        )}
      </div>
      <h3 className="timeline-title">{item.title}</h3>
      {item.description && (
        <p className="timeline-desc">{item.description}</p>
      )}
      {item.tags && item.tags.length > 0 && (
        <div className="timeline-tags">
          {item.tags.map((tag) => (
            <Tag key={tag} value={tag} severity="info" />
          ))}
        </div>
      )}
    </div>
  )

  /* ------------------------------------------------------------
     STATS
     ------------------------------------------------------------ */
  const skillGroups = Object.values(skills)
  const totalSkills = skillGroups.reduce((acc, g) => acc + g.items.length, 0)

  const totalExperience =
    experiences.length + workExperiences.length

  const yearsOfExperience = (() => {
    // Hitung dari work experience dulu, fallback ke experiences
    const workYears = workExperiences
      .map((w) => parseInt(w.startDate?.substring(0, 4) || '0'))
      .filter((y) => !isNaN(y) && y > 0)

    const expYears = experiences
      .map((e) => parseInt(e.year || '0'))
      .filter((y) => !isNaN(y) && y > 0)

    const years = [...workYears, ...expYears]
    if (years.length === 0) return new Date().getFullYear() - 2020
    const minYear = Math.min(...years)
    return new Date().getFullYear() - minYear
  })()

  /* ------------------------------------------------------------
     RENDER
     ------------------------------------------------------------ */
  return (
    <div className="about-wrapper">
      <SEO
        title={`About ${profile.fullName || username}`}
        description={`Kenali ${profile.fullName || username} lebih dekat — profil, pengalaman, skills, dan perjalanan karier.`}
        url={userPath('/about')}
        type="profile"
        keywords={['about', 'profile', profile.fullName || '', 'skills']}
      />

      {/* ===== HERO ===== */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <div className="about-hero-orb about-hero-orb-1" />
          <div className="about-hero-orb about-hero-orb-2" />
          <div className="about-hero-orb about-hero-orb-3" />
          <div className="about-hero-grid" />
        </div>

        <div className="about-hero-inner">
          <div className="about-hero-container">
            <div className="about-avatar-wrapper">
              <div className="about-avatar-ring"></div>
              <div className="about-avatar-ring about-avatar-ring-2"></div>
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="about-avatar-img"
                />
              ) : (
                <div className="about-avatar">
                  <i className="pi pi-user"></i>
                </div>
              )}
              {profile.availableForWork && (
                <div className="about-avatar-badge">
                  <span className="about-avatar-badge-dot"></span>
                </div>
              )}
            </div>

            <div className="about-info">
              <span className="about-eyebrow">
                <i className="pi pi-sparkles"></i>
                About Me
              </span>

              <h1 className="about-name">{profile.fullName}</h1>
              {profile.role && <h2 className="about-role">{profile.role}</h2>}

              {profile.bio && <p className="about-bio">{profile.bio}</p>}

              <div className="about-quick-info">
                {profile.location && (
                  <div className="about-quick-item">
                    <i className="pi pi-map-marker"></i>
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.email && (
                  <div className="about-quick-item">
                    <i className="pi pi-envelope"></i>
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  </div>
                )}
              </div>

              {profile.socials && profile.socials.length > 0 && (
                <div className="about-socials">
                  {profile.socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="about-social-link"
                    >
                      <i className={s.icon}></i>
                    </a>
                  ))}
                </div>
              )}

              <div className="about-actions">
                <Link
                  to={userPath('/contact')}
                  className="about-btn about-btn-primary"
                >
                  <span className="about-btn-icon">
                    <i className="pi pi-envelope"></i>
                  </span>
                  <span className="about-btn-content">
                    <span className="about-btn-label">Hubungi Saya</span>
                    <span className="about-btn-sub">Balas dalam 24 jam</span>
                  </span>
                  <i className="pi pi-arrow-right about-btn-arrow"></i>
                </Link>

                {profile.cvUrl ? (
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="about-btn about-btn-secondary"
                  >
                    <span className="about-btn-icon">
                      <i className="pi pi-download"></i>
                    </span>
                    <span className="about-btn-content">
                      <span className="about-btn-label">Download CV</span>
                      <span className="about-btn-sub">
                        {profile.cvSource === 'GENERATED'
                          ? 'Auto-generated'
                          : 'PDF terbaru'}
                      </span>
                    </span>
                    <i className="pi pi-arrow-right about-btn-arrow"></i>
                  </a>
                ) : (
                  <button
                    type="button"
                    className="about-btn about-btn-secondary"
                    onClick={() =>
                      alert('CV akan tersedia segera. Hubungi via email dulu ya!')
                    }
                  >
                    <span className="about-btn-icon">
                      <i className="pi pi-download"></i>
                    </span>
                    <span className="about-btn-content">
                      <span className="about-btn-label">Download CV</span>
                      <span className="about-btn-sub">Coming soon</span>
                    </span>
                    <i className="pi pi-arrow-right about-btn-arrow"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ===== STATS ===== */}
          <AnimatedSection variant="fade-up" delay={200}>
            <div className="about-stats">
              <div className="about-stat">
                <div className="about-stat-icon about-stat-icon-1">
                  <i className="pi pi-briefcase"></i>
                </div>
                <div className="about-stat-info">
                  <span className="about-stat-value">{yearsOfExperience}+</span>
                  <span className="about-stat-label">Tahun Pengalaman</span>
                </div>
              </div>
              <div className="about-stat">
                <div className="about-stat-icon about-stat-icon-2">
                  <i className="pi pi-star"></i>
                </div>
                <div className="about-stat-info">
                  <span className="about-stat-value">{totalSkills}+</span>
                  <span className="about-stat-label">Skills Dikuasai</span>
                </div>
              </div>
              <div className="about-stat">
                <div className="about-stat-icon about-stat-icon-3">
                  <i className="pi pi-code"></i>
                </div>
                <div className="about-stat-info">
                  <span className="about-stat-value">{totalExperience}</span>
                  <span className="about-stat-label">Pengalaman</span>
                </div>
              </div>
              <div className="about-stat">
                <div className="about-stat-icon about-stat-icon-4">
                  <i className="pi pi-th-large"></i>
                </div>
                <div className="about-stat-info">
                  <span className="about-stat-value">{techStack.length}</span>
                  <span className="about-stat-label">Tools & Software</span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ===== ⭐ WORK EXPERIENCE (BARU) ===== */}
      {workExperiences.length > 0 && (
        <section className="about-section about-section-alt">
          <div className="about-section-inner">
            <AnimatedSection variant="fade-up">
              <div className="about-section-header">
                <span className="section-eyebrow">Career</span>
                <h2 className="about-section-title">
                  Pengalaman{' '}
                  <span className="section-title-gradient">Kerja</span>
                </h2>
                <p className="about-section-desc">
                  Riwayat pekerjaan & posisi yang pernah saya jalani
                </p>
              </div>
            </AnimatedSection>

            <div className="about-work-list">
              {workExperiences.map((work, idx) => (
                <AnimatedSection
                  key={work.id}
                  variant="fade-up"
                  delay={idx * 100}
                >
                  <div className="about-work-item">
                    <div className="about-work-header">
                      <div className="about-work-title-wrap">
                        <h3 className="about-work-position">
                          {work.position}
                        </h3>
                        <div className="about-work-company">
                          <i className="pi pi-building"></i>
                          <span>{work.company}</span>
                        </div>
                      </div>

                      <div className="about-work-period">
                        <i className="pi pi-calendar"></i>
                        <span>
                          {formatMonthYear(work.startDate)}
                          {work.startDate ? ' – ' : ''}
                          {work.currentlyHere
                            ? 'Sekarang'
                            : work.endDate
                            ? formatMonthYear(work.endDate)
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="about-work-meta">
                      {work.location && (
                        <span className="about-work-meta-item">
                          <i className="pi pi-map-marker"></i>
                          {work.location}
                        </span>
                      )}
                      {work.employmentType && (
                        <span className="about-work-meta-item">
                          <i className="pi pi-clock"></i>
                          {getEmploymentTypeLabel(work.employmentType)}
                        </span>
                      )}
                      {work.currentlyHere && (
                        <span className="about-work-meta-item is-current">
                          <i className="pi pi-circle-fill"></i>
                          Masih bekerja
                        </span>
                      )}
                    </div>

                    {work.description && (
                      <p className="about-work-desc">{work.description}</p>
                    )}
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== ⭐ EDUCATION (BARU) ===== */}
      {educations.length > 0 && (
        <section className="about-section">
          <div className="about-section-inner">
            <AnimatedSection variant="fade-up">
              <div className="about-section-header">
                <span className="section-eyebrow">Education</span>
                <h2 className="about-section-title">
                  Riwayat{' '}
                  <span className="section-title-gradient">Pendidikan</span>
                </h2>
                <p className="about-section-desc">
                  Latar belakang pendidikan & akademik
                </p>
              </div>
            </AnimatedSection>

            <div className="about-edu-grid">
              {educations.map((edu, idx) => (
                <AnimatedSection
                  key={edu.id}
                  variant="fade-up"
                  delay={idx * 100}
                >
                  <div className="about-edu-card">
                    <div className="about-edu-icon">
                      <i className="pi pi-graduation-cap"></i>
                    </div>

                    <div className="about-edu-body">
                      <h3 className="about-edu-institution">
                        {edu.institution}
                      </h3>

                      {(edu.degree || edu.fieldOfStudy) && (
                        <div className="about-edu-degree">
                          {edu.degree}
                          {edu.degree && edu.fieldOfStudy ? ' · ' : ''}
                          {edu.fieldOfStudy}
                        </div>
                      )}

                      <div className="about-edu-meta">
                        {(edu.startDate || edu.endDate) && (
                          <span className="about-edu-meta-item">
                            <i className="pi pi-calendar"></i>
                            {formatMonthYear(edu.startDate)}
                            {edu.startDate ? ' – ' : ''}
                            {edu.endDate
                              ? formatMonthYear(edu.endDate)
                              : 'Sekarang'}
                          </span>
                        )}
                        {edu.gpa && (
                          <span className="about-edu-meta-item">
                            <i className="pi pi-star"></i>
                            GPA: {edu.gpa}
                          </span>
                        )}
                      </div>

                      {edu.description && (
                        <p className="about-edu-desc">{edu.description}</p>
                      )}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TECH STACK ===== */}
      {techStack.length > 0 && (
        <section className="about-section about-section-alt">
          <div className="about-section-inner">
            <AnimatedSection variant="fade-up">
              <div className="about-section-header">
                <span className="section-eyebrow">Tech Stack</span>
                <h2 className="about-section-title">
                  Tools &{' '}
                  <span className="section-title-gradient">Software</span>
                </h2>
                <p className="about-section-desc">
                  Tools & software yang saya pakai sehari-hari
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection variant="fade-up" delay={100}>
              <div className="about-tech-chips">
                {techStack.map((tech) => (
                  <Chip
                    key={tech.id}
                    label={tech.name}
                    icon={tech.icon || 'pi pi-check'}
                  />
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ===== TIMELINE (Achievement) ===== */}
      {experiences.length > 0 && (
        <section className="about-section">
          <div className="about-section-inner">
            <AnimatedSection variant="fade-up">
              <div className="about-section-header">
                <span className="section-eyebrow">Journey</span>
                <h2 className="about-section-title">
                  Pencapaian &{' '}
                  <span className="section-title-gradient">Milestone</span>
                </h2>
                <p className="about-section-desc">
                  Pencapaian, milestone, dan perjalanan yang saya lalui
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection variant="fade-up" delay={100}>
              <Timeline
                value={experiences}
                marker={customMarker}
                content={customContent}
                className="about-timeline"
              />
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* ===== SKILLS ===== */}
      {skillGroups.length > 0 && (
        <section className="about-section about-section-alt">
          <div className="about-section-inner">
            <AnimatedSection variant="fade-up">
              <div className="about-section-header">
                <span className="section-eyebrow">Expertise</span>
                <h2 className="about-section-title">
                  Keahlian{' '}
                  <span className="section-title-gradient">Saya</span>
                </h2>
                <p className="about-section-desc">
                  Skills yang saya kuasai & terus asah
                </p>
              </div>
            </AnimatedSection>

            <div className="skills-detail-grid">
              {skillGroups.map((group, idx) => (
                <AnimatedSection
                  key={group.category}
                  variant="fade-up"
                  delay={idx * 100}
                >
                  <div className="skill-category-card">
                    <div className="skill-category-header">
                      <div className="skill-category-icon">
                        <i
                          className={group.categoryIcon || 'pi pi-star'}
                        ></i>
                      </div>
                      <div className="skill-category-info">
                        <h3 className="skill-category-title">
                          {group.category}
                        </h3>
                        <span className="skill-category-count">
                          {group.items.length} skills
                        </span>
                      </div>
                    </div>

                    <div className="skill-items">
                      {group.items.map((skill) => (
                        <div key={skill.id} className="skill-bar-item">
                          <div className="skill-bar-header">
                            <span className="skill-bar-name">
                              {skill.name}
                            </span>
                            <span className="skill-bar-level">
                              {skill.level}%
                            </span>
                          </div>
                          <ProgressBar
                            value={skill.level}
                            showValue={false}
                            style={{ height: '8px' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="section-container">
          <AnimatedSection variant="zoom-in">
            <div className="cta-card">
              <div className="cta-bg-grid" />
              <div className="cta-orb cta-orb-1" />
              <div className="cta-orb cta-orb-2" />

              <div className="cta-content">
                <span className="cta-badge">
                  <i className="pi pi-sparkles"></i>
                  Let's Collaborate
                </span>
                <h2 className="cta-title">
                  Mau <span className="cta-title-gradient">kerja sama?</span>
                </h2>
                <p className="cta-desc">
                  Saya terbuka untuk freelance, full-time, atau sekadar
                  ngobrol soal karya.
                </p>
                <div className="cta-actions">
                  <Link to={userPath('/contact')}>
                    <Button
                      label="Kirim Pesan"
                      icon="pi pi-send"
                      size="large"
                    />
                  </Link>
                  <Link to={userPath('/projects')}>
                    <Button
                      label="Lihat Works"
                      icon="pi pi-briefcase"
                      severity="secondary"
                      outlined
                      size="large"
                    />
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

export default About