import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Skeleton } from 'primereact/skeleton'
import { InputText } from 'primereact/inputtext'
import { messageService } from '@/services/messageService'
import type { Message as MessageType } from '@/types/message'

/* ============================================================
   TYPES
   ============================================================ */

type FilterOption = 'all' | 'unread' | 'read'

interface FilterConfig {
  label: string
  value: FilterOption
  icon: string
  tone: 'blue' | 'orange' | 'green'
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const FILTER_OPTIONS: FilterConfig[] = [
  { label: 'Semua', value: 'all', icon: 'pi pi-inbox', tone: 'blue' },
  { label: 'Belum Dibaca', value: 'unread', icon: 'pi pi-envelope', tone: 'orange' },
  { label: 'Sudah Dibaca', value: 'read', icon: 'pi pi-check-circle', tone: 'green' },
]

/* ============================================================
   HELPERS
   ============================================================ */

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Baru saja'
  if (diffMins < 60) return `${diffMins} menit lalu`
  if (diffHours < 24) return `${diffHours} jam lalu`
  if (diffDays < 7) return `${diffDays} hari lalu`

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const getAvatarColor = (name: string): string => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b',
    '#ef4444', '#06b6d4', '#ec4899', '#6366f1',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

/* ============================================================
   COMPONENT
   ============================================================ */

function Inbox() {
  const toast = useRef<Toast>(null)

  const [messages, setMessages] = useState<MessageType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [filter, setFilter] = useState<FilterOption>('all')
  const [search, setSearch] = useState('')

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const data = await messageService.getAll()
      setMessages(data)

      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id)
      }
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat pesan',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ------------------------------------------------------------
     SELECT
     ------------------------------------------------------------ */
  const handleSelect = async (msg: MessageType) => {
    setSelectedId(msg.id)

    if (!msg.read) {
      try {
        const updated = await messageService.markAsRead(msg.id, true)
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? updated : m))
        )
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }
  }

  /* ------------------------------------------------------------
     TOGGLE READ
     ------------------------------------------------------------ */
  const handleToggleRead = async (msg: MessageType) => {
    try {
      const updated = await messageService.markAsRead(msg.id, !msg.read)
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? updated : m))
      )
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: updated.read
          ? 'Ditandai sudah dibaca'
          : 'Ditandai belum dibaca',
        life: 2000,
      })
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: 'Gagal update status',
        life: 3000,
      })
    }
  }

  /* ------------------------------------------------------------
     DELETE
     ------------------------------------------------------------ */
  const handleDelete = (msg: MessageType) => {
    confirmDialog({
      message: `Yakin hapus pesan dari "${msg.name}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await messageService.delete(msg.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Pesan berhasil dihapus',
            life: 3000,
          })

          if (selectedId === msg.id) {
            setSelectedId(null)
          }
          fetchMessages()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus pesan',
            life: 3000,
          })
        }
      },
    })
  }

  /* ------------------------------------------------------------
     STATS
     ------------------------------------------------------------ */
  const stats = useMemo(() => {
    const total = messages.length
    const unread = messages.filter((m) => !m.read).length
    const read = total - unread
    return { total, unread, read }
  }, [messages])

  /* ------------------------------------------------------------
     FILTER COUNTS
     ------------------------------------------------------------ */
  const filterCounts = useMemo<Record<FilterOption, number>>(
    () => ({
      all: stats.total,
      unread: stats.unread,
      read: stats.read,
    }),
    [stats]
  )

  /* ------------------------------------------------------------
     FILTERED
     ------------------------------------------------------------ */
  const filtered = useMemo(() => {
    return messages.filter((m) => {
      if (filter === 'unread' && m.read) return false
      if (filter === 'read' && !m.read) return false

      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
        )
      }

      return true
    })
  }, [messages, filter, search])

  const selected = messages.find((m) => m.id === selectedId) || null

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="inbox-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ============================================
          HEADER
         ============================================ */}
      <header className="inbox-header">
        <div className="inbox-header-bg">
          <span className="inbox-header-orb inbox-header-orb-1" />
          <span className="inbox-header-orb inbox-header-orb-2" />
        </div>

        <div className="inbox-header-inner">
          <div className="inbox-header-left">
            <div className="inbox-header-icon">
              <i className="pi pi-inbox"></i>
              {stats.unread > 0 && (
                <span className="inbox-header-icon-badge">
                  {stats.unread > 99 ? '99+' : stats.unread}
                </span>
              )}
            </div>
            <div className="inbox-header-text">
              <span className="inbox-header-eyebrow">
                <i className="pi pi-envelope"></i>
                Message Center
              </span>
              <h1 className="inbox-header-title">
                My <span className="inbox-header-title-gradient">Inbox</span>
              </h1>
              <p className="inbox-header-subtitle">
                Pesan dari contact form —{' '}
                <strong>{stats.total} total</strong>,{' '}
                <strong>{stats.unread} belum dibaca</strong>
              </p>
            </div>
          </div>

          <div className="inbox-header-right">
            <Button
              label="Refresh"
              icon="pi pi-refresh"
              outlined
              onClick={fetchMessages}
              className="inbox-refresh-btn"
            />
          </div>
        </div>
      </header>

      {/* ============================================
          STATS
         ============================================ */}
      <div className="inbox-stats">
        <div className="inbox-stat tone-blue">
          <div className="inbox-stat-icon">
            <i className="pi pi-inbox"></i>
          </div>
          <div className="inbox-stat-info">
            <span className="inbox-stat-label">Total Pesan</span>
            <strong className="inbox-stat-value">{stats.total}</strong>
          </div>
        </div>

        <div className="inbox-stat tone-orange">
          <div className="inbox-stat-icon">
            <i className="pi pi-envelope"></i>
          </div>
          <div className="inbox-stat-info">
            <span className="inbox-stat-label">Belum Dibaca</span>
            <strong className="inbox-stat-value">{stats.unread}</strong>
          </div>
        </div>

        <div className="inbox-stat tone-green">
          <div className="inbox-stat-icon">
            <i className="pi pi-check-circle"></i>
          </div>
          <div className="inbox-stat-info">
            <span className="inbox-stat-label">Sudah Dibaca</span>
            <strong className="inbox-stat-value">{stats.read}</strong>
          </div>
        </div>
      </div>

      {/* ============================================
          FILTER CHIPS
         ============================================ */}
      {!loading && messages.length > 0 && (
        <div className="inbox-filters">
          <span className="inbox-filters-label">
            <i className="pi pi-filter"></i>
            Filter
          </span>
          <div className="inbox-filters-chips">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`inbox-chip tone-${opt.tone} ${
                  filter === opt.value ? 'is-active' : ''
                }`}
                onClick={() => setFilter(opt.value)}
              >
                <i className={opt.icon}></i>
                <span>{opt.label}</span>
                <span className="inbox-chip-count">
                  {filterCounts[opt.value]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================
          LOADING
         ============================================ */}
      {loading && (
        <div className="inbox-layout">
          <div className="inbox-list-wrapper">
            <div className="inbox-toolbar">
              <Skeleton width="100%" height="2.5rem" />
            </div>
            <div className="inbox-list">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="inbox-item-skeleton">
                  <div className="inbox-item-skeleton-row">
                    <Skeleton shape="circle" size="2rem" />
                    <Skeleton width="60%" height="1rem" />
                  </div>
                  <Skeleton width="90%" height="0.85rem" className="mt-2" />
                  <Skeleton width="70%" height="0.75rem" className="mt-2" />
                </div>
              ))}
            </div>
          </div>
          <div className="inbox-detail-wrapper">
            <div className="inbox-detail">
              <Skeleton width="50%" height="1.75rem" />
              <Skeleton width="30%" height="1rem" className="mt-3" />
              <Skeleton width="100%" height="1rem" className="mt-5" />
              <Skeleton width="100%" height="1rem" className="mt-2" />
              <Skeleton width="80%" height="1rem" className="mt-2" />
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          EMPTY (no messages at all)
         ============================================ */}
      {!loading && messages.length === 0 && (
        <div className="inbox-empty-state">
          <div className="inbox-empty-state-icon">
            <i className="pi pi-inbox"></i>
          </div>
          <h2 className="inbox-empty-state-title">Inbox Kosong</h2>
          <p className="inbox-empty-state-desc">
            Belum ada pesan masuk. Pesan dari contact form akan tampil di sini.
          </p>
        </div>
      )}

      {/* ============================================
          CONTENT
         ============================================ */}
      {!loading && messages.length > 0 && (
        <div className="inbox-layout">
          {/* ===== LEFT: LIST ===== */}
          <div className="inbox-list-wrapper">
            {/* Toolbar */}
            <div className="inbox-toolbar">
              <span className="inbox-search">
                <i className="pi pi-search"></i>
                <InputText
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pesan..."
                  className="w-full"
                />
                {search && (
                  <button
                    type="button"
                    className="inbox-search-clear"
                    onClick={() => setSearch('')}
                    aria-label="Clear"
                  >
                    <i className="pi pi-times"></i>
                  </button>
                )}
              </span>
            </div>

            {/* List */}
            <div className="inbox-list">
              {filtered.length === 0 ? (
                <div className="inbox-empty-filter">
                  <i className="pi pi-search"></i>
                  <p>Tidak ada pesan yang cocok</p>
                  <button
                    type="button"
                    className="inbox-empty-filter-reset"
                    onClick={() => {
                      setSearch('')
                      setFilter('all')
                    }}
                  >
                    Reset filter
                  </button>
                </div>
              ) : (
                filtered.map((msg) => (
                  <div
                    key={msg.id}
                    className={`inbox-item ${
                      selectedId === msg.id ? 'inbox-item-active' : ''
                    } ${!msg.read ? 'inbox-item-unread' : ''}`}
                    onClick={() => handleSelect(msg)}
                  >
                    <div className="inbox-item-header">
                      <div className="inbox-item-left">
                        <div
                          className="inbox-item-avatar"
                          style={{
                            background: `linear-gradient(135deg, ${getAvatarColor(
                              msg.name
                            )}, ${getAvatarColor(msg.name)}cc)`,
                          }}
                        >
                          {getInitials(msg.name)}
                        </div>
                        <strong className="inbox-item-name">{msg.name}</strong>
                        {!msg.read && <span className="inbox-dot"></span>}
                      </div>
                      <span className="inbox-item-time">
                        {formatRelativeDate(msg.createdAt)}
                      </span>
                    </div>
                    <div className="inbox-item-subject">
                      {msg.subject || '(Tanpa Subjek)'}
                    </div>
                    <div className="inbox-item-preview">{msg.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ===== RIGHT: DETAIL ===== */}
          <div className="inbox-detail-wrapper">
            {selected ? (
              <div className="inbox-detail">
                {/* Header */}
                <div className="inbox-detail-header">
                  <div
                    className="inbox-detail-avatar"
                    style={{
                      background: `linear-gradient(135deg, ${getAvatarColor(
                        selected.name
                      )}, ${getAvatarColor(selected.name)}cc)`,
                    }}
                  >
                    {getInitials(selected.name)}
                  </div>
                  <div className="inbox-detail-header-content">
                    <h2 className="inbox-detail-subject">
                      {selected.subject || '(Tanpa Subjek)'}
                    </h2>
                    <div className="inbox-detail-meta">
                      <i className="pi pi-user"></i>
                      <strong>{selected.name}</strong>
                      <span className="inbox-detail-sep">•</span>
                      <a href={`mailto:${selected.email}`}>
                        {selected.email}
                      </a>
                    </div>
                    <div className="inbox-detail-date">
                      <i className="pi pi-calendar"></i>
                      {new Date(selected.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="inbox-detail-status">
                    {selected.read ? (
                      <span className="inbox-status-badge inbox-status-read">
                        <i className="pi pi-check-circle"></i>
                        Sudah Dibaca
                      </span>
                    ) : (
                      <span className="inbox-status-badge inbox-status-unread">
                        <i className="pi pi-envelope"></i>
                        Belum Dibaca
                      </span>
                    )}
                  </div>
                </div>

                <div className="inbox-detail-divider" />

                {/* Body */}
                <div className="inbox-detail-body">{selected.message}</div>

                <div className="inbox-detail-divider" />

                {/* Actions */}
                <div className="inbox-detail-actions">
                  <a href={`mailto:${selected.email}`}>
                    <Button
                      label="Balas via Email"
                      icon="pi pi-reply"
                      className="inbox-action-primary"
                    />
                  </a>
                  <Button
                    label={
                      selected.read
                        ? 'Tandai Belum Dibaca'
                        : 'Tandai Sudah Dibaca'
                    }
                    icon={selected.read ? 'pi pi-envelope' : 'pi pi-check'}
                    severity="secondary"
                    outlined
                    onClick={() => handleToggleRead(selected)}
                  />
                  <Button
                    label="Hapus"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    onClick={() => handleDelete(selected)}
                  />
                </div>
              </div>
            ) : (
              <div className="inbox-detail-empty">
                <div className="inbox-detail-empty-icon">
                  <i className="pi pi-inbox"></i>
                </div>
                <h3>Pilih pesan untuk dibaca</h3>
                <p>Klik salah satu pesan di sebelah kiri untuk melihat detail.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Inbox