import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import ProjectCard from '@/components/ProjectCard'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/project'

const SKILLS = [
  { label: 'Java', icon: 'pi pi-server' },
  { label: 'Spring Boot', icon: 'pi pi-bolt' },
  { label: 'PostgreSQL', icon: 'pi pi-database' },
  { label: 'React', icon: 'pi pi-code' },
  { label: 'TypeScript', icon: 'pi pi-file-edit' },
  { label: 'PrimeReact', icon: 'pi pi-palette' },
]

function Home() {
  const [featured, setFeatured] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true)
        const data = await projectService.getFeatured()
        setFeatured(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Gagal memuat project unggulan.')
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  return (
    <div className="home-wrapper">
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <span className="hero-badge">
              <i className="pi pi-circle-fill text-green-500 text-xs mr-1"></i>
              Available for work
            </span>

            <h1 className="hero-title">
              Hi, saya <span className="text-primary">Anjar</span> 👋
            </h1>

            <h2 className="hero-subtitle">
              Full-Stack Developer
            </h2>

            <p className="hero-desc">
              Saya membangun aplikasi web end-to-end dengan <strong>Java Spring Boot</strong> di backend
              dan <strong>React + TypeScript</strong> di frontend. Fokus pada kode yang bersih,
              performa, dan pengalaman pengguna yang baik.
            </p>

            <div className="hero-actions">
              <Link to="/projects">
                <Button
                  label="Lihat Projects"
                  icon="pi pi-briefcase"
                  size="large"
                />
              </Link>
              <Link to="/contact">
                <Button
                  label="Hubungi Saya"
                  icon="pi pi-envelope"
                  severity="secondary"
                  outlined
                  size="large"
                />
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-avatar">
              <i className="pi pi-user text-8xl text-primary"></i>
            </div>
            <div className="hero-decoration hero-decoration-1"></div>
            <div className="hero-decoration hero-decoration-2"></div>
          </div>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Tech Stack</h2>
            <p className="section-subtitle">
              Tools yang saya pakai sehari-hari
            </p>
          </div>

          <div className="skills-grid">
            {SKILLS.map((skill) => (
              <div key={skill.label} className="skill-item">
                <i className={`${skill.icon} text-2xl text-primary`}></i>
                <span>{skill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ===== FEATURED PROJECTS ===== */}
      <section className="section">
        <div className="section-container">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">Featured Projects</h2>
              <p className="section-subtitle">
                Project pilihan yang saya banggakan
              </p>
            </div>
            <Link to="/projects">
              <Button
                label="Lihat Semua"
                icon="pi pi-arrow-right"
                iconPos="right"
                text
              />
            </Link>
          </div>

          {loading && (
            <div className="grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="col-12 md:col-6 lg:col-4">
                  <div className="skeleton-card">
                    <Skeleton height="180px" />
                    <Skeleton height="2rem" className="mt-3" />
                    <Skeleton height="1rem" className="mt-2" />
                    <Skeleton height="1rem" width="60%" className="mt-2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <Message severity="error" text={error} className="w-full" />
          )}

          {!loading && !error && featured.length === 0 && (
            <Message
              severity="info"
              text="Belum ada project featured. Tambahkan lewat admin panel nanti."
              className="w-full"
            />
          )}

          {!loading && !error && featured.length > 0 && (
            <div className="grid">
              {featured.map((project) => (
                <div key={project.id} className="col-12 md:col-6 lg:col-4">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card">
            <h2 className="cta-title">Punya project atau mau kolaborasi?</h2>
            <p className="cta-desc">
              Saya terbuka untuk freelance, full-time, atau sekadar ngobrol soal tech.
            </p>
            <div className="flex gap-2 justify-content-center flex-wrap">
              <Link to="/contact">
                <Button
                  label="Kirim Pesan"
                  icon="pi pi-send"
                  size="large"
                />
              </Link>
              <a
                href="https://github.com/anjarfals-07"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  label="GitHub Saya"
                  icon="pi pi-github"
                  severity="secondary"
                  outlined
                  size="large"
                />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home