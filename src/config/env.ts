// src/config/env.ts
export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  APP_ENV: import.meta.env.MODE || 'development',
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
}