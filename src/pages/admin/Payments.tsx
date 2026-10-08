import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { Paginator } from 'primereact/paginator'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { PaymentDetailDialog } from '@/components/admin/PaymentDetailDialog'
import { RejectPaymentDialog } from '@/components/admin/RejectPaymentDialog'
import { paymentAdminService } from '@/services/paymentAdminService'
import type { PaymentAdminDTO, PaymentStatsDTO } from '@/types/payment'

/* ============================================================
   CONFIG
   ============================================================ */
const STATUS_FILTERS = [
  { label: 'Semua', value: 'ALL', icon: 'pi pi-th-large' },
  {
    label: 'Menunggu Verifikasi',
    value: 'WAITING_VERIFICATION',
    icon: 'pi pi-clock',
  },
  { label: 'Dibayar', value: 'PAID', icon: 'pi pi-check-circle' },
  { label: 'Ditolak', value: 'REJECTED', icon: 'pi pi-times-circle' },
  { label: 'Expired', value: 'EXPIRED', icon: 'pi pi-calendar-times' },
]

const METHOD_FILTERS = [
  { label: 'Semua Metode', value: 'ALL' },
  { label: 'QRIS', value: 'QRIS' },
  { label: 'Bank Transfer', value: 'BANK_TRANSFER' },
  { label: 'E-Wallet', value: 'EWALLET' },
  { label: 'Crypto EVM', value: 'CRYPTO_EVM' },
]

const PAGE_SIZES = [
  { label: '10 / halaman', value: 10 },
  { label: '20 / halaman', value: 20 },
  { label: '50 / halaman', value: 50 },
]

const STATUS_SEVERITY: Record<string, string> = {
  PENDING: 'warning',
  WAITING_VERIFICATION: 'info',
  PAID: 'success',
  REJECTED: 'danger',
  EXPIRED: 'secondary',
  REFUNDED: 'secondary',
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Menunggu Bayar',
  WAITING_VERIFICATION: 'Menunggu Verifikasi',
  PAID: 'Dibayar',
  REJECTED: 'Ditolak',
  EXPIRED: 'Expired',
  REFUNDED: 'Refunded',
}

/* ============================================================
   COMPONENT
   ============================================================ */
export default function Payments() {
  const toast = useRef<Toast>(null)

  const [payments, setPayments] = useState<PaymentAdminDTO[]>([])
  const [stats, setStats] = useState<PaymentStatsDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [methodFilter, setMethodFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)

  const [detailVisible, setDetailVisible] = useState(false)
  const [rejectVisible, setRejectVisible] = useState(false)
  const [selected, setSelected] = useState<PaymentAdminDTO | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // ============================================================
  // FETCH
  // ============================================================
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [listRes, statsRes] = await Promise.all([
        paymentAdminService.list(statusFilter, page, size),
        paymentAdminService.getStats(),
      ])

      setPayments(listRes.content)
      setTotalRecords(listRes.totalElements)
      setStats(statsRes)
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message || 'Gagal memuat data pembayaran')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page, size])

  // ============================================================
  // CLIENT-SIDE FILTER (method + search)
  // ============================================================
  const filteredPayments = useMemo(() => {
    let result = payments

    if (methodFilter !== 'ALL') {
      result = result.filter((p) => p.methodType === methodFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (p) =>
          p.username?.toLowerCase().includes(q) ||
          p.referenceId?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.displayName?.toLowerCase().includes(q)
      )
    }

    return result
  }, [payments, methodFilter, search])

  // ============================================================
  // HANDLERS
  // ============================================================
  const openDetail = (p: PaymentAdminDTO) => {
    setSelected(p)
    setDetailVisible(true)
  }

  const handleApprove = () => {
    if (!selected) return
    confirmDialog({
      message: `Approve pembayaran ${selected.referenceId}?`,
      header: 'Konfirmasi Approve',
      icon: 'pi pi-check-circle',
      accept: async () => {
        try {
          setActionLoading(true)
          await paymentAdminService.approve(selected.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Pembayaran disetujui',
            life: 3000,
          })
          setDetailVisible(false)
          await fetchData()
        } catch (err: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: err?.response?.data?.message || 'Gagal approve',
            life: 3000,
          })
        } finally {
          setActionLoading(false)
        }
      },
    })
  }

  const handleReject = () => {
    setRejectVisible(true)
  }

  const handleRejectSubmit = async (reason: string) => {
    if (!selected) return
    try {
      setActionLoading(true)
      await paymentAdminService.reject(selected.id, {
        rejectionReason: reason,
      })
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Pembayaran ditolak',
        life: 3000,
      })
      setDetailVisible(false)
      await fetchData()
    } catch (err: any) {
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchData()
    toast.current?.show({
      severity: 'info',
      summary: 'Refreshed',
      detail: 'Data terupdate',
      life: 1500,
    })
  }

  const handleResetFilter = () => {
    setStatusFilter('ALL')
    setMethodFilter('ALL')
    setSearch('')
    setPage(0)
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'QRIS':
        return 'pi pi-qrcode'
      case 'BANK_TRANSFER':
        return 'pi pi-building-columns'
      case 'EWALLET':
        return 'pi pi-wallet'
      case 'CRYPTO_EVM':
        return 'pi pi-bitcoin'
      default:
        return 'pi pi-credit-card'
    }
  }

  const getMethodTone = (type: string) => {
    switch (type) {
      case 'QRIS':
        return 'blue'
      case 'BANK_TRANSFER':
        return 'green'
      case 'EWALLET':
        return 'pink'
      case 'CRYPTO_EVM':
        return 'amber'
      default:
        return 'gray'
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dash pd-dash">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />
        <div className="dash-hero-inner">
          <div className="dash-hero-left">
            <span className="dash-hero-greeting">
              <i className="pi pi-receipt" />
              Payment Management
            </span>
            <h1 className="dash-hero-title">
              Payment <span className="dash-hero-name">verification</span>
            </h1>
            <p className="dash-hero-desc">
              Verifikasi bukti bayar user. Approve atau reject dengan alasan.
            </p>
          </div>

          <div className="dash-hero-right">
            <Button
              icon="pi pi-refresh"
              label="Refresh"
              outlined
              onClick={handleRefresh}
              disabled={loading}
              className="pd-refresh-btn"
            />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      {stats && (
        <section className="pd-stats-section">
          <div className="pd-stats">
            <div className="pd-stat pd-stat-pending">
              <span className="pd-stat-icon">
                <i className="pi pi-clock" />
              </span>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Pending</span>
                <strong className="pd-stat-value">
                  {stats.totalPending}
                </strong>
              </div>
            </div>

            <div className="pd-stat pd-stat-paid">
              <span className="pd-stat-icon">
                <i className="pi pi-check-circle" />
              </span>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Dibayar</span>
                <strong className="pd-stat-value">{stats.totalPaid}</strong>
              </div>
            </div>

            <div className="pd-stat pd-stat-rejected">
              <span className="pd-stat-icon">
                <i className="pi pi-times-circle" />
              </span>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Ditolak</span>
                <strong className="pd-stat-value">
                  {stats.totalRejected}
                </strong>
              </div>
            </div>

            <div className="pd-stat pd-stat-revenue">
              <span className="pd-stat-icon">
                <i className="pi pi-wallet" />
              </span>
              <div className="pd-stat-body">
                <span className="pd-stat-label">Revenue Bulan Ini</span>
                <strong className="pd-stat-value">
                  Rp {stats.revenueThisMonth.toLocaleString('id-ID')}
                </strong>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== LIST ===== */}
      <section className="dash-section">
        <div className="dash-section-head">
          <div className="dash-section-head-left">
            <span className="dash-section-eyebrow">
              <i className="pi pi-list" />
              {totalRecords} transaksi
            </span>
            <h2 className="dash-section-title">Daftar transaksi</h2>
          </div>
        </div>

        {/* ===== TOOLBAR ===== */}
        <div className="pd-toolbar">
          <div className="pd-toolbar-row">
            {/* Status filter chips */}
            <div className="pd-filter-chips">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  className={`pd-filter-chip ${
                    statusFilter === f.value ? 'is-active' : ''
                  }`}
                  onClick={() => {
                    setStatusFilter(f.value)
                    setPage(0)
                  }}
                >
                  <i className={f.icon} />
                  <span>{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pd-toolbar-row">
            {/* Method dropdown */}
            <Dropdown
              value={methodFilter}
              options={METHOD_FILTERS}
              onChange={(e) => setMethodFilter(e.value)}
              placeholder="Semua Metode"
              className="pd-method-dropdown"
            />

            {/* Search */}
            <div className="pd-search">
              <i className="pi pi-search" />
              <InputText
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari username / reference / email..."
                className="pd-search-input"
              />
              {search && (
                <button
                  type="button"
                  className="pd-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear"
                >
                  <i className="pi pi-times" />
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Message severity="error" text={error} className="w-full mb-3" />
        )}

        {/* ===== LOADING ===== */}
        {loading && (
          <div className="pd-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="pd-item pd-item-skeleton">
                <Skeleton shape="circle" size="44px" />
                <div style={{ flex: 1 }}>
                  <Skeleton height="1rem" width="40%" className="mb-2" />
                  <Skeleton height="0.75rem" width="60%" />
                </div>
                <Skeleton height="2rem" width="100px" />
              </div>
            ))}
          </div>
        )}

        {/* ===== EMPTY ===== */}
        {!loading && filteredPayments.length === 0 && (
          <div className="pm-empty">
            <div className="pm-empty-icon">
              <i className="pi pi-inbox" />
            </div>
            <h3>
              {payments.length === 0
                ? 'Belum ada transaksi'
                : 'Tidak ada hasil'}
            </h3>
            <p>
              {payments.length === 0
                ? 'Belum ada transaksi untuk filter ini.'
                : 'Coba ubah filter status, metode, atau kata kunci.'}
            </p>
            {payments.length > 0 && (
              <Button
                label="Reset Filter"
                icon="pi pi-refresh"
                outlined
                onClick={handleResetFilter}
              />
            )}
          </div>
        )}

        {/* ===== LIST ===== */}
        {!loading && filteredPayments.length > 0 && (
          <div className="pd-list">
            {filteredPayments.map((p) => (
              <button
                key={p.id}
                type="button"
                className="pd-item"
                onClick={() => openDetail(p)}
              >
                {/* Method icon dengan warna khas */}
                <span
                  className={`pd-item-icon pd-item-icon-${getMethodTone(
                    p.methodType
                  )}`}
                >
                  <i className={getMethodIcon(p.methodType)} />
                </span>

                <div className="pd-item-main">
                  <div className="pd-item-head">
                    <strong>{p.username}</strong>
                    {p.displayName && (
                      <span className="pd-item-name">
                        {p.displayName}
                      </span>
                    )}
                    <code className="pd-item-ref">{p.referenceId}</code>
                  </div>
                  <div className="pd-item-sub">
                    <span className="pd-item-method">
                      {p.methodLabel}
                    </span>
                    <span className="pd-dot">•</span>
                    <span>
                      {new Date(p.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="pd-item-right">
                  <span className="pd-item-amount">
                    Rp {p.amountIdr.toLocaleString('id-ID')}
                  </span>
                  <Tag
                    value={STATUS_LABEL[p.status] || p.status}
                    severity={STATUS_SEVERITY[p.status] as any}
                    rounded
                  />
                </div>

                <i className="pi pi-chevron-right pd-item-arrow" />
              </button>
            ))}

            {/* Paginator + size selector */}
            <div className="pd-paginator-wrap">
              <Paginator
                first={page * size}
                rows={size}
                totalRecords={totalRecords}
                onPageChange={(e) => setPage(e.page)}
                template="PrevPageLink CurrentPageReport NextPageLink"
                className="pd-paginator"
              />

              <Dropdown
                value={size}
                options={PAGE_SIZES}
                onChange={(e) => {
                  setSize(e.value)
                  setPage(0)
                }}
                className="pd-page-size"
              />
            </div>
          </div>
        )}
      </section>

      {/* ===== DIALOGS ===== */}
      <PaymentDetailDialog
        visible={detailVisible}
        data={selected}
        onHide={() => setDetailVisible(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        loading={actionLoading}
      />

      <RejectPaymentDialog
        visible={rejectVisible}
        onHide={() => setRejectVisible(false)}
        onSubmit={handleRejectSubmit}
        loading={actionLoading}
      />
    </div>
  )
}