// src/hooks/useScrollSpy.ts
import { useEffect, useState } from 'react'

/**
 * Scroll Spy Hook — deteksi section mana yang sedang di-view.
 *
 * Pakai scroll event listener + getBoundingClientRect()
 * → Tidak terpengaruh `overflow` di parent.
 *
 * @param sectionIds — Array ID section (misal: ['home', 'projects', 'about'])
 * @param options    — Options
 * @returns activeSectionId — ID section yang sedang di-view
 */
export function useScrollSpy(
  sectionIds: string[],
  options: {
    enabled?: boolean
    /** Offset dari top viewport (px). Default: 120 (di bawah navbar) */
    offset?: number
  } = {}
): string | null {
  const { enabled = true, offset = 120 } = options
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const idsKey = sectionIds.join('|')

  useEffect(() => {
    if (!enabled) {
      setActiveSection(null)
      return
    }

    // ⭐ Fungsi utama: cek section mana yang sedang di-view
    const updateActiveSection = () => {
      let current: string | null = null

      // Iterasi dari bawah ke atas, cari section yang top-nya sudah lewat offset
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i]
        const el = document.getElementById(id)
        if (!el) continue

        const rect = el.getBoundingClientRect()

        // Section "active" kalau:
        // - Top-nya sudah lewat offset (di atas), dan
        // - Bottom-nya masih di bawah offset (belum lewat)
        if (rect.top <= offset && rect.bottom > offset) {
          current = id
          break
        }
      }

      // Fallback: kalau tidak ada yang match, ambil section pertama
      // yang top-nya masih di bawah offset (artinya belum scroll)
      if (!current) {
        for (let i = 0; i < sectionIds.length; i++) {
          const el = document.getElementById(sectionIds[i])
          if (!el) continue
          const rect = el.getBoundingClientRect()
          if (rect.top > offset) {
            current = sectionIds[i]
            break
          }
        }
      }

      // Default fallback
      if (!current) current = sectionIds[0]

      setActiveSection((prev) => {
        if (prev !== current) {
          // Debug log (uncomment kalau butuh)
          // console.log('🔄 Active section:', current)
        }
        return current
      })
    }

    // Initial check — delay dikit biar layout settle
    const timeout = setTimeout(updateActiveSection, 100)

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection, { passive: true })

    return () => {
      clearTimeout(timeout)
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, enabled, offset])

  return activeSection
}