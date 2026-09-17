import { Link } from 'react-router-dom'

const SOCIAL_LINKS = [
  { icon: 'pi pi-github', url: 'https://github.com/anjarfals-07', label: 'GitHub' },
  { icon: 'pi pi-linkedin', url: 'https://linkedin.com/in/username', label: 'LinkedIn' },
  { icon: 'pi pi-envelope', url: 'mailto:email@kamu.com', label: 'Email' },
]

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="flex align-items-center gap-2 mb-2">
            <i className="pi pi-code text-xl text-primary"></i>
            <span className="font-bold text-lg">Portfolio</span>
          </div>
          <p className="text-sm text-color-secondary m-0">
            Full-Stack Developer — Java • Spring Boot • React
          </p>
        </div>

        <div className="footer-links">
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/projects" className="footer-link">Projects</Link>
          <Link to="/about" className="footer-link">About</Link>
          <Link to="/contact" className="footer-link">Contact</Link>
        </div>

        <div className="footer-social">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="footer-social-link"
            >
              <i className={s.icon}></i>
            </a>
          ))}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <span>© {year} Anjar. Made with ☕ & React.</span>
          <Link
            to="/admin/login"
            className="footer-admin-link"
            title="Admin Login"
          >
            <i className="pi pi-lock"></i>
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer