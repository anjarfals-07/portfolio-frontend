/* ============================================================
   BACKUP TYPES
   ============================================================ */

export interface DatabaseStatus {
  connected: boolean
  version?: string
  databaseName?: string
  host?: string
  port?: number
  backupMode: 'DOCKER' | 'LOCAL'
  errorMessage?: string
  checkedAt?: string
}

export interface BackupMetadata {
  filename: string
  sizeBytes: number
  contentType: string
  createdAt: string
  databaseName: string
  mode: string
  message: string
}

export interface BackupProgress {
  phase: 'idle' | 'generating' | 'downloading' | 'done' | 'error'
  message?: string
  percent?: number
}

/* ============================================================
   RESTORE TYPES
   ============================================================ */

export type RestorePhase =
  | 'BACKUP_CURRENT'
  | 'VALIDATING'
  | 'RESTORING'
  | 'VERIFYING'
  | 'DONE'
  | 'FAILED'

export interface RestoreResult {
  status: 'SUCCESS' | 'FAILED'
  filename: string
  sizeBytes: number
  safetyBackupFilename?: string
  durationMs: number
  tablesRestored: number
  userCount: number
  restoredAt: string
  message: string
}

export interface RestoreStatus {
  phase: RestorePhase
  running: boolean
  percent: number
  message: string
  updatedAt: string
}

export interface RestoreProgress {
  phase: 'idle' | 'uploading' | 'restoring' | 'done' | 'error'
  percent: number
  message?: string
}