// src/pages/owner/ManageCustomDomain.tsx

import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Message } from 'primereact/message'
import { Tag } from 'primereact/tag'
import { useRef } from 'react'
import { domainService } from '@/services/domainService'
import { isValidDomain, normalizeDomain } from '@/utils/domain'
import type { TenantDomain } from '@/types/tenant'

export default function ManageCustomDomain() {
  const toast = useRef<Toast>(null)

  const [domains, setDomains] = useState<TenantDomain[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [verifying, setVerifying] = useState<number | null>(null)

  // ============================================================
  // FETCH
  // ============================================================
  const fetchDomains = async () => {
    try {
      setLoading(true)
      const data = await domainService.list()
      setDomains(data)
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: err?.response?.data?.message || 'Gagal memuat domain',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDomains()
  }, [])

  // ============================================================
  // ADD
  // ============================================================
  const handleAdd = async () => {
    const clean = normalizeDomain(newDomain)

    if (!clean) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Domain kosong',
        detail: 'Masukkan domain',
        life: 3000,
      })
      return
    }

    if (!isValidDomain(clean)) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Format tidak valid',
        detail: 'Contoh: badru.com',
        life: 3000,
      })
      return
    }

    try {
      setAdding(true)
      await domainService.add(clean)
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Domain ditambahkan. Setup DNS untuk verifikasi.',
        life: 4000,
      })
      setNewDomain('')
      await fetchDomains()
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: err?.response?.data?.message || 'Gagal tambah domain',
        life: 3000,
      })
    } finally {
      setAdding(false)
    }
  }

  // ============================================================
  // VERIFY
  // ============================================================
  const handleVerify = async (id: number) => {
    try {
      setVerifying(id)
      const updated = await domainService.verify(id)

      if (updated.isVerified) {
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Domain terverifikasi!',
          life: 4000,
        })
      } else {
        toast.current?.show({
          severity: 'warn',
          summary: 'Belum terverifikasi',
          detail: 'DNS belum menunjuk ke server. Cek instruksi.',
          life: 4000,
        })
      }

      await fetchDomains()
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: err?.response?.data?.message || 'Gagal verifikasi',
        life: 3000,
      })
    } finally {
      setVerifying(null)
    }
  }

  // ============================================================
  // DELETE
  // ============================================================
  const handleDelete = (id: number, domain: string) => {
    confirmDialog({
      message: `Hapus domain "${domain}"?`,
      header: 'Konfirmasi',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          await domainService.delete(id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Domain dihapus',
            life: 3000,
          })
          await fetchDomains()
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
  // SET PRIMARY
  // ============================================================
  const handleSetPrimary = async (id: number) => {
    try {
      await domainService.setPrimary(id)
      toast.current?.show({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Domain jadi primary',
        life: 3000,
      })
      await fetchDomains()
    } catch (err: any) {
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: err?.response?.data?.message || 'Gagal set primary',
        life: 3000,
      })
    }
  }

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="pd-dash">
      <Toast ref={toast} />
      <ConfirmDialog />

      <section className="dash-hero">
        <div className="dash-hero-inner">
          <div className="dash-hero-left">
            <span className="dash-hero-greeting">
              <i className="pi pi-globe" />
              Custom Domain
            </span>
            <h1 className="dash-hero-title">
              Pakai <span className="dash-hero-name">domain sendiri</span>
            </h1>
            <p className="dash-hero-desc">
              Hubungkan domain Anda (contoh: badru.com) ke portfolio ini.
            </p>
          </div>
        </div>
      </section>

      <section className="dash-section">
        {/* ===== ADD FORM ===== */}
        <div className="pd-card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginTop: 0 }}>Tambah Domain</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Masukkan domain tanpa <code>http://</code> atau <code>www.</code>
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <InputText
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="badru.com"
              style={{ flex: 1, minWidth: '240px' }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <Button
              label="Tambah"
              icon="pi pi-plus"
              onClick={handleAdd}
              loading={adding}
              disabled={!newDomain.trim() || adding}
            />
          </div>
        </div>

        {/* ===== LIST ===== */}
        {loading && (
          <Message severity="info" text="Memuat domain..." className="w-full" />
        )}

        {!loading && domains.length === 0 && (
          <Message
            severity="info"
            text="Belum ada domain. Tambahkan domain untuk memulai."
            className="w-full"
          />
        )}

        {!loading && domains.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {domains.map((d) => (
              <div
                key={d.id}
                style={{
                  padding: '1rem',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <strong style={{ fontSize: '1rem', flex: 1 }}>{d.domain}</strong>

                  {d.isPrimary && <Tag value="Primary" severity="info" rounded />}

                  {d.isVerified ? (
                    <Tag value="Verified" severity="success" rounded />
                  ) : (
                    <Tag value="Pending" severity="warning" rounded />
                  )}

                  {d.sslStatus === 'ACTIVE' && (
                    <Tag value="SSL Active" severity="success" rounded />
                  )}
                </div>

                {/* ===== DNS INSTRUCTIONS (kalau belum verified) ===== */}
                {!d.isVerified && (
                  <div
                    style={{
                      padding: '0.75rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      marginBottom: '0.75rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong>Setup DNS:</strong>
                    <div style={{ marginTop: '0.5rem' }}>
                      <div>
                        <code>CNAME</code> → <code>{d.cnameTarget}</code>
                      </div>
                      <div style={{ marginTop: '0.25rem' }}>
                        <code>TXT</code> {d.txtRecordName} →{' '}
                        <code>{d.txtRecordValue}</code>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== ACTIONS ===== */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {!d.isVerified && (
                    <Button
                      label="Cek Verifikasi"
                      icon="pi pi-refresh"
                      size="small"
                      onClick={() => handleVerify(d.id)}
                      loading={verifying === d.id}
                    />
                  )}
                  {d.isVerified && !d.isPrimary && (
                    <Button
                      label="Jadikan Primary"
                      icon="pi pi-star"
                      size="small"
                      outlined
                      onClick={() => handleSetPrimary(d.id)}
                    />
                  )}
                  <Button
                    label="Hapus"
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    outlined
                    onClick={() => handleDelete(d.id, d.domain)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}