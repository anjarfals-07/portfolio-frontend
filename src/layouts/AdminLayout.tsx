import { useState, useRef, useEffect, useMemo } from 'react'
import {
  NavLink,
  Outlet,
  useNavigate,
  Link,
  useLocation,
} from 'react-router-dom'
import { Menu } from 'primereact/menu'
import type { MenuItem } from 'primereact/menuitem'
import { useAuth } from '@/context/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
  keywords?: string
  external?: boolean
}

interface NavSection {
  id: string
  label: string
  items: NavItem[]
}

const MOBILE_BREAKPOINT = 1024

function getIsMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
}

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const [cmdQuery, setCmdQuery] = useState('')
  const [cmdActive, setCmdActive] = useState(0)
  const [isMobile, setIsMobile] = useState(getIsMobile)

  const userMenuRef = useRef<Menu>(null)
  const cmdInputRef = useRef<HTMLInputElement>(null)

  const userPortfolioSlug = user?.portfolioSlug || user?.username

  // ============================================================
  // DETEKSI MOBILE
  // ============================================================
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (!e.matches) setSidebarOpen(false)
    }

    mq.addEventListener('change', handleChange)
    setIsMobile(mq.matches)

    return () => mq.removeEventListener('change', handleChange)
  }, [])

  // ============================================================
  // NAV SECTIONS — SUPER_ADMIN bisa manage portfolio juga
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
            path: '/admin',
            keywords: 'home overview stats',
          },
          {
            id: 'projects',
            label: 'Projects',
            icon: 'pi pi-briefcase',
            path: '/admin/projects',
            keywords: 'project portfolio karya works',
          },
          {
            id: 'blog',
            label: 'Blog',
            icon: 'pi pi-book',
            path: '/admin/blog',
            keywords: 'blog artikel tulisan post',
          },
        ],
      },
      {
        id: 'manage',
        label: 'Management',
        items: [
          {
            id: 'users',
            label: 'Users',
            icon: 'pi pi-users',
            path: '/admin/users',
            badge: 2,
            keywords: 'accounts members people',
          },
          {
            id: 'payments',
            label: 'Payments',
            icon: 'pi pi-receipt',
            path: '/admin/payments',
            keywords:
              'payment transaksi verifikasi bukti bayar approve reject',
          },
          {
            id: 'payment-methods',
            label: 'Payment Methods',
            icon: 'pi pi-credit-card',
            path: '/admin/payment-methods',
            keywords: 'payment qris bank crypto wallet metode bayar',
          },
        ],
      },
      {
        id: 'my-portfolio',
        label: 'Portfolio Saya',
        items: [
          {
            id: 'profile',
            label: 'Profile',
            icon: 'pi pi-user',
            path: '/admin/profile',
            keywords: 'profile bio tentang',
          },
          {
            id: 'theme',
            label: 'Theme',
            icon: 'pi pi-palette',
            path: '/admin/theme',
            keywords: 'theme warna kustomisasi tampilan',
          },
          {
            id: 'skills',
            label: 'Skills',
            icon: 'pi pi-star',
            path: '/admin/skills',
            keywords: 'skill keahlian kemampuan',
          },
          {
            id: 'experiences',
            label: 'Experiences',
            icon: 'pi pi-briefcase',
            path: '/admin/experiences',
            keywords: 'experience pengalaman kerja',
          },
          {
            id: 'tech-stack',
            label: 'Tech Stack',
            icon: 'pi pi-code',
            path: '/admin/tech-stack',
            keywords: 'tech stack tools teknologi',
          },
          {
            id: 'inbox',
            label: 'Inbox',
            icon: 'pi pi-inbox',
            path: '/admin/inbox',
            keywords: 'inbox pesan message',
          },
          {
            id: 'custom-domain',
            label: 'Custom Domain',
            icon: 'pi pi-globe',
            path: '/admin/custom-domain',
            keywords: 'domain custom url',
          },
        ],
      },
      {
        id: 'system',
        label: 'System',
        items: [
          {
            id: 'settings',
            label: 'Settings',
            icon: 'pi pi-cog',
            path: '/admin/settings',
            keywords: 'config preferences',
          },
        ],
      },
    ],
    []
  )

  const allNavItems = useMemo(
    () => NAV_SECTIONS.flatMap((s) => s.items),
    [NAV_SECTIONS]
  )

  const cmdResults = useMemo(() => {
    if (!cmdQuery.trim()) return allNavItems
    const q = cmdQuery.toLowerCase().trim()
    return allNavItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords?.toLowerCase().includes(q)
    )
  }, [cmdQuery, allNavItems])

  // ============================================================
  // USER MENU
  // ============================================================
  const userMenuItems: MenuItem[] = [
    ...(userPortfolioSlug
      ? [
          {
            label: 'Portfolio saya',
            icon: 'pi pi-user',
            command: () => navigate(`/${userPortfolioSlug}`),
          },
        ]
      : []),
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => navigate('/admin/settings'),
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      className: 'admin-menu-item-danger',
      command: () => {
        logout()
        navigate('/login', { replace: true })
      },
    },
  ]

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    setSidebarOpen(false)
    setCmdOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const lock = sidebarOpen || cmdOpen
    document.body.style.overflow = lock ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen, cmdOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen(true)
        setCmdQuery('')
        setCmdActive(0)
        setTimeout(() => cmdInputRef.current?.focus(), 30)
      }
      if (e.key === 'Escape') {
        setCmdOpen(false)
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!cmdOpen) return
    const onNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCmdActive((i) => (i + 1) % Math.max(cmdResults.length, 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCmdActive((i) =>
          i === 0 ? Math.max(cmdResults.length - 1, 0) : i - 1
        )
      }
      if (e.key === 'Enter' && cmdResults[cmdActive]) {
        e.preventDefault()
        navigate(cmdResults[cmdActive].path)
        setCmdOpen(false)
      }
    }
    window.addEventListener('keydown', onNav)
    return () => window.removeEventListener('keydown', onNav)
  }, [cmdOpen, cmdResults, cmdActive, navigate])

  // ============================================================
  // HELPERS — PAGE META (BREADCRUMB)
  // ============================================================
  const pageMeta = useMemo(() => {
    const path = location.pathname
    if (path === '/admin') return { title: 'Dashboard' }

    // ⚠️ Cek /admin/payments SEBELUM /admin/payment-methods
    if (path.startsWith('/admin/payments')) return { title: 'Payments' }
    if (path.startsWith('/admin/payment-methods'))
      return { title: 'Payment Methods' }

    if (path.startsWith('/admin/users')) return { title: 'Users' }
    if (path.startsWith('/admin/projects')) return { title: 'Projects' }
    if (path.startsWith('/admin/blog')) return { title: 'Blog' }
    if (path.startsWith('/admin/profile')) return { title: 'Profile' }
    if (path.startsWith('/admin/theme')) return { title: 'Theme' }
    if (path.startsWith('/admin/skills')) return { title: 'Skills' }
    if (path.startsWith('/admin/experiences')) return { title: 'Experiences' }
    if (path.startsWith('/admin/tech-stack')) return { title: 'Tech Stack' }
    if (path.startsWith('/admin/inbox')) return { title: 'Inbox' }
    if (path.startsWith('/admin/custom-domain'))
      return { title: 'Custom Domain' }
    if (path.startsWith('/admin/settings')) return { title: 'Settings' }

    return { title: 'Admin' }
  }, [location.pathname])

  const userInitial = (user?.username?.charAt(0) || 'A').toUpperCase()
  const userName = user?.displayName || user?.username || 'Admin'

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside
        className={`admin-aside ${sidebarOpen ? 'admin-aside-open' : ''}`}
      >
        <div className="admin-aside-head">
          <Link to="/admin" className="admin-aside-brand">
            <span className="admin-aside-brand-mark">
              <i className="pi pi-bolt" />
            </span>
            <span className="admin-aside-brand-text">
              <strong>Nexus</strong>
              <small>Admin Panel</small>
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

        <div className="admin-aside-user">
          <span className="admin-aside-user-avatar">{userInitial}</span>
          <div className="admin-aside-user-info">
            <strong>{userName}</strong>
            <small>@{user?.username}</small>
          </div>
        </div>

        <nav className="admin-aside-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="admin-aside-group">
              <span className="admin-aside-group-label">
                {section.label}
              </span>
              {section.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) =>
                    `admin-aside-link ${isActive ? 'is-active' : ''}`
                  }
                >
                  <span className="admin-aside-link-icon">
                    <i className={item.icon} />
                  </span>
                  <span className="admin-aside-link-label">
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="admin-aside-link-badge">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="admin-aside-foot">
          {userPortfolioSlug && (
            <Link
              to={`/${userPortfolioSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-aside-action"
            >
              <i className="pi pi-external-link" />
              <span>Lihat portfolio</span>
              <i className="pi pi-arrow-up-right admin-aside-action-arrow" />
            </Link>
          )}
        </div>
      </aside>

      {/* OVERLAY */}
      {isMobile && sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* MAIN */}
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
              <span className="admin-crumb-item">Admin</span>
              <i className="pi pi-angle-right admin-crumb-sep" />
              <span className="admin-crumb-item is-current">
                {pageMeta.title}
              </span>
            </nav>
          </div>

          <div className="admin-crown-right">
            <button
              type="button"
              className="admin-search"
              onClick={() => {
                setCmdOpen(true)
                setCmdQuery('')
                setTimeout(() => cmdInputRef.current?.focus(), 30)
              }}
              aria-label="Search"
            >
              <i className="pi pi-search" />
              <span className="admin-search-text">Search…</span>
              <kbd className="admin-search-kbd">⌘K</kbd>
            </button>

            <span className="admin-crown-rule" />

            <ThemeToggle variant="icon-only" />

            <span className="admin-crown-rule" />

            <button
              type="button"
              className="admin-userchip"
              onClick={(e) => userMenuRef.current?.toggle(e)}
              aria-label="Account menu"
            >
              <span className="admin-userchip-avatar">{userInitial}</span>
              <span className="admin-userchip-meta">
                <span className="admin-userchip-name">{userName}</span>
                <span className="admin-userchip-role">
                  {user?.role || 'SUPER_ADMIN'}
                </span>
              </span>
              <i className="pi pi-angle-down admin-userchip-caret" />
            </button>

            <Menu
              model={userMenuItems}
              popup
              ref={userMenuRef}
              className="admin-menu"
            />
          </div>
        </header>

        <main className="admin-surface">
          <Outlet />
        </main>
      </div>

      {/* COMMAND PALETTE */}
      {cmdOpen && (
        <div
          className="admin-cmdk-scrim"
          onClick={() => setCmdOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="admin-cmdk-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-cmdk-top">
              <i className="pi pi-search admin-cmdk-icon" />
              <input
                ref={cmdInputRef}
                type="text"
                className="admin-cmdk-field"
                placeholder="Search or jump to…"
                value={cmdQuery}
                onChange={(e) => {
                  setCmdQuery(e.target.value)
                  setCmdActive(0)
                }}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                className="admin-cmdk-esc"
                onClick={() => setCmdOpen(false)}
              >
                ESC
              </button>
            </div>

            <div className="admin-cmdk-body">
              {cmdResults.length === 0 ? (
                <div className="admin-cmdk-empty">
                  <i className="pi pi-search" />
                  <span>No matches for "{cmdQuery}"</span>
                </div>
              ) : (
                <>
                  <div className="admin-cmdk-group">Navigation</div>
                  {cmdResults.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`admin-cmdk-row ${
                        idx === cmdActive ? 'is-active' : ''
                      }`}
                      onMouseEnter={() => setCmdActive(idx)}
                      onClick={() => {
                        navigate(item.path)
                        setCmdOpen(false)
                      }}
                    >
                      <span className="admin-cmdk-row-icon">
                        <i className={item.icon} />
                      </span>
                      <span className="admin-cmdk-row-body">
                        <span className="admin-cmdk-row-title">
                          {item.label}
                        </span>
                        <span className="admin-cmdk-row-path">
                          {item.path}
                        </span>
                      </span>
                      <i className="pi pi-arrow-right admin-cmdk-row-arrow" />
                    </button>
                  ))}
                </>
              )}
            </div>

            <div className="admin-cmdk-foot">
              <span className="admin-cmdk-hint">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="admin-cmdk-hint">
                <kbd>↵</kbd>
                <span>Open</span>
              </span>
              <span className="admin-cmdk-hint">
                <kbd>ESC</kbd>
                <span>Dismiss</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout