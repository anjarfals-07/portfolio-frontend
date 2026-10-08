import type { ThemeFormData } from '@/types/theme'
import { DEFAULT_THEME } from '@/types/theme'

interface ThemePreviewProps {
  theme: ThemeFormData
}

/**
 * Live preview — nampilin mini portfolio dengan theme aktif.
 */
function ThemePreview({ theme }: ThemePreviewProps) {
  // ===== Safe fallback — selalu return string =====
  const primary: string = theme.primaryColor ?? DEFAULT_THEME.primaryColor ?? '#3b82f6'
  const accent: string = theme.accentColor ?? DEFAULT_THEME.accentColor ?? '#8b5cf6'
  const bg: string = theme.bgColor ?? DEFAULT_THEME.bgColor ?? '#ffffff'
  const text: string = theme.textColor ?? DEFAULT_THEME.textColor ?? '#1e293b'
  const radius: string = theme.borderRadius ?? DEFAULT_THEME.borderRadius ?? '12px'
  const font: string = theme.fontFamily ?? 'system-ui, sans-serif'
  const headingFont: string = theme.headingFont ?? 'system-ui, sans-serif'
  const logoIcon: string = theme.logoIcon ?? DEFAULT_THEME.logoIcon ?? 'pi pi-code'

  return (
    <div
      className="theme-preview"
      style={{
        background: bg,
        color: text,
        borderRadius: radius,
        fontFamily: font,
      }}
    >
      {/* Browser Bar */}
      <div className="theme-preview-bar">
        <div className="theme-preview-dots">
          <span className="theme-preview-dot theme-preview-dot-red" />
          <span className="theme-preview-dot theme-preview-dot-yellow" />
          <span className="theme-preview-dot theme-preview-dot-green" />
        </div>
        <div className="theme-preview-url">
          <i className="pi pi-lock"></i>
          <span>anjar.dev</span>
        </div>
        <div className="theme-preview-actions">
          <i className="pi pi-ellipsis-h"></i>
        </div>
      </div>

      {/* Content */}
      <div className="theme-preview-content">
        {/* Navbar mini */}
        <div className="theme-preview-nav">
          <div className="theme-preview-logo">
            <i className={logoIcon} style={{ color: primary }}></i>
            <strong
              style={{
                fontFamily: headingFont,
                color: text,
              }}
            >
              Anjar
            </strong>
          </div>
          <div className="theme-preview-nav-links">
            <span style={{ color: text }}>Home</span>
            <span style={{ color: text }}>Works</span>
            <span style={{ color: text }}>Blog</span>
          </div>
        </div>

        {/* Hero mini */}
        <div className="theme-preview-hero">
          <h3
            className="theme-preview-title"
            style={{
              fontFamily: headingFont,
              color: text,
            }}
          >
            Hi, saya{' '}
            <span
              style={{
                background: `linear-gradient(135deg, ${primary}, ${accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Anjar
            </span>
          </h3>
          <p
            className="theme-preview-subtitle"
            style={{ color: text, opacity: 0.7 }}
          >
            Creative Professional
          </p>

          {/* Buttons */}
          <div className="theme-preview-buttons">
            <span
              className="theme-preview-btn"
              style={{
                background: primary,
                color: '#ffffff',
                borderRadius: radius,
              }}
            >
              Lihat Works
            </span>
            <span
              className="theme-preview-btn theme-preview-btn-outline"
              style={{
                border: `1px solid ${primary}`,
                color: primary,
                borderRadius: radius,
              }}
            >
              Hubungi
            </span>
          </div>
        </div>

        {/* Card mini */}
        <div
          className="theme-preview-card"
          style={{
            background: bg,
            border: `1px solid ${text}20`,
            borderRadius: radius,
          }}
        >
          <div
            className="theme-preview-card-image"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              borderRadius: `${radius} ${radius} 0 0`,
            }}
          >
            <i className="pi pi-image"></i>
          </div>
          <div className="theme-preview-card-body">
            <strong
              style={{
                fontFamily: headingFont,
                color: text,
              }}
            >
              Project Title
            </strong>
            <small style={{ color: text, opacity: 0.6 }}>
              Web Development
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemePreview