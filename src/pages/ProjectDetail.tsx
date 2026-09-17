import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Divider } from 'primereact/divider'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/project'

function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!slug) {
        setError('Slug project tidak valid')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await projectService.getBySlug(slug)
        setProject(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Project tidak ditemukan.')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [slug])

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="page-container">
        <Skeleton width="8rem" height="2rem" className="mb-3" />
        <Skeleton width="70%" height="3rem" className="mb-3" />
        <Skeleton width="40%" height="1.5rem" className="mb-4" />
        <Skeleton height="400px" className="mb-4" />
        <Skeleton width="100%" height="1rem" className="mb-2" />
        <Skeleton width="100%" height="1rem" className="mb-2" />
        <Skeleton width="80%" height="1rem" />
      </div>
    )
  }

  // ===== ERROR =====
  if (error || !project) {
    return (
      <div className="page-container">
        <div className="detail-notfound">
          <i className="pi pi-exclamation-triangle text-6xl text-orange-500"></i>
          <h1 className="mt-4">Project Tidak Ditemukan</h1>
          <p className="text-color-secondary">
            {error || 'Project yang kamu cari nggak ada atau udah dihapus.'}
          </p>
          <div className="flex gap-2 justify-content-center flex-wrap">
            <Link to="/projects">
              <Button label="Lihat Semua Project" icon="pi pi-arrow-left" />
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
    )
  }

  // ===== SUCCESS =====
  return (
    <div className="page-container detail-container">
      {/* ===== BREADCRUMB / BACK ===== */}
      <div className="detail-breadcrumb">
        <Link to="/projects" className="detail-back-link">
          <i className="pi pi-arrow-left"></i>
          <span>Kembali ke Projects</span>
        </Link>
      </div>

      {/* ===== HEADER ===== */}
      <div className="detail-header">
        <div className="detail-header-left">
          {project.featured && (
            <Tag
              value="⭐ Featured"
              severity="warning"
              className="mb-2"
            />
          )}

          <h1 className="detail-title">{project.title}</h1>

          <p className="detail-description">
            {project.description || 'Tanpa deskripsi'}
          </p>

          {/* ===== TECH STACK ===== */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="detail-tech">
              <span className="detail-tech-label">Tech Stack:</span>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <Tag key={tech} value={tech} severity="info" />
                ))}
              </div>
            </div>
          )}

          {/* ===== ACTION BUTTONS ===== */}
          <div className="detail-actions">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  label="Lihat di GitHub"
                  icon="pi pi-github"
                  severity="secondary"
                  outlined
                />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  label="Live Demo"
                  icon="pi pi-external-link"
                />
              </a>
            )}
            {!project.githubUrl && !project.demoUrl && (
              <Message
                severity="info"
                text="Belum ada link GitHub atau Demo untuk project ini."
              />
            )}
          </div>
        </div>

        {/* ===== META INFO ===== */}
        <div className="detail-meta">
          <div className="detail-meta-item">
            <i className="pi pi-calendar"></i>
            <div>
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
              <i className="pi pi-refresh"></i>
              <div>
                <span className="detail-meta-label">Terakhir Update</span>
                <span className="detail-meta-value">
                  {new Date(project.updatedAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          )}

          <div className="detail-meta-item">
            <i className="pi pi-link"></i>
            <div>
              <span className="detail-meta-label">Slug</span>
              <code className="detail-meta-code">{project.slug}</code>
            </div>
          </div>
        </div>
      </div>

      {/* ===== THUMBNAIL ===== */}
      {project.thumbnailUrl ? (
        <div className="detail-thumbnail">
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="detail-thumbnail-placeholder">
          <i className="pi pi-image text-6xl text-color-secondary"></i>
          <span className="text-color-secondary">Tidak ada gambar</span>
        </div>
      )}

      <Divider />

      {/* ===== CONTENT ===== */}
      {project.content ? (
        <div className="detail-content">
          <h2 className="detail-section-title">
            <i className="pi pi-file-edit mr-2"></i>
            Tentang Project
          </h2>
          <div className="detail-content-body">
            {project.content.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </div>
      ) : (
        <Message
          severity="info"
          text="Deskripsi lengkap belum ditambahkan untuk project ini."
          className="w-full"
        />
      )}

      <Divider />

      {/* ===== CTA ===== */}
      <div className="detail-cta">
        <div>
          <h3 className="detail-cta-title">Tertarik dengan project ini?</h3>
          <p className="detail-cta-desc">
            Ada pertanyaan atau mau kolaborasi? Hubungi saya.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link to="/contact">
            <Button label="Hubungi Saya" icon="pi pi-envelope" />
          </Link>
          <Link to="/projects">
            <Button
              label="Project Lain"
              icon="pi pi-briefcase"
              severity="secondary"
              outlined
            />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail