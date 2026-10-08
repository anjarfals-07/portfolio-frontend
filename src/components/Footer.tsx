import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { profileService } from '@/services/profileService'
import type { Profile } from '@/types/profile'

// ============================================================
// SOCIAL LINKS — fallback kalau profile kosong
// ============================================================
const FALLBACK_SOCIALS = [
  {
    icon: 'pi pi-github',
    url: 'https://github.com/anjarfals-07',
    label: 'GitHub',
    color: '#333333',
  },
  {
    icon: 'pi pi-linkedin',
    url: 'https://linkedin.com/in/username',
    label: 'LinkedIn',
    color: '#0a66c2',
  },
  {
    icon: 'pi pi-envelope',
    url: 'mailto:email@kamu.com',
    label: 'Email',
    color: '#ea4335',
  },
  {
    icon: 'pi pi-instagram',
    url: 'https://instagram.com/username',
    label: 'Instagram',
    color: '#e1306c',
  },
]

function Footer() {
  const { username } = useParams<{ username: string }>()
  const year = new Date().getFullYear()

  const [showBackToTop, setShowBackToTop] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  // ===== Fetch profile untuk data dinamis =====
  useEffect(() => {
    if (!username) return

    const fetchProfile = async () => {
      try {
        const data = await profileService.getPublicProfile(username)
        setProfile(data)
      } catch {
        // silent — pakai fallback
      }
    }
    fetchProfile()
  }, [username])

  // ===== Nav links per user =====
  const NAV_LINKS = [
    { to: `/${username}`, label: 'Home', icon: 'pi pi-home' },
    { to: `/${username}/projects`, label: 'Works', icon: 'pi pi-briefcase' },
    { to: `/${username}/blog`, label: 'Blog', icon: 'pi pi-book' },
    { to: `/${username}/about`, label: 'About', icon: 'pi pi-user' },
    { to: `/${username}/contact`, label: 'Contact', icon: 'pi pi-envelope' },
  ]

  // ===== Socials dinamis dari profile =====
  const socials = (() => {
    if (profile?.socials && profile.socials.length > 0) {
      return profile.socials
        .filter((s) => s.url)
        .map((s) => ({
          icon: s.icon || 'pi pi-link',
          url: s.url,
          label: s.label || 'Link',
          color: '#6366f1', // default color
        }))
    }
    return FALLBACK_SOCIALS
  })()

  // ===== Display name =====
  const displayName =
    profile?.fullName || profile?.shortBio || username || 'Portfolio'

  const role = profile?.role || 'Creative Professional'
  const bio =
    profile?.shortBio ||
    'Saya membuat karya yang bermakna & berkualitas.'
  const availableForWork = profile?.availableForWork ?? true

  // ===== Back to top =====
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      {/* ===== TOP GRADIENT LINE ===== */}
      <div className="footer-top-line" />

      <div className="footer-main">
        <div className="footer-container">
          {/* ============================================================ */}
          {/* BRAND                                                        */}
          {/* ============================================================ */}
          <div className="footer-brand">
            <Link to={`/${username}`} className="footer-logo">
              <div className="footer-logo-icon">
                <i className="pi pi-sparkles"></i>
              </div>
              <div className="footer-logo-text">
                <strong>{displayName}</strong>
                <small>{role}</small>
              </div>
            </Link>

            <p className="footer-brand-desc">{bio}</p>

            {availableForWork && (
              <div className="footer-status">
                <span className="footer-status-dot" />
                <span>Available for work</span>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* NAVIGATION                                                   */}
          {/* ============================================================ */}
          <nav className="footer-nav">
            <h4 className="footer-heading">
              <i className="pi pi-compass"></i>
              Navigation
            </h4>
            <ul className="footer-nav-list">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer-link">
                    <i className={link.icon}></i>
                    <span>{link.label}</span>
                    <i className="pi pi-arrow-up-right footer-link-arrow"></i>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* ============================================================ */}
          {/* CONNECT                                                      */}
          {/* ============================================================ */}
          <div className="footer-connect">
            <h4 className="footer-heading">
              <i className="pi pi-send"></i>
              Let's Connect
            </h4>
            <p className="footer-connect-desc">
              Terbuka untuk freelance, kolaborasi, atau sekadar ngobrol soal
              tech.
            </p>

            {/* Social Links — dinamis */}
            <div className="footer-socials">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="footer-social-link"
                  style={
                    { '--social-color': s.color } as React.CSSProperties
                  }
                >
                  <i className={s.icon}></i>
                  <span className="footer-social-tooltip">{s.label}</span>
                </a>
              ))}
            </div>

            {/* CTA — Kirim Pesan */}
            <Link to={`/${username}/contact`} className="footer-cta-btn">
              <span className="footer-cta-icon">
                <i className="pi pi-envelope"></i>
              </span>
              <span className="footer-cta-content">
                <span className="footer-cta-label">Kirim Pesan</span>
                <span className="footer-cta-sub">Balas dalam 24 jam</span>
              </span>
              <i className="pi pi-arrow-right footer-cta-arrow"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* BOTTOM BAR — Copyright + Build Your Own                      */}
      {/* ============================================================ */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          {/* KIRI — Copyright */}
          <div className="footer-bottom-left">
            <span className="footer-copyright">
              © {year}{' '}
              <Link to={`/${username}`} className="footer-copyright-link">
                <strong>{displayName}</strong>
              </Link>
              . Made with <span className="footer-heart">☕</span> & React.
            </span>
          </div>

          {/* KANAN — Build Your Own CTA */}
          <div className="footer-bottom-right">
            <Link
              to="/register"
              className="footer-build-cta"
              title="Buat portfolio kamu sendiri"
            >
              <span className="footer-build-cta-icon">
                <i className="pi pi-sparkles"></i>
              </span>
              <span className="footer-build-cta-text">
                <strong>Punya portfolio?</strong>
                <small>Bagikan di sini</small>
              </span>
              <i className="pi pi-arrow-right footer-build-cta-arrow"></i>
            </Link>
          </div>
        </div>
      </div>

      {/* ===== BACK TO TOP ===== */}
      <button
        type="button"
        className={`footer-back-to-top ${showBackToTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="pi pi-arrow-up"></i>
      </button>
    </footer>
  )
}

export default Footer