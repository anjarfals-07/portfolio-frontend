import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Chip } from 'primereact/chip'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { techStackService } from '@/services/techStackService'
import type { TechStack } from '@/types/techStack'
import EmptyState from '@/components/EmptyState'

/* ============================================================
   TYPES
   ============================================================ */

interface TechForm {
  name: string
  icon: string
  sortOrder: number
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const EMPTY_FORM: TechForm = {
  name: '',
  icon: 'pi pi-code',
  sortOrder: 0,
}

const ICON_PRESETS = [
  { icon: 'pi pi-server', label: 'Server' },
  { icon: 'pi pi-bolt', label: 'Bolt' },
  { icon: 'pi pi-database', label: 'Database' },
  { icon: 'pi pi-code', label: 'Code' },
  { icon: 'pi pi-file-edit', label: 'File Edit' },
  { icon: 'pi pi-palette', label: 'Palette' },
  { icon: 'pi pi-box', label: 'Box' },
  { icon: 'pi pi-github', label: 'GitHub' },
  { icon: 'pi pi-wrench', label: 'Wrench' },
  { icon: 'pi pi-link', label: 'Link' },
  { icon: 'pi pi-lock', label: 'Lock' },
  { icon: 'pi pi-cloud', label: 'Cloud' },
  { icon: 'pi pi-cloud-upload', label: 'Cloud Upload' },
  { icon: 'pi pi-star', label: 'Star' },
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
      className={`ats-modal-mask ${closing ? 'is-closing' : ''} ${className}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="ats-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ats-modal-accent" />

        <div className="ats-modal-header">
          <div className="ats-modal-header-content">{header}</div>
          <button
            type="button"
            className="ats-modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <i className="pi pi-times" />
          </button>
        </div>

        <div className="ats-modal-content">{children}</div>

        <div className="ats-modal-footer">{footer}</div>
      </div>
    </div>,
    document.body
  )
}

/* ============================================================
   COMPONENT
   ============================================================ */

function ManageTechStack() {
  const toast = useRef<Toast>(null)

  const [techs, setTechs] = useState<TechStack[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<TechForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [globalFilter, setGlobalFilter] = useState('')

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  const fetchTechs = async () => {
    try {
      setLoading(true)
      const data = await techStackService.getAll()
      setTechs(data)
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat tools',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTechs()
  }, [])

  /* ------------------------------------------------------------
     STATS
     ------------------------------------------------------------ */
  const stats = useMemo(() => {
    const total = techs.length
    const uniqueIcons = new Set(techs.map((t) => t.icon).filter(Boolean)).size
    return { total, uniqueIcons }
  }, [techs])

  /* ------------------------------------------------------------
     DIALOG
     ------------------------------------------------------------ */
  const openCreate = () => {
    setEditingId(null)
    setForm({
      ...EMPTY_FORM,
      sortOrder: techs.length,
    })
    setFormErrors({})
    setDialogVisible(true)
  }

  const openEdit = (tech: TechStack) => {
    setEditingId(tech.id)
    setForm({
      name: tech.name,
      icon: tech.icon || 'pi pi-code',
      sortOrder: tech.sortOrder,
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
      errors.name = 'Nama tool wajib diisi'
    } else if (form.name.length > 100) {
      errors.name = 'Nama maksimal 100 karakter'
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
        await techStackService.update(editingId, form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Tool berhasil diupdate',
          life: 3000,
        })
      } else {
        await techStackService.create(form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Tool berhasil dibuat',
          life: 3000,
        })
      }
      closeDialog()
      fetchTechs()
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
  const handleDelete = (tech: TechStack) => {
    confirmDialog({
      message: `Yakin hapus "${tech.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await techStackService.delete(tech.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Tool berhasil dihapus',
            life: 3000,
          })
          fetchTechs()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus tool',
            life: 3000,
          })
        }
      },
    })
  }

  /* ============================================================
     TEMPLATES
     ============================================================ */

  const iconTemplate = (row: TechStack) => (
    <div className="ats-icon-cell">
      <i className={row.icon || 'pi pi-code'}></i>
    </div>
  )

  const nameTemplate = (row: TechStack) => (
    <div className="ats-name-cell">
      <strong className="ats-name-text">{row.name}</strong>
      <span className="ats-name-sub">#{row.sortOrder}</span>
    </div>
  )

  const chipTemplate = (row: TechStack) => (
    <Chip
      label={row.name}
      icon={row.icon || 'pi pi-check'}
      className="ats-chip-preview"
    />
  )

  const sortOrderTemplate = (row: TechStack) => (
    <span className="ats-sort-order">{row.sortOrder}</span>
  )

  const actionsTemplate = (row: TechStack) => (
    <div className="ats-actions-cell">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)}
        className="ats-action-btn"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        tooltip="Hapus"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleDelete(row)}
        className="ats-action-btn"
      />
    </div>
  )

  /* ============================================================
     TABLE HEADER
     ============================================================ */
  const header = (
    <div className="ats-table-header">
      <div className="ats-table-header-left">
        <span className="ats-search">
          <i className="pi pi-search"></i>
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari tool..."
          />
          {globalFilter && (
            <button
              type="button"
              className="ats-search-clear"
              onClick={() => setGlobalFilter('')}
              aria-label="Clear"
            >
              <i className="pi pi-times"></i>
            </button>
          )}
        </span>
      </div>

      <span className="ats-table-header-meta">
        <i className="pi pi-list"></i>
        Menampilkan <strong>{techs.length}</strong> tool
      </span>
    </div>
  )

  /* ============================================================
     DIALOG HEADER / FOOTER
     ============================================================ */
  const dialogHeader = (
    <div className="ats-modal-header-info">
      <div className="ats-modal-header-icon">
        <i className={editingId ? 'pi pi-pencil' : 'pi pi-plus'}></i>
      </div>
      <div className="ats-modal-header-text">
        <strong>{editingId ? 'Edit Tool' : 'Tambah Tool Baru'}</strong>
        <span>
          {editingId
            ? 'Update informasi tool kamu'
            : 'Isi form di bawah untuk menambah tool'}
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
        className="ats-modal-btn-cancel"
      />
      <Button
        label={saving ? 'Menyimpan...' : editingId ? 'Update Tool' : 'Simpan Tool'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSave}
        disabled={saving}
        className="ats-modal-btn-submit"
        type="button"
      />
    </>
  )

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="ats-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <header className="ats-header">
        <div className="ats-header-bg">
          <span className="ats-header-orb ats-header-orb-1" />
          <span className="ats-header-orb ats-header-orb-2" />
        </div>

        <div className="ats-header-inner">
          <div className="ats-header-left">
            <div className="ats-header-icon">
              <i className="pi pi-server"></i>
            </div>
            <div className="ats-header-text">
              <span className="ats-header-eyebrow">
                <i className="pi pi-wrench"></i>
                Tools & Software
              </span>
              <h1 className="ats-header-title">
                Manage{' '}
                <span className="ats-header-title-gradient">Tools</span>
              </h1>
              <p className="ats-header-subtitle">
                Kelola tools & software yang tampil di halaman About —{' '}
                <strong>{stats.total} tools</strong>
              </p>
            </div>
          </div>

          <div className="ats-header-right">
            <Button
              label="Tambah Tool"
              icon="pi pi-plus"
              onClick={openCreate}
              className="ats-add-btn ats-add-btn-lg"
              type="button"
            />
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="ats-stats">
        <div className="ats-stat tone-blue">
          <div className="ats-stat-icon">
            <i className="pi pi-server"></i>
          </div>
          <div className="ats-stat-info">
            <span className="ats-stat-label">Total Tools</span>
            <strong className="ats-stat-value">{stats.total}</strong>
          </div>
        </div>

        <div className="ats-stat tone-purple">
          <div className="ats-stat-icon">
            <i className="pi pi-palette"></i>
          </div>
          <div className="ats-stat-info">
            <span className="ats-stat-label">Unique Icons</span>
            <strong className="ats-stat-value">{stats.uniqueIcons}</strong>
          </div>
        </div>

        <div className="ats-stat tone-green">
          <div className="ats-stat-icon">
            <i className="pi pi-eye"></i>
          </div>
          <div className="ats-stat-info">
            <span className="ats-stat-label">Status</span>
            <strong className="ats-stat-value">
              {stats.total > 0 ? 'Aktif' : 'Kosong'}
            </strong>
          </div>
        </div>
      </div>

      {/* LIVE PREVIEW */}
      {techs.length > 0 && (
        <div className="ats-preview">
          <div className="ats-preview-header">
            <span className="ats-preview-label">
              <i className="pi pi-eye"></i>
              Preview di Halaman About
            </span>
            <span className="ats-preview-count">
              {techs.length} chips
            </span>
          </div>
          <div className="ats-preview-chips">
            {techs.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                icon={t.icon || 'pi pi-check'}
                className="ats-preview-chip"
              />
            ))}
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="ats-table-wrapper">
        <DataTable
          value={techs}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          globalFilterFields={['name']}
          paginator
          rows={15}
          rowsPerPageOptions={[10, 15, 25, 50]}
          emptyMessage={
            <EmptyState
              variant="admin"
              icon="pi pi-server"
              title="Belum Ada Tools"
              description="Klik tombol di bawah untuk menambahkan tool pertama kamu."
              actionLabel="Tambah Tool"
              actionIcon="pi pi-plus"
              onAction={openCreate}
            />
          }
          responsiveLayout="scroll"
          stripedRows
          sortField="sortOrder"
          sortOrder={1}
          className="ats-table"
        >
          <Column
            header="Icon"
            body={iconTemplate}
            style={{ width: '90px' }}
          />
          <Column
            field="name"
            header="Nama Tool"
            body={nameTemplate}
            sortable
            style={{ minWidth: '200px' }}
          />
          <Column
            header="Preview Chip"
            body={chipTemplate}
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
        className="ats-modal-tool"
      >
        <div className="ats-form">
          {/* Section 1: Info Tool */}
          <div className="ats-form-section">
            <div className="ats-form-section-header">
              <div className="ats-form-section-icon tone-blue">
                <i className="pi pi-info-circle"></i>
              </div>
              <div>
                <h3 className="ats-form-section-title">Info Tool</h3>
                <p className="ats-form-section-desc">
                  Nama dan urutan tampil
                </p>
              </div>
            </div>

            <div className="ats-form-grid">
              <div className="ats-form-field ats-form-field-full">
                <label className="ats-form-label">
                  Nama Tool <span className="ats-form-required">*</span>
                </label>
                <InputText
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Java, React, Figma, Photoshop..."
                  className={
                    formErrors.name ? 'p-invalid w-full' : 'w-full'
                  }
                  maxLength={100}
                  autoFocus
                />
                <div className="ats-form-hint-row">
                  <small className="ats-form-hint">
                    <i className="pi pi-info-circle"></i>
                    {form.name.length} / 100
                  </small>
                  {formErrors.name && (
                    <small className="ats-form-error">
                      <i className="pi pi-exclamation-circle"></i>
                      {formErrors.name}
                    </small>
                  )}
                </div>
              </div>

              <div className="ats-form-field">
                <label className="ats-form-label">Urutan</label>
                <InputNumber
                  value={form.sortOrder}
                  onValueChange={(e) =>
                    setForm({ ...form, sortOrder: e.value ?? 0 })
                  }
                  min={0}
                  showButtons
                  className="w-full"
                />
                <small className="ats-form-hint">
                  <i className="pi pi-info-circle"></i>
                  Angka kecil tampil duluan
                </small>
              </div>
            </div>
          </div>

          {/* Section 2: Icon */}
          <div className="ats-form-section">
            <div className="ats-form-section-header">
              <div className="ats-form-section-icon tone-purple">
                <i className="pi pi-palette"></i>
              </div>
              <div>
                <h3 className="ats-form-section-title">Icon</h3>
                <p className="ats-form-section-desc">
                  Pilih icon untuk tool ini
                </p>
              </div>
            </div>

            <div className="ats-form-field">
              <label className="ats-form-label">Icon Class</label>
              <div className="ats-icon-picker">
                <div className="ats-icon-picker-preview">
                  <i className={form.icon || 'pi pi-code'}></i>
                </div>
                <InputText
                  value={form.icon}
                  onChange={(e) =>
                    setForm({ ...form, icon: e.target.value })
                  }
                  placeholder="pi pi-code"
                  className="w-full"
                />
              </div>
              <div className="ats-icon-presets">
                {ICON_PRESETS.map((p) => (
                  <button
                    key={p.icon}
                    type="button"
                    className={`ats-icon-preset ${
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
          </div>

          {/* Section 3: Live Preview */}
          <div className="ats-form-section">
            <div className="ats-form-section-header">
              <div className="ats-form-section-icon tone-green">
                <i className="pi pi-eye"></i>
              </div>
              <div>
                <h3 className="ats-form-section-title">Live Preview</h3>
                <p className="ats-form-section-desc">
                  Preview chip seperti di halaman About
                </p>
              </div>
            </div>

            <div className="ats-live-preview">
              <Chip
                label={form.name || 'Nama Tool'}
                icon={form.icon || 'pi pi-check'}
              />
              <span className="ats-live-preview-hint">
                <i className="pi pi-info-circle"></i>
                Tampilan chip di halaman About
              </span>
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  )
}

export default ManageTechStack