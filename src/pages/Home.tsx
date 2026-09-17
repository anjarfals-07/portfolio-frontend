import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { Divider } from 'primereact/divider'
import ProjectCard from '@/components/ProjectCard'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/project'

// ===== GANTI SKILLS SESUAI BIDANG KAMU =====
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
        setError('Gagal memuat karya unggulan.')
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

            <h2 className="hero-subtitle">Creative Professional</h2>

            <p className="hero-desc">
              Saya membuat karya yang bermakna dan berkualitas. Fokus pada
              detail, estetika, dan pengalaman yang berkesan untuk setiap
              project.
            </p>

            <div className="hero-actions">
              <Link to="/projects">
                <Button
                  label="Lihat Works"
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
            <h2 className="section-title">Skills & Tools</h2>
            <p className="section-subtitle">
              Keahlian & tools yang saya pakai sehari-hari
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

      {/* ===== HIGHLIGHTED WORKS ===== */}
      <section className="section">
        <div className="section-container">
          <div className="section-header-flex">
            <div>
              <h2 className="section-title">Highlighted Works</h2>
              <p className="section-subtitle">
                Karya pilihan yang saya banggakan
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
              text="Belum ada karya unggulan. Tambahkan via admin panel."
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
              Saya terbuka untuk freelance, full-time, atau sekadar ngobrol
              soal karya.
            </p>
            <div className="flex gap-2 justify-content-center flex-wrap">
              <Link to="/contact">
                <Button label="Kirim Pesan" icon="pi pi-send" size="large" />
              </Link>
              <a
                href="https://github.com/anjarfals-07"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  label="Portfolio Lain"
                  icon="pi pi-external-link"
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