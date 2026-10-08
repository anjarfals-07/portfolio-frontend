import { useState, useEffect, useMemo } from 'react'
import {
  NavLink,
  Outlet,
  Link,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { messageService } from '@/services/messageService'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
  end?: boolean
}

interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

function OwnerLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // ============================================================
  // ⭐ BASE PATH — global /owner
  // ============================================================
  const basePath = '/owner'

  // ⭐ Username untuk link ke public portfolio
  const publicUsername = user?.portfolioSlug || user?.username || ''
  const publicPortfolioUrl = publicUsername ? `/${publicUsername}` : '/'

  // ===== Cek apakah user adalah SUPER_ADMIN =====
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  // ============================================================
  // FETCH UNREAD
  // ============================================================
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const count = await messageService.countUnread()
        setUnreadCount(count)
      } catch {
        // ignore
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 60000)
    return () => clearInterval(interval)
  }, [])

  // ============================================================
  // AUTO CLOSE SIDEBAR
  // ============================================================
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  // ============================================================
  // NAV STRUCTURE
  // ============================================================
  const NAV_SECTIONS: NavSection[] = useMemo(
    () => [
      {
        id: 'main',
        label: 'Workspace',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: 'pi pi-home',
            path: basePath,
            end: true,
          },
        ],
      },
      {
        id: 'content',
        label: 'Content',
        items: [
          {
            id: 'projects',
            label: 'Projects',
            icon: 'pi pi-briefcase',
            path: `${basePath}/projects`,
          },
          {
            id: 'blog',
            label: 'Blog',
            icon: 'pi pi-book',
            path: `${basePath}/blog`,
          },
          {
            id: 'experiences',
            label: 'Experiences',
            icon: 'pi pi-map-marker',
            path: `${basePath}/experiences`,
          },
        ],
      },
      {
        id: 'profile',
        label: 'Profile',
        items: [
          {
            id: 'profile',
            label: 'Profile',
            icon: 'pi pi-user',
            path: `${basePath}/profile`,
          },
          {
            id: 'skills',
            label: 'Skills',
            icon: 'pi pi-chart-bar',
            path: `${basePath}/skills`,
          },
          {
            id: 'tech-stack',
            label: 'Tech Stack',
            icon: 'pi pi-server',
            path: `${basePath}/tech-stack`,
          },
          {
            id: 'theme',
            label: 'Theme',
            icon: 'pi pi-palette',
            path: `${basePath}/theme`,
          },
        ],
      },
      {
        id: 'inbox',
        label: 'Inbox',
        items: [
          {
            id: 'messages',
            label: 'Messages',
            icon: 'pi pi-inbox',
            path: `${basePath}/inbox`,
            badge: unreadCount,
          },
        ],
      },
    ],
    [basePath, unreadCount]
  )

  // ============================================================
  // HELPERS
  // ============================================================
  const getPageMeta = () => {
    const path = location.pathname
    if (path === basePath) return { title: 'Dashboard' }
    if (path.startsWith(`${basePath}/projects`)) return { title: 'Projects' }
    if (path.startsWith(`${basePath}/blog`)) return { title: 'Blog' }
    if (path.startsWith(`${basePath}/profile`)) return { title: 'Profile' }
    if (path.startsWith(`${basePath}/skills`)) return { title: 'Skills' }
    if (path.startsWith(`${basePath}/experiences`))
      return { title: 'Experiences' }
    if (path.startsWith(`${basePath}/tech-stack`))
      return { title: 'Tech Stack' }
    if (path.startsWith(`${basePath}/theme`)) return { title: 'Theme' }
    if (path.startsWith(`${basePath}/inbox`)) return { title: 'Inbox' }
    return { title: 'Dashboard' }
  }

  const pageMeta = getPageMeta()
  const userInitial = (user?.displayName || user?.username || 'U')
    .charAt(0)
    .toUpperCase()
  const userName = user?.displayName || user?.username || 'Owner'

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="admin-shell">
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`admin-aside ${sidebarOpen ? 'admin-aside-open' : ''}`}
      >
        {/* Brand */}
        <div className="admin-aside-head">
          <Link to={basePath} className="admin-aside-brand">
            <span className="admin-aside-brand-mark">
              <i className="pi pi-sparkles" />
            </span>
            <span className="admin-aside-brand-text">
              <strong>Portfolio</strong>
              <small>{isSuperAdmin ? 'Super Admin' : 'Owner Panel'}</small>
            </span>
          </Link>
          <button
            type="button"
            className="admin-aside-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <i className="pi pi-times" />
          </button>
        </div>

        {/* User card */}
        <div className="admin-aside-user">
          <span className="admin-aside-user-avatar">{userInitial}</span>
          <div className="admin-aside-user-info">
            <strong>{userName}</strong>
            <small>@{user?.username}</small>
          </div>
        </div>

        {/* Nav */}
        <nav className="admin-aside-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="admin-aside-group">
              <span className="admin-aside-group-label">{section.label}</span>
              {section.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `admin-aside-link ${isActive ? 'is-active' : ''}`
                  }
                >
                  <span className="admin-aside-link-icon">
                    <i className={item.icon} />
                  </span>
                  <span className="admin-aside-link-label">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="admin-aside-link-badge">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}

          {/* ⭐ ADMIN SECTION — cuma muncul kalau SUPER_ADMIN */}
          {isSuperAdmin && (
            <div className="admin-aside-group">
              <span className="admin-aside-group-label">Admin</span>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `admin-aside-link ${isActive ? 'is-active' : ''}`
                }
              >
                <span className="admin-aside-link-icon">
                  <i className="pi pi-shield" />
                </span>
                <span className="admin-aside-link-label">Admin Panel</span>
                <i className="pi pi-arrow-up-right admin-aside-link-arrow" />
              </NavLink>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="admin-aside-foot">
          <Link
            to={publicPortfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-aside-action"
          >
            <i className="pi pi-external-link" />
            <span>Lihat portfolio</span>
            <i className="pi pi-arrow-up-right admin-aside-action-arrow" />
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ===== MAIN ===== */}
      <div className="admin-stage">
        <header className="admin-crown">
          <div className="admin-crown-left">
            <button
              type="button"
              className="admin-iconbtn admin-crown-menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <i className="pi pi-bars" />
            </button>

            <nav className="admin-crumb" aria-label="Breadcrumb">
              <span className="admin-crumb-item">Owner</span>
              <i className="pi pi-angle-right admin-crumb-sep" />
              <span className="admin-crumb-item is-current">
                {pageMeta.title}
              </span>
            </nav>
          </div>

          <div className="admin-crown-right">
            {/* ⭐ Admin panel button — cuma muncul kalau SUPER_ADMIN */}
            {isSuperAdmin && (
              <>
                <Link
                  to="/admin"
                  className="admin-preview-link"
                  title="Ke Admin Panel"
                >
                  <i className="pi pi-shield" />
                  <span>Admin</span>
                </Link>

                <span className="admin-crown-rule" />
              </>
            )}

            <Link
              to={publicPortfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-preview-link"
            >
              <i className="pi pi-external-link" />
              <span>Preview</span>
            </Link>

            <span className="admin-crown-rule" />

            <button
              type="button"
              className="admin-userchip"
              onClick={handleLogout}
              aria-label="Logout"
              title="Klik untuk logout"
            >
              <span className="admin-userchip-avatar">{userInitial}</span>
              <span className="admin-userchip-meta">
                <span className="admin-userchip-name">{userName}</span>
                <span className="admin-userchip-role">
                  {user?.role || 'OWNER'}
                </span>
              </span>
              <i className="pi pi-sign-out admin-userchip-caret" />
            </button>
          </div>
        </header>

        <main className="admin-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default OwnerLayout