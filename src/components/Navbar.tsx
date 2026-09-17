import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from 'primereact/button'

interface NavItem {
  label: string
  path: string
  icon: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', icon: 'pi pi-home' },
  { label: 'Projects', path: '/projects', icon: 'pi pi-briefcase' },
  { label: 'About', path: '/about', icon: 'pi pi-user' },
  { label: 'Contact', path: '/contact', icon: 'pi pi-envelope' },
]

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <NavLink to="/" className="navbar-logo">
          <i className="pi pi-code text-2xl text-primary"></i>
          <span className="font-bold text-xl ml-2">Portfolio</span>
        </NavLink>

        {/* Desktop Menu */}
        <div className="navbar-menu-desktop">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link-active' : ''}`
              }
              end={item.path === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile Toggle */}
        <Button
          icon={mobileOpen ? 'pi pi-times' : 'pi pi-bars'}
          className="navbar-toggle p-button-text p-button-plain"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        />
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="navbar-menu-mobile">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navbar-link-mobile ${isActive ? 'navbar-link-active' : ''}`
              }
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
            >
              <i className={`${item.icon} mr-2`}></i>
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

export default Navbar