import { useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputSwitch } from 'primereact/inputswitch'
import { Chips } from 'primereact/chips'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Image } from 'primereact/image'
import EmptyState from '@/components/EmptyState'
import ImageUpload from '@/components/ImageUpload'
import { projectService } from '@/services/projectService'
import type { Project, ProjectFormData } from '@/types/project'

const EMPTY_FORM: ProjectFormData = {
  title: '',
  slug: '',
  description: '',
  content: '',
  thumbnailUrl: '',
  techStack: [],
  githubUrl: '',
  demoUrl: '',
  featured: false,
  published: true,
}

type FilterStatus = 'all' | 'published' | 'draft' | 'featured'

interface FilterOption {
  label: string
  value: FilterStatus
  icon: string
  tone: 'blue' | 'green' | 'gray' | 'orange'
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'Semua', value: 'all', icon: 'pi pi-th-large', tone: 'blue' },
  {
    label: 'Published',
    value: 'published',
    icon: 'pi pi-check-circle',
    tone: 'green',
  },
  { label: 'Draft', value: 'draft', icon: 'pi pi-clock', tone: 'gray' },
  {
    label: 'Featured',
    value: 'featured',
    icon: 'pi pi-star-fill',
    tone: 'orange',
  },
]

function ManageProjects() {
  const toast = useRef<Toast>(null)

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<ProjectFormData>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [globalFilter, setGlobalFilter] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getAll()
      setProjects(data)
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat works',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const stats = useMemo(
    () => ({
      total: projects.length,
      published: projects.filter((p) => p.published).length,
      drafts: projects.filter((p) => !p.published).length,
      featured: projects.filter((p) => p.featured).length,
    }),
    [projects]
  )

  const filteredProjects = useMemo(() => {
    switch (filterStatus) {
      case 'published':
        return projects.filter((p) => p.published)
      case 'draft':
        return projects.filter((p) => !p.published)
      case 'featured':
        return projects.filter((p) => p.featured)
      default:
        return projects
    }
  }, [projects, filterStatus])

  const filterCount = useMemo<Record<FilterStatus, number>>(
    () => ({
      all: stats.total,
      published: stats.published,
      draft: stats.drafts,
      featured: stats.featured,
    }),
    [stats]
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setDialogVisible(true)
  }

  const openEdit = (project: Project) => {
    setEditingId(project.id)
    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description || '',
      content: project.content || '',
      thumbnailUrl: project.thumbnailUrl || '',
      techStack: project.techStack || [],
      githubUrl: project.githubUrl || '',
      demoUrl: project.demoUrl || '',
      featured: project.featured,
      published: project.published,
    })
    setFormErrors({})
    setDialogVisible(true)
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.title.trim()) errors.title = 'Title wajib diisi'
    else if (form.title.length > 200)
      errors.title = 'Title maksimal 200 karakter'
    if (form.description && form.description.length > 500)
      errors.description = 'Description maksimal 500 karakter'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      if (editingId) {
        await projectService.update(editingId, form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Works berhasil diupdate',
          life: 3000,
        })
      } else {
        await projectService.create(form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Works berhasil dibuat',
          life: 3000,
        })
      }
      setDialogVisible(false)
      fetchProjects()
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

  const handleDelete = (project: Project) => {
    confirmDialog({
      message: `Yakin hapus works "${project.title}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await projectService.delete(project.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Works berhasil dihapus',
            life: 3000,
          })
          fetchProjects()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus works',
            life: 3000,
          })
        }
      },
    })
  }

  // ===== TEMPLATES =====
  const thumbnailTemplate = (row: Project) => {
    if (!row.thumbnailUrl) {
      return (
        <div className="ap-thumb ap-thumb-empty">
          <i className="pi pi-image"></i>
        </div>
      )
    }
    return (
      <Image
        src={row.thumbnailUrl}
        alt={row.title}
        width="72"
        height="48"
        preview
        className="ap-thumb"
        imageClassName="ap-thumb-img"
      />
    )
  }

  const titleTemplate = (row: Project) => (
    <div className="ap-title-cell">
      <strong className="ap-title-text">{row.title}</strong>
      <span className="ap-slug">
        <i className="pi pi-hashtag"></i>
        {row.slug}
      </span>
    </div>
  )

  const techTemplate = (row: Project) => (
    <div className="ap-tech-stack">
      {row.techStack?.slice(0, 2).map((t) => (
        <span key={t} className="ap-tech-tag">
          {t}
        </span>
      ))}
      {row.techStack && row.techStack.length > 2 && (
        <span className="ap-tech-tag ap-tech-tag-more">
          +{row.techStack.length - 2}
        </span>
      )}
      {!row.techStack?.length && <span className="ap-tech-empty">—</span>}
    </div>
  )

  const statusTemplate = (row: Project) => (
    <div className="ap-status-cell">
      {row.featured && (
        <span className="ap-status-badge ap-status-featured">
          <i className="pi pi-star-fill"></i>
          Featured
        </span>
      )}
      {row.published ? (
        <span className="ap-status-badge ap-status-published">
          <i className="pi pi-check-circle"></i>
          Published
        </span>
      ) : (
        <span className="ap-status-badge ap-status-draft">
          <i className="pi pi-clock"></i>
          Draft
        </span>
      )}
    </div>
  )

  const actionsTemplate = (row: Project) => (
    <div className="ap-actions-cell">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)}
        className="ap-action-btn"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        tooltip="Hapus"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleDelete(row)}
        className="ap-action-btn"
      />
    </div>
  )

  const header = (
    <div className="ap-table-header">
      <div className="ap-table-header-left">
        <span className="ap-search">
          <i className="pi pi-search"></i>
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari works..."
          />
          {globalFilter && (
            <button
              type="button"
              className="ap-search-clear"
              onClick={() => setGlobalFilter('')}
              aria-label="Clear"
            >
              <i className="pi pi-times"></i>
            </button>
          )}
        </span>
      </div>

      <span className="ap-table-header-meta">
        <i className="pi pi-list"></i>
        Menampilkan <strong>{filteredProjects.length}</strong> dari{' '}
        <strong>{projects.length}</strong> works
      </span>
    </div>
  )

  const dialogFooter = (
    <div className="ap-dialog-footer">
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={() => setDialogVisible(false)}
        disabled={saving}
      />
      <Button
        label={
          saving
            ? 'Menyimpan...'
            : editingId
            ? 'Simpan Perubahan'
            : 'Buat Works'
        }
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSave}
        disabled={saving}
        className="ap-submit-btn"
      />
    </div>
  )

  return (
    <div className="ap-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* HEADER */}
      <header className="ap-header">
        <div className="ap-header-bg">
          <span className="ap-header-orb ap-header-orb-1" />
          <span className="ap-header-orb ap-header-orb-2" />
        </div>

        <div className="ap-header-inner">
          <div className="ap-header-left">
            <div className="ap-header-icon">
              <i className="pi pi-briefcase"></i>
            </div>
            <div className="ap-header-text">
              <span className="ap-header-eyebrow">
                <i className="pi pi-database"></i>
                Content Management
              </span>
              <h1 className="ap-header-title">
                Manage <span className="ap-header-title-gradient">Works</span>
              </h1>
              <p className="ap-header-subtitle">
                Kelola semua karya kamu — total{' '}
                <strong>{stats.total} works</strong>
              </p>
            </div>
          </div>

          <div className="ap-header-right">
            <Button
              label="Tambah Works"
              icon="pi pi-plus"
              onClick={openCreate}
              className="ap-add-btn ap-add-btn-lg"
            />
          </div>
        </div>
      </header>

      {/* STATS */}
      <div className="ap-stats">
        <div className="ap-stat tone-blue">
          <div className="ap-stat-icon">
            <i className="pi pi-briefcase"></i>
          </div>
          <div className="ap-stat-info">
            <span className="ap-stat-label">Total Works</span>
            <strong className="ap-stat-value">{stats.total}</strong>
          </div>
        </div>

        <div className="ap-stat tone-green">
          <div className="ap-stat-icon">
            <i className="pi pi-check-circle"></i>
          </div>
          <div className="ap-stat-info">
            <span className="ap-stat-label">Published</span>
            <strong className="ap-stat-value">{stats.published}</strong>
          </div>
        </div>

        <div className="ap-stat tone-gray">
          <div className="ap-stat-icon">
            <i className="pi pi-clock"></i>
          </div>
          <div className="ap-stat-info">
            <span className="ap-stat-label">Drafts</span>
            <strong className="ap-stat-value">{stats.drafts}</strong>
          </div>
        </div>

        <div className="ap-stat tone-orange">
          <div className="ap-stat-icon">
            <i className="pi pi-star-fill"></i>
          </div>
          <div className="ap-stat-info">
            <span className="ap-stat-label">Featured</span>
            <strong className="ap-stat-value">{stats.featured}</strong>
          </div>
        </div>
      </div>

      {/* FILTER CHIPS */}
      <div className="ap-filters">
        <span className="ap-filters-label">
          <i className="pi pi-filter"></i>
          Filter
        </span>
        <div className="ap-filters-chips">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`ap-chip tone-${opt.tone} ${
                filterStatus === opt.value ? 'is-active' : ''
              }`}
              onClick={() => setFilterStatus(opt.value)}
            >
              <i className={opt.icon}></i>
              <span>{opt.label}</span>
              <span className="ap-chip-count">{filterCount[opt.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="ap-table-wrapper">
        <DataTable
          value={filteredProjects}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          emptyMessage={
            <EmptyState
              variant="admin"
              icon="pi pi-briefcase"
              title={
                projects.length === 0 ? 'Belum Ada Works' : 'Tidak Ada Hasil'
              }
              description={
                projects.length === 0
                  ? 'Klik tombol di bawah untuk menambahkan karya pertama kamu.'
                  : 'Coba ubah kata kunci atau filter.'
              }
              actionLabel="Tambah Works"
              actionIcon="pi pi-plus"
              onAction={openCreate}
            />
          }
          responsiveLayout="scroll"
          stripedRows
          className="ap-table"
        >
          <Column
            header="Thumbnail"
            body={thumbnailTemplate}
            style={{ width: '110px' }}
          />
          <Column
            field="title"
            header="Title"
            body={titleTemplate}
            sortable
            style={{ minWidth: '240px' }}
          />
          <Column
            header="Tech Stack"
            body={techTemplate}
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Status"
            body={statusTemplate}
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Aksi"
            body={actionsTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      {/* DIALOG FORM */}
      <Dialog
        header={
          <div className="ap-dialog-header">
            <div className="ap-dialog-header-icon">
              <i className={editingId ? 'pi pi-pencil' : 'pi pi-plus'}></i>
            </div>
            <div className="ap-dialog-header-text">
              <strong>{editingId ? 'Edit Works' : 'Tambah Works'}</strong>
              <span>
                {editingId
                  ? 'Update informasi karya kamu'
                  : 'Isi detail karya baru'}
              </span>
            </div>
          </div>
        }
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '760px', maxWidth: '95vw' }}
        footer={dialogFooter}
        modal
        // blockScroll
        className="ap-dialog"
        baseZIndex={1100}
      >
        <div className="ap-form">
          {/* Section 1: Basic Info */}
          <div className="ap-form-section">
            <div className="ap-form-section-header">
              <div className="ap-form-section-icon tone-blue">
                <i className="pi pi-info-circle"></i>
              </div>
              <div>
                <h3 className="ap-form-section-title">Informasi Dasar</h3>
                <p className="ap-form-section-desc">
                  Judul, deskripsi, dan konten karya
                </p>
              </div>
            </div>

            <div className="ap-form-grid">
              <div className="ap-form-field ap-form-field-full">
                <label className="ap-form-label">
                  Title <span className="ap-form-required">*</span>
                </label>
                <InputText
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Judul karya"
                  className={
                    formErrors.title ? 'p-invalid w-full' : 'w-full'
                  }
                  maxLength={200}
                />
                {formErrors.title && (
                  <small className="ap-form-error">
                    <i className="pi pi-exclamation-circle"></i>
                    {formErrors.title}
                  </small>
                )}
              </div>

              <div className="ap-form-field ap-form-field-full">
                <label className="ap-form-label">
                  Slug
                  <span className="ap-form-hint-inline">
                    (kosongin aja, auto-generate)
                  </span>
                </label>
                <InputText
                  value={form.slug || ''}
                  onChange={(e) =>
                    setForm({ ...form, slug: e.target.value })
                  }
                  placeholder="auto-generate dari title"
                  className="w-full"
                  maxLength={200}
                />
              </div>

              <div className="ap-form-field ap-form-field-full">
                <label className="ap-form-label">Description</label>
                <InputTextarea
                  value={form.description || ''}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat karya (maks 500 karakter)"
                  rows={3}
                  autoResize
                  className="w-full"
                  maxLength={500}
                />
                <small className="ap-form-hint">
                  {(form.description || '').length} / 500
                </small>
              </div>

              <div className="ap-form-field ap-form-field-full">
                <label className="ap-form-label">Content</label>
                <InputTextarea
                  value={form.content || ''}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="Deskripsi lengkap karya..."
                  rows={6}
                  autoResize
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Thumbnail */}
          <div className="ap-form-section">
            <div className="ap-form-section-header">
              <div className="ap-form-section-icon tone-pink">
                <i className="pi pi-image"></i>
              </div>
              <div>
                <h3 className="ap-form-section-title">Thumbnail</h3>
                <p className="ap-form-section-desc">
                  Gambar preview untuk card karya
                </p>
              </div>
            </div>

            <ImageUpload
              value={form.thumbnailUrl || null}
              onChange={(url) =>
                setForm({ ...form, thumbnailUrl: url || '' })
              }
              label=""
              aspectRatio="video"
              maxSizeMB={10}
            />
          </div>

          {/* Section 3: Tech & Links */}
          <div className="ap-form-section">
            <div className="ap-form-section-header">
              <div className="ap-form-section-icon tone-green">
                <i className="pi pi-code"></i>
              </div>
              <div>
                <h3 className="ap-form-section-title">Tech & Links</h3>
                <p className="ap-form-section-desc">
                  Tools yang dipakai & link terkait
                </p>
              </div>
            </div>

            <div className="ap-form-grid">
              <div className="ap-form-field ap-form-field-full">
                <label className="ap-form-label">Tools / Tech Stack</label>
                <Chips
                  value={form.techStack || []}
                  onChange={(e) =>
                    setForm({ ...form, techStack: e.value || [] })
                  }
                  placeholder="Ketik, tekan Enter"
                  className="w-full"
                />
                <small className="ap-form-hint">
                  Contoh: Java, Spring Boot, React, PrimeReact
                </small>
              </div>

              <div className="ap-form-field">
                <label className="ap-form-label">
                  Link 1{' '}
                  <span className="ap-form-hint-inline">(GitHub/dll)</span>
                </label>
                <InputText
                  value={form.githubUrl || ''}
                  onChange={(e) =>
                    setForm({ ...form, githubUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full"
                />
              </div>

              <div className="ap-form-field">
                <label className="ap-form-label">
                  Link 2{' '}
                  <span className="ap-form-hint-inline">(Demo/dll)</span>
                </label>
                <InputText
                  value={form.demoUrl || ''}
                  onChange={(e) =>
                    setForm({ ...form, demoUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Status */}
          <div className="ap-form-section">
            <div className="ap-form-section-header">
              <div className="ap-form-section-icon tone-orange">
                <i className="pi pi-sliders-h"></i>
              </div>
              <div>
                <h3 className="ap-form-section-title">Status</h3>
                <p className="ap-form-section-desc">
                  Atur visibilitas & featured
                </p>
              </div>
            </div>

            <div className="ap-form-toggles">
              <div className="ap-form-toggle-card tone-orange">
                <div className="ap-form-toggle-icon tone-orange">
                  <i className="pi pi-star-fill"></i>
                </div>
                <div className="ap-form-toggle-content">
                  <label
                    htmlFor="featured"
                    className="ap-form-toggle-label"
                  >
                    Featured
                  </label>
                  <span className="ap-form-toggle-desc">
                    Tampilkan di section "Highlighted Works"
                  </span>
                </div>
                <InputSwitch
                  inputId="featured"
                  checked={form.featured || false}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.value })
                  }
                />
              </div>

              <div className="ap-form-toggle-card tone-green">
                <div className="ap-form-toggle-icon tone-green">
                  <i className="pi pi-check-circle"></i>
                </div>
                <div className="ap-form-toggle-content">
                  <label
                    htmlFor="published"
                    className="ap-form-toggle-label"
                  >
                    Published
                  </label>
                  <span className="ap-form-toggle-desc">
                    Karya bisa dilihat publik
                  </span>
                </div>
                <InputSwitch
                  inputId="published"
                  checked={form.published !== false}
                  onChange={(e) =>
                    setForm({ ...form, published: e.value })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default ManageProjects