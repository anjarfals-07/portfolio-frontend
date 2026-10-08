import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { skillService } from '@/services/skillService'
import type { Skill } from '@/types/skill'
import EmptyState from '@/components/EmptyState'

/* ============================================================
   TYPES
   ============================================================ */

interface SkillForm {
  category: string
  categoryIcon: string
  name: string
  level: number
  sortOrder: number
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const EMPTY_FORM: SkillForm = {
  category: 'Technical',
  categoryIcon: 'pi pi-wrench',
  name: '',
  level: 50,
  sortOrder: 0,
}

const CATEGORY_OPTIONS = [
  { label: 'Technical', value: 'Technical', icon: 'pi pi-wrench' },
  { label: 'Creative', value: 'Creative', icon: 'pi pi-palette' },
  { label: 'Tools & Software', value: 'Tools & Software', icon: 'pi pi-desktop' },
  { label: 'Soft Skills', value: 'Soft Skills', icon: 'pi pi-users' },
  { label: 'Languages', value: 'Languages', icon: 'pi pi-globe' },
  { label: 'Other', value: 'Other', icon: 'pi pi-star' },
]

/* ============================================================
   HELPERS
   ============================================================ */

type LevelSeverity = 'success' | 'info' | 'warning' | 'danger'

const getLevelSeverity = (level: number): LevelSeverity => {
  if (level >= 80) return 'success'
  if (level >= 60) return 'info'
  if (level >= 40) return 'warning'
  return 'danger'
}

const getLevelLabel = (level: number): string => {
  if (level >= 80) return 'Expert'
  if (level >= 60) return 'Advanced'
  if (level >= 40) return 'Intermediate'
  return 'Beginner'
}

const getLevelTone = (level: number): 'green' | 'blue' | 'orange' | 'red' => {
  if (level >= 80) return 'green'
  if (level >= 60) return 'blue'
  if (level >= 40) return 'orange'
  return 'red'
}

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

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => {
      setClosing(false)
      onHide()
    }, 180)
  }

  // Lock body scroll
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
      className={`as-modal-mask ${closing ? 'is-closing' : ''} ${className}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="as-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="as-modal-accent" />

        <div className="as-modal-header">
          <div className="as-modal-header-content">{header}</div>
          <button
            type="button"
            className="as-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <i className="pi pi-times" />
          </button>
        </div>

        <div className="as-modal-content">{children}</div>

        <div className="as-modal-footer">{footer}</div>
      </div>
    </div>,
    document.body
  )
}

/* ============================================================
   COMPONENT
   ============================================================ */

function ManageSkills() {
  const toast = useRef<Toast>(null)

  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SkillForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  const fetchSkills = async () => {
    try {
      setLoading(true)
      const data = await skillService.getAll()
      setSkills(data)
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat skills',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSkills()
  }, [])

  /* ------------------------------------------------------------
     STATS
     ------------------------------------------------------------ */
  const stats = useMemo(() => {
    const total = skills.length
    const expert = skills.filter((s) => s.level >= 80).length
    const categories = new Set(skills.map((s) => s.category)).size
    const avg =
      skills.length > 0
        ? Math.round(
            skills.reduce((sum, s) => sum + s.level, 0) / skills.length
          )
        : 0
    return { total, expert, categories, avg }
  }, [skills])

  /* ------------------------------------------------------------
     CATEGORY COUNT
     ------------------------------------------------------------ */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    skills.forEach((s) => {
      const key = s.category ?? 'Other'
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [skills])

  /* ------------------------------------------------------------
     DIALOG
     ------------------------------------------------------------ */
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setDialogVisible(true)
  }

  const openEdit = (skill: Skill) => {
    setEditingId(skill.id)
    setForm({
      category: skill.category || 'Technical',
      categoryIcon: skill.categoryIcon || 'pi pi-wrench',
      name: skill.name,
      level: skill.level,
      sortOrder: skill.sortOrder,
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

    if (!form.name.trim()) {
      errors.name = 'Nama skill wajib diisi'
    } else if (form.name.length > 100) {
      errors.name = 'Nama maksimal 100 karakter'
    }

    if (!form.category.trim()) {
      errors.category = 'Kategori wajib dipilih'
    }

    if (form.level < 0 || form.level > 100) {
      errors.level = 'Level harus 0-100'
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
        await skillService.update(editingId, form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Skill berhasil diupdate',
          life: 3000,
        })
      } else {
        await skillService.create(form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Skill berhasil dibuat',
          life: 3000,
        })
      }
      closeDialog()
      fetchSkills()
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
  const handleDelete = (skill: Skill) => {
    confirmDialog({
      message: `Yakin hapus skill "${skill.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await skillService.delete(skill.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Skill berhasil dihapus',
            life: 3000,
          })
          fetchSkills()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus skill',
            life: 3000,
          })
        }
      },
    })
  }

  /* ------------------------------------------------------------
     CATEGORY HANDLER
     ------------------------------------------------------------ */
  const handleCategoryChange = (category: string | null) => {
    if (!category) return
    const opt = CATEGORY_OPTIONS.find((c) => c.value === category)
    setForm((prev) => ({
      ...prev,
      category,
      categoryIcon: opt?.icon || 'pi pi-star',
    }))
  }

  /* ============================================================
     TEMPLATES
     ============================================================ */

  const categoryTemplate = (row: Skill) => (
    <div className="as-category-cell">
      <div className="as-category-icon">
        <i className={row.categoryIcon || 'pi pi-star'}></i>
      </div>
      <span className="as-category-text">{row.category || '—'}</span>
    </div>
  )

  const nameTemplate = (row: Skill) => (
    <div className="as-name-cell">
      <strong className="as-name-text">{row.name}</strong>
      <span className="as-name-sub">{row.category}</span>
    </div>
  )

  const levelTemplate = (row: Skill) => {
    const tone = getLevelTone(row.level)
    return (
      <div className={`as-level tone-${tone}`}>
        <div className="as-level-bar">
          <div
            className="as-level-bar-fill"
            style={{ width: `${row.level}%` }}
          />
        </div>
        <span className="as-level-value">{row.level}%</span>
      </div>
    )
  }

  const statusTemplate = (row: Skill) => {
    const severity = getLevelSeverity(row.level)
    return (
      <span className={`as-status as-status-${severity}`}>
        <i className="pi pi-star-fill"></i>
        {getLevelLabel(row.level)}
      </span>
    )
  }

  const sortOrderTemplate = (row: Skill) => (
    <span className="as-sort-order">{row.sortOrder}</span>
  )

  const actionsTemplate = (row: Skill) => (
    <div className="as-actions-cell">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)}
        className="as-action-btn"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        tooltip="Hapus"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleDelete(row)}
        className="as-action-btn"
      />
    </div>
  )

  /* ============================================================
     TABLE HEADER
     ============================================================ */
  const header = (
    <div className="as-table-header">
      <div className="as-table-header-left">
        <span className="as-search">
          <i className="pi pi-search"></i>
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari skill..."
          />
          {globalFilter && (
            <button
              type="button"
              className="as-search-clear"
              onClick={() => setGlobalFilter('')}
              aria-label="Clear"
            >
              <i className="pi pi-times"></i>
            </button>
          )}
        </span>
      </div>

      <span className="as-table-header-meta">
        <i className="pi pi-list"></i>
        Menampilkan <strong>{skills.length}</strong> skill
      </span>
    </div>
  )

  /* ============================================================
     DIALOG HEADER / FOOTER
     ============================================================ */
  const dialogHeader = (
    <div className="as-modal-header-info">
      <div className="as-modal-header-icon">
        <i className={editingId ? 'pi pi-pencil' : 'pi pi-plus'}></i>
      </div>
      <div className="as-modal-header-text">
        <strong>{editingId ? 'Edit Skill' : 'Tambah Skill Baru'}</strong>
        <span>
          {editingId
            ? 'Update informasi skill kamu'
            : 'Isi form di bawah untuk menambah skill'}
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
        className="as-modal-btn-cancel"
      />
      <Button
        label={saving ? 'Menyimpan...' : editingId ? 'Update Skill' : 'Simpan Skill'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSave}
        disabled={saving}
        className="as-modal-btn-submit"
        type="button"
      />
    </>
  )

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="as-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <header className="as-header">
        <div className="as-header-bg">
          <span className="as-header-orb as-header-orb-1" />
          <span className="as-header-orb as-header-orb-2" />
        </div>

        <div className="as-header-inner">
          <div className="as-header-left">
            <div className="as-header-icon">
              <i className="pi pi-chart-bar"></i>
            </div>
            <div className="as-header-text">
              <span className="as-header-eyebrow">
                <i className="pi pi-sparkles"></i>
                Skill Matrix
              </span>
              <h1 className="as-header-title">
                Manage <span className="as-header-title-gradient">Skills</span>
              </h1>
              <p className="as-header-subtitle">
                Kelola skills & keahlian kamu —{' '}
                <strong>{stats.total} skills</strong>
              </p>
            </div>
          </div>

          <div className="as-header-right">
            <Button
              label="Tambah Skill"
              icon="pi pi-plus"
              onClick={openCreate}
              className="as-add-btn as-add-btn-lg"
              type="button"
            />
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="as-stats">
        <div className="as-stat tone-blue">
          <div className="as-stat-icon">
            <i className="pi pi-chart-bar"></i>
          </div>
          <div className="as-stat-info">
            <span className="as-stat-label">Total Skills</span>
            <strong className="as-stat-value">{stats.total}</strong>
          </div>
        </div>

        <div className="as-stat tone-green">
          <div className="as-stat-icon">
            <i className="pi pi-star-fill"></i>
          </div>
          <div className="as-stat-info">
            <span className="as-stat-label">Expert Level</span>
            <strong className="as-stat-value">{stats.expert}</strong>
          </div>
        </div>

        <div className="as-stat tone-purple">
          <div className="as-stat-icon">
            <i className="pi pi-th-large"></i>
          </div>
          <div className="as-stat-info">
            <span className="as-stat-label">Kategori</span>
            <strong className="as-stat-value">{stats.categories}</strong>
          </div>
        </div>

        <div className="as-stat tone-orange">
          <div className="as-stat-icon">
            <i className="pi pi-percentage"></i>
          </div>
          <div className="as-stat-info">
            <span className="as-stat-label">Rata-rata Level</span>
            <strong className="as-stat-value">{stats.avg}%</strong>
          </div>
        </div>
      </div>

      {/* CATEGORY FILTER CHIPS */}
      <div className="as-filters">
        <span className="as-filters-label">
          <i className="pi pi-filter"></i>
          Kategori
        </span>
        <div className="as-filters-chips">
          <button
            type="button"
            className={`as-chip ${categoryFilter === null ? 'is-active' : ''}`}
            onClick={() => setCategoryFilter(null)}
          >
            <i className="pi pi-th-large"></i>
            <span>Semua</span>
            <span className="as-chip-count">{skills.length}</span>
          </button>

          {CATEGORY_OPTIONS.map((opt) => {
            const count = categoryCounts[opt.value] || 0
            if (count === 0 && categoryFilter !== opt.value) return null
            return (
              <button
                key={opt.value}
                type="button"
                className={`as-chip ${
                  categoryFilter === opt.value ? 'is-active' : ''
                }`}
                onClick={() =>
                  setCategoryFilter(
                    categoryFilter === opt.value ? null : opt.value
                  )
                }
              >
                <i className={opt.icon}></i>
                <span>{opt.label}</span>
                <span className="as-chip-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* TABLE */}
      <div className="as-table-wrapper">
        <DataTable
          value={skills}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          filters={{
            category: { value: categoryFilter, matchMode: 'equals' },
          }}
          globalFilterFields={['name', 'category']}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage={
            <EmptyState
              variant="admin"
              icon="pi pi-chart-bar"
              title="Belum Ada Skill"
              description="Klik tombol di bawah untuk menambahkan skill pertama kamu."
              actionLabel="Tambah Skill"
              actionIcon="pi pi-plus"
              onAction={openCreate}
            />
          }
          responsiveLayout="scroll"
          stripedRows
          sortField="sortOrder"
          sortOrder={1}
          className="as-table"
        >
          <Column
            field="category"
            header="Kategori"
            body={categoryTemplate}
            style={{ minWidth: '200px' }}
          />
          <Column
            field="name"
            header="Skill"
            body={nameTemplate}
            sortable
            style={{ minWidth: '220px' }}
          />
          <Column
            field="level"
            header="Level"
            body={levelTemplate}
            sortable
            style={{ minWidth: '240px' }}
          />
          <Column
            field="level"
            header="Status"
            body={statusTemplate}
            style={{ width: '140px' }}
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
        className="as-modal-skill"
      >
        <div className="as-form">
          {/* Section 1: Kategori & Icon */}
          <div className="as-form-section">
            <div className="as-form-section-header">
              <div className="as-form-section-icon tone-blue">
                <i className="pi pi-th-large"></i>
              </div>
              <div>
                <h3 className="as-form-section-title">Kategori & Icon</h3>
                <p className="as-form-section-desc">
                  Pilih kategori dan icon untuk skill ini
                </p>
              </div>
            </div>

            <div className="as-form-grid">
              <div className="as-form-field">
                <label className="as-form-label">
                  Kategori <span className="as-form-required">*</span>
                </label>
                <Dropdown
                  value={form.category}
                  options={CATEGORY_OPTIONS}
                  onChange={(e) => handleCategoryChange(e.value)}
                  placeholder="Pilih kategori"
                  className="w-full"
                />
                {formErrors.category && (
                  <small className="as-form-error">
                    <i className="pi pi-exclamation-circle"></i>
                    {formErrors.category}
                  </small>
                )}
              </div>

              <div className="as-form-field">
                <label className="as-form-label">Icon Kategori</label>
                <div className="as-icon-preview">
                  <div className="as-icon-preview-box">
                    <i className={form.categoryIcon}></i>
                  </div>
                  <InputText
                    value={form.categoryIcon}
                    onChange={(e) =>
                      setForm({ ...form, categoryIcon: e.target.value })
                    }
                    placeholder="pi pi-wrench"
                    className="w-full"
                  />
                </div>
                <small className="as-form-hint">
                  <i className="pi pi-info-circle"></i>
                  Auto-filled dari kategori. Bisa custom.
                </small>
              </div>
            </div>
          </div>

          {/* Section 2: Detail Skill */}
          <div className="as-form-section">
            <div className="as-form-section-header">
              <div className="as-form-section-icon tone-purple">
                <i className="pi pi-sparkles"></i>
              </div>
              <div>
                <h3 className="as-form-section-title">Detail Skill</h3>
                <p className="as-form-section-desc">
                  Nama, level, dan urutan tampil
                </p>
              </div>
            </div>

            <div className="as-form-grid">
              <div className="as-form-field as-form-field-full">
                <label className="as-form-label">
                  Nama Skill <span className="as-form-required">*</span>
                </label>
                <InputText
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Java, React, Photography..."
                  className={
                    formErrors.name ? 'p-invalid w-full' : 'w-full'
                  }
                  maxLength={100}
                />
                <div className="as-form-hint-row">
                  <small className="as-form-hint">
                    <i className="pi pi-info-circle"></i>
                    {form.name.length} / 100
                  </small>
                  {formErrors.name && (
                    <small className="as-form-error">
                      <i className="pi pi-exclamation-circle"></i>
                      {formErrors.name}
                    </small>
                  )}
                </div>
              </div>

              <div className="as-form-field">
                <label className="as-form-label">
                  Level (0-100){' '}
                  <span className="as-form-required">*</span>
                </label>
                <InputNumber
                  value={form.level}
                  onValueChange={(e) =>
                    setForm({ ...form, level: e.value ?? 0 })
                  }
                  min={0}
                  max={100}
                  showButtons
                  className="w-full"
                />
                {formErrors.level && (
                  <small className="as-form-error">
                    <i className="pi pi-exclamation-circle"></i>
                    {formErrors.level}
                  </small>
                )}
              </div>

              <div className="as-form-field">
                <label className="as-form-label">Urutan</label>
                <InputNumber
                  value={form.sortOrder}
                  onValueChange={(e) =>
                    setForm({ ...form, sortOrder: e.value ?? 0 })
                  }
                  min={0}
                  showButtons
                  className="w-full"
                />
                <small className="as-form-hint">
                  <i className="pi pi-info-circle"></i>
                  Angka kecil tampil duluan
                </small>
              </div>
            </div>

            {/* Live Preview */}
            <div className="as-live-preview">
              <span className="as-live-preview-label">
                <i className="pi pi-eye"></i>
                Live Preview
              </span>
              <div className="as-live-preview-item">
                <div className="as-live-preview-icon">
                  <i className={form.categoryIcon || 'pi pi-star'}></i>
                </div>
                <div className="as-live-preview-content">
                  <strong className="as-live-preview-title">
                    {form.name || 'Nama Skill'}
                  </strong>
                  <span className="as-live-preview-sub">
                    {form.category || 'Kategori'}
                  </span>
                </div>
              </div>
              <div
                className={`as-level tone-${getLevelTone(form.level)}`}
              >
                <div className="as-level-bar">
                  <div
                    className="as-level-bar-fill"
                    style={{ width: `${form.level}%` }}
                  />
                </div>
                <span className="as-level-value">{form.level}%</span>
              </div>
              <span
                className={`as-status as-status-${getLevelSeverity(form.level)}`}
              >
                <i className="pi pi-star-fill"></i>
                {getLevelLabel(form.level)}
              </span>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  )
}

export default ManageSkills