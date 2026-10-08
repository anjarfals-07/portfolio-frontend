// src/constants/reservedUsernames.ts

/**
 * Mirror dari backend ReservedUsernames.java.
 * Sinkron dengan backend — kalau backend update, update juga di sini.
 *
 * ⚠️ Semua lowercase. Matching pakai toLowerCase() di isReservedUsername().
 */
export const RESERVED_USERNAMES = new Set<string>([
  // ===== Auth & onboarding =====
  'login', 'register', 'logout', 'signin', 'signup', 'sign-out',
  'pending-approval', 'forgot-password', 'reset-password',
  'verify-email', 'verify', 'onboarding', 'activate',

  // ===== Payment =====
  'payment', 'payments', 'checkout', 'billing', 'invoice',
  'payment-callback', 'callback', 'webhook',

  // ===== Public routes =====
  'explore', 'landing', 'home', 'index',
  'about', 'about-us', 'contact', 'contact-us',
  'blog', 'blogs', 'blog-post', 'blog-posts', 'post', 'posts',
  'project', 'projects', 'portfolio', 'portfolios',
  'works', 'work', 'pricing', 'features', 'faq',
  'help', 'support', 'docs', 'documentation',

  // ===== Dashboard & admin =====
  'dashboard', 'admin', 'administrator', 'owner', 'manage', 'management',
  'settings', 'setting', 'config', 'configuration', 'preferences',
  'users', 'user', 'profile', 'account', 'accounts',
  'inbox', 'messages', 'notifications', 'analytics',

  // ===== System & infra =====
  'api', 'www', 'mail', 'ftp', 'smtp', 'pop', 'imap',
  'cdn', 'static', 'assets', 'public', 'private', 'media',
  'upload', 'uploads', 'download', 'downloads', 'files',
  'app', 'apps', 'mobile', 'web', 'admin-panel',
  'health', 'healthz', 'status', 'metrics',
  'sitemap', 'robots', 'manifest', 'favicon',

  // ===== Legal =====
  'terms', 'privacy', 'policy', 'cookies', 'legal',
  'tos', 'dmca', 'gdpr', 'license',

  // ===== Common words =====
  'test', 'demo', 'example', 'sample', 'null', 'undefined',
  'system', 'root', 'moderator', 'administrator',
  'me', 'my', 'self', 'new', 'create', 'edit', 'delete',
  'search', 'explore', 'discover',

  // ===== Reserved branding =====
  // 'muhammad-anjar',
])

/**
 * Cek apakah username reserved.
 * - Case-insensitive
 * - Trim whitespace
 */
export function isReservedUsername(username: string): boolean {
  if (!username) return false
  return RESERVED_USERNAMES.has(username.toLowerCase().trim())
}