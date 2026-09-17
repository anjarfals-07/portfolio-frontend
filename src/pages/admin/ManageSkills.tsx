import { useEffect, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Tag } from 'primereact/tag'
import { ProgressBar } from 'primereact/progressbar'
import { skillService } from '@/services/skillService'
import type { Skill } from '@/types/skill'

interface SkillForm {
  category: string
  categoryIcon: string
  name: string
  level: number
  sortOrder: number
}

const EMPTY_FORM: SkillForm = {
  category: 'Backend',
  categoryIcon: 'pi pi-server',
  name: '',
  level: 50,
  sortOrder: 0,
}

const CATEGORY_OPTIONS = [
  { label: 'Backend', value: 'Backend', icon: 'pi pi-server' },
  { label: 'Frontend', value: 'Frontend', icon: 'pi pi-code' },
  { label: 'Tools & DevOps', value: 'Tools & DevOps', icon: 'pi pi-wrench' },
  { label: 'Database', value: 'Database', icon: 'pi pi-database' },
  { label: 'Mobile', value: 'Mobile', icon: 'pi pi-mobile' },
  { label: 'Other', value: 'Other', icon: 'pi pi-star' },
]

function ManageSkills() {
  const toast = useRef<Toast>(null)

  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dialog
  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<SkillForm>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Filter
  const [globalFilter, setGlobalFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // ===== FETCH =====
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

  // ===== OPEN DIALOG =====
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setDialogVisible(true)
  }

  const openEdit = (skill: Skill) => {
    setEditingId(skill.id)
    setForm({
      category: skill.category || 'Backend',
      categoryIcon: skill.categoryIcon || 'pi pi-server',
      name: skill.name,
      level: skill.level,
      sortOrder: skill.sortOrder,
    })
    setFormErrors({})
    setDialogVisible(true)
  }

  // ===== VALIDASI =====
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

  // ===== SAVE =====
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
      setDialogVisible(false)
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

  // ===== DELETE =====
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

  // ===== HANDLE CATEGORY CHANGE =====
  const handleCategoryChange = (category: string) => {
    const opt = CATEGORY_OPTIONS.find((c) => c.value === category)
    setForm({
      ...form,
      category,
      categoryIcon: opt?.icon || 'pi pi-star',
    })
  }

  // ===== TEMPLATES =====
  const categoryTemplate = (row: Skill) => (
    <div className="admin-category-cell">
      <i className={`${row.categoryIcon || 'pi pi-star'} text-primary`}></i>
      <span>{row.category || '—'}</span>
    </div>
  )

  const nameTemplate = (row: Skill) => (
    <strong className="admin-skill-name">{row.name}</strong>
  )

  const levelTemplate = (row: Skill) => (
    <div className="admin-level-cell">
      <ProgressBar
        value={row.level}
        showValue={false}
        style={{ height: '6px', flex: 1 }}
      />
      <span className="admin-level-value">{row.level}%</span>
    </div>
  )

  const actionsTemplate = (row: Skill) => (
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
      <div className="flex gap-2 flex-wrap flex-1">
        <span className="p-input-icon-left admin-search">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari skill..."
          />
        </span>
        <Dropdown
          value={categoryFilter}
          options={CATEGORY_OPTIONS}
          onChange={(e) => setCategoryFilter(e.value)}
          placeholder="Semua Kategori"
          showClear
          className="admin-category-filter"
        />
      </div>
      <Button
        label="Tambah Skill"
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

      {/* ===== HEADER ===== */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Manage Skills</h1>
          <p className="admin-page-subtitle">
            Kelola skill & keahlian kamu ({skills.length} total)
          </p>
        </div>
        <Button
          label="Tambah Skill"
          icon="pi pi-plus"
          onClick={openCreate}
          className="admin-page-add-btn"
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="admin-table-wrapper">
        <DataTable
          value={skills}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          filters={{ category: { value: categoryFilter, matchMode: 'equals' } }}
          globalFilterFields={['name', 'category']}
          paginator
          rows={10}
          rowsPerPageOptions={[10, 25, 50]}
          emptyMessage="Belum ada skill. Klik 'Tambah Skill' untuk mulai."
          responsiveLayout="scroll"
          stripedRows
          sortField="sortOrder"
          sortOrder={1}
          className="admin-table"
        >
          <Column
            field="category"
            header="Kategori"
            body={categoryTemplate}
            filter
            filterField="category"
            showFilterMatchModes={false}
            showClearButton={false}
            style={{ minWidth: '180px' }}
          />
          <Column
            field="name"
            header="Skill"
            body={nameTemplate}
            sortable
            style={{ minWidth: '180px' }}
          />
          <Column
            field="level"
            header="Level"
            body={levelTemplate}
            sortable
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

      {/* ===== DIALOG FORM ===== */}
      <Dialog
        header={editingId ? 'Edit Skill' : 'Tambah Skill'}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '550px', maxWidth: '95vw' }}
        footer={dialogFooter}
        modal
        blockScroll
      >
        <div className="admin-form">
          {/* Category */}
          <div className="admin-form-field">
            <label className="admin-form-label">
              Kategori <span className="text-red-500">*</span>
            </label>
            <Dropdown
              value={form.category}
              options={CATEGORY_OPTIONS}
              onChange={(e) => handleCategoryChange(e.value)}
              placeholder="Pilih kategori"
              className="w-full"
            />
            {formErrors.category && (
              <small className="admin-form-error">{formErrors.category}</small>
            )}
          </div>

          {/* Category Icon (auto-filled) */}
          <div className="admin-form-field">
            <label className="admin-form-label">Icon Kategori</label>
            <div className="admin-icon-preview">
              <i className={`${form.categoryIcon} text-2xl text-primary`}></i>
              <InputText
                value={form.categoryIcon}
                onChange={(e) =>
                  setForm({ ...form, categoryIcon: e.target.value })
                }
                placeholder="pi pi-server"
                className="w-full"
              />
            </div>
            <small className="admin-form-hint">
              Auto-filled dari kategori. Bisa custom.
            </small>
          </div>

          {/* Name */}
          <div className="admin-form-field">
            <label className="admin-form-label">
              Nama Skill <span className="text-red-500">*</span>
            </label>
            <InputText
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Java, React, PostgreSQL..."
              className={formErrors.name ? 'p-invalid w-full' : 'w-full'}
              maxLength={100}
            />
            {formErrors.name && (
              <small className="admin-form-error">{formErrors.name}</small>
            )}
          </div>

          {/* Level */}
          <div className="admin-form-field">
            <label className="admin-form-label">
              Level (0-100) <span className="text-red-500">*</span>
            </label>
            <div className="admin-level-input">
              <InputNumber
                value={form.level}
                onValueChange={(e) =>
                  setForm({ ...form, level: e.value || 0 })
                }
                min={0}
                max={100}
                showButtons
                className="w-full"
              />
              <div className="admin-level-preview">
                <ProgressBar
                  value={form.level}
                  showValue={false}
                  style={{ height: '8px' }}
                />
                <span className="admin-level-preview-value">{form.level}%</span>
              </div>
            </div>
            {formErrors.level && (
              <small className="admin-form-error">{formErrors.level}</small>
            )}
          </div>

          {/* Sort Order */}
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

export default ManageSkills