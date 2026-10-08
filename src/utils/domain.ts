// src/utils/domain.ts

/**
 * Helper untuk deteksi domain platform vs custom domain tenant.
 *
 * Contoh:
 * - localhost:5173                    → platform (dev)
 * - 192.168.1.10:5173                 → platform (dev LAN)
 * - platform.com                      → platform
 * - app.platform.com                  → platform
 * - www.platform.com                  → platform
 * - badru.com                         → custom domain tenant
 * - www.badru.com                     → custom domain tenant
 */

/**
 * Daftar domain platform — sesuaikan dengan domain Anda.
 * Format: lowercase, tanpa protocol, tanpa port.
 */
const PLATFORM_DOMAINS = [
  'localhost',
  '127.0.0.1',
  'platform.com',        // ⚠️ ganti dengan domain Anda
  'app.platform.com',    // ⚠️ ganti dengan domain Anda
  'www.platform.com',    // ⚠️ ganti dengan domain Anda
]

/**
 * Cek apakah host adalah platform (bukan custom domain tenant).
 */
export function isPlatformDomain(host: string): boolean {
  const clean = host.toLowerCase().split(':')[0] // hilangkan port

  // Cek exact match
  if (PLATFORM_DOMAINS.includes(clean)) return true

  // Cek subdomain platform (misal: staging.platform.com)
  return PLATFORM_DOMAINS.some(
    (d) => clean.endsWith(`.${d}`) && d !== 'localhost'
  )
}

/**
 * Cek apakah host adalah localhost / IP lokal.
 */
export function isLocalhost(host: string): boolean {
  const clean = host.toLowerCase().split(':')[0]
  return (
    clean === 'localhost' ||
    clean === '127.0.0.1' ||
    clean === '0.0.0.0' ||
    /^192\.168\.\d+\.\d+$/.test(clean) ||
    /^10\.\d+\.\d+\.\d+$/.test(clean) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(clean)
  )
}

/**
 * Cek apakah host adalah custom domain tenant (bukan platform).
 */
export function isCustomDomain(host: string): boolean {
  return !isPlatformDomain(host) && !isLocalhost(host)
}

/**
 * Ambil hostname dari window.location (browser only).
 */
export function getCurrentHost(): string {
  if (typeof window === 'undefined') return ''
  return window.location.hostname
}

/**
 * Ambil host lengkap (hostname + port) dari window.location.
 */
export function getCurrentHostWithPort(): string {
  if (typeof window === 'undefined') return ''
  return window.location.host
}

/**
 * Ambil protocol dari window.location.
 */
export function getCurrentProtocol(): string {
  if (typeof window === 'undefined') return 'http:'
  return window.location.protocol
}

/**
 * Cek apakah development mode.
 */
export function isDev(): boolean {
  if (typeof window === 'undefined') return false
  return (
    isLocalhost(window.location.hostname) ||
    window.location.protocol === 'http:'
  )
}

/**
 * Get origin (protocol + host) — untuk absolute URL.
 */
export function getOrigin(): string {
  if (typeof window === 'undefined') return ''
  return window.location.origin
}

/**
 * Normalize domain — lowercase, trim, hilangkan protocol & path.
 */
export function normalizeDomain(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '')  // hilangkan protocol
    .replace(/^www\./, '')        // hilangkan www
    .replace(/\/.*$/, '')         // hilangkan path
    .split(':')[0]                // hilangkan port
}

/**
 * Validasi format domain.
 */
export function isValidDomain(input: string): boolean {
  const clean = normalizeDomain(input)
  // Format: example.com, sub.example.com, dst
  return /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(clean)
}