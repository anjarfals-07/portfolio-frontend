import { useEffect, useRef, useState } from 'react'
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
import { Tag } from 'primereact/tag'
import { Image } from 'primereact/image'
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

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await projectService.getAll(true)
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
    if (form.title.length > 200) errors.title = 'Title maksimal 200 karakter'
    if (form.description && form.description.length > 500) {
      errors.description = 'Description maksimal 500 karakter'
    }
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

  const thumbnailTemplate = (row: Project) => {
    if (!row.thumbnailUrl) {
      return (
        <div className="admin-thumb-placeholder">
          <i className="pi pi-image"></i>
        </div>
      )
    }
    return (
      <Image
        src={row.thumbnailUrl}
        alt={row.title}
        width="60"
        height="40"
        preview
        className="admin-thumb"
        imageClassName="admin-thumb-img"
      />
    )
  }

  const titleTemplate = (row: Project) => (
    <div className="admin-title-cell">
      <strong>{row.title}</strong>
      <span className="admin-slug">{row.slug}</span>
    </div>
  )

  const techTemplate = (row: Project) => (
    <div className="flex flex-wrap gap-1">
      {row.techStack?.slice(0, 3).map((t) => (
        <Tag key={t} value={t} severity="info" />
      ))}
      {row.techStack && row.techStack.length > 3 && (
        <Tag value={`+${row.techStack.length - 3}`} severity="secondary" />
      )}
      {!row.techStack?.length && (
        <span className="text-color-secondary text-sm">—</span>
      )}
    </div>
  )

  const statusTemplate = (row: Project) => (
    <div className="flex gap-1 flex-wrap">
      {row.featured && <Tag value="⭐ Featured" severity="warning" />}
      {row.published ? (
        <Tag value="✅ Published" severity="success" />
      ) : (
        <Tag value="⏸ Draft" severity="secondary" />
      )}
    </div>
  )

  const actionsTemplate = (row: Project) => (
    <div className="flex gap-1">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        tooltip="Edit"
        onClick={() => openEdit(row)}
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        tooltip="Hapus"
        onClick={() => handleDelete(row)}
      />
    </div>
  )

  const header = (
    <div className="admin-table-header">
      <span className="p-input-icon-left admin-search">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Cari works..."
        />
      </span>
      <Button
        label="Tambah Works"
        icon="pi pi-plus"
        onClick={openCreate}
      />
    </div>
  )

  const dialogFooter = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={() => setDialogVisible(false)}
        disabled={saving}
      />
      <Button
        label={saving ? 'Menyimpan...' : 'Simpan'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSave}
        disabled={saving}
      />
    </div>
  )

  return (
    <div className="admin-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage Works</h1>
          <p className="admin-page-subtitle">
            Kelola semua karya kamu
          </p>
        </div>
        <Button
          label="Tambah Works"
          icon="pi pi-plus"
          onClick={openCreate}
          className="admin-page-add-btn"
        />
      </div>

      <div className="admin-table-wrapper">
        <DataTable
          value={projects}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          emptyMessage="Belum ada works. Klik 'Tambah Works' untuk mulai."
          responsiveLayout="scroll"
          stripedRows
          className="admin-table"
        >
          <Column
            header="Thumbnail"
            body={thumbnailTemplate}
            style={{ width: '100px' }}
          />
          <Column
            field="title"
            header="Title"
            body={titleTemplate}
            sortable
            style={{ minWidth: '200px' }}
          />
          <Column
            header="Tools"
            body={techTemplate}
            style={{ minWidth: '200px' }}
          />
          <Column
            header="Status"
            body={statusTemplate}
            style={{ width: '180px' }}
          />
          <Column
            header="Aksi"
            body={actionsTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      <Dialog
        header={editingId ? 'Edit Works' : 'Tambah Works'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '700px', maxWidth: '95vw' }}
        footer={dialogFooter}
        modal
        blockScroll
      >
        <div className="admin-form">
          <div className="admin-form-field">
            <label className="admin-form-label">
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Judul karya"
              className={formErrors.title ? 'p-invalid w-full' : 'w-full'}
              maxLength={200}
            />
            {formErrors.title && (
              <small className="admin-form-error">{formErrors.title}</small>
            )}
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Slug</label>
            <InputText
              value={form.slug || ''}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generate dari title (kosongin aja)"
              className="w-full"
              maxLength={200}
            />
            <small className="admin-form-hint">
              Kosongin aja, otomatis dari title
            </small>
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Description</label>
            <InputTextarea
              value={form.description || ''}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Deskripsi singkat (maks 500 karakter)"
              rows={3}
              autoResize
              className="w-full"
              maxLength={500}
            />
            <small className="admin-form-hint">
              {(form.description || '').length} / 500
            </small>
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Content</label>
            <InputTextarea
              value={form.content || ''}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Deskripsi lengkap karya..."
              rows={6}
              autoResize
              className="w-full"
            />
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Thumbnail URL</label>
            <InputText
              value={form.thumbnailUrl || ''}
              onChange={(e) =>
                setForm({ ...form, thumbnailUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="w-full"
            />
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Tools</label>
            <Chips
              value={form.techStack || []}
              onChange={(e) =>
                setForm({ ...form, techStack: e.value || [] })
              }
              placeholder="Ketik, tekan Enter"
              className="w-full"
            />
            <small className="admin-form-hint">
              Contoh: Java, Spring Boot, React (atau tools lain sesuai bidang)
            </small>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-field">
              <label className="admin-form-label">Link 1 (GitHub/dll)</label>
              <InputText
                value={form.githubUrl || ''}
                onChange={(e) =>
                  setForm({ ...form, githubUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full"
              />
            </div>
            <div className="admin-form-field">
              <label className="admin-form-label">Link 2 (Demo/dll)</label>
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

          <div className="admin-form-row">
            <div className="admin-form-toggle">
              <InputSwitch
                inputId="featured"
                checked={form.featured || false}
                onChange={(e) => setForm({ ...form, featured: e.value })}
              />
              <label htmlFor="featured">⭐ Featured</label>
            </div>
            <div className="admin-form-toggle">
              <InputSwitch
                inputId="published"
                checked={form.published !== false}
                onChange={(e) => setForm({ ...form, published: e.value })}
              />
              <label htmlFor="published">✅ Published</label>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default ManageProjects