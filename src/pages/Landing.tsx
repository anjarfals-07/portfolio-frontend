import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import StructuredData from '@/components/StructuredData'
import { userService } from '@/services/userService'
import type { UserPublic } from '@/types/user'

function Landing() {
  const [users, setUsers] = useState<UserPublic[]>([])
  const [filtered, setFiltered] = useState<UserPublic[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===== Fetch semua user =====
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await userService.getAllPublic()
        setUsers(data)
        setFiltered(data)
      } catch (err) {
        console.error('Failed to load users:', err)
        setError('Gagal memuat daftar portfolio.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // ===== Filter by search =====
  useEffect(() => {
    const q = search.toLowerCase().trim()
    if (!q) {
      setFiltered(users)
      return
    }
    setFiltered(
      users.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          (u.displayName?.toLowerCase().includes(q) ?? false) ||
          u.portfolioSlug.toLowerCase().includes(q)
      )
    )
  }, [search, users])

  return (
    <div className="landing-wrapper">
      {/* ============================================================ */}
      {/* SEO + STRUCTURED DATA                                        */}
      {/* ============================================================ */}
      <SEO
        title="Explore Portfolios — Directory"
        description="Temukan portfolio kreatif dari berbagai profesional. Explore works, blog, dan skills mereka."
        url="/"
        keywords={['portfolio', 'directory', 'developer', 'creative', 'explore']}
      />

      <StructuredData
        type="WebSite"
        name="Portfolio Directory"
        description="Explore portfolios from creative professionals"
        url="/"
      />

      {/* ============================================================ */}
      {/* HERO                                                         */}
      {/* ============================================================ */}
      <section className="landing-hero">
        <div className="landing-hero-bg">
          <div className="landing-hero-blob landing-hero-blob-1" />
          <div className="landing-hero-blob landing-hero-blob-2" />
          <div className="landing-hero-blob landing-hero-blob-3" />
          <div className="landing-hero-grid" />
        </div>

        <div className="landing-hero-content">
          <AnimatedSection variant="fade-up">
            <span className="landing-hero-badge">
              <i className="pi pi-sparkles"></i>
              Portfolio Directory
            </span>

            <h1 className="landing-hero-title">
              Explore{' '}
              <span className="landing-hero-title-gradient">Portfolios</span>
            </h1>

            <p className="landing-hero-desc">
              Temukan portfolio kreatif dari berbagai profesional. Lihat works,
              blog, dan skills mereka — semua di satu tempat.
            </p>

            <div className="landing-hero-actions">
              <Link to="/register">
                <Button
                  label="Buat Portfolio Kamu"
                  icon="pi pi-plus"
                  size="large"
                  className="landing-btn-primary"
                />
              </Link>
              <a href="#explore">
                <Button
                  label="Jelajahi"
                  icon="pi pi-arrow-down"
                  severity="secondary"
                  outlined
                  size="large"
                  className="landing-btn-secondary"
                />
              </a>
            </div>

            <div className="landing-hero-stats">
              <div className="landing-stat">
                <span className="landing-stat-value">{users.length}</span>
                <span className="landing-stat-label">Portfolios</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ============================================================ */}
      {/* EXPLORE — DIRECTORY                                          */}
      {/* ============================================================ */}
      <section id="explore" className="landing-explore">
        <div className="section-container">
          <AnimatedSection variant="fade-up">
            <div className="landing-explore-header">
              <div>
                <span className="section-eyebrow">Directory</span>
                <h2 className="section-title">
                  Semua{' '}
                  <span className="section-title-gradient">Portfolio</span>
                </h2>
                <p className="section-subtitle">
                  {loading
                    ? 'Memuat...'
                    : `${filtered.length} portfolio ditemukan`}
                </p>
              </div>

              {/* Search */}
              <div className="landing-search">
                <IconField iconPosition="left">
                  <InputIcon className="pi pi-search" />
                  <InputText
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari username atau nama..."
                    className="landing-search-input"
                  />
                </IconField>
              </div>
            </div>
          </AnimatedSection>

          {/* Loading */}
          {loading && (
            <div className="landing-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="landing-card-skeleton">
                  <Skeleton shape="circle" size="4rem" />
                  <Skeleton height="1.5rem" className="mt-3" />
                  <Skeleton height="1rem" width="60%" className="mt-2" />
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <Message severity="error" text={error} className="w-full" />
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="landing-empty">
              <i className="pi pi-search text-6xl text-color-secondary"></i>
              <h3 className="mt-3">Tidak ada portfolio ditemukan</h3>
              <p className="text-color-secondary">
                {search
                  ? `Gak ada hasil untuk "${search}"`
                  : 'Belum ada user yang terdaftar.'}
              </p>
              {search && (
                <Button
                  label="Reset Pencarian"
                  icon="pi pi-times"
                  text
                  onClick={() => setSearch('')}
                  className="mt-2"
                />
              )}
            </div>
          )}

          {/* Grid Users */}
          {!loading && !error && filtered.length > 0 && (
            <div className="landing-grid">
              {filtered.map((user, idx) => (
                <AnimatedSection
                  key={user.id}
                  variant="fade-up"
                  delay={idx * 60}
                >
                  <UserCard user={user} />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* CTA — REGISTER                                               */}
      {/* ============================================================ */}
      <section className="landing-cta">
        <div className="section-container">
          <AnimatedSection variant="zoom-in">
            <div className="landing-cta-card">
              <div className="landing-cta-bg" />
              <div className="landing-cta-content">
                <i className="pi pi-sparkles landing-cta-icon"></i>
                <h2 className="landing-cta-title">
                  Punya portfolio?{' '}
                  <span className="landing-cta-title-gradient">
                    Bagikan di sini!
                  </span>
                </h2>
                <p className="landing-cta-desc">
                  Daftar gratis, dapat subdomain sendiri, dan tunjukkan karyamu
                  ke dunia.
                </p>
                <Link to="/register">
                  <Button
                    label="Daftar Sekarang"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    size="large"
                    className="landing-cta-btn"
                  />
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  )
}

export default Landing

// ============================================================
// USER CARD
// ============================================================
function UserCard({ user }: { user: UserPublic }) {
  const initial = (user.displayName || user.username || 'U')
    .charAt(0)
    .toUpperCase()

  const isSuperAdmin = user.role === 'SUPER_ADMIN'

  return (
    <Link to={`/${user.portfolioSlug}`} className="landing-card">
      <div className="landing-card-avatar">
        {initial}
      </div>

      <div className="landing-card-body">
        <h3 className="landing-card-name">
          {user.displayName || user.username}
        </h3>
        <p className="landing-card-username">@{user.username}</p>

        <div className="landing-card-tags">
          {isSuperAdmin ? (
            <Tag value="Super Admin" severity="warning" icon="pi pi-star-fill" />
          ) : (
            <Tag value="Owner" severity="info" icon="pi pi-user" />
          )}
        </div>
      </div>

      <div className="landing-card-footer">
        <span className="landing-card-link">
          Lihat Portfolio <i className="pi pi-arrow-right"></i>
        </span>
      </div>
    </Link>
  )
}