import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { Chips } from 'primereact/chips'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { experienceService } from '@/services/experienceService'
import type { Experience } from '@/types/experience'
import EmptyState from '@/components/EmptyState'

/* ============================================================
   TYPES
   ============================================================ */

interface ExperienceForm {
  year: string
  title: string
  subtitle: string
  description: string
  icon: string
  color: string
  tags: string[]
  sortOrder: number
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const EMPTY_FORM: ExperienceForm = {
  year: '',
  title: '',
  subtitle: '',
  description: '',
  icon: 'pi pi-briefcase',
  color: '#3b82f6',
  tags: [],
  sortOrder: 0,
}

const COLOR_PRESETS = [
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#6366f1',
]

const ICON_PRESETS = [
  { icon: 'pi pi-briefcase', label: 'Briefcase' },
  { icon: 'pi pi-server', label: 'Server' },
  { icon: 'pi pi-code', label: 'Code' },
  { icon: 'pi pi-graduation-cap', label: 'Graduation' },
  { icon: 'pi pi-building', label: 'Building' },
  { icon: 'pi pi-star', label: 'Star' },
  { icon: 'pi pi-trophy', label: 'Trophy' },
  { icon: 'pi pi-book', label: 'Book' },
]

/* ============================================================
   CUSTOM MODAL — Modern Glassmorphism Edition
   ============================================================ */

interface CustomModalProps {
  visible: boolean
  onHide: () => void
  header: React.ReactNode
  footer: React.ReactNode
  children: React.ReactNode
  className?: string
}

function CustomModal({
  visible,
  onHide,
  header,
  footer,
  children,
  className = '',
}: CustomModalProps) {
  const [mounted, setMounted] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle close dengan animasi
  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onHide()
    }, 180)
  }

  // Lock body scroll saat modal buka
  useEffect(() => {
    if (!visible) return

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth

    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
      document.removeEventListener('keydown', handleEsc)
    }
  }, [visible])

  if (!mounted || !visible) return null

  return createPortal(
    <div
      className={`ae-modal-mask ${closing ? 'is-closing' : ''} ${className}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="ae-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient accent bar */}
        <div className="ae-modal-accent" />

        {/* Header */}
        <div className="ae-modal-header">
          <div className="ae-modal-header-content">{header}</div>
          <button
            type="button"
            className="ae-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <i className="pi pi-times" />
          </button>
        </div>

        {/* Content */}
        <div className="ae-modal-content">{children}</div>

        {/* Footer */}
        <div className="ae-modal-footer">{footer}</div>
      </div>
    </div>,
    document.body
  )
}

/* ============================================================
   COMPONENT
   ============================================================ */

function ManageExperiences() {
  const toast = useRef<Toast>(null)

  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ExperienceForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [globalFilter, setGlobalFilter] = useState('')

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  const fetchExperiences = async () => {
    try {
      setLoading(true)
      const data = await experienceService.getAll()
      setExperiences(data)
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat journey',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExperiences()
  }, [])

  /* ------------------------------------------------------------
     STATS
     ------------------------------------------------------------ */
  const stats = useMemo(() => {
    const total = experiences.length
    const yearRange =
      experiences.length > 0
        ? `${experiences[experiences.length - 1]?.year || '?'} — ${
            experiences[0]?.year || '?'
          }`
        : '—'
    const totalTags = new Set(experiences.flatMap((e) => e.tags || [])).size
    const companies = new Set(
      experiences.map((e) => e.subtitle).filter(Boolean)
    ).size
    return { total, yearRange, totalTags, companies }
  }, [experiences])

  /* ------------------------------------------------------------
     DIALOG
     ------------------------------------------------------------ */
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setDialogVisible(true)
  }

  const openEdit = (exp: Experience) => {
    setEditingId(exp.id)
    setForm({
      year: exp.year || '',
      title: exp.title,
      subtitle: exp.subtitle || '',
      description: exp.description || '',
      icon: exp.icon || 'pi pi-briefcase',
      color: exp.color || '#3b82f6',
      tags: exp.tags || [],
      sortOrder: exp.sortOrder,
    })
    setFormErrors({})
    setDialogVisible(true)
  }

  const closeDialog = () => {
    setDialogVisible(false)
    setEditingId(null)
  }

  /* ------------------------------------------------------------
     VALIDATE
     ------------------------------------------------------------ */
  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!form.title.trim()) {
      errors.title = 'Title wajib diisi'
    } else if (form.title.length > 200) {
      errors.title = 'Title maksimal 200 karakter'
    }

    if (form.year && form.year.length > 100) {
      errors.year = 'Year maksimal 100 karakter'
    }

    if (form.subtitle && form.subtitle.length > 200) {
      errors.subtitle = 'Subtitle maksimal 200 karakter'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /* ------------------------------------------------------------
     SAVE
     ------------------------------------------------------------ */
  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      if (editingId) {
        await experienceService.update(editingId, form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Journey berhasil diupdate',
          life: 3000,
        })
      } else {
        await experienceService.create(form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Journey berhasil dibuat',
          life: 3000,
        })
      }
      closeDialog()
      fetchExperiences()
    } catch (err) {
      console.error(err)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: axiosErr.response?.data?.message || 'Terjadi kesalahan',
        life: 4000,
      })
    } finally {
      setSaving(false)
    }
  }

  /* ------------------------------------------------------------
     DELETE
     ------------------------------------------------------------ */
  const handleDelete = (exp: Experience) => {
    confirmDialog({
      message: `Yakin hapus journey "${exp.title}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await experienceService.delete(exp.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Journey berhasil dihapus',
            life: 3000,
          })
          fetchExperiences()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus journey',
            life: 3000,
          })
        }
      },
    })
  }

  /* ============================================================
     TEMPLATES
     ============================================================ */

  const markerTemplate = (row: Experience) => (
    <div
      className="ae-marker"
      style={
        {
          '--marker-color': row.color || '#3b82f6',
        } as React.CSSProperties
      }
    >
      <i className={row.icon || 'pi pi-circle'}></i>
    </div>
  )

  const titleTemplate = (row: Experience) => (
    <div className="ae-title-cell">
      {row.year && (
        <span className="ae-year">
          <i className="pi pi-calendar"></i>
          {row.year}
        </span>
      )}
      <strong className="ae-title">{row.title}</strong>
      {row.subtitle && (
        <span className="ae-subtitle">
          <i className="pi pi-building"></i>
          {row.subtitle}
        </span>
      )}
    </div>
  )

  const tagsTemplate = (row: Experience) => (
    <div className="ae-tags">
      {row.tags?.slice(0, 3).map((t) => (
        <span key={t} className="ae-tag">
          {t}
        </span>
      ))}
      {row.tags && row.tags.length > 3 && (
        <span className="ae-tag ae-tag-more">+{row.tags.length - 3}</span>
      )}
      {!row.tags?.length && <span className="ae-tag-empty">—</span>}
    </div>
  )

  const sortOrderTemplate = (row: Experience) => (
    <span className="ae-sort-order">{row.sortOrder}</span>
  )

  const actionsTemplate = (row: Experience) => (
    <div className="ae-actions-cell">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)}
        className="ae-action-btn"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        tooltip="Hapus"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleDelete(row)}
        className="ae-action-btn"
      />
    </div>
  )

  /* ============================================================
     TABLE HEADER
     ============================================================ */
  const header = (
    <div className="ae-table-header">
      <div className="ae-table-header-left">
        <span className="ae-search">
          <i className="pi pi-search"></i>
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari journey..."
          />
          {globalFilter && (
            <button
              type="button"
              className="ae-search-clear"
              onClick={() => setGlobalFilter('')}
              aria-label="Clear"
            >
              <i className="pi pi-times"></i>
            </button>
          )}
        </span>
      </div>

      <span className="ae-table-header-meta">
        <i className="pi pi-list"></i>
        Menampilkan <strong>{experiences.length}</strong> journey
      </span>
    </div>
  )

  /* ============================================================
     DIALOG HEADER / FOOTER
     ============================================================ */
  const dialogHeader = (
    <div className="ae-modal-header-info">
      <div className="ae-modal-header-icon">
        <i className={editingId ? 'pi pi-pencil' : 'pi pi-plus'}></i>
      </div>
      <div className="ae-modal-header-text">
        <strong>{editingId ? 'Edit Journey' : 'Tambah Journey Baru'}</strong>
        <span>
          {editingId
            ? 'Update informasi journey kamu'
            : 'Isi form di bawah untuk menambah pengalaman'}
        </span>
      </div>
    </div>
  )

  const dialogFooter = (
    <>
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={closeDialog}
        disabled={saving}
        type="button"
        className="ae-modal-btn-cancel"
      />
      <Button
        label={saving ? 'Menyimpan...' : editingId ? 'Update Journey' : 'Simpan Journey'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSave}
        disabled={saving}
        className="ae-modal-btn-submit"
        type="button"
      />
    </>
  )

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="ae-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <header className="ae-header">
        <div className="ae-header-bg">
          <span className="ae-header-orb ae-header-orb-1" />
          <span className="ae-header-orb ae-header-orb-2" />
        </div>

        <div className="ae-header-inner">
          <div className="ae-header-left">
            <div className="ae-header-icon">
              <i className="pi pi-briefcase"></i>
            </div>
            <div className="ae-header-text">
              <span className="ae-header-eyebrow">
                <i className="pi pi-clock"></i>
                Career Timeline
              </span>
              <h1 className="ae-header-title">
                Manage <span className="ae-header-title-gradient">Journey</span>
              </h1>
              <p className="ae-header-subtitle">
                Kelola perjalanan karier & pengalaman —{' '}
                <strong>{stats.total} journey</strong>
              </p>
            </div>
          </div>

          <div className="ae-header-right">
            <Button
              label="Tambah Journey"
              icon="pi pi-plus"
              onClick={openCreate}
              className="ae-add-btn ae-add-btn-lg"
              type="button"
            />
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="ae-stats">
        <div className="ae-stat tone-blue">
          <div className="ae-stat-icon">
            <i className="pi pi-briefcase"></i>
          </div>
          <div className="ae-stat-info">
            <span className="ae-stat-label">Total Journey</span>
            <strong className="ae-stat-value">{stats.total}</strong>
          </div>
        </div>

        <div className="ae-stat tone-purple">
          <div className="ae-stat-icon">
            <i className="pi pi-building"></i>
          </div>
          <div className="ae-stat-info">
            <span className="ae-stat-label">Perusahaan</span>
            <strong className="ae-stat-value">{stats.companies}</strong>
          </div>
        </div>

        <div className="ae-stat tone-green">
          <div className="ae-stat-icon">
            <i className="pi pi-tag"></i>
          </div>
          <div className="ae-stat-info">
            <span className="ae-stat-label">Unique Tags</span>
            <strong className="ae-stat-value">{stats.totalTags}</strong>
          </div>
        </div>

        <div className="ae-stat tone-orange">
          <div className="ae-stat-icon">
            <i className="pi pi-calendar"></i>
          </div>
          <div className="ae-stat-info">
            <span className="ae-stat-label">Rentang Waktu</span>
            <strong className="ae-stat-value ae-stat-value-sm">
              {stats.yearRange}
            </strong>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="ae-table-wrapper">
        <DataTable
          value={experiences}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          globalFilterFields={['title', 'subtitle', 'year']}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={
            <EmptyState
              variant="admin"
              icon="pi pi-clock"
              title="Belum Ada Journey"
              description="Klik tombol di bawah untuk menambahkan pengalaman pertama kamu."
              actionLabel="Tambah Journey"
              actionIcon="pi pi-plus"
              onAction={openCreate}
            />
          }
          responsiveLayout="scroll"
          stripedRows
          sortField="sortOrder"
          sortOrder={1}
          className="ae-table"
        >
          <Column header="" body={markerTemplate} style={{ width: '90px' }} />
          <Column
            field="title"
            header="Journey"
            body={titleTemplate}
            sortable
            style={{ minWidth: '300px' }}
          />
          <Column
            header="Tags"
            body={tagsTemplate}
            style={{ minWidth: '220px' }}
          />
          <Column
            field="sortOrder"
            header="Urutan"
            body={sortOrderTemplate}
            sortable
            style={{ width: '100px' }}
          />
          <Column
            header="Aksi"
            body={actionsTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      {/* CUSTOM MODAL */}
      <CustomModal
        visible={dialogVisible}
        onHide={closeDialog}
        header={dialogHeader}
        footer={dialogFooter}
        className="ae-modal-experience"
      >
        <div className="ae-form">
          {/* Section 1: Waktu & Urutan */}
          <div className="ae-form-section">
            <div className="ae-form-section-header">
              <div className="ae-form-section-icon tone-blue">
                <i className="pi pi-calendar"></i>
              </div>
              <div>
                <h3 className="ae-form-section-title">Waktu & Urutan</h3>
                <p className="ae-form-section-desc">
                  Kapan pengalaman ini berlangsung
                </p>
              </div>
            </div>

            <div className="ae-form-grid">
              <div className="ae-form-field">
                <label className="ae-form-label">Tahun / Periode</label>
                <InputText
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: e.target.value })
                  }
                  placeholder="2023 - Sekarang"
                  className={formErrors.year ? 'p-invalid w-full' : 'w-full'}
                  maxLength={100}
                />
                {formErrors.year && (
                  <small className="ae-form-error">
                    <i className="pi pi-exclamation-circle"></i>
                    {formErrors.year}
                  </small>
                )}
              </div>

              <div className="ae-form-field">
                <label className="ae-form-label">Urutan</label>
                <InputNumber
                  value={form.sortOrder}
                  onValueChange={(e) =>
                    setForm({ ...form, sortOrder: e.value ?? 0 })
                  }
                  min={0}
                  showButtons
                  className="w-full"
                />
                <small className="ae-form-hint">
                  <i className="pi pi-info-circle"></i>
                  Angka kecil tampil duluan
                </small>
              </div>
            </div>
          </div>

          {/* Section 2: Info Journey */}
          <div className="ae-form-section">
            <div className="ae-form-section-header">
              <div className="ae-form-section-icon tone-purple">
                <i className="pi pi-info-circle"></i>
              </div>
              <div>
                <h3 className="ae-form-section-title">Info Journey</h3>
                <p className="ae-form-section-desc">
                  Title, perusahaan, dan deskripsi
                </p>
              </div>
            </div>

            <div className="ae-form-grid">
              <div className="ae-form-field ae-form-field-full">
                <label className="ae-form-label">
                  Title <span className="ae-form-required">*</span>
                </label>
                <InputText
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Full-Stack Developer"
                  className={
                    formErrors.title ? 'p-invalid w-full' : 'w-full'
                  }
                  maxLength={200}
                />
                {formErrors.title && (
                  <small className="ae-form-error">
                    <i className="pi pi-exclamation-circle"></i>
                    {formErrors.title}
                  </small>
                )}
              </div>

              <div className="ae-form-field ae-form-field-full">
                <label className="ae-form-label">
                  Subtitle / Perusahaan
                </label>
                <InputText
                  value={form.subtitle}
                  onChange={(e) =>
                    setForm({ ...form, subtitle: e.target.value })
                  }
                  placeholder="PT XYZ Technology"
                  className={
                    formErrors.subtitle ? 'p-invalid w-full' : 'w-full'
                  }
                  maxLength={200}
                />
                {formErrors.subtitle && (
                  <small className="ae-form-error">
                    <i className="pi pi-exclamation-circle"></i>
                    {formErrors.subtitle}
                  </small>
                )}
              </div>

              <div className="ae-form-field ae-form-field-full">
                <label className="ae-form-label">Description</label>
                <InputTextarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Ceritakan peran & pencapaian..."
                  rows={4}
                  autoResize
                  className="w-full"
                />
              </div>

              <div className="ae-form-field ae-form-field-full">
                <label className="ae-form-label">Tags</label>
                <Chips
                  value={form.tags}
                  onChange={(e) =>
                    setForm({ ...form, tags: e.value || [] })
                  }
                  placeholder="Ketik, tekan Enter"
                  className="w-full"
                />
                <small className="ae-form-hint">
                  <i className="pi pi-tag"></i>
                  Contoh: Java, Spring Boot, React
                </small>
              </div>
            </div>
          </div>

          {/* Section 3: Visual */}
          <div className="ae-form-section">
            <div className="ae-form-section-header">
              <div className="ae-form-section-icon tone-orange">
                <i className="pi pi-palette"></i>
              </div>
              <div>
                <h3 className="ae-form-section-title">Visual</h3>
                <p className="ae-form-section-desc">
                  Icon dan warna marker untuk timeline
                </p>
              </div>
            </div>

            <div className="ae-form-grid">
              {/* Icon */}
              <div className="ae-form-field">
                <label className="ae-form-label">Icon</label>
                <div className="ae-icon-picker">
                  <div className="ae-icon-picker-preview">
                    <i className={form.icon}></i>
                  </div>
                  <InputText
                    value={form.icon}
                    onChange={(e) =>
                      setForm({ ...form, icon: e.target.value })
                    }
                    placeholder="pi pi-briefcase"
                    className="w-full"
                  />
                </div>
                <div className="ae-icon-presets">
                  {ICON_PRESETS.map((p) => (
                    <button
                      key={p.icon}
                      type="button"
                      className={`ae-icon-preset ${
                        form.icon === p.icon ? 'is-active' : ''
                      }`}
                      onClick={() => setForm({ ...form, icon: p.icon })}
                      title={p.label}
                    >
                      <i className={p.icon}></i>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="ae-form-field">
                <label className="ae-form-label">Warna Marker</label>
                <div className="ae-color-picker">
                  <div
                    className="ae-color-preview"
                    style={{ backgroundColor: form.color }}
                  >
                    <i className={`${form.icon} text-white`}></i>
                  </div>
                  <InputText
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    placeholder="#3b82f6"
                    className="w-full"
                  />
                </div>
                <div className="ae-color-presets">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`ae-color-preset ${
                        form.color === c ? 'is-active' : ''
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setForm({ ...form, color: c })}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Timeline */}
            <div className="ae-live-preview">
              <span className="ae-live-preview-label">
                <i className="pi pi-eye"></i>
                Live Preview
              </span>
              <div className="ae-live-preview-item">
                <div
                  className="ae-marker ae-marker-lg"
                  style={
                    {
                      '--marker-color': form.color || '#3b82f6',
                    } as React.CSSProperties
                  }
                >
                  <i className={form.icon || 'pi pi-circle'}></i>
                </div>
                <div className="ae-live-preview-content">
                  {form.year && (
                    <span className="ae-year">
                      <i className="pi pi-calendar"></i>
                      {form.year}
                    </span>
                  )}
                  <strong className="ae-title">
                    {form.title || 'Judul Journey'}
                  </strong>
                  {form.subtitle && (
                    <span className="ae-subtitle">
                      <i className="pi pi-building"></i>
                      {form.subtitle}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  )
}

export default ManageExperiences