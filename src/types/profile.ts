// ============================================================
// Profile Types
// ============================================================
// Sinkron dengan backend ProfileDTO.java (v3)
// ============================================================

import type { CvPreferences, CvSource } from './cv'

/* ============================================================
   SOCIAL LINK
   ============================================================ */

export interface SocialLink {
  icon: string
  url: string
  label: string
}

/* ============================================================
   PROFILE
   ============================================================ */

export interface Profile {
  // ===== Identitas =====
  id: number
  fullName: string
  role: string | null
  bio: string | null
  shortBio: string | null

  // ===== Kontak =====
  email: string | null
  phone?: string | null
  city?: string | null
  location: string | null

  // ===== ⭐ Personal Info =====
  religion?: string | null
  maritalStatus?: string | null
  birthDate?: string | null      // ISO date: "1995-05-15"
  birthPlace?: string | null
  nationality?: string | null
  gender?: string | null

  // ===== Media =====
  avatarUrl: string | null

  // ===== CV =====
  cvUrl: string | null
  cvSource?: CvSource | null
  cvGeneratedAt?: string | null

  // ===== CV Preferences (JSONB dari backend) =====
  cvPreferences?: CvPreferences | null

  // ===== Status =====
  availableForWork: boolean

  // ===== Socials =====
  socials: SocialLink[] | null

  // ===== Timestamp =====
  updatedAt: string
}

/* ============================================================
   HELPER TYPES
   ============================================================ */

/**
 * Profile form state — dipakai di ManageProfile.
 * Semua field string (bukan null) biar gampang di-input.
 */
export interface ProfileFormState {
  // Identitas
  fullName: string
  role: string
  bio: string
  shortBio: string

  // Kontak
  email: string
  phone: string
  city: string
  location: string

  // Personal
  religion: string
  maritalStatus: string
  birthDate: string
  birthPlace: string
  nationality: string
  gender: string

  // Media
  avatarUrl: string
  cvUrl: string

  // Status
  availableForWork: boolean

  // Socials
  socials: SocialLink[]
}

/**
 * Partial profile untuk update.
 */
export type ProfileUpdatePayload = Partial<
  Omit<Profile, 'id' | 'updatedAt' | 'cvSource' | 'cvGeneratedAt'>
>

/* ============================================================
   LABEL MAPS — untuk dropdown di form
   ============================================================ */

export interface SelectOption<T = string> {
  label: string
  value: T
}

export const MARITAL_STATUS_OPTIONS: SelectOption[] = [
  { value: 'SINGLE',   label: 'Belum Menikah' },
  { value: 'MARRIED',  label: 'Menikah' },
  { value: 'DIVORCED', label: 'Cerai' },
  { value: 'WIDOWED',  label: 'Janda / Duda' },
]

export const GENDER_OPTIONS: SelectOption[] = [
  { value: 'MALE',   label: 'Laki-laki' },
  { value: 'FEMALE', label: 'Perempuan' },
  { value: 'OTHER',  label: 'Lainnya' },
]

export const RELIGION_OPTIONS: SelectOption[] = [
  { value: 'Islam',     label: 'Islam' },
  { value: 'Kristen',   label: 'Kristen' },
  { value: 'Katolik',   label: 'Katolik' },
  { value: 'Hindu',     label: 'Hindu' },
  { value: 'Budha',     label: 'Budha' },
  { value: 'Konghucu',  label: 'Konghucu' },
  { value: 'Lainnya',   label: 'Lainnya' },
]

export const NATIONALITY_OPTIONS: SelectOption[] = [
  { value: 'Indonesia',     label: 'Indonesia' },
  { value: 'Malaysia',      label: 'Malaysia' },
  { value: 'Singapore',     label: 'Singapore' },
  { value: 'Australia',     label: 'Australia' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom',label: 'United Kingdom' },
  { value: 'Japan',         label: 'Japan' },
  { value: 'Other',         label: 'Other' },
]

/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */

/**
 * Convert `Profile` → `ProfileFormState`.
 */
export function toFormState(profile: Profile): ProfileFormState {
  return {
    fullName: profile.fullName ?? '',
    role: profile.role ?? '',
    bio: profile.bio ?? '',
    shortBio: profile.shortBio ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    city: profile.city ?? '',
    location: profile.location ?? '',

    // Personal
    religion: profile.religion ?? '',
    maritalStatus: profile.maritalStatus ?? '',
    birthDate: profile.birthDate ?? '',
    birthPlace: profile.birthPlace ?? '',
    nationality: profile.nationality ?? '',
    gender: profile.gender ?? '',

    avatarUrl: profile.avatarUrl ?? '',
    cvUrl: profile.cvUrl ?? '',
    availableForWork: profile.availableForWork ?? true,
    socials: profile.socials ?? [],
  }
}

/**
 * Convert `ProfileFormState` → partial payload.
 * Buang field kosong biar payload ringan.
 */
export function toUpdatePayload(
  form: ProfileFormState
): ProfileUpdatePayload {
  const payload: ProfileUpdatePayload = {}

  if (form.fullName.trim()) payload.fullName = form.fullName.trim()
  if (form.role.trim()) payload.role = form.role.trim()
  if (form.bio.trim()) payload.bio = form.bio.trim()
  if (form.shortBio.trim()) payload.shortBio = form.shortBio.trim()
  if (form.email.trim()) payload.email = form.email.trim()
  if (form.phone.trim()) payload.phone = form.phone.trim()
  if (form.city.trim()) payload.city = form.city.trim()
  if (form.location.trim()) payload.location = form.location.trim()

  // Personal
  if (form.religion.trim()) payload.religion = form.religion.trim()
  if (form.maritalStatus.trim()) payload.maritalStatus = form.maritalStatus.trim()
  if (form.birthDate.trim()) payload.birthDate = form.birthDate.trim()
  if (form.birthPlace.trim()) payload.birthPlace = form.birthPlace.trim()
  if (form.nationality.trim()) payload.nationality = form.nationality.trim()
  if (form.gender.trim()) payload.gender = form.gender.trim()

  if (form.avatarUrl.trim()) payload.avatarUrl = form.avatarUrl.trim()
  if (form.cvUrl.trim()) payload.cvUrl = form.cvUrl.trim()

  payload.availableForWork = form.availableForWork
  payload.socials = form.socials

  return payload
}