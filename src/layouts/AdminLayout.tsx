import { useState } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import { Badge } from 'primereact/badge'
import { useAuth } from '@/context/AuthContext'

interface MenuItem {
  label: string
  icon: string
  path: string
  badge?: number
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', path: '/admin' },
  { label: 'Projects', icon: 'pi pi-briefcase', path: '/admin/projects' },
  { label: 'Profile', icon: 'pi pi-user', path: '/admin/profile' },
  { label: 'Skills', icon: 'pi pi-chart-bar', path: '/admin/skills' },
  { label: 'Experiences', icon: 'pi pi-clock', path: '/admin/experiences' },
  { label: 'Tech Stack', icon: 'pi pi-server', path: '/admin/tech-stack' },
  { label: 'Inbox', icon: 'pi pi-inbox', path: '/admin/inbox' },
]

function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-wrapper">
      {/* ===== SIDEBAR ===== */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar-header">
          <Link to="/admin" className="admin-logo">
            <i className="pi pi-code text-2xl text-primary"></i>
            <span>Admin Panel</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="admin-menu">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `admin-menu-item ${isActive ? 'admin-menu-item-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
              {item.badge && (
                <Badge value={item.badge} severity="danger" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-menu-item">
            <i className="pi pi-external-link"></i>
            <span>Lihat Website</span>
          </Link>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="admin-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* ===== MAIN ===== */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <div className="admin-header-left">
            <Button
              icon="pi pi-bars"
              text
              rounded
              severity="secondary"
              className="admin-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            />
            <h2 className="admin-header-title">Admin Panel</h2>
          </div>

          <div className="admin-header-right">
            {/* User info */}
            <div className="admin-user">
              <Avatar
                label={user?.username?.charAt(0).toUpperCase() || 'A'}
                shape="circle"
                className="admin-user-avatar"
              />
              <div className="admin-user-info">
                <span className="admin-user-name">{user?.username || 'Admin'}</span>
                <span className="admin-user-role">{user?.role || 'ADMIN'}</span>
              </div>
            </div>

            {/* Logout */}
            <Button
              icon="pi pi-sign-out"
              label="Logout"
              text
              severity="danger"
              onClick={handleLogout}
              className="admin-logout-btn"
            />
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout