// src/components/Navbar.tsx

import { useState, useEffect, useMemo } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { LogoRenderer } from '@/components/LogoRenderer'
import { useUserTheme } from '@/hooks/useUserTheme'
import { useScrollSpy } from '@/hooks/useScrollSpy'
import { DEFAULT_THEME } from '@/types/theme'

interface NavItem {
  label: string
  path: string
  icon: string
  end?: boolean
  /** ID section untuk scroll spy (kalau single-page) */
  sectionId?: string
}

function Navbar() {
  const { username } = useParams<{ username: string }>()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  // ===== Ambil theme user =====
  const { theme } = useUserTheme()

  const resolvedTheme = {
    primaryColor: theme?.primaryColor || DEFAULT_THEME.primaryColor,
    accentColor: theme?.accentColor || DEFAULT_THEME.accentColor,
    logoIcon: theme?.logoIcon || DEFAULT_THEME.logoIcon,
  }

  // ⭐ White-label: pakai displayName user (kalau ada), fallback ke username
  const brandName = theme?.displayName?.trim() || username || 'Portfolio'

  const logoGradient: [string, string] = [
    resolvedTheme.primaryColor,
    resolvedTheme.accentColor,
  ]

  // ===== NAV ITEMS per user =====
  const NAV_ITEMS: NavItem[] = useMemo(
    () => [
      {
        label: 'Home',
        path: `/${username}`,
        icon: 'pi pi-home',
        end: true,
        sectionId: 'home',
      },
      {
        label: 'Works',
        path: `/${username}/projects`,
        icon: 'pi pi-briefcase',
        sectionId: 'projects',
      },
      {
        label: 'Blog',
        path: `/${username}/blog`,
        icon: 'pi pi-book',
        sectionId: 'blog',
      },
      {
        label: 'About',
        path: `/${username}/about`,
        icon: 'pi pi-user',
        sectionId: 'about',
      },
      {
        label: 'Contact',
        path: `/${username}/contact`,
        icon: 'pi pi-envelope',
        sectionId: 'contact',
      },
    ],
    [username]
  )

  // ===== Scroll Spy — deteksi section di halaman Home =====
  const isHomePage = location.pathname === `/${username}`

  // ID section yang ada di halaman Home
  const homeSectionIds = useMemo(
    () => ['home', 'skills', 'projects', 'blog', 'contact'],
    []
  )

  const activeSection = useScrollSpy(homeSectionIds, {
    enabled: isHomePage,
    offset: 120,
  })

  // ===== Tentukan menu mana yang active =====
  const isItemActive = (item: NavItem): boolean => {
    // ⭐ 1. Kalau bukan di Home page → pakai route-based
    if (!isHomePage) {
      if (item.end) {
        return location.pathname === item.path
      }
      return (
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + '/')
      )
    }

    // ⭐ 2. Kalau di Home page → pakai scroll spy
    if (!activeSection) {
      // Belum ada section yang terdeteksi → default ke Home
      return item.sectionId === 'home'
    }

    // Map sectionId ke menu
    switch (activeSection) {
      case 'home':
        return item.sectionId === 'home'
      case 'skills':
        // Skills tidak ada di menu → tetap highlight Home
        return item.sectionId === 'home'
      case 'projects':
        return item.sectionId === 'projects'
      case 'blog':
        return item.sectionId === 'blog'
      case 'about':
        return item.sectionId === 'about'
      case 'contact':
        return item.sectionId === 'contact'
      default:
        return false
    }
  }

  // Auto close menu saat pindah halaman
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Lock body scroll saat menu buka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const toggleMobile = () => setMobileOpen((prev) => !prev)
  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* ===== LOGO ===== */}
          <NavLink
            to={`/${username}`}
            className="navbar-logo"
            onClick={closeMobile}
          >
            <span className="navbar-logo-icon">
              <LogoRenderer
                value={resolvedTheme.logoIcon}
                size={32}
                gradient={logoGradient}
              />
            </span>
            <span className="navbar-logo-text">{brandName}</span>
          </NavLink>

          {/* ===== RIGHT ===== */}
          <div className="navbar-right">
            <div className="navbar-menu-desktop">
              {NAV_ITEMS.map((item) => {
                const active = isItemActive(item)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`navbar-link ${
                      active ? 'navbar-link-active' : ''
                    }`}
                    end={item.end}
                  >
                    {item.label}
                  </NavLink>
                )
              })}
            </div>

            <div className="navbar-theme-desktop">
              <ThemeToggle />
            </div>

            {/* ⭐ CTA: Hire Me */}
            <NavLink
              to={`/${username}/contact`}
              className="navbar-cta-desktop"
            >
              <i className="pi pi-send"></i>
              <span>Hire Me</span>
            </NavLink>

            <button
              className={`navbar-toggle ${
                mobileOpen ? 'navbar-toggle-open' : ''
              }`}
              onClick={toggleMobile}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              type="button"
            >
              <span className="navbar-toggle-box">
                <span className="navbar-toggle-line"></span>
                <span className="navbar-toggle-line"></span>
                <span className="navbar-toggle-line"></span>
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* ===== OVERLAY ===== */}
      <div
        className={`navbar-overlay ${
          mobileOpen ? 'navbar-overlay-open' : ''
        }`}
        onClick={closeMobile}
        aria-hidden="true"
      ></div>

      {/* ===== MOBILE MENU ===== */}
      <aside
        className={`navbar-mobile ${mobileOpen ? 'navbar-mobile-open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="navbar-mobile-inner">
          {/* Logo mobile */}
          <div className="navbar-mobile-logo">
            <span className="navbar-mobile-logo-icon">
              <LogoRenderer
                value={resolvedTheme.logoIcon}
                size={36}
                gradient={logoGradient}
              />
            </span>
            <span className="navbar-mobile-logo-text">{brandName}</span>
          </div>

          <div className="navbar-mobile-divider" />

          {NAV_ITEMS.map((item, index) => {
            const active = isItemActive(item)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`navbar-mobile-link ${
                  active ? 'navbar-mobile-link-active' : ''
                }`}
                end={item.end}
                onClick={closeMobile}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
                <i className="pi pi-arrow-right navbar-mobile-arrow"></i>
              </NavLink>
            )
          })}

          <div className="navbar-mobile-divider" />

          {/* CTA mobile: Hire Me */}
          <NavLink
            to={`/${username}/contact`}
            className="navbar-mobile-cta"
            onClick={closeMobile}
          >
            <i className="pi pi-send"></i>
            <span>Hire Me</span>
          </NavLink>

          <div className="navbar-mobile-divider" />

          <div className="navbar-mobile-theme">
            <ThemeToggle variant="text" />
          </div>
        </div>
      </aside>
    </>
  )
}

export default Navbar