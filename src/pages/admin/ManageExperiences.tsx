import { useEffect, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { Chips } from 'primereact/chips'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'
import { experienceService } from '@/services/experienceService'
import type { Experience } from '@/types/experience'

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
  '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#6366f1',
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
      setDialogVisible(false)
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

  const markerTemplate = (row: Experience) => (
    <div
      className="admin-exp-marker"
      style={{ backgroundColor: row.color || '#3b82f6' }}
    >
      <i className={row.icon || 'pi pi-circle'}></i>
    </div>
  )

  const titleTemplate = (row: Experience) => (
    <div className="admin-exp-title-cell">
      {row.year && <span className="admin-exp-year">{row.year}</span>}
      <strong className="admin-exp-title">{row.title}</strong>
      {row.subtitle && (
        <span className="admin-exp-subtitle">{row.subtitle}</span>
      )}
    </div>
  )

  const tagsTemplate = (row: Experience) => (
    <div className="flex flex-wrap gap-1">
      {row.tags?.slice(0, 3).map((t) => (
        <Tag key={t} value={t} severity="info" />
      ))}
      {row.tags && row.tags.length > 3 && (
        <Tag value={`+${row.tags.length - 3}`} severity="secondary" />
      )}
      {!row.tags?.length && (
        <span className="text-color-secondary text-sm">—</span>
      )}
    </div>
  )

  const actionsTemplate = (row: Experience) => (
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
          placeholder="Cari journey..."
        />
      </span>
      <Button
        label="Tambah Journey"
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
          <h1 className="admin-page-title">Manage Journey</h1>
          <p className="admin-page-subtitle">
            Kelola perjalanan karier & pengalaman ({experiences.length} total)
          </p>
        </div>
        <Button
          label="Tambah Journey"
          icon="pi pi-plus"
          onClick={openCreate}
          className="admin-page-add-btn"
        />
      </div>

      <div className="admin-table-wrapper">
        <DataTable
          value={experiences}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          globalFilterFields={['title', 'subtitle', 'year']}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage="Belum ada journey. Klik 'Tambah Journey' untuk mulai."
          responsiveLayout="scroll"
          stripedRows
          sortField="sortOrder"
          sortOrder={1}
          className="admin-table"
        >
          <Column header="" body={markerTemplate} style={{ width: '80px' }} />
          <Column
            field="title"
            header="Journey"
            body={titleTemplate}
            sortable
            style={{ minWidth: '240px' }}
          />
          <Column
            header="Tags"
            body={tagsTemplate}
            style={{ minWidth: '200px' }}
          />
          <Column
            field="sortOrder"
            header="Urutan"
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

      <Dialog
        header={editingId ? 'Edit Journey' : 'Tambah Journey'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '650px', maxWidth: '95vw' }}
        footer={dialogFooter}
        modal
        blockScroll
      >
        <div className="admin-form">
          <div className="admin-form-row">
            <div className="admin-form-field">
              <label className="admin-form-label">Tahun / Periode</label>
              <InputText
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="2023 - Sekarang"
                className={formErrors.year ? 'p-invalid w-full' : 'w-full'}
                maxLength={100}
              />
              {formErrors.year && (
                <small className="admin-form-error">{formErrors.year}</small>
              )}
            </div>
            <div className="admin-form-field">
              <label className="admin-form-label">Urutan</label>
              <InputNumber
                value={form.sortOrder}
                onValueChange={(e) =>
                  setForm({ ...form, sortOrder: e.value || 0 })
                }
                min={0}
                showButtons
                className="w-full"
              />
            </div>
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Full-Stack Developer"
              className={formErrors.title ? 'p-invalid w-full' : 'w-full'}
              maxLength={200}
            />
            {formErrors.title && (
              <small className="admin-form-error">{formErrors.title}</small>
            )}
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Subtitle / Perusahaan</label>
            <InputText
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="PT XYZ Technology"
              className={formErrors.subtitle ? 'p-invalid w-full' : 'w-full'}
              maxLength={200}
            />
            {formErrors.subtitle && (
              <small className="admin-form-error">
                {formErrors.subtitle}
              </small>
            )}
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Description</label>
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

          <div className="admin-form-field">
            <label className="admin-form-label">Tags</label>
            <Chips
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.value || [] })}
              placeholder="Ketik, tekan Enter"
              className="w-full"
            />
            <small className="admin-form-hint">
              Contoh: Java, Spring Boot, React
            </small>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-field">
              <label className="admin-form-label">Icon</label>
              <div className="admin-icon-picker">
                <div className="admin-icon-picker-preview">
                  <i className={`${form.icon} text-xl`}></i>
                </div>
                <InputText
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="pi pi-briefcase"
                  className="w-full"
                />
              </div>
              <div className="admin-icon-presets">
                {ICON_PRESETS.map((p) => (
                  <button
                    key={p.icon}
                    type="button"
                    className={`admin-icon-preset ${
                      form.icon === p.icon ? 'admin-icon-preset-active' : ''
                    }`}
                    onClick={() => setForm({ ...form, icon: p.icon })}
                    title={p.label}
                  >
                    <i className={p.icon}></i>
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-form-field">
              <label className="admin-form-label">Warna Marker</label>
              <div className="admin-color-picker">
                <div
                  className="admin-color-preview"
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
              <div className="admin-color-presets">
                {COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`admin-color-preset ${
                      form.color === c ? 'admin-color-preset-active' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setForm({ ...form, color: c })}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default ManageExperiences