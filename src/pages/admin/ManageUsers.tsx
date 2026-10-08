import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Dialog } from 'primereact/dialog'
import { InputTextarea } from 'primereact/inputtextarea'
import { Menu } from 'primereact/menu'
import type { MenuItem } from 'primereact/menuitem'
import EmptyState from '@/components/EmptyState'
import { userService } from '@/services/userService'
import type { UserAdmin, UserStatus } from '@/types/user'

// ============================================================
// FILTER TABS
// ============================================================
type StatusFilter = 'all' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED'

interface FilterOption {
  label: string
  value: StatusFilter
  icon: string
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All', value: 'all', icon: 'pi pi-th-large' },
  { label: 'Pending', value: 'PENDING', icon: 'pi pi-clock' },
  { label: 'Active', value: 'ACTIVE', icon: 'pi pi-check-circle' },
  { label: 'Rejected', value: 'REJECTED', icon: 'pi pi-times-circle' },
  { label: 'Suspended', value: 'SUSPENDED', icon: 'pi pi-ban' },
]

// ============================================================
// AVATAR TONES
// ============================================================
const AVATAR_TONES = [
  { bg: '#dbeafe', fg: '#1d4ed8' },
  { bg: '#ede9fe', fg: '#6d28d9' },
  { bg: '#fce7f3', fg: '#be185d' },
  { bg: '#d1fae5', fg: '#047857' },
  { bg: '#fef3c7', fg: '#b45309' },
  { bg: '#cffafe', fg: '#0e7490' },
]

function getAvatarTone(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return AVATAR_TONES[Math.abs(hash) % AVATAR_TONES.length]
}

// ============================================================
// STATUS CONFIG
// ============================================================
const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; tone: string; icon: string }
> = {
  PENDING: { label: 'Pending', tone: 'amber', icon: 'pi pi-clock' },
  ACTIVE: { label: 'Active', tone: 'green', icon: 'pi pi-check-circle' },
  REJECTED: { label: 'Rejected', tone: 'red', icon: 'pi pi-times-circle' },
  SUSPENDED: { label: 'Suspended', tone: 'zinc', icon: 'pi pi-ban' },
}

// ============================================================
// COMPONENT
// ============================================================
function ManageUsers() {
  const toast = useRef<Toast>(null)
  const rowMenuRef = useRef<Menu>(null)
  const navigate = useNavigate()

  const [users, setUsers] = useState<UserAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [activeRow, setActiveRow] = useState<UserAdmin | null>(null)

  // Dialog
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogMode, setDialogMode] = useState<'reject' | 'suspend'>('reject')
  const [dialogUserId, setDialogUserId] = useState<number | null>(null)
  const [dialogReason, setDialogReason] = useState('')
  const [dialogSaving, setDialogSaving] = useState(false)

  // ============================================================
  // FETCH
  // ============================================================
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getAllForAdmin()
      setUsers(data)
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat users',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // ============================================================
  // STATS
  // ============================================================
  const stats = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((u) => u.status === 'PENDING').length,
      active: users.filter((u) => u.status === 'ACTIVE').length,
      rejected: users.filter((u) => u.status === 'REJECTED').length,
      suspended: users.filter((u) => u.status === 'SUSPENDED').length,
    }),
    [users]
  )

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return users
    return users.filter((u) => u.status === statusFilter)
  }, [users, statusFilter])

  const filterCount = useMemo<Record<StatusFilter, number>>(
    () => ({
      all: stats.total,
      PENDING: stats.pending,
      ACTIVE: stats.active,
      REJECTED: stats.rejected,
      SUSPENDED: stats.suspended,
    }),
    [stats]
  )

  // ============================================================
  // ACTIONS
  // ============================================================
  const handleApprove = (user: UserAdmin) => {
    confirmDialog({
      message: `Approve user "${user.username}"? User bakal bisa login.`,
      header: 'Approve user',
      icon: 'pi pi-check-circle',
      acceptClassName: 'p-button-success',
      accept: async () => {
        try {
          await userService.approveUser(user.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: `User "${user.username}" di-approve`,
            life: 3000,
          })
          fetchUsers()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal approve user',
            life: 3000,
          })
        }
      },
    })
  }

  const openReasonDialog = (user: UserAdmin, mode: 'reject' | 'suspend') => {
    setDialogUserId(user.id)
    setDialogMode(mode)
    setDialogReason('')
    setDialogVisible(true)
  }

  const handleSubmitReason = async () => {
    if (!dialogUserId) return
    try {
      setDialogSaving(true)
      if (dialogMode === 'reject') {
        await userService.rejectUser(
          dialogUserId,
          dialogReason || 'Tidak memenuhi syarat'
        )
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'User di-reject',
          life: 3000,
        })
      } else {
        await userService.suspendUser(
          dialogUserId,
          dialogReason || 'Melanggar aturan'
        )
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'User di-suspend',
          life: 3000,
        })
      }
      setDialogVisible(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal update status user',
        life: 3000,
      })
    } finally {
      setDialogSaving(false)
    }
  }

  const handleDelete = (user: UserAdmin) => {
    confirmDialog({
      message: `Yakin hapus user "${user.username}"? Semua data (projects, blog, dll) bakal ikut kehapus.`,
      header: 'Hapus user',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await userService.deleteByAdmin(user.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'User dihapus',
            life: 3000,
          })
          fetchUsers()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus user',
            life: 3000,
          })
        }
      },
    })
  }

  // ============================================================
  // ROW MENU
  // ============================================================
  const buildRowMenu = (user: UserAdmin): MenuItem[] => {
    const items: MenuItem[] = [
      {
        label: 'Lihat detail',
        icon: 'pi pi-eye',
        command: () => navigate(`/admin/users/${user.id}`),
      },
      { separator: true },
    ]

    if (user.status === 'PENDING') {
      items.push({
        label: 'Approve user',
        icon: 'pi pi-check',
        command: () => handleApprove(user),
      })
    }

    if (user.status === 'PENDING' || user.status === 'ACTIVE') {
      items.push({
        label: 'Reject user',
        icon: 'pi pi-times',
        command: () => openReasonDialog(user, 'reject'),
      })
    }

    if (user.status === 'ACTIVE') {
      items.push({
        label: 'Suspend user',
        icon: 'pi pi-ban',
        command: () => openReasonDialog(user, 'suspend'),
      })
    }

    items.push({ separator: true })
    items.push({
      label: 'Hapus user',
      icon: 'pi pi-trash',
      className: 'usr-row-menu-danger',
      command: () => handleDelete(user),
    })

    return items
  }

  // ============================================================
  // TEMPLATES
  // ============================================================
  const userTemplate = (row: UserAdmin) => {
    const tone = getAvatarTone(row.username)
    const initial = (row.displayName || row.username).charAt(0).toUpperCase()
    return (
      <div className="usr-cell">
        <div
          className="usr-avatar"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {initial}
        </div>
        <div className="usr-meta">
          <span className="usr-name">
            {row.displayName || row.username}
          </span>
          <span className="usr-sub">
            <span className="usr-handle">@{row.username}</span>
            <span className="usr-dot">·</span>
            <span className="usr-slug">/{row.portfolioSlug}</span>
          </span>
          <span className="usr-email">{row.email}</span>
        </div>
      </div>
    )
  }

  const roleTemplate = (row: UserAdmin) => (
    <span
      className={`usr-role ${
        row.role === 'SUPER_ADMIN' ? 'is-admin' : 'is-owner'
      }`}
    >
      <i
        className={row.role === 'SUPER_ADMIN' ? 'pi pi-shield' : 'pi pi-user'}
      />
      {row.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Owner'}
    </span>
  )

  const statusTemplate = (row: UserAdmin) => {
    const c = STATUS_CONFIG[row.status] || STATUS_CONFIG.PENDING
    return (
      <span className={`usr-status tone-${c.tone}`}>
        <i className={c.icon} />
        {c.label}
      </span>
    )
  }

  const dateTemplate = (row: UserAdmin) => (
    <span className="usr-date">
      {new Date(row.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    </span>
  )

  const actionsTemplate = (row: UserAdmin) => (
    <div className="usr-actions">
      <Link
        to={`/admin/users/${row.id}`}
        className="usr-action usr-action-view"
        aria-label="View"
      >
        <i className="pi pi-eye" />
      </Link>
      <button
        type="button"
        className="usr-action"
        onClick={(e) => {
          setActiveRow(row)
          rowMenuRef.current?.toggle(e)
        }}
        aria-label="More actions"
      >
        <i className="pi pi-ellipsis-h" />
      </button>
    </div>
  )

  // ============================================================
  // HEADER / DIALOG
  // ============================================================
  const tableHeader = (
    <div className="usr-table-toolbar">
      <div className="usr-table-toolbar-left">
        <span className="usr-search">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search users by name, email, username…"
          />
        </span>
      </div>
      <div className="usr-table-toolbar-right">
        <span className="usr-table-count">
          <strong>{filtered.length}</strong>
          <span>of {users.length}</span>
        </span>
      </div>
    </div>
  )

  const dialogHeader = (
    <div className="usr-dialog-head">
      <span
        className={`usr-dialog-head-icon ${
          dialogMode === 'reject' ? 'is-red' : 'is-amber'
        }`}
      >
        <i
          className={
            dialogMode === 'reject' ? 'pi pi-times-circle' : 'pi pi-ban'
          }
        />
      </span>
      <div className="usr-dialog-head-text">
        <strong>
          {dialogMode === 'reject' ? 'Reject user' : 'Suspend user'}
        </strong>
        <span>
          {dialogMode === 'reject'
            ? 'User tidak akan bisa login. Berikan alasan.'
            : 'User tidak bisa login sementara. Berikan alasan.'}
        </span>
      </div>
    </div>
  )

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dash">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />
        <div className="dash-hero-inner">
          <div className="dash-hero-left">
            <span className="dash-hero-greeting">
              <i className="pi pi-users" />
              User management
            </span>
            <h1 className="dash-hero-title">
              Manage <span className="dash-hero-name">users</span>
            </h1>
            <p className="dash-hero-desc">
              Kelola semua akun pengguna platform — approve, reject, suspend,
              atau hapus.
            </p>

            <div className="dash-hero-actions">
              <Link to="/admin/users/new" className="dash-hero-btn primary">
                <i className="pi pi-plus" />
                <span>Tambah user</span>
                <i className="pi pi-arrow-right" />
              </Link>
            </div>
          </div>

          <div className="dash-hero-right">
            <div className="dash-hero-meta">
              <span className="dash-hero-meta-item">
                <i className="pi pi-users" />
                {stats.total} total
              </span>
              <span className="dash-hero-meta-divider" />
              <span className="dash-hero-meta-item">
                <span
                  className="dash-hero-meta-dot"
                  style={{
                    background: '#10b981',
                    boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                  }}
                />
                {stats.active} active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEGMENTED TABS ===== */}
      <div className="usr-segments" role="tablist">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={statusFilter === opt.value}
            className={`usr-segment ${
              statusFilter === opt.value ? 'is-active' : ''
            }`}
            onClick={() => setStatusFilter(opt.value)}
          >
            <i className={opt.icon} />
            <span className="usr-segment-label">{opt.label}</span>
            <span className="usr-segment-count">
              {filterCount[opt.value]}
            </span>
          </button>
        ))}
      </div>

      {/* ===== TABLE ===== */}
      <div className="usr-table-wrap">
        <DataTable
          value={filtered}
          loading={loading}
          header={tableHeader}
          globalFilter={globalFilter}
          globalFilterFields={[
            'username',
            'displayName',
            'email',
            'portfolioSlug',
          ]}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
          currentPageReportTemplate="{first}–{last} of {totalRecords}"
          emptyMessage={
            <EmptyState
              variant="admin"
              icon="pi pi-users"
              title={
                users.length === 0 ? 'Belum ada user' : 'Tidak ada hasil'
              }
              description={
                users.length === 0
                  ? 'Klik tombol di bawah untuk menambahkan user pertama.'
                  : 'Coba ubah kata kunci atau filter.'
              }
            />
          }
          responsiveLayout="scroll"
          sortField="createdAt"
          sortOrder={-1}
          className="usr-table"
        >
          <Column
            field="username"
            header="User"
            body={userTemplate}
            sortable
            style={{ minWidth: '320px' }}
          />
          <Column
            field="role"
            header="Role"
            body={roleTemplate}
            sortable
            style={{ width: '160px' }}
          />
          <Column
            field="status"
            header="Status"
            body={statusTemplate}
            sortable
            style={{ width: '140px' }}
          />
          <Column
            field="createdAt"
            header="Joined"
            body={dateTemplate}
            sortable
            style={{ width: '140px' }}
          />
          <Column
            header=""
            body={actionsTemplate}
            style={{ width: '100px' }}
          />
        </DataTable>
      </div>

      {/* ===== ROW MENU ===== */}
      <Menu
        model={activeRow ? buildRowMenu(activeRow) : []}
        popup
        ref={rowMenuRef}
        className="usr-row-menu"
      />

      {/* ===== DIALOG ===== */}
      <Dialog
        header={dialogHeader}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '520px', maxWidth: '95vw' }}
        modal
        blockScroll
        className="usr-dialog"
        footer={
          <div className="usr-dialog-foot">
            <Button
              label="Batal"
              icon="pi pi-times"
              severity="secondary"
              outlined
              onClick={() => setDialogVisible(false)}
              disabled={dialogSaving}
            />
            <Button
              label={
                dialogSaving
                  ? 'Menyimpan…'
                  : dialogMode === 'reject'
                  ? 'Reject user'
                  : 'Suspend user'
              }
              icon={
                dialogSaving
                  ? 'pi pi-spin pi-spinner'
                  : dialogMode === 'reject'
                  ? 'pi pi-times'
                  : 'pi pi-ban'
              }
              severity={dialogMode === 'reject' ? 'danger' : 'warning'}
              onClick={handleSubmitReason}
              disabled={dialogSaving}
            />
          </div>
        }
      >
        <div className="usr-dialog-field">
          <label className="usr-dialog-label">
            Alasan {dialogMode === 'reject' ? 'reject' : 'suspend'}
          </label>
          <InputTextarea
            value={dialogReason}
            onChange={(e) => setDialogReason(e.target.value)}
            placeholder={
              dialogMode === 'reject'
                ? 'Contoh: Data tidak valid, email tidak aktif…'
                : 'Contoh: Melanggar aturan, spam…'
            }
            rows={4}
            autoResize
            className="w-full"
            maxLength={500}
          />
          <small className="usr-dialog-hint">
            <i className="pi pi-info-circle" />
            Opsional. Kosongkan untuk pakai alasan default.
          </small>
        </div>
      </Dialog>
    </div>
  )
}

export default ManageUsers