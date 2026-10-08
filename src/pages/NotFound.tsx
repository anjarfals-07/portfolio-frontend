// src/pages/NotFound.tsx
import SEO from '@/components/SEO'

/**
 * ⭐ 404 Netral
 *
 * Tidak bocorkan identitas platform:
 * - Tidak ada tombol "Kembali ke Home"
 * - Tidak ada link ke /explore, /login, /register
 * - Tidak ada navbar/footer platform
 *
 * Dipakai untuk:
 * - Root URL (/)
 * - Username tidak ditemukan (/user-ngasal)
 * - Username reserved (/login, /admin, dll via tenant route)
 * - Catch-all route
 */
function NotFound() {
  return (
    <>
      <SEO
        title="404 - Halaman Tidak Ditemukan"
        description="Halaman yang kamu cari tidak ditemukan."
        url="/404"
      />

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          background: '#f8fafc',
        }}
      >
        {/* ===== 404 Big ===== */}
        <div
          style={{
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: '#cbd5e1',
            marginBottom: '1.5rem',
            userSelect: 'none',
          }}
        >
          404
        </div>

        {/* ===== Title ===== */}
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 0.75rem 0',
          }}
        >
          Halaman Tidak Ditemukan
        </h1>

        {/* ===== Description ===== */}
        <p
          style={{
            color: '#64748b',
            fontSize: '0.95rem',
            maxWidth: '400px',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        </p>
      </div>
    </>
  )
}

export default NotFound