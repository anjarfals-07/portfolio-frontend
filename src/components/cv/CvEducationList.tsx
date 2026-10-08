// ============================================================
// CvEducationList — List + CRUD riwayat pendidikan
// ============================================================

import { useCallback, useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Skeleton } from 'primereact/skeleton'
import { ConfirmDialog } from 'primereact/confirmdialog'
import CvEducationForm from './CvEducationForm'
import { educationService } from '@/services/educationService'
import { formatMonthYear, type Education, type EducationFormData } from '@/types/cv'
import './cv.css'

/* ============================================================
   TYPES
   ============================================================ */

export interface CvEducationListProps {
  onChange?: () => void
  disabled?: boolean
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function CvEducationList({
  onChange,
  disabled = false,
}: CvEducationListProps) {
  const [list, setList] = useState<Education[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Education | null>(null)
  const [error, setError] = useState<string | null>(null)

  // ⭐ CONTROLLED CONFIRM STATE
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Education | null>(null)

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  const fetchList = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await educationService.list()
      setList(data)
    } catch (err) {
      console.error('Failed to load education:', err)
      setError('Gagal memuat data pendidikan')
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

  const handleEdit = (edu: Education) => {
    setEditing(edu)
    setFormOpen(true)
  }

  const handleDeleteClick = (edu: Education) => {
    setPendingDelete(edu)
    setConfirmVisible(true)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await educationService.delete(pendingDelete.id)
      await fetchList()
      onChange?.()
    } catch (err) {
      console.error('Delete failed:', err)
      setError('Gagal menghapus pendidikan')
    } finally {
      setConfirmVisible(false)
      setPendingDelete(null)
    }
  }

  const handleCancelDelete = useCallback(() => {
    setConfirmVisible(false)
    setPendingDelete(null)
  }, [])

  const handleSave = async (data: EducationFormData) => {
    try {
      setSaving(true)
      setError(null)

      if (editing) {
        await educationService.update(editing.id, data)
      } else {
        await educationService.create(data)
      }

      setFormOpen(false)
      setEditing(null)
      await fetchList()
      onChange?.()
    } catch (err) {
      console.error('Save failed:', err)
      setError('Gagal menyimpan pendidikan')
    } finally {
      setSaving(false)
    }
  }

  const handleFormHide = useCallback(() => {
    setFormOpen(false)
    setEditing(null)
  }, [])

  /* ------------------------------------------------------------
     RENDER
     ------------------------------------------------------------ */
  if (loading) {
    return (
      <div className="cv-scope cv-edu-list">
        {[1, 2].map((i) => (
          <Skeleton key={i} height="80px" borderRadius="12px" />
        ))}
      </div>
    )
  }

  return (
    <div className="cv-scope cv-edu-list">
      {/* ===== Header ===== */}
      <div className="cv-edu-header">
        <div className="cv-edu-header-info">
          <div className="cv-edu-header-icon">
            <i className="pi pi-graduation-cap" />
          </div>
          <div className="cv-edu-header-text">
            <strong>Riwayat Pendidikan</strong>
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
        <div className="cv-edu-error">
          <i className="pi pi-exclamation-circle" />
          {error}
        </div>
      )}

      {/* ===== Empty ===== */}
      {list.length === 0 ? (
        <div className="cv-edu-empty">
          <i className="pi pi-graduation-cap" />
          <strong>Belum ada riwayat pendidikan</strong>
          <span className="cv-text-xs cv-text-muted">
            Klik "Tambah" untuk menambahkan pendidikan
          </span>
        </div>
      ) : (
        <div className="cv-edu-items">
          {list.map((edu) => (
            <div key={edu.id} className="cv-edu-item">
              <div className="cv-edu-item-body">
                <div className="cv-edu-item-title">
                  {edu.institution}
                </div>

                {(edu.degree || edu.fieldOfStudy) && (
                  <div className="cv-edu-item-sub">
                    {edu.degree}
                    {edu.degree && edu.fieldOfStudy ? ' · ' : ''}
                    {edu.fieldOfStudy}
                  </div>
                )}

                <div className="cv-edu-item-meta">
                  {(edu.startDate || edu.endDate) && (
                    <span className="cv-edu-item-period">
                      <i className="pi pi-calendar" />
                      {formatMonthYear(edu.startDate)}
                      {edu.startDate || edu.endDate ? ' – ' : ''}
                      {edu.endDate ? formatMonthYear(edu.endDate) : 'Sekarang'}
                    </span>
                  )}
                  {edu.gpa && (
                    <span className="cv-edu-item-gpa">
                      <i className="pi pi-star" />
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>

                {edu.description && (
                  <p className="cv-edu-item-desc">{edu.description}</p>
                )}
              </div>

              <div className="cv-edu-item-actions">
                <Button
                  icon="pi pi-pencil"
                  rounded
                  text
                  size="small"
                  onClick={() => handleEdit(edu)}
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
                  onClick={() => handleDeleteClick(edu)}
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
      <CvEducationForm
        visible={formOpen}
        onHide={handleFormHide}
        education={editing}
        onSave={handleSave}
        saving={saving}
      />

      {/* ⭐ CONTROLLED ConfirmDialog — close 1x klik */}
      <ConfirmDialog
        visible={confirmVisible}
        onHide={handleCancelDelete}
        message={
          pendingDelete
            ? `Hapus pendidikan di "${pendingDelete.institution}"?`
            : ''
        }
        header="Konfirmasi Hapus"
        icon="pi pi-exclamation-triangle"
        acceptLabel="Ya, Hapus"
        rejectLabel="Batal"
        acceptClassName="p-button-danger"
        accept={handleConfirmDelete}
        reject={handleCancelDelete}
        dismissableMask
        closeOnEscape
        appendTo={typeof document !== 'undefined' ? document.body : undefined}
        className="cv-confirm-dialog"
      />
    </div>
  )
}