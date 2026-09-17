import { useEffect, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Chip } from 'primereact/chip'
import { techStackService } from '@/services/techStackService'
import type { TechStack } from '@/types/techStack'

interface TechForm {
  name: string
  icon: string
  sortOrder: number
}

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
      setDialogVisible(false)
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

  const iconTemplate = (row: TechStack) => (
    <div className="admin-tech-icon">
      <i className={row.icon || 'pi pi-code'}></i>
    </div>
  )

  const nameTemplate = (row: TechStack) => (
    <strong className="admin-tech-name">{row.name}</strong>
  )

  const chipTemplate = (row: TechStack) => (
    <Chip
      label={row.name}
      icon={row.icon || 'pi pi-check'}
      className="admin-tech-chip-preview"
    />
  )

  const actionsTemplate = (row: TechStack) => (
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
          placeholder="Cari tool..."
        />
      </span>
      <Button
        label="Tambah Tool"
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
          <h1 className="admin-page-title">Manage Tools</h1>
          <p className="admin-page-subtitle">
            Kelola tools & software yang tampil di halaman About ({techs.length}{' '}
            total)
          </p>
        </div>
        <Button
          label="Tambah Tool"
          icon="pi pi-plus"
          onClick={openCreate}
          className="admin-page-add-btn"
        />
      </div>

      {techs.length > 0 && (
        <div className="admin-tech-preview-section">
          <div className="admin-tech-preview-label">
            <i className="pi pi-eye mr-1"></i>
            Preview tampilan di halaman About:
          </div>
          <div className="admin-tech-preview-chips">
            {techs.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                icon={t.icon || 'pi pi-check'}
              />
            ))}
          </div>
        </div>
      )}

      <div className="admin-table-wrapper">
        <DataTable
          value={techs}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          globalFilterFields={['name']}
          paginator
          rows={15}
          rowsPerPageOptions={[10, 15, 25, 50]}
          emptyMessage="Belum ada tools. Klik 'Tambah Tool' untuk mulai."
          responsiveLayout="scroll"
          stripedRows
          sortField="sortOrder"
          sortOrder={1}
          className="admin-table"
        >
          <Column
            header="Icon"
            body={iconTemplate}
            style={{ width: '80px' }}
          />
          <Column
            field="name"
            header="Nama Tool"
            body={nameTemplate}
            sortable
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Preview Chip"
            body={chipTemplate}
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
        header={editingId ? 'Edit Tool' : 'Tambah Tool'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '500px', maxWidth: '95vw' }}
        footer={dialogFooter}
        modal
        blockScroll
      >
        <div className="admin-form">
          <div className="admin-form-field">
            <label className="admin-form-label">
              Nama Tool <span className="text-red-500">*</span>
            </label>
            <InputText
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Java, React, Figma, Photoshop..."
              className={formErrors.name ? 'p-invalid w-full' : 'w-full'}
              maxLength={100}
              autoFocus
            />
            {formErrors.name && (
              <small className="admin-form-error">{formErrors.name}</small>
            )}
          </div>

          <div className="admin-form-field">
            <label className="admin-form-label">Icon</label>
            <div className="admin-icon-picker">
              <div className="admin-icon-picker-preview">
                <i className={`${form.icon} text-xl`}></i>
              </div>
              <InputText
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="pi pi-code"
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
            <label className="admin-form-label">Preview</label>
            <div className="admin-tech-chip-preview-box">
              <Chip
                label={form.name || 'Nama Tool'}
                icon={form.icon || 'pi pi-check'}
              />
            </div>
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
            <small className="admin-form-hint">
              Angka kecil tampil duluan
            </small>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default ManageTechStack