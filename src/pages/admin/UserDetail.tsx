import { useEffect, useState, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Toast } from 'primereact/toast'
import { userService } from '@/services/userService'
import { projectService } from '@/services/projectService'
import { blogService } from '@/services/blogService'
import type { UserAdmin } from '@/types/user'
import type { Project } from '@/types/project'
import type { BlogPost } from '@/types/blog'

// ============================================================
// AVATAR TONES — deterministik per user
// ============================================================
const AVATAR_TONES = [
  { bg: '#dbeafe', fg: '#1d4ed8' },
  { bg: '#ede9fe', fg: '#6d28d9' },
  { bg: '#fce7f3', fg: '#be185d' },
  { bg: '#d1fae5', fg: '#047857' },
  { bg: '#fef3c7', fg: '#b45309' },
  { bg: '#cffafe', fg: '#0e7490' },
]

function getAvatarTone(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length]
}

// ============================================================
// COMPONENT
// ============================================================
function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const toast = useRef<Toast>(null)

  const [user, setUser] = useState<UserAdmin | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // FETCH
  // ============================================================
  useEffect(() => {
    if (!id) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const userId = Number(id)

        const [userData, projectsData, blogData] = await Promise.all([
          userService.getByIdForAdmin(userId),
          projectService.getByUserIdForAdmin(userId).catch(() => []),
          blogService.getByUserIdForAdmin(userId).catch(() => []),
        ])

        setUser(userData)
        setProjects(projectsData)
        setBlogPosts(blogData)
      } catch (err) {
        console.error(err)
        setError('Gagal memuat detail user.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // ============================================================
  // TOGGLE ACTIVE
  // ============================================================
  const handleToggleActive = async () => {
    if (!user) return
    try {
      const updated = await userService.setActive(user.id, !user.active)
      setUser(updated)
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: updated.active ? 'User diaktifkan' : 'User di-disable',
        life: 2000,
      })
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal update status user',
        life: 3000,
      })
    }
  }

  // ============================================================
  // LOADING SKELETON
  // ============================================================
  if (loading) {
    return (
      <div className="dash">
        <div className="ud-skeleton">
          <div className="ud-skeleton-hero" />
          <div className="ud-skeleton-metrics">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="ud-skeleton-card" />
            ))}
          </div>
          <div className="ud-skeleton-section" />
          <div className="ud-skeleton-section" />
        </div>
      </div>
    )
  }

  // ============================================================
  // ERROR STATE
  // ============================================================
  if (error || !user) {
    return (
      <div className="dash">
        <div className="ud-error">
          <div className="ud-error-icon">
            <i className="pi pi-exclamation-triangle" />
          </div>
          <h2 className="ud-error-title">User tidak ditemukan</h2>
          <p className="ud-error-desc">
            {error || 'Data user tidak tersedia atau sudah dihapus.'}
          </p>
          <Link to="/admin/users" className="dash-hero-btn primary">
            <i className="pi pi-arrow-left" />
            <span>Kembali ke Manage Users</span>
          </Link>
        </div>
      </div>
    )
  }

  // ============================================================
  // EXTRACT DATA
  // ============================================================
  const tone = getAvatarTone(user.username)
  const initial = (user.displayName || user.username).charAt(0).toUpperCase()
  const displayName = user.displayName || user.username
  const joinedDate = new Date(user.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const totalViews = blogPosts.reduce((sum, b) => sum + (b.viewCount || 0), 0)
  const publishedProjects = projects.filter((p) => p.published).length
  const publishedPosts = blogPosts.filter((b) => b.published).length

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dash">
      <Toast ref={toast} />

      {/* ===== HERO ===== */}
      <section className="ud-hero">
        <div className="ud-hero-bg" aria-hidden="true" />

        {/* Back link */}
        <Link to="/admin/users" className="ud-back">
          <i className="pi pi-arrow-left" />
          <span>Manage users</span>
        </Link>

        <div className="ud-hero-inner">
          {/* LEFT: Avatar + info */}
          <div className="ud-hero-left">
            <div
              className="ud-hero-avatar"
              style={{ background: tone.bg, color: tone.fg }}
            >
              {initial}
            </div>

            <div className="ud-hero-meta">
              <h1 className="ud-hero-name">{displayName}</h1>

              <div className="ud-hero-handles">
                <span className="ud-handle">
                  <i className="pi pi-at" />
                  {user.username}
                </span>
                <span className="ud-handle-dot">·</span>
                <span className="ud-handle">
                  <i className="pi pi-link" />
                  {user.portfolioSlug}
                </span>
              </div>

              <div className="ud-hero-tags">
                <span
                  className={`usr-role ${
                    user.role === 'SUPER_ADMIN' ? 'is-admin' : 'is-owner'
                  }`}
                >
                  <i
                    className={
                      user.role === 'SUPER_ADMIN'
                        ? 'pi pi-shield'
                        : 'pi pi-user'
                    }
                  />
                  {user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}
                </span>
                <span
                  className={`usr-status ${
                    user.active ? 'tone-green' : 'tone-red'
                  }`}
                >
                  <i
                    className={
                      user.active ? 'pi pi-check-circle' : 'pi pi-ban'
                    }
                  />
                  {user.active ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Actions + info */}
          <div className="ud-hero-right">
            <div className="ud-hero-actions">
              <Link
                to={`/${user.portfolioSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dash-hero-btn ghost"
              >
                <i className="pi pi-external-link" />
                <span>Portfolio</span>
              </Link>
              <button
                type="button"
                className={`dash-hero-btn ${
                  user.active ? 'ghost is-warning' : 'primary'
                }`}
                onClick={handleToggleActive}
              >
                <i
                  className={
                    user.active ? 'pi pi-ban' : 'pi pi-check-circle'
                  }
                />
                <span>{user.active ? 'Disable' : 'Enable'}</span>
              </button>
            </div>

            <div className="ud-hero-info">
              <div className="ud-hero-info-item">
                <i className="pi pi-envelope" />
                <span>{user.email}</span>
              </div>
              <div className="ud-hero-info-item">
                <i className="pi pi-calendar" />
                <span>Joined {joinedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="dash-section">
        <div className="dash-metrics">
          <div className="m-card">
            <div className="m-card-head">
              <span className="m-card-icon tone-blue">
                <i className="pi pi-briefcase" />
              </span>
            </div>
            <div className="m-card-body">
              <span className="m-card-value">{projects.length}</span>
              <span className="m-card-label">Projects</span>
              {publishedProjects > 0 && (
                <span className="m-card-sublabel">
                  {publishedProjects} published
                </span>
              )}
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <span className="m-card-icon tone-purple">
                <i className="pi pi-book" />
              </span>
            </div>
            <div className="m-card-body">
              <span className="m-card-value">{blogPosts.length}</span>
              <span className="m-card-label">Blog posts</span>
              {publishedPosts > 0 && (
                <span className="m-card-sublabel">
                  {publishedPosts} published
                </span>
              )}
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <span className="m-card-icon tone-green">
                <i className="pi pi-eye" />
              </span>
            </div>
            <div className="m-card-body">
              <span className="m-card-value">
                {totalViews.toLocaleString()}
              </span>
              <span className="m-card-label">Total views</span>
            </div>
          </div>

          <div className="m-card">
            <div className="m-card-head">
              <span
                className={`m-card-icon ${
                  user.active ? 'tone-green' : 'tone-amber'
                }`}
              >
                <i
                  className={
                    user.active ? 'pi pi-check-circle' : 'pi pi-ban'
                  }
                />
              </span>
            </div>
            <div className="m-card-body">
              <span className="m-card-value">
                {user.active ? 'Active' : 'Off'}
              </span>
              <span className="m-card-label">Account status</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PROJECTS ===== */}
      <section className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-head-left">
            <span className="dash-section-eyebrow">
              <i className="pi pi-briefcase" />
              Portfolio
            </span>
            <h2 className="dash-section-title">
              Projects{' '}
              <span className="ud-count-badge">{projects.length}</span>
            </h2>
          </div>
          {projects.length > 0 && (
            <Link
              to={`/${user.portfolioSlug}/projects`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-section-link"
            >
              Lihat di portfolio
              <i className="pi pi-arrow-right" />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="ud-empty">
            <div className="ud-empty-icon">
              <i className="pi pi-briefcase" />
            </div>
            <strong className="ud-empty-title">Belum ada project</strong>
            <span className="ud-empty-desc">
              User ini belum menambahkan project apapun.
            </span>
          </div>
        ) : (
          <div className="ud-grid">
            {projects.map((p, i) => (
              <Link
                key={p.id}
                to={`/${user.portfolioSlug}/projects/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ud-card"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="ud-card-thumb">
                  {p.thumbnailUrl ? (
                    <img
                      src={p.thumbnailUrl}
                      alt={p.title}
                      loading="lazy"
                    />
                  ) : (
                    <div className="ud-card-thumb-empty">
                      <i className="pi pi-image" />
                    </div>
                  )}
                  {p.featured && (
                    <span className="ud-card-badge is-featured">
                      <i className="pi pi-star-fill" />
                      Featured
                    </span>
                  )}
                </div>
                <div className="ud-card-body">
                  <strong className="ud-card-title">{p.title}</strong>
                  <p className="ud-card-desc">
                    {p.description || 'Tanpa deskripsi'}
                  </p>
                  <div className="ud-card-tags">
                    <span
                      className={`usr-status ${
                        p.published ? 'tone-green' : 'tone-zinc'
                      }`}
                    >
                      <i
                        className={
                          p.published
                            ? 'pi pi-check-circle'
                            : 'pi pi-pencil'
                        }
                      />
                      {p.published ? 'Published' : 'Draft'}
                    </span>
                    {p.techStack && p.techStack.length > 0 && (
                      <span className="usr-status tone-zinc">
                        <i className="pi pi-code" />
                        {p.techStack.length} tech
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== BLOG ===== */}
      <section className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-head-left">
            <span className="dash-section-eyebrow">
              <i className="pi pi-book" />
              Content
            </span>
            <h2 className="dash-section-title">
              Blog posts{' '}
              <span className="ud-count-badge">{blogPosts.length}</span>
            </h2>
          </div>
          {blogPosts.length > 0 && (
            <Link
              to={`/${user.portfolioSlug}/blog`}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-section-link"
            >
              Lihat di portfolio
              <i className="pi pi-arrow-right" />
            </Link>
          )}
        </div>

        {blogPosts.length === 0 ? (
          <div className="ud-empty">
            <div className="ud-empty-icon">
              <i className="pi pi-book" />
            </div>
            <strong className="ud-empty-title">Belum ada blog post</strong>
            <span className="ud-empty-desc">
              User ini belum menulis blog post.
            </span>
          </div>
        ) : (
          <div className="ud-grid">
            {blogPosts.map((b, i) => (
              <Link
                key={b.id}
                to={`/${user.portfolioSlug}/blog/${b.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ud-card"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="ud-card-thumb">
                  {b.coverUrl ? (
                    <img src={b.coverUrl} alt={b.title} loading="lazy" />
                  ) : (
                    <div className="ud-card-thumb-empty">
                      <i className="pi pi-image" />
                    </div>
                  )}
                </div>
                <div className="ud-card-body">
                  <strong className="ud-card-title">{b.title}</strong>
                  <p className="ud-card-desc">
                    {b.excerpt || 'Tanpa excerpt'}
                  </p>
                  <div className="ud-card-tags">
                    <span
                      className={`usr-status ${
                        b.published ? 'tone-green' : 'tone-zinc'
                      }`}
                    >
                      <i
                        className={
                          b.published
                            ? 'pi pi-check-circle'
                            : 'pi pi-pencil'
                        }
                      />
                      {b.published ? 'Published' : 'Draft'}
                    </span>
                    <span className="usr-status tone-zinc">
                      <i className="pi pi-eye" />
                      {(b.viewCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default UserDetail