import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'primereact/card'
import { Button } from 'primereact/button'
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

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    skills: 0,
    experiences: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [projects, skills, experiences, unread] = await Promise.all([
          projectService.getAll(true).catch(() => []),
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

  const statCards = [
    {
      label: 'Projects',
      value: stats.projects,
      icon: 'pi pi-briefcase',
      color: '#3b82f6',
      bgColor: '#eff6ff',
      link: '/admin/projects',
    },
    {
      label: 'Skills',
      value: stats.skills,
      icon: 'pi pi-chart-bar',
      color: '#8b5cf6',
      bgColor: '#f5f3ff',
      link: '/admin/skills',
    },
    {
      label: 'Experiences',
      value: stats.experiences,
      icon: 'pi pi-clock',
      color: '#10b981',
      bgColor: '#ecfdf5',
      link: '/admin/experiences',
    },
    {
      label: 'Pesan Baru',
      value: stats.unreadMessages,
      icon: 'pi pi-inbox',
      color: '#f59e0b',
      bgColor: '#fffbeb',
      link: '/admin/inbox',
    },
  ]

  const quickActions = [
    {
      label: 'Tambah Project',
      icon: 'pi pi-plus',
      link: '/admin/projects',
      description: 'Bikin project baru',
    },
    {
      label: 'Edit Profile',
      icon: 'pi pi-user-edit',
      link: '/admin/profile',
      description: 'Update bio & info',
    },
    {
      label: 'Baca Pesan',
      icon: 'pi pi-envelope',
      link: '/admin/inbox',
      description: `${stats.unreadMessages} pesan belum dibaca`,
    },
    {
      label: 'Lihat Website',
      icon: 'pi pi-external-link',
      link: '/',
      description: 'Buka portfolio publik',
    },
  ]

  return (
    <div className="admin-dashboard">
      {/* ===== WELCOME ===== */}
      <div className="admin-welcome">
        <h1 className="admin-welcome-title">
          Halo, {user?.username || 'Admin'}! 👋
        </h1>
        <p className="admin-welcome-subtitle">
          Selamat datang di admin panel. Kelola portfolio kamu di sini.
        </p>
      </div>

      {/* ===== STATS ===== */}
      <div className="admin-stats-grid">
        {statCards.map((stat) => (
          <Link key={stat.label} to={stat.link} className="admin-stat-link">
            <Card className="admin-stat-card">
              <div className="admin-stat-content">
                <div
                  className="admin-stat-icon"
                  style={{
                    background: stat.bgColor,
                    color: stat.color,
                  }}
                >
                  <i className={stat.icon}></i>
                </div>
                <div className="admin-stat-info">
                  {loading ? (
                    <Skeleton width="3rem" height="2rem" />
                  ) : (
                    <span className="admin-stat-value">{stat.value}</span>
                  )}
                  <span className="admin-stat-label">{stat.label}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* ===== QUICK ACTIONS ===== */}
      <div className="admin-section">
        <h2 className="admin-section-title">Aksi Cepat</h2>
        <div className="admin-actions-grid">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.link} className="admin-action-link">
              <div className="admin-action-card">
                <div className="admin-action-icon">
                  <i className={action.icon}></i>
                </div>
                <div className="admin-action-content">
                  <span className="admin-action-label">{action.label}</span>
                  <span className="admin-action-desc">{action.description}</span>
                </div>
                <i className="pi pi-arrow-right admin-action-arrow"></i>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ===== INFO ===== */}
      <div className="admin-section">
        <h2 className="admin-section-title">Info</h2>
        <Card className="admin-info-card">
          <div className="admin-info-content">
            <i className="pi pi-info-circle text-primary text-2xl"></i>
            <div>
              <strong>Tips:</strong> Semua perubahan di admin panel langsung
              tampil di website publik. Nggak perlu redeploy!
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard