import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Timeline } from 'primereact/timeline'
import { ProgressBar } from 'primereact/progressbar'
import { Divider } from 'primereact/divider'
import { Chip } from 'primereact/chip'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'
import { profileService } from '@/services/profileService'
import { experienceService } from '@/services/experienceService'
import { skillService } from '@/services/skillService'
import { techStackService } from '@/services/techStackService'
import type { Profile } from '@/types/profile'
import type { Experience } from '@/types/experience'
import type { SkillGrouped } from '@/types/skill'
import type { TechStack } from '@/types/techStack'

function About() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [skills, setSkills] = useState<SkillGrouped>({})
  const [techStack, setTechStack] = useState<TechStack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        setError(null)

        const [profileData, expData, skillData, techData] = await Promise.all([
          profileService.get(),
          experienceService.getAll(),
          skillService.getGrouped(),
          techStackService.getAll(),
        ])

        setProfile(profileData)
        setExperiences(expData)
        setSkills(skillData)
        setTechStack(techData)
      } catch (err) {
        console.error('Failed to fetch about data:', err)
        setError('Gagal memuat data. Pastikan backend jalan.')
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="page-container">
        <div
          className="about-hero-container"
          style={{ marginBottom: '3rem' }}
        >
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
          text={error || 'Profil belum di-setup. Isi via admin panel.'}
          className="w-full"
        />
      </div>
    )
  }

  const customMarker = (item: Experience) => (
    <span
      className="timeline-marker"
      style={{ backgroundColor: item.color || '#3b82f6' }}
    >
      <i className={item.icon || 'pi pi-circle'}></i>
    </span>
  )

  const customContent = (item: Experience) => (
    <div className="timeline-content">
      {item.year && <span className="timeline-year">{item.year}</span>}
      <h3 className="timeline-title">{item.title}</h3>
      {item.subtitle && <p className="timeline-subtitle">{item.subtitle}</p>}
      {item.description && <p className="timeline-desc">{item.description}</p>}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.tags.map((tag) => (
            <Tag key={tag} value={tag} severity="info" />
          ))}
        </div>
      )}
    </div>
  )

  const skillGroups = Object.values(skills)

  return (
    <div className="about-wrapper">
      {/* ===== HERO / PROFIL ===== */}
      <section className="about-hero">
        <div className="about-hero-container">
          <div className="about-avatar-wrapper">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="about-avatar-img"
              />
            ) : (
              <div className="about-avatar">
                <i className="pi pi-user text-8xl text-primary"></i>
              </div>
            )}
          </div>

          <div className="about-info">
            {profile.availableForWork && (
              <span className="about-badge">
                <i className="pi pi-circle-fill text-green-500 text-xs mr-1"></i>
                Available for work
              </span>
            )}

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
              <Link to="/contact">
                <Button label="Hubungi Saya" icon="pi pi-envelope" />
              </Link>
              {profile.cvUrl ? (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    label="Download CV"
                    icon="pi pi-download"
                    severity="secondary"
                    outlined
                  />
                </a>
              ) : (
                <Button
                  label="Download CV"
                  icon="pi pi-download"
                  severity="secondary"
                  outlined
                  onClick={() =>
                    alert('CV akan tersedia segera. Hubungi via email dulu ya!')
                  }
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TECH STACK CHIPS ===== */}
      {techStack.length > 0 && (
        <section className="section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Tools & Software</h2>
              <p className="section-subtitle">
                Tools & software yang saya pakai sehari-hari
              </p>
            </div>

            <div className="about-tech-chips">
              {techStack.map((tech) => (
                <Chip
                  key={tech.id}
                  label={tech.name}
                  icon={tech.icon || 'pi pi-check'}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {experiences.length > 0 && <Divider />}

      {/* ===== TIMELINE / JOURNEY ===== */}
      {experiences.length > 0 && (
        <section className="section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Journey</h2>
              <p className="section-subtitle">
                Perjalanan karier & pengalaman saya
              </p>
            </div>

            <Timeline
              value={experiences}
              marker={customMarker}
              content={customContent}
              className="about-timeline"
            />
          </div>
        </section>
      )}

      {skillGroups.length > 0 && <Divider />}

      {/* ===== SKILLS / EXPERTISE ===== */}
      {skillGroups.length > 0 && (
        <section className="section">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Expertise</h2>
              <p className="section-subtitle">Keahlian yang saya kuasai</p>
            </div>

            <div className="skills-detail-grid">
              {skillGroups.map((group) => (
                <div key={group.category} className="skill-category-card">
                  <div className="skill-category-header">
                    <i
                      className={`${
                        group.categoryIcon || 'pi pi-star'
                      } text-2xl text-primary`}
                    ></i>
                    <h3 className="skill-category-title">{group.category}</h3>
                  </div>

                  <div className="skill-items">
                    {group.items.map((skill) => (
                      <div key={skill.id} className="skill-bar-item">
                        <div className="skill-bar-header">
                          <span className="skill-bar-name">{skill.name}</span>
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
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card">
            <h2 className="cta-title">Mau kerja sama?</h2>
            <p className="cta-desc">
              Saya terbuka untuk freelance, full-time, atau sekadar ngobrol
              soal karya.
            </p>
            <div className="flex gap-2 justify-content-center flex-wrap">
              <Link to="/contact">
                <Button label="Kirim Pesan" icon="pi pi-send" size="large" />
              </Link>
              <Link to="/projects">
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
      </section>
    </div>
  )
}

export default About