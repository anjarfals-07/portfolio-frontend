import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Skeleton } from 'primereact/skeleton'
import { projectService } from '@/services/projectService'
import { messageService } from '@/services/messageService'
import { skillService } from '@/services/skillService'
import { experienceService } from '@/services/experienceService'
import { useAuth } from '@/context/AuthContext'

interface Stats {
  projects: number
  skills: number
  experiences: number
  unreadMessages: number
}

interface MetricCard {
  key: keyof Stats
  label: string
  icon: string
  tone: string
  link: string
  trend?: { value: number; direction: 'up' | 'down' | 'flat' }
}

interface QuickAction {
  label: string
  desc: string
  icon: string
  link: string
  tone: string
}

function Dashboard() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()

  const [stats, setStats] = useState<Stats>({
    projects: 0,
    skills: 0,
    experiences: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  const basePath = `/${username}/dashboard`

  // ============================================================
  // FETCH STATS
  // ============================================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [projects, skills, experiences, unread] = await Promise.all([
          projectService.getAll().catch(() => []),
          skillService.getAll().catch(() => []),
          experienceService.getAll().catch(() => []),
          messageService.countUnread().catch(() => 0),
        ])

        setStats({
          projects: projects.length,
          skills: skills.length,
          experiences: experiences.length,
          unreadMessages: unread,
        })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // ============================================================
  // GREETING
  // ============================================================
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }),
    []
  )

  // ============================================================
  // METRICS
  // ============================================================
  const metrics: MetricCard[] = [
    {
      key: 'projects',
      label: 'Projects',
      icon: 'pi pi-briefcase',
      tone: 'blue',
      link: `${basePath}/projects`,
      trend: { value: 12, direction: 'up' },
    },
    {
      key: 'skills',
      label: 'Skills',
      icon: 'pi pi-chart-bar',
      tone: 'purple',
      link: `${basePath}/skills`,
      trend: { value: 4, direction: 'up' },
    },
    {
      key: 'experiences',
      label: 'Experiences',
      icon: 'pi pi-map-marker',
      tone: 'green',
      link: `${basePath}/experiences`,
      trend: { value: 0, direction: 'flat' },
    },
    {
      key: 'unreadMessages',
      label: 'Unread messages',
      icon: 'pi pi-inbox',
      tone: stats.unreadMessages > 0 ? 'amber' : 'zinc',
      link: `${basePath}/inbox`,
      trend:
        stats.unreadMessages > 0
          ? { value: stats.unreadMessages, direction: 'up' }
          : undefined,
    },
  ]

  const quickActions: QuickAction[] = [
    {
      label: 'Tambah project',
      desc: 'Bikin karya baru untuk portfolio',
      icon: 'pi pi-plus-circle',
      link: `${basePath}/projects`,
      tone: 'blue',
    },
    {
      label: 'Edit profile',
      desc: 'Update bio, avatar & sosial media',
      icon: 'pi pi-user-edit',
      link: `${basePath}/profile`,
      tone: 'purple',
    },
    {
      label: 'Baca pesan',
      desc:
        stats.unreadMessages > 0
          ? `${stats.unreadMessages} pesan belum dibaca`
          : 'Tidak ada pesan baru',
      icon: 'pi pi-envelope',
      link: `${basePath}/inbox`,
      tone: 'amber',
    },
    {
      label: 'Atur theme',
      desc: 'Custom warna & layout portfolio',
      icon: 'pi pi-palette',
      link: `${basePath}/theme`,
      tone: 'pink',
    },
  ]

  const displayName = user?.displayName || user?.username || 'User'

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dash">
      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />
        <div className="dash-hero-inner">
          <div className="dash-hero-left">
            <span className="dash-hero-greeting">
              <i className="pi pi-sun" />
              {greeting}
            </span>
            <h1 className="dash-hero-title">
              Welcome back,{' '}
              <span className="dash-hero-name">{displayName}</span>
            </h1>
            <p className="dash-hero-desc">
              Kelola seluruh portfolio kamu dari satu tempat. Semua data
              terbaru siap dilihat di sini.
            </p>

            <div className="dash-hero-actions">
              <Link
                to={`${basePath}/projects`}
                className="dash-hero-btn primary"
              >
                <i className="pi pi-briefcase" />
                <span>Manage projects</span>
                <i className="pi pi-arrow-right" />
              </Link>
              <Link
                to={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="dash-hero-btn ghost"
              >
                <i className="pi pi-external-link" />
                <span>Lihat portfolio</span>
              </Link>
            </div>
          </div>

          <div className="dash-hero-right">
            <div className="dash-hero-meta">
              <span className="dash-hero-meta-item">
                <i className="pi pi-calendar" />
                {today}
              </span>
              <span className="dash-hero-meta-divider" />
              <span className="dash-hero-meta-item">
                <span className="dash-hero-meta-dot" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== METRICS ===== */}
      <section className="dash-section">
        <header className="dash-section-head">
          <div className="dash-section-head-left">
            <span className="dash-section-eyebrow">
              <i className="pi pi-chart-line" />
              Overview
            </span>
            <h2 className="dash-section-title">Portfolio statistics</h2>
          </div>
        </header>

        <div className="dash-metrics">
          {metrics.map((m, i) => (
            <Link
              key={m.key}
              to={m.link}
              className="m-card is-clickable"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="m-card-head">
                <span className={`m-card-icon tone-${m.tone}`}>
                  <i className={m.icon} />
                </span>
                {m.trend && m.trend.value > 0 && (
                  <span
                    className={`m-card-trend is-${m.trend.direction}`}
                  >
                    {m.trend.direction === 'up' && (
                      <i className="pi pi-arrow-up-right" />
                    )}
                    {m.trend.direction === 'down' && (
                      <i className="pi pi-arrow-down-right" />
                    )}
                    {m.trend.direction === 'flat' && (
                      <i className="pi pi-minus" />
                    )}
                    {m.trend.value > 0 && `${m.trend.value}`}
                  </span>
                )}
              </div>
              <div className="m-card-body">
                {loading ? (
                  <Skeleton width="3rem" height="1.75rem" />
                ) : (
                  <span className="m-card-value">
                    {stats[m.key]}
                  </span>
                )}
                <span className="m-card-label">{m.label}</span>
              </div>
              <i className="pi pi-arrow-up-right m-card-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== QUICK ACTIONS ===== */}
      <section className="dash-section">
        <header className="dash-section-head">
          <div className="dash-section-head-left">
            <span className="dash-section-eyebrow">
              <i className="pi pi-bolt" />
              Quick actions
            </span>
            <h2 className="dash-section-title">Shortcuts</h2>
          </div>
        </header>

        <div className="dash-quick">
          {quickActions.map((action, i) => (
            <Link
              key={action.label}
              to={action.link}
              className="q-action"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className={`q-action-icon tone-${action.tone}`}>
                <i className={action.icon} />
              </span>
              <span className="q-action-body">
                <span className="q-action-title">{action.label}</span>
                <span className="q-action-desc">{action.desc}</span>
              </span>
              <i className="pi pi-arrow-up-right q-action-arrow" />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== TIPS ===== */}
      <section className="dash-section">
        <div className="set-banner">
          <div className="set-banner-icon">
            <i className="pi pi-lightbulb" />
          </div>
          <div className="set-banner-body">
            <strong>Pro tip</strong>
            <span>
              Semua perubahan di dashboard langsung tampil di portfolio
              publik. Simpan draft dulu, publish nanti saat siap.
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard