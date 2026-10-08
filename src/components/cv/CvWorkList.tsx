// ============================================================
// CvWorkList — List + CRUD riwayat pekerjaan
// ============================================================

import { useCallback, useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Skeleton } from 'primereact/skeleton'
import { confirmDialog } from 'primereact/confirmdialog'
import CvWorkForm from './CvWorkForm'
import { workExperienceService } from '@/services/workExperienceService'
import {
  formatMonthYear,
  getEmploymentTypeLabel,
  type WorkExperience,
  type WorkExperienceFormData,
} from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvWorkListProps {
  /** Callback saat list berubah */
  onChange?: () => void

  /** Disabled state */
  disabled?: boolean
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvWorkList({
  onChange,
  disabled = false,
}: CvWorkListProps) {
  const [list, setList] = useState<WorkExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<WorkExperience | null>(null)
  const [error, setError] = useState<string | null>(null)

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  const fetchList = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await workExperienceService.list()
      setList(data)
    } catch (err) {
      console.error('Failed to load work experience:', err)
      setError('Gagal memuat data pengalaman kerja')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  /* ------------------------------------------------------------
     HANDLERS
     ------------------------------------------------------------ */
  const handleAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const handleEdit = (work: WorkExperience) => {
    setEditing(work)
    setFormOpen(true)
  }

  const handleDelete = (work: WorkExperience) => {
    confirmDialog({
      message: `Hapus pengalaman di "${work.company}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ya, Hapus',
      rejectLabel: 'Batal',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await workExperienceService.delete(work.id)
          await fetchList()
          onChange?.()
        } catch (err) {
          console.error('Delete failed:', err)
          setError('Gagal menghapus pengalaman kerja')
        }
      },
    })
  }

  const handleSave = async (data: WorkExperienceFormData) => {
    try {
      setSaving(true)
      setError(null)

      if (editing) {
        await workExperienceService.update(editing.id, data)
      } else {
        await workExperienceService.create(data)
      }

      setFormOpen(false)
      setEditing(null)
      await fetchList()
      onChange?.()
    } catch (err) {
      console.error('Save failed:', err)
      setError('Gagal menyimpan pengalaman kerja')
    } finally {
      setSaving(false)
    }
  }

  /* ------------------------------------------------------------
     RENDER
     ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="cv-scope cv-work-list">
        {[1, 2].map((i) => (
          <Skeleton key={i} height="80px" borderRadius="12px" />
        ))}
      </div>
    )
  }

  return (
    <div className="cv-scope cv-work-list">
      {/* ===== Header ===== */}
      <div className="cv-work-header">
        <div className="cv-work-header-info">
          <div className="cv-work-header-icon">
            <i className="pi pi-briefcase" />
          </div>
          <div className="cv-work-header-text">
            <strong>Riwayat Pengalaman Kerja</strong>
            <span className="cv-text-xs cv-text-muted">
              {list.length} entri
            </span>
          </div>
        </div>

        <Button
          label="Tambah"
          icon="pi pi-plus"
          size="small"
          onClick={handleAdd}
          disabled={disabled}
          type="button"
        />
      </div>

      {/* ===== Error ===== */}
      {error && (
        <div className="cv-work-error">
          <i className="pi pi-exclamation-circle" />
          {error}
        </div>
      )}

      {/* ===== Empty ===== */}
      {list.length === 0 ? (
        <div className="cv-work-empty">
          <i className="pi pi-briefcase" />
          <strong>Belum ada pengalaman kerja</strong>
          <span className="cv-text-xs cv-text-muted">
            Klik "Tambah" untuk menambahkan pengalaman kerja
          </span>
        </div>
      ) : (
        <div className="cv-work-items">
          {list.map((work) => (
            <div key={work.id} className="cv-work-item">
              <div className="cv-work-item-body">
                {/* Title */}
                <div className="cv-work-item-title">{work.position}</div>
                <div className="cv-work-item-sub">{work.company}</div>

                {/* Meta */}
                <div className="cv-work-item-meta">
                  {(work.startDate || work.endDate || work.currentlyHere) && (
                    <span className="cv-work-item-period">
                      <i className="pi pi-calendar" />
                      {formatMonthYear(work.startDate)}
                      {work.startDate ? ' – ' : ''}
                      {work.currentlyHere
                        ? 'Sekarang'
                        : work.endDate
                        ? formatMonthYear(work.endDate)
                        : '-'}
                    </span>
                  )}

                  {work.location && (
                    <span className="cv-work-item-location">
                      <i className="pi pi-map-marker" />
                      {work.location}
                    </span>
                  )}

                  {work.employmentType && (
                    <span className="cv-work-item-type">
                      <i className="pi pi-clock" />
                      {getEmploymentTypeLabel(work.employmentType)}
                    </span>
                  )}
                </div>

                {work.description && (
                  <p className="cv-work-item-desc">{work.description}</p>
                )}

                {work.currentlyHere && (
                  <span className="cv-work-item-badge is-current">
                    <i className="pi pi-circle-fill" />
                    Masih bekerja
                  </span>
                )}
              </div>

              <div className="cv-work-item-actions">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  onClick={() => handleEdit(work)}
                  disabled={disabled}
                  tooltip="Edit"
                  tooltipOptions={{ position: 'top' }}
                  type="button"
                  aria-label="Edit"
                />
                <Button
                  icon="pi pi-trash"
                  rounded
                  text
                  size="small"
                  severity="danger"
                  onClick={() => handleDelete(work)}
                  disabled={disabled}
                  tooltip="Hapus"
                  tooltipOptions={{ position: 'top' }}
                  type="button"
                  aria-label="Hapus"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Form Modal ===== */}
      <CvWorkForm
        visible={formOpen}
        onHide={() => {
          setFormOpen(false)
          setEditing(null)
        }}
        work={editing}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  )
}