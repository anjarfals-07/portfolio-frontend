// ============================================================
// CvEducationForm — Modern Centered Scrollable Form Modal
// ============================================================

import { useEffect, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Calendar } from 'primereact/calendar'
import type { Education, EducationFormData } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvEducationFormProps {
  visible: boolean
  onHide: () => void
  education?: Education | null
  onSave: (data: EducationFormData) => void | Promise<void>
  saving?: boolean
}

/* ============================================================
   EMPTY FORM
   ============================================================ */

const EMPTY_FORM: EducationFormData = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  gpa: '',
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

export default function CvEducationForm({
  visible,
  onHide,
  education,
  onSave,
  saving = false,
}: CvEducationFormProps) {
  const [form, setForm] = useState<EducationFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEdit = !!education

  useEffect(() => {
    if (visible) {
      if (education) {
        setForm({
          institution: education.institution ?? '',
          degree: education.degree ?? '',
          fieldOfStudy: education.fieldOfStudy ?? '',
          startDate: education.startDate ?? '',
          endDate: education.endDate ?? '',
          gpa: education.gpa ?? '',
          description: education.description ?? '',
        })
      } else {
        setForm(EMPTY_FORM)
      }
      setErrors({})
    }
  }, [visible, education])

  const update = <K extends keyof EducationFormData>(
    key: K,
    value: EducationFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.institution.trim()) {
      errs.institution = 'Nama institusi wajib diisi'
    }
    if (form.startDate && form.endDate) {
      const s = new Date(form.startDate)
      const e = new Date(form.endDate)
      if (s > e) {
        errs.endDate = 'Tanggal selesai harus setelah tanggal mulai'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    await onSave(form)
  }

  const footer = (
    <div className="cv-form-footer">
      <Button
        label="Batal"
        severity="secondary"
        outlined
        onClick={onHide}
        disabled={saving}
        type="button"
        className="cv-form-footer-btn"
      />
      <Button
        label={saving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSubmit}
        disabled={saving}
        type="button"
        className="cv-form-footer-btn cv-form-footer-btn-primary"
      />
    </div>
  )

  const header = (
    <div className="cv-dialog-header">
      <div className="cv-dialog-header-icon">
        <i className="pi pi-graduation-cap" />
      </div>
      <div className="cv-dialog-header-text">
        <strong>{isEdit ? 'Edit Pendidikan' : 'Tambah Pendidikan'}</strong>
        <span>
          {isEdit
            ? 'Perbarui data riwayat pendidikan'
            : 'Lengkapi data riwayat pendidikan kamu'}
        </span>
      </div>
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={header}
      footer={footer}
      modal
      draggable={false}
      resizable={false}
      className="cv-form-modal cv-dialog-education"
      style={{
        width: '520px',
        maxWidth: 'calc(100vw - 2rem)',
      }}
      contentStyle={{
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(85vh - 130px)',
        overflowY: 'auto',
        padding: '1.25rem 1.5rem',
      }}
      appendTo={typeof document !== 'undefined' ? document.body : undefined}
      closeOnEscape={!saving}
      dismissableMask={!saving}
    >
      <div className="cv-scope cv-form">
        {/* Institution */}
        <div className="cv-form-field">
          <label className="cv-form-label">
            Institusi <span className="cv-form-required">*</span>
          </label>
          <InputText
            value={form.institution}
            onChange={(e) => update('institution', e.target.value)}
            placeholder="Universitas Indonesia"
            className={errors.institution ? 'p-invalid w-full' : 'w-full'}
            maxLength={255}
            disabled={saving}
            autoFocus
          />
          {errors.institution && (
            <small className="cv-form-error">
              <i className="pi pi-exclamation-circle" />
              {errors.institution}
            </small>
          )}
        </div>

        {/* Degree + Field */}
        <div className="cv-form-grid">
          <div className="cv-form-field">
            <label className="cv-form-label">Jenjang</label>
            <InputText
              value={form.degree}
              onChange={(e) => update('degree', e.target.value)}
              placeholder="S1"
              className="w-full"
              maxLength={100}
              disabled={saving}
            />
          </div>

          <div className="cv-form-field">
            <label className="cv-form-label">Jurusan</label>
            <InputText
              value={form.fieldOfStudy}
              onChange={(e) => update('fieldOfStudy', e.target.value)}
              placeholder="Ilmu Komputer"
              className="w-full"
              maxLength={255}
              disabled={saving}
            />
          </div>
        </div>

        {/* Dates */}
<div className="cv-form-grid">
  <div className="cv-form-field">
    <label className="cv-form-label">Mulai</label>
    <Calendar
      value={toDate(form.startDate)}
      onChange={(e) => update('startDate', toIso(e.value as Date))}
      view="month"
      dateFormat="M yy"
      placeholder="Sep 2013"
      className="w-full"
      showIcon
      disabled={saving}
      panelClassName="cv-datepicker-panel"
      appendTo={typeof document !== 'undefined' ? document.body : undefined}
    />
  </div>

  <div className="cv-form-field">
    <label className="cv-form-label">Selesai</label>
    <Calendar
      value={toDate(form.endDate)}
      onChange={(e) => update('endDate', toIso(e.value as Date))}
      view="month"
      dateFormat="M yy"
      placeholder="Agu 2017"
      className={errors.endDate ? 'p-invalid w-full' : 'w-full'}
      showIcon
      disabled={saving}
      panelClassName="cv-datepicker-panel"
      appendTo={typeof document !== 'undefined' ? document.body : undefined}
    />
    {errors.endDate && (
      <small className="cv-form-error">
        <i className="pi pi-exclamation-circle" />
        {errors.endDate}
      </small>
    )}
  </div>
</div>

        {/* GPA */}
        <div className="cv-form-field">
          <label className="cv-form-label">IPK / Nilai</label>
          <InputText
            value={form.gpa}
            onChange={(e) => update('gpa', e.target.value)}
            placeholder="3.75"
            className="w-full"
            maxLength={20}
            disabled={saving}
          />
        </div>

        {/* Description */}
        <div className="cv-form-field">
          <label className="cv-form-label">Deskripsi</label>
          <InputTextarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="Aktivitas, prestasi, atau organisasi..."
            rows={3}
            autoResize
            className="w-full"
            disabled={saving}
          />
        </div>
      </div>
    </Dialog>
  )
}