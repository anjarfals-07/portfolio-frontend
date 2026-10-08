import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Skeleton } from 'primereact/skeleton'
import { Message } from 'primereact/message'
import { InputText } from 'primereact/inputtext'
import { PaymentMethodFormDialog } from '@/components/admin/PaymentMethodFormDialog'
import { paymentMethodService } from '@/services/paymentMethodService'
import type { PaymentMethod, PaymentMethodFormData } from '@/types/payment'

type FilterType = 'ALL' | 'QRIS' | 'BANK_TRANSFER' | 'EWALLET' | 'CRYPTO_EVM'

const FILTERS: { label: string; value: FilterType; icon: string }[] = [
  { label: 'Semua', value: 'ALL', icon: 'pi pi-th-large' },
  { label: 'QRIS', value: 'QRIS', icon: 'pi pi-qrcode' },
  {
    label: 'Bank',
    value: 'BANK_TRANSFER',
    icon: 'pi pi-building-columns',
  },
  { label: 'E-Wallet', value: 'EWALLET', icon: 'pi pi-wallet' },
  { label: 'Crypto', value: 'CRYPTO_EVM', icon: 'pi pi-bitcoin' },
]

export default function PaymentMethods() {
  const toast = useRef<Toast>(null)

  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)

  const [filter, setFilter] = useState<FilterType>('ALL')
  const [search, setSearch] = useState('')

  // ============================================================
  // FETCH
  // ============================================================
  const fetchMethods = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await paymentMethodService.getAll()
      setMethods(data)
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message || 'Gagal memuat payment methods')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMethods()
  }, [])

  // ============================================================
  // DERIVED
  // ============================================================
  const stats = useMemo(() => {
    const active = methods.filter((m) => m.isActive).length
    return {
      total: methods.length,
      active,
      inactive: methods.length - active,
      qris: methods.filter((m) => m.type === 'QRIS').length,
      bank: methods.filter((m) => m.type === 'BANK_TRANSFER').length,
      ewallet: methods.filter((m) => m.type === 'EWALLET').length,
      crypto: methods.filter((m) => m.type === 'CRYPTO_EVM').length,
    }
  }, [methods])

  const filtered = useMemo(() => {
    let result = methods

    if (filter !== 'ALL') {
      result = result.filter((m) => m.type === filter)
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (m) =>
          m.label.toLowerCase().includes(q) ||
          m.bankName?.toLowerCase().includes(q) ||
          m.cryptoChain?.toLowerCase().includes(q) ||
          m.cryptoToken?.toLowerCase().includes(q) ||
          m.qrisMerchantName?.toLowerCase().includes(q) ||
          m.ewalletProvider?.toLowerCase().includes(q) ||
          m.ewalletAccount?.toLowerCase().includes(q) ||
          m.ewalletAccountHolder?.toLowerCase().includes(q)
      )
    }

    return result
  }, [methods, filter, search])

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleCreate = () => {
    setEditing(null)
    setDialogVisible(true)
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditing(method)
    setDialogVisible(true)
  }

  const handleSubmit = async (form: PaymentMethodFormData) => {
    if (editing) {
      await paymentMethodService.update(editing.id, form)
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Payment method berhasil diupdate',
        life: 3000,
      })
    } else {
      await paymentMethodService.create(form)
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Payment method berhasil ditambahkan',
        life: 3000,
      })
    }
    await fetchMethods()
  }

  const handleToggle = async (method: PaymentMethod) => {
    try {
      await paymentMethodService.toggleActive(method.id)
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: `Method ${method.isActive ? 'dinonaktifkan' : 'diaktifkan'}`,
        life: 2000,
      })
      await fetchMethods()
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: err?.response?.data?.message || 'Gagal toggle status',
        life: 3000,
      })
    }
  }

  const handleDelete = (method: PaymentMethod) => {
    confirmDialog({
      message: `Yakin hapus "${method.label}"? Tindakan ini tidak bisa dibatalkan.`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await paymentMethodService.delete(method.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Payment method dihapus',
            life: 3000,
          })
          await fetchMethods()
        } catch (err: any) {
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: err?.response?.data?.message || 'Gagal hapus',
            life: 3000,
          })
        }
      },
    })
  }

  // ============================================================
  // HELPERS
  // ============================================================
  const getTypeIcon = (type: string) => {
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'QRIS':
        return 'QRIS'
      case 'BANK_TRANSFER':
        return 'Bank Transfer'
      case 'EWALLET':
        return 'E-Wallet'
      case 'CRYPTO_EVM':
        return 'Crypto EVM'
      default:
        return type
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="dash pm-dash">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ===== HERO ===== */}
      <section className="dash-hero">
        <div className="dash-hero-bg" aria-hidden="true" />
        <div className="dash-hero-inner">
          <div className="dash-hero-left">
            <span className="dash-hero-greeting">
              <i className="pi pi-credit-card" />
              Payment Configuration
            </span>
            <h1 className="dash-hero-title">
              Payment <span className="dash-hero-name">methods</span>
            </h1>
            <p className="dash-hero-desc">
              Kelola metode pembayaran manual: QRIS, transfer bank, e-wallet,
              dan crypto EVM wallet.
            </p>
          </div>

          <div className="dash-hero-right">
            <Button
              label="Tambah Method"
              icon="pi pi-plus"
              onClick={handleCreate}
              className="pm-add-btn"
            />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      {!loading && methods.length > 0 && (
        <section className="pm-stats">
          <div className="pm-stat">
            <span className="pm-stat-icon pm-stat-icon-blue">
              <i className="pi pi-credit-card" />
            </span>
            <div className="pm-stat-body">
              <span className="pm-stat-label">Total</span>
              <strong className="pm-stat-value">{stats.total}</strong>
            </div>
          </div>

          <div className="pm-stat">
            <span className="pm-stat-icon pm-stat-icon-green">
              <i className="pi pi-check-circle" />
            </span>
            <div className="pm-stat-body">
              <span className="pm-stat-label">Aktif</span>
              <strong className="pm-stat-value">{stats.active}</strong>
            </div>
          </div>

          <div className="pm-stat">
            <span className="pm-stat-icon pm-stat-icon-gray">
              <i className="pi pi-eye-slash" />
            </span>
            <div className="pm-stat-body">
              <span className="pm-stat-label">Nonaktif</span>
              <strong className="pm-stat-value">{stats.inactive}</strong>
            </div>
          </div>

          <div className="pm-stat pm-stat-split">
            <div className="pm-stat-chip pm-stat-chip-qris">
              <i className="pi pi-qrcode" />
              <span>{stats.qris}</span>
            </div>
            <div className="pm-stat-chip pm-stat-chip-bank">
              <i className="pi pi-building-columns" />
              <span>{stats.bank}</span>
            </div>
            <div className="pm-stat-chip pm-stat-chip-ewallet">
              <i className="pi pi-wallet" />
              <span>{stats.ewallet}</span>
            </div>
            <div className="pm-stat-chip pm-stat-chip-crypto">
              <i className="pi pi-bitcoin" />
              <span>{stats.crypto}</span>
            </div>
          </div>
        </section>
      )}

      {/* ===== TOOLBAR ===== */}
      <section className="pm-toolbar">
        <div className="pm-toolbar-filters">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`pm-chip ${filter === f.value ? 'is-active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              <i className={f.icon} />
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        <div className="pm-toolbar-search">
          <i className="pi pi-search" />
          <InputText
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari metode..."
            className="pm-search-input"
          />
          {search && (
            <button
              type="button"
              className="pm-search-clear"
              onClick={() => setSearch('')}
              aria-label="Clear"
            >
              <i className="pi pi-times" />
            </button>
          )}
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="dash-section">
        {error && (
          <Message severity="error" text={error} className="w-full mb-3" />
        )}

        {/* LOADING */}
        {loading && (
          <div className="pm-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="pm-card pm-card-skeleton">
                <div className="pm-card-head">
                  <Skeleton shape="circle" size="48px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton height="1rem" width="60%" className="mb-2" />
                    <Skeleton height="0.75rem" width="40%" />
                  </div>
                </div>
                <Skeleton height="3rem" />
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && filtered.length === 0 && (
          <div className="pm-empty">
            <div className="pm-empty-icon">
              <i className="pi pi-credit-card" />
            </div>
            <h3>
              {methods.length === 0
                ? 'Belum ada payment method'
                : 'Tidak ada hasil'}
            </h3>
            <p>
              {methods.length === 0
                ? 'Tambahkan metode pembayaran pertama kamu untuk mulai menerima pembayaran.'
                : 'Coba ubah filter atau kata kunci pencarian.'}
            </p>
            {methods.length === 0 ? (
              <Button
                label="Tambah Method Pertama"
                icon="pi pi-plus"
                onClick={handleCreate}
              />
            ) : (
              <Button
                label="Reset Filter"
                icon="pi pi-refresh"
                outlined
                onClick={() => {
                  setFilter('ALL')
                  setSearch('')
                }}
              />
            )}
          </div>
        )}

        {/* GRID */}
        {!loading && filtered.length > 0 && (
          <div className="pm-grid">
            {filtered.map((method, idx) => (
              <div
                key={method.id}
                className={`pm-card pm-card-${method.type.toLowerCase()} ${
                  !method.isActive ? 'pm-card-inactive' : ''
                }`}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                {/* Gradient accent */}
                <div className="pm-card-accent" />

                {/* Header */}
                <div className="pm-card-head">
                  <span className="pm-card-icon">
                    <i className={getTypeIcon(method.type)} />
                  </span>

                  <div className="pm-card-title">
                    <strong>{method.label}</strong>
                    <span className="pm-card-type">
                      {getTypeLabel(method.type)}
                    </span>
                  </div>

                  <span
                    className={`pm-card-status-dot ${
                      method.isActive ? 'is-active' : 'is-inactive'
                    }`}
                    title={method.isActive ? 'Aktif' : 'Nonaktif'}
                  />
                </div>

                {/* Body */}
                <div className="pm-card-body">
                  {method.type === 'QRIS' && (
                    <div className="pm-card-qris">
                      {method.qrisImageUrl ? (
                        <div className="pm-qris-thumb">
                          <img src={method.qrisImageUrl} alt={method.label} />
                        </div>
                      ) : (
                        <div className="pm-qris-empty">
                          <i className="pi pi-qrcode" />
                        </div>
                      )}
                      <div className="pm-qris-info">
                        <span className="pm-detail">
                          <i className="pi pi-shop" />
                          {method.qrisMerchantName || '—'}
                        </span>
                      </div>
                    </div>
                  )}

                  {method.type === 'BANK_TRANSFER' && (
                    <div className="pm-card-lines">
                      <div className="pm-line">
                        <span className="pm-line-label">Bank</span>
                        <span className="pm-line-value">{method.bankName}</span>
                      </div>
                      <div className="pm-line">
                        <span className="pm-line-label">No. Rek</span>
                        <span className="pm-line-value pm-line-mono">
                          {method.bankAccountNumber}
                        </span>
                      </div>
                      <div className="pm-line">
                        <span className="pm-line-label">Atas Nama</span>
                        <span className="pm-line-value">
                          {method.bankAccountHolder}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ⭐ E-WALLET */}
                  {method.type === 'EWALLET' && (
                    <div className="pm-card-lines">
                      <div className="pm-line">
                        <span className="pm-line-label">Provider</span>
                        <span className="pm-line-value">
                          {method.ewalletProvider}
                        </span>
                      </div>
                      <div className="pm-line">
                        <span className="pm-line-label">Nomor</span>
                        <span className="pm-line-value pm-line-mono">
                          {method.ewalletAccount}
                        </span>
                      </div>
                      <div className="pm-line">
                        <span className="pm-line-label">Atas Nama</span>
                        <span className="pm-line-value">
                          {method.ewalletAccountHolder}
                        </span>
                      </div>
                    </div>
                  )}

                  {method.type === 'CRYPTO_EVM' && (
                    <div className="pm-card-lines">
                      <div className="pm-line">
                        <span className="pm-line-label">Chain</span>
                        <span className="pm-line-value pm-line-cap">
                          {method.cryptoChain}
                        </span>
                      </div>
                      <div className="pm-line">
                        <span className="pm-line-label">Token</span>
                        <span className="pm-line-value">
                          {method.cryptoToken}
                        </span>
                      </div>
                      <div className="pm-line">
                        <span className="pm-line-label">Address</span>
                        <span className="pm-line-value pm-line-mono">
                          {method.cryptoAddress
                            ? `${method.cryptoAddress.slice(0, 8)}...${method.cryptoAddress.slice(-6)}`
                            : '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pm-card-foot">
                  <span className="pm-card-order">
                    <i className="pi pi-sort-alt" />#{method.sortOrder}
                  </span>

                  <div className="pm-card-actions">
                    <button
                      type="button"
                      className="pm-action-btn"
                      onClick={() => handleToggle(method)}
                      title={method.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <i
                        className={
                          method.isActive ? 'pi pi-eye-slash' : 'pi pi-eye'
                        }
                      />
                    </button>
                    <button
                      type="button"
                      className="pm-action-btn pm-action-btn-edit"
                      onClick={() => handleEdit(method)}
                      title="Edit"
                    >
                      <i className="pi pi-pencil" />
                    </button>
                    <button
                      type="button"
                      className="pm-action-btn pm-action-btn-danger"
                      onClick={() => handleDelete(method)}
                      title="Hapus"
                    >
                      <i className="pi pi-trash" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== DIALOG ===== */}
      <PaymentMethodFormDialog
        visible={dialogVisible}
        editing={editing}
        onHide={() => setDialogVisible(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}