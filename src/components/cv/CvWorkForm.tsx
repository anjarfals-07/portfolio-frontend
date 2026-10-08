// ============================================================
// CvWorkForm — Form modal untuk create/edit work experience
// ============================================================

import { useEffect, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import { Dropdown } from 'primereact/dropdown'
import { InputSwitch } from 'primereact/inputswitch'
import {
  EMPLOYMENT_TYPES,
  type EmploymentType,
  type WorkExperience,
  type WorkExperienceFormData,
} from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvWorkFormProps {
  /** Modal visible */
  visible: boolean

  /** Callback untuk tutup modal */
  onHide: () => void

  /** Data untuk edit (null = create mode) */
  work?: WorkExperience | null

  /** Callback saat save */
  onSave: (data: WorkExperienceFormData) => void | Promise<void>

  /** Loading state saat save */
  saving?: boolean
}

/* ============================================================
   EMPTY FORM
   ============================================================ */

const EMPTY_FORM: WorkExperienceFormData = {
  company: '',
  position: '',
  employmentType: 'FULL_TIME',
  location: '',
  startDate: '',
  endDate: '',
  currentlyHere: false,
  description: '',
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

export default function CvWorkForm({
  visible,
  onHide,
  work,
  onSave,
  saving = false,
}: CvWorkFormProps) {
  const [form, setForm] = useState<WorkExperienceFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!work

  // ===== Sync form saat work berubah =====
  useEffect(() => {
    if (visible) {
      if (work) {
        setForm({
          company: work.company ?? '',
          position: work.position ?? '',
          employmentType: work.employmentType ?? 'FULL_TIME',
          location: work.location ?? '',
          startDate: work.startDate ?? '',
          endDate: work.endDate ?? '',
          currentlyHere: work.currentlyHere ?? false,
          description: work.description ?? '',
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  }, [visible, work])

  // ===== Update field =====
  const update = <K extends keyof WorkExperienceFormData>(
    key: K,
    value: WorkExperienceFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  // ===== Toggle currentlyHere =====
  const handleCurrentlyHereChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      currentlyHere: checked,
      endDate: checked ? '' : prev.endDate, // clear endDate kalau current
    }))
    setErrors((prev) => {
      if (!prev.endDate) return prev
      const next = { ...prev }
      delete next.endDate
      return next
    })
  }

  // ===== Validate =====
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.company.trim()) {
      errs.company = 'Nama perusahaan wajib diisi'
    }
    if (!form.position.trim()) {
      errs.position = 'Posisi wajib diisi'
    }
    if (!form.currentlyHere && form.startDate && form.endDate) {
      const s = new Date(form.startDate)
      const e = new Date(form.endDate)
      if (s > e) {
        errs.endDate = 'Tanggal selesai harus setelah tanggal mulai'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ===== Submit =====
  const handleSubmit = async () => {
    if (!validate()) return
    await onSave(form)
  }

  // ===== Footer =====
  const footer = (
    <div className="cv-form-footer">
      <Button
        label="Batal"
        severity="secondary"
        outlined
        onClick={onHide}
        disabled={saving}
        type="button"
      />
      <Button
        label={saving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSubmit}
        disabled={saving}
        type="button"
      />
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={isEdit ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Kerja'}
      footer={footer}
      modal
      draggable={false}
      resizable={false}
      className="cv-form-modal"
      style={{ width: '640px', maxWidth: '95vw' }}
      breakpoints={{ '768px': '95vw' }}
      closeOnEscape={!saving}
    >
      <div className="cv-scope cv-form">
        {/* Company + Position */}
        <div className="cv-form-grid">
          <div className="cv-form-field">
            <label className="cv-form-label">
              Perusahaan <span className="cv-form-required">*</span>
            </label>
            <InputText
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
              placeholder="PT Teknologi Maju"
              className={errors.company ? 'p-invalid w-full' : 'w-full'}
              maxLength={255}
              disabled={saving}
              autoFocus
            />
            {errors.company && (
              <small className="cv-form-error">
                <i className="pi pi-exclamation-circle" />
                {errors.company}
              </small>
            )}
          </div>

          <div className="cv-form-field">
            <label className="cv-form-label">
              Posisi <span className="cv-form-required">*</span>
            </label>
            <InputText
              value={form.position}
              onChange={(e) => update('position', e.target.value)}
              placeholder="Senior Backend Engineer"
              className={errors.position ? 'p-invalid w-full' : 'w-full'}
              maxLength={255}
              disabled={saving}
            />
            {errors.position && (
              <small className="cv-form-error">
                <i className="pi pi-exclamation-circle" />
                {errors.position}
              </small>
            )}
          </div>
        </div>

        {/* Employment Type + Location */}
        <div className="cv-form-grid">
          <div className="cv-form-field">
            <label className="cv-form-label">Tipe Kerja</label>
            <Dropdown
              value={form.employmentType}
              options={EMPLOYMENT_TYPES}
              onChange={(e) => update('employmentType', e.value as EmploymentType)}
              placeholder="Pilih tipe"
              className="w-full"
              disabled={saving}
            />
          </div>

          <div className="cv-form-field">
            <label className="cv-form-label">Lokasi</label>
            <InputText
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Jakarta / Remote"
              className="w-full"
              maxLength={200}
              disabled={saving}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="cv-form-grid">
          <div className="cv-form-field">
            <label className="cv-form-label">Tanggal Mulai</label>
            <Calendar
              value={toDate(form.startDate)}
              onChange={(e) => update('startDate', toIso(e.value as Date))}
              view="month"
              dateFormat="M yy"
              placeholder="Jan 2021"
              className="w-full"
              showIcon
              disabled={saving}
            />
          </div>

          <div className="cv-form-field">
            <label className="cv-form-label">Tanggal Selesai</label>
            <Calendar
              value={toDate(form.endDate)}
              onChange={(e) => update('endDate', toIso(e.value as Date))}
              view="month"
              dateFormat="M yy"
              placeholder="Des 2023"
              className={errors.endDate ? 'p-invalid w-full' : 'w-full'}
              showIcon
              disabled={saving || form.currentlyHere}
            />
            {errors.endDate && (
              <small className="cv-form-error">
                <i className="pi pi-exclamation-circle" />
                {errors.endDate}
              </small>
            )}
          </div>
        </div>

        {/* Currently Here Toggle */}
        <div className="cv-form-field">
          <div className="cv-form-toggle-row">
            <InputSwitch
              inputId="currentlyHere"
              checked={form.currentlyHere}
              onChange={(e) => handleCurrentlyHereChange(e.value ?? false)}
              disabled={saving}
            />
            <label
              htmlFor="currentlyHere"
              className={`cv-form-toggle-label ${form.currentlyHere ? 'is-on' : ''}`}
            >
              <i className="pi pi-briefcase" />
              Masih bekerja di sini
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="cv-form-field">
          <label className="cv-form-label">Deskripsi</label>
          <InputTextarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Tanggung jawab, pencapaian, atau project yang dikerjakan..."
            rows={4}
            autoResize
            className="w-full"
            disabled={saving}
          />
        </div>
      </div>
    </Dialog>
  )
}