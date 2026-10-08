// ============================================================
// CvPersonalInfoForm — Form untuk edit data personal profile
// ============================================================
// Field:
// - religion, maritalStatus, birthDate, birthPlace, nationality, gender
// ============================================================

import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { Skeleton } from 'primereact/skeleton'
import {
  GENDER_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  NATIONALITY_OPTIONS,
  RELIGION_OPTIONS,
} from '@/types/profile'
import type { Profile } from '@/types/profile'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface PersonalInfoData {
  religion: string
  maritalStatus: string
  birthDate: string
  birthPlace: string
  nationality: string
  gender: string
}

export interface CvPersonalInfoFormProps {
  /** Profile data (dari parent) */
  profile: Profile | null

  /** Callback saat save */
  onSave: (data: PersonalInfoData) => void | Promise<void>

  /** Loading state */
  saving?: boolean

  /** Loading data dari parent */
  loading?: boolean

  /** Disabled state */
  disabled?: boolean

  /** Hide header */
  hideHeader?: boolean
}

/* ============================================================
   EMPTY
   ============================================================ */

const EMPTY_DATA: PersonalInfoData = {
  religion: '',
  maritalStatus: '',
  birthDate: '',
  birthPlace: '',
  nationality: '',
  gender: '',
}

/* ============================================================
   HELPERS
   ============================================================ */

function toDate(iso: string | null | undefined): Date | null {
  if (!iso) return null
  try {
    return new Date(iso)
  } catch {
    return null
  }
}

function toIso(date: Date | null | undefined): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvPersonalInfoForm({
  profile,
  onSave,
  saving = false,
  loading = false,
  disabled = false,
  hideHeader = false,
}: CvPersonalInfoFormProps) {
  const [form, setForm] = useState<PersonalInfoData>(EMPTY_DATA)

  // ===== Sync form saat profile berubah =====
  useEffect(() => {
    if (profile) {
      setForm({
        religion: profile.religion ?? '',
        maritalStatus: profile.maritalStatus ?? '',
        birthDate: profile.birthDate ?? '',
        birthPlace: profile.birthPlace ?? '',
        nationality: profile.nationality ?? '',
        gender: profile.gender ?? '',
      })
    } else {
      setForm(EMPTY_DATA)
    }
  }, [profile])

  // ===== Update field =====
  const update = <K extends keyof PersonalInfoData>(
    key: K,
    value: PersonalInfoData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ===== Submit =====
  const handleSubmit = async () => {
    await onSave(form)
  }

  // ===== Loading skeleton =====
  if (loading) {
    return (
      <div className="cv-scope cv-personal">
        <Skeleton height="3rem" borderRadius="8px" />
        <Skeleton height="3rem" borderRadius="8px" />
        <Skeleton height="3rem" borderRadius="8px" />
      </div>
    )
  }

  return (
    <div className="cv-scope cv-personal">
      {/* ===== Header ===== */}
      {!hideHeader && (
        <div className="cv-personal-header">
          <div className="cv-personal-header-icon">
            <i className="pi pi-id-card" />
          </div>
          <div className="cv-personal-header-text">
            <strong>Data Pribadi</strong>
            <span className="cv-text-xs cv-text-muted">
              Informasi personal yang tampil di CV
            </span>
          </div>
        </div>
      )}

      {/* ===== Form ===== */}
      <div className="cv-personal-form">
        {/* Birth Place + Birth Date */}
        <div className="cv-form-grid">
          <div className="cv-form-field">
            <label className="cv-form-label">Tempat Lahir</label>
            <InputText
              value={form.birthPlace}
              onChange={(e) => update('birthPlace', e.target.value)}
              placeholder="Jakarta"
              className="w-full"
              maxLength={200}
              disabled={disabled || saving}
            />
          </div>

          <div className="cv-form-field">
            <label className="cv-form-label">Tanggal Lahir</label>
            <Calendar
              value={toDate(form.birthDate)}
              onChange={(e) => update('birthDate', toIso(e.value as Date))}
              view="date"
              dateFormat="dd M yy"
              placeholder="Pilih tanggal"
              className="w-full"
              showIcon
              disabled={disabled || saving}
              maxDate={new Date()}
            />
          </div>
        </div>

        {/* Religion + Marital Status */}
        <div className="cv-form-grid">
          <div className="cv-form-field">
            <label className="cv-form-label">Agama</label>
            <Dropdown
              value={form.religion}
              options={RELIGION_OPTIONS}
              onChange={(e) => update('religion', e.value)}
              placeholder="Pilih agama"
              className="w-full"
              editable
              disabled={disabled || saving}
            />
          </div>

          <div className="cv-form-field">
            <label className="cv-form-label">Status Pernikahan</label>
            <Dropdown
              value={form.maritalStatus}
              options={MARITAL_STATUS_OPTIONS}
              onChange={(e) => update('maritalStatus', e.value)}
              placeholder="Pilih status"
              className="w-full"
              disabled={disabled || saving}
            />
          </div>
        </div>

        {/* Nationality + Gender */}
        <div className="cv-form-grid">
          <div className="cv-form-field">
            <label className="cv-form-label">Kewarganegaraan</label>
            <Dropdown
              value={form.nationality}
              options={NATIONALITY_OPTIONS}
              onChange={(e) => update('nationality', e.value)}
              placeholder="Pilih negara"
              className="w-full"
              editable
              disabled={disabled || saving}
            />
          </div>

          <div className="cv-form-field">
            <label className="cv-form-label">Jenis Kelamin</label>
            <Dropdown
              value={form.gender}
              options={GENDER_OPTIONS}
              onChange={(e) => update('gender', e.value)}
              placeholder="Pilih gender"
              className="w-full"
              disabled={disabled || saving}
            />
          </div>
        </div>
      </div>

      {/* ===== Footer Actions ===== */}
      <div className="cv-personal-actions">
        <Button
          label={saving ? 'Menyimpan...' : 'Simpan Data Pribadi'}
          icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
          onClick={handleSubmit}
          disabled={disabled || saving}
          type="button"
        />
      </div>

      {/* ===== Hint ===== */}
      <div className="cv-personal-hint">
        <i className="pi pi-info-circle" />
        <span>
          Data ini muncul di section <strong>Data Pribadi</strong> pada CV.
          Kosongkan field yang tidak ingin ditampilkan.
        </span>
      </div>
    </div>
  )
}