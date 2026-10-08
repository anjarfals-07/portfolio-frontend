// ============================================================
// useCvRenderData — Hook fetch semua data untuk render CV
// ============================================================

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CvRenderData } from '@/services/cvHtmlRenderer'
import type { Profile } from '@/types/profile'
import type { WorkExperience, Education } from '@/types/cv'
import type { Experience } from '@/types/experience'
import type { Project } from '@/types/project'
import type { SkillGrouped } from '@/types/skill'
import type { TechStack } from '@/types/techStack'

/* ============================================================
   SERVICE IMPORTS
   ============================================================ */

import { profileService } from '@/services/profileService'
import { workExperienceService } from '@/services/workExperienceService'
import { educationService } from '@/services/educationService'
import { experienceService } from '@/services/experienceService'
import { projectService } from '@/services/projectService'
import { skillService } from '@/services/skillService'
import { techStackService } from '@/services/techStackService'

/* ============================================================
   TYPES
   ============================================================ */

export interface UseCvRenderDataOptions {
  profile?: Profile | null
  autoFetch?: boolean
  onError?: (err: Error) => void
  onSuccess?: (data: CvRenderData) => void
}

export interface UseCvRenderDataResult {
  data: CvRenderData | null
  loading: boolean
  refreshing: boolean
  error: string | null
  refresh: () => Promise<void>
  clear: () => void
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const EMPTY_SKILL_GROUPS: SkillGrouped = {}
const EMPTY_ARRAY: never[] = []

/* ============================================================
   HOOK
   ============================================================ */

export function useCvRenderData(
  options: UseCvRenderDataOptions = {}
): UseCvRenderDataResult {
  const {
    profile: externalProfile,
    autoFetch = true,
    onError,
    onSuccess,
  } = options

  const [data, setData] = useState<CvRenderData | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mountedRef = useRef(true)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      abortRef.current?.abort()
    }
  }, [])

  const fetchAll = useCallback(
    async (isRefresh: boolean) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        // ===== Parallel fetch =====
        // ⭐ Method yang benar:
        //   profileService.get()
        //   workExperienceService.list()
        //   educationService.list()
        //   experienceService.getAll()
        //   projectService.getAll()
        //   skillService.getGrouped()
        //   techStackService.getAll()
        const [
          profileResult,
          workExperiences,
          educations,
          experiences,
          projects,
          skills,
          techStack,
        ] = await Promise.all([
          externalProfile
            ? Promise.resolve(externalProfile)
            : safeCall(() => profileService.get(), null),

          safeCall(() => workExperienceService.list(), EMPTY_ARRAY),
          safeCall(() => educationService.list(), EMPTY_ARRAY),

          safeCall(() => experienceService.getAll(), EMPTY_ARRAY),   // ⭐ FIX
          safeCall(() => projectService.getAll(), EMPTY_ARRAY),      // ⭐ FIX

          safeCall(() => skillService.getGrouped(), EMPTY_SKILL_GROUPS),

          safeCall(() => techStackService.getAll(), EMPTY_ARRAY),    // ⭐ FIX
        ])

        if (controller.signal.aborted || !mountedRef.current) return

        if (!profileResult) {
          throw new Error(
            'Profile tidak ditemukan. Silakan lengkapi profile dulu.'
          )
        }

        const result: CvRenderData = {
          profile: profileResult,
          workExperiences: normalizeArray<WorkExperience>(workExperiences),
          educations: normalizeArray<Education>(educations),
          experiences: normalizeArray<Experience>(experiences),
          projects: normalizeArray<Project>(projects),
          skills: (skills as SkillGrouped) ?? EMPTY_SKILL_GROUPS,
          techStack: normalizeArray<TechStack>(techStack),
        }

        setData(result)
        onSuccess?.(result)
      } catch (err) {
        if (controller.signal.aborted || !mountedRef.current) return

        const message =
          err instanceof Error ? err.message : 'Gagal memuat data CV'
        setError(message)
        onError?.(err instanceof Error ? err : new Error(message))
      } finally {
        if (mountedRef.current && !controller.signal.aborted) {
          setLoading(false)
          setRefreshing(false)
        }
      }
    },
    [externalProfile, onError, onSuccess]
  )

  useEffect(() => {
    if (!autoFetch) return
    fetchAll(false)
  }, [autoFetch, fetchAll])

  const refresh = useCallback(async () => {
    await fetchAll(true)
  }, [fetchAll])

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setData(null)
    setError(null)
    setLoading(false)
    setRefreshing(false)
  }, [])

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
    clear,
  }
}

/* ============================================================
   HELPERS
   ============================================================ */

async function safeCall<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    const result = await fn()
    return result ?? fallback
  } catch (err) {
    console.warn('[useCvRenderData] service call failed:', err)
    return fallback
  }
}

function normalizeArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object' && 'data' in value) {
    const inner = (value as { data: unknown }).data
    if (Array.isArray(inner)) return inner as T[]
  }
  return []
}