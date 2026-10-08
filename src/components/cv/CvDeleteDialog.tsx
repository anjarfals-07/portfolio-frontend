// ============================================================
// CvDeleteDialog — Custom dialog pakai React Portal
// ============================================================
// Ganti PrimeReact <Dialog> dengan createPortal + inline styles.
//
// Alasan:
// - PrimeReact Dialog kadang tidak keluar dari stacking context
//   parent (terutama dengan overflow: clip, transform, filter)
// - Bug "appendTo" yang tidak bekerja di beberapa versi
// - Konflik z-index dengan sibling CSS
//
// Solusi: createPortal langsung ke <body> + z-index maksimum.
// ============================================================

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  visible: boolean
  filename?: string
  deleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** z-index maksimum 32-bit signed int */
const MAX_Z_INDEX = 2147483647

export default function CvDeleteDialog({
  visible,
  filename,
  deleting = false,
  onConfirm,
  onCancel,
}: Props) {
  /* ------------------------------------------------------------
     LOCK SCROLL saat dialog terbuka
     ------------------------------------------------------------ */
  useEffect(() => {
    if (!visible) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight

    // Hitung scrollbar width — biar layout tidak "geser" saat scroll hilang
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [visible])

  /* ------------------------------------------------------------
     HANDLE ESC
     ------------------------------------------------------------ */
  useEffect(() => {
    if (!visible) return

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !deleting) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [visible, deleting, onCancel])

  /* ------------------------------------------------------------
     RENDER — tidak render kalau tidak visible
     ------------------------------------------------------------ */
  if (!visible) return null

  return createPortal(
    <div
      // ⭐ OVERLAY
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: MAX_Z_INDEX,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        animation: 'cvDialogFadeIn 0.15s ease-out',
      }}
      onClick={deleting ? undefined : onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-delete-title"
    >
      <div
        // ⭐ DIALOG PANEL
        style={{
          position: 'relative',
          background: '#ffffff',
          borderRadius: '14px',
          maxWidth: '440px',
          width: '100%',
          padding: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          borderTop: '3px solid #ef4444',
          animation: 'cvDialogScaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ===== HEADER ===== */}
        <div
          style={{
            display: 'flex',
            gap: '0.85rem',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'grid',
              placeItems: 'center',
              fontSize: '1.25rem',
              flexShrink: 0,
            }}
          >
            <i className="pi pi-exclamation-triangle" />
          </div>

          <div style={{ minWidth: 0 }}>
            <h3
              id="cv-delete-title"
              style={{
                fontSize: '1.0625rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              Konfirmasi Hapus
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: '#6b7280',
                margin: 0,
                marginTop: '0.2rem',
              }}
            >
              Tindakan ini tidak bisa dibatalkan
            </p>
          </div>
        </div>

        {/* ===== BODY ===== */}
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#1f2937',
            lineHeight: 1.6,
            margin: '0 0 1rem',
          }}
        >
          Hapus CV saat ini? Kamu bisa upload atau generate ulang kapan saja.
        </p>

        {filename && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.55rem',
              padding: '0.7rem 0.9rem',
              background: '#f9fafb',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#6b7280',
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
              wordBreak: 'break-all',
              marginBottom: '1.25rem',
              border: '1px solid #e5e7eb',
            }}
          >
            <i
              className="pi pi-file-pdf"
              style={{ color: '#ef4444', flexShrink: 0 }}
            />
            <span>{filename}</span>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: '1.5px solid #e5e7eb',
              background: '#ffffff',
              color: '#374151',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '9px',
              border: 'none',
              background: deleting ? '#f87171' : '#ef4444',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 700,
              fontFamily: 'inherit',
              cursor: deleting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 4px 12px -4px rgba(239, 68, 68, 0.5)',
            }}
          >
            <i
              className={deleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'}
              style={{ fontSize: '0.85rem' }}
            />
            <span>{deleting ? 'Menghapus...' : 'Ya, Hapus'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}