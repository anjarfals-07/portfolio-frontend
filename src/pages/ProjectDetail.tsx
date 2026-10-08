import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'
import SEO from '@/components/SEO'
import AnimatedSection from '@/components/AnimatedSection'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/project'

function ProjectDetail() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===== Helper: user path =====
  const userPath = (path: string = '') => {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `/${username}${clean}`
  }

  useEffect(() => {
    if (!username || !slug) return

    const fetchProject = async () => {
      try {
        setLoading(true)
        const data = await projectService.getPublicBySlug(username, slug)
        setProject(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Works tidak ditemukan.')
      } finally {
        setLoading(false)
      }
    }
    fetchProject()
  }, [username, slug])

  if (loading) {
    return (
      <>
        <SEO
          title="Memuat..."
          description="Memuat detail works..."
          url={userPath(`/projects/${slug}`)}
        />
        <div className="page-container detail-container">
          <Skeleton width="8rem" height="1.5rem" className="mb-4" />
          <Skeleton width="70%" height="3rem" className="mb-3" />
          <Skeleton width="40%" height="1.25rem" className="mb-5" />
          <Skeleton height="420px" className="mb-5" borderRadius="20px" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="80%" height="1rem" />
        </div>
      </>
    )
  }

  if (error || !project) {
    return (
      <>
        <SEO
          title="Works Tidak Ditemukan"
          description="Works yang kamu cari nggak ada atau udah dihapus."
          url={userPath(`/projects/${slug}`)}
        />
        <div className="page-container detail-container">
          <div className="detail-notfound">
            <div className="detail-notfound-icon-wrapper">
              <i className="pi pi-exclamation-triangle"></i>
            </div>
            <h1>Works Tidak Ditemukan</h1>
            <p className="detail-notfound-desc">
              {error || 'Works yang kamu cari nggak ada atau udah dihapus.'}
            </p>
            <div className="detail-notfound-actions">
              <Link to={userPath('/projects')}>
                <Button
                  label="Lihat Semua Works"
                  icon="pi pi-arrow-left"
                  className="detail-btn-primary"
                />
              </Link>
              <Button
                label="Kembali"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEO
        title={project.title}
        description={
          project.description ||
          `Lihat detail works "${project.title}" — ${project.techStack?.join(', ') || 'portfolio'}`
        }
        image={project.thumbnailUrl || undefined}
        url={userPath(`/projects/${project.slug}`)}
        type="article"
        keywords={project.techStack || []}
        publishedTime={project.createdAt}
        modifiedTime={project.updatedAt}
      />

      <div className="detail-page">
        <div className="detail-hero-section">
          <div className="detail-hero-bg">
            <div className="detail-hero-orb detail-hero-orb-1" />
            <div className="detail-hero-orb detail-hero-orb-2" />
            <div className="detail-hero-grid" />
          </div>

          <AnimatedSection variant="fade-up">
            <div className="page-container detail-hero-inner">
              <nav className="detail-breadcrumb-nav">
                <Link to={userPath('/projects')} className="detail-breadcrumb-link">
                  <i className="pi pi-arrow-left"></i>
                  <span>All Works</span>
                </Link>
                <span className="detail-breadcrumb-divider">/</span>
                <span className="detail-breadcrumb-active">
                  {project.title}
                </span>
              </nav>

              <div className="detail-badges">
                {project.featured && (
                  <span className="detail-badge detail-badge-featured">
                    <i className="pi pi-star-fill"></i>
                    Featured
                  </span>
                )}
                <span className="detail-badge detail-badge-date">
                  <i className="pi pi-calendar"></i>
                  {new Date(project.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="detail-title">{project.title}</h1>

              <p className="detail-description">
                {project.description || 'Tanpa deskripsi'}
              </p>

              {project.techStack && project.techStack.length > 0 && (
                <div className="detail-tech">
                  <span className="detail-tech-label">
                    <i className="pi pi-code"></i>
                    Tech Stack
                  </span>
                  <div className="detail-tech-list">
                    {project.techStack.map((tech) => (
                      <span key={tech} className="detail-tech-pill">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(project.githubUrl || project.demoUrl) && (
                <div className="detail-actions">
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-action-link"
                    >
                      <Button
                        label="Live Demo"
                        icon="pi pi-external-link"
                        className="detail-btn-primary"
                      />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="detail-action-link"
                    >
                      <Button
                        label="Source Code"
                        icon="pi pi-github"
                        severity="secondary"
                        outlined
                      />
                    </a>
                  )}
                </div>
              )}

              {!project.githubUrl && !project.demoUrl && (
                <div className="detail-no-links">
                  <div className="detail-no-links-icon">
                    <i className="pi pi-link"></i>
                  </div>
                  <div>
                    <strong>Link belum tersedia</strong>
                    <span>
                      Works ini belum punya link demo atau repository.{' '}
                      <Link to={userPath('/contact')}>Hubungi saya</Link> untuk
                      info lebih.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>

        <div className="page-container detail-content-area">
          {project.thumbnailUrl ? (
            <AnimatedSection variant="zoom-in">
              <div className="detail-browser-frame">
                <div className="detail-browser-bar">
                  <div className="detail-browser-dots">
                    <span className="detail-browser-dot detail-browser-dot-red" />
                    <span className="detail-browser-dot detail-browser-dot-yellow" />
                    <span className="detail-browser-dot detail-browser-dot-green" />
                  </div>
                  <div className="detail-browser-url">
                    <i className="pi pi-lock"></i>
                    <span>
                      {project.demoUrl
                        ? new URL(project.demoUrl).hostname
                        : project.slug}
                    </span>
                  </div>
                  <div className="detail-browser-actions">
                    <i className="pi pi-ellipsis-h"></i>
                  </div>
                </div>
                <div className="detail-browser-content">
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    loading="lazy"
                  />
                </div>
              </div>
            </AnimatedSection>
          ) : (
            <div className="detail-thumbnail-placeholder">
              <i className="pi pi-image"></i>
              <span>Preview belum tersedia</span>
            </div>
          )}

          <AnimatedSection variant="fade-up" delay={100}>
            <div className="detail-meta-strip">
              <div className="detail-meta-item">
                <div className="detail-meta-icon">
                  <i className="pi pi-calendar"></i>
                </div>
                <div className="detail-meta-body">
                  <span className="detail-meta-label">Dibuat</span>
                  <span className="detail-meta-value">
                    {new Date(project.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {project.updatedAt !== project.createdAt && (
                <div className="detail-meta-item">
                  <div className="detail-meta-icon">
                    <i className="pi pi-refresh"></i>
                  </div>
                  <div className="detail-meta-body">
                    <span className="detail-meta-label">Diperbarui</span>
                    <span className="detail-meta-value">
                      {new Date(project.updatedAt).toLocaleDateString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="detail-meta-item">
                <div className="detail-meta-icon">
                  <i className="pi pi-hashtag"></i>
                </div>
                <div className="detail-meta-body">
                  <span className="detail-meta-label">Slug</span>
                  <span className="detail-meta-value detail-meta-code">
                    {project.slug}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {project.content ? (
            <AnimatedSection variant="fade-up" delay={200}>
              <article className="detail-content">
                <div className="detail-content-header">
                  <span className="section-eyebrow">About</span>
                  <h2 className="detail-section-title">
                    Tentang{' '}
                    <span className="section-title-gradient">Karya</span>
                  </h2>
                </div>
                <div className="detail-content-body">
                  {project.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </article>
            </AnimatedSection>
          ) : (
            <Message
              severity="info"
              text="Deskripsi lengkap belum ditambahkan."
              className="detail-message w-full"
            />
          )}

          <Divider className="detail-divider" />

          <AnimatedSection variant="zoom-in">
            <section className="detail-cta">
              <div className="detail-cta-grid" />
              <div className="detail-cta-orb detail-cta-orb-1" />
              <div className="detail-cta-orb detail-cta-orb-2" />

              <div className="detail-cta-content">
                <span className="detail-cta-badge">
                  <i className="pi pi-sparkles"></i>
                  Let's Collaborate
                </span>
                <h3 className="detail-cta-title">
                  Tertarik dengan{' '}
                  <span className="detail-cta-title-gradient">
                    karya ini?
                  </span>
                </h3>
                <p className="detail-cta-desc">
                  Ada pertanyaan atau mau kolaborasi? Hubungi saya.
                </p>
                <div className="detail-cta-actions">
                  <Link
                    to={userPath('/contact')}
                    className="detail-cta-btn detail-cta-btn-primary"
                  >
                    <span className="detail-cta-btn-icon">
                      <i className="pi pi-envelope"></i>
                    </span>
                    <span className="detail-cta-btn-content">
                      <span className="detail-cta-btn-label">
                        Hubungi Saya
                      </span>
                      <span className="detail-cta-btn-sub">
                        Balas dalam 24 jam
                      </span>
                    </span>
                    <i className="pi pi-arrow-right detail-cta-btn-arrow"></i>
                  </Link>

                  <Link
                    to={userPath('/projects')}
                    className="detail-cta-btn detail-cta-btn-secondary"
                  >
                    <span className="detail-cta-btn-icon">
                      <i className="pi pi-briefcase"></i>
                    </span>
                    <span className="detail-cta-btn-content">
                      <span className="detail-cta-btn-label">Works Lain</span>
                      <span className="detail-cta-btn-sub">
                        Jelajahi portfolio
                      </span>
                    </span>
                    <i className="pi pi-arrow-right detail-cta-btn-arrow"></i>
                  </Link>
                </div>
              </div>
            </section>
          </AnimatedSection>
        </div>
      </div>
    </>
  )
}

export default ProjectDetail