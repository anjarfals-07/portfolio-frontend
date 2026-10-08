import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Divider } from 'primereact/divider'
import type { PaymentAdminDTO } from '@/types/payment'

interface Props {
  visible: boolean
  data: PaymentAdminDTO | null
  onHide: () => void
  onApprove: () => void
  onReject: () => void
  loading?: boolean
}

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

export function PaymentDetailDialog({
  visible,
  data,
  onHide,
  onApprove,
  onReject,
  loading,
}: Props) {
  if (!data) return null

  const canVerify = data.status === 'WAITING_VERIFICATION'

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="pm-dialog-header">
          <span className="pm-dialog-icon">
            <i className="pi pi-receipt" />
          </span>
          <div>
            <strong>Detail Pembayaran</strong>
            <small className="pay-info-mono">{data.referenceId}</small>
          </div>
        </div>
      }
      style={{ width: '720px', maxWidth: '95vw' }}
      modal
      blockScroll
      footer={
        canVerify ? (
          <div className="pm-dialog-footer">
            <Button
              label="Tolak"
              icon="pi pi-times"
              severity="danger"
              outlined
              onClick={onReject}
              disabled={loading}
            />
            <Button
              label={loading ? 'Memproses...' : 'Approve'}
              icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
              severity="success"
              onClick={onApprove}
              disabled={loading}
            />
          </div>
        ) : (
          <div className="pm-dialog-footer">
            <Button
              label="Tutup"
              icon="pi pi-times"
              severity="secondary"
              outlined
              onClick={onHide}
            />
          </div>
        )
      }
    >
      <div className="pd-body">
        <div className="pd-section">
          <div className="pd-row">
            <span className="pd-label">Status</span>
            <Tag
              value={STATUS_LABEL[data.status] || data.status}
              severity={STATUS_SEVERITY[data.status] as any}
              rounded
            />
          </div>
          <div className="pd-row">
            <span className="pd-label">Nominal</span>
            <span className="pd-value pd-amount">
              Rp {data.amountIdr.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="pd-row">
            <span className="pd-label">Metode</span>
            <span className="pd-value">{data.methodLabel}</span>
          </div>
          <div className="pd-row">
            <span className="pd-label">Dibuat</span>
            <span className="pd-value">
              {new Date(data.createdAt).toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        <Divider />

        <div className="pd-section">
          <h4 className="pd-title">
            <i className="pi pi-user" /> User
          </h4>
          <div className="pd-row">
            <span className="pd-label">Username</span>
            <span className="pd-value">@{data.username}</span>
          </div>
          <div className="pd-row">
            <span className="pd-label">Nama</span>
            <span className="pd-value">{data.displayName || '—'}</span>
          </div>
          <div className="pd-row">
            <span className="pd-label">Email</span>
            <span className="pd-value">{data.email}</span>
          </div>
          <div className="pd-row">
            <span className="pd-label">User Status</span>
            <Tag value={data.userStatus} severity="info" />
          </div>
          <div className="pd-row">
            <span className="pd-label">Payment Status</span>
            <Tag value={data.userPaymentStatus} severity="info" />
          </div>
        </div>

        <Divider />

        <div className="pd-section">
          <h4 className="pd-title">
            <i className="pi pi-info-circle" /> Info Metode
          </h4>

          {data.methodType === 'QRIS' && (
            <>
              <div className="pd-row">
                <span className="pd-label">Merchant</span>
                <span className="pd-value">{data.qrisMerchantName}</span>
              </div>
              {data.qrisImageUrl && (
                <div className="pd-qris">
                  <img src={data.qrisImageUrl} alt="QRIS" />
                </div>
              )}
            </>
          )}

          {data.methodType === 'BANK_TRANSFER' && (
            <>
              <div className="pd-row">
                <span className="pd-label">Bank</span>
                <span className="pd-value">{data.bankName}</span>
              </div>
              <div className="pd-row">
                <span className="pd-label">No Rek</span>
                <span className="pd-value pay-info-mono">
                  {data.bankAccountNumber}
                </span>
              </div>
              <div className="pd-row">
                <span className="pd-label">Atas Nama</span>
                <span className="pd-value">{data.bankAccountHolder}</span>
              </div>
            </>
          )}

          {/* ⭐ NEW: E-WALLET */}
          {data.methodType === 'EWALLET' && (
            <>
              <div className="pd-row">
                <span className="pd-label">Provider</span>
                <span className="pd-value">
                  {data.ewalletProvider}
                </span>
              </div>
              <div className="pd-row">
                <span className="pd-label">Nomor Akun</span>
                <span className="pd-value pay-info-mono">
                  {data.ewalletAccount}
                </span>
              </div>
              <div className="pd-row">
                <span className="pd-label">Atas Nama</span>
                <span className="pd-value">
                  {data.ewalletAccountHolder}
                </span>
              </div>
            </>
          )}

          {data.methodType === 'CRYPTO_EVM' && (
            <>
              <div className="pd-row">
                <span className="pd-label">Chain</span>
                <span className="pd-value">{data.cryptoChain}</span>
              </div>
              <div className="pd-row">
                <span className="pd-label">Token</span>
                <span className="pd-value">{data.cryptoToken}</span>
              </div>
              <div className="pd-row pd-column">
                <span className="pd-label">Address</span>
                <code className="pd-code">{data.cryptoAddress}</code>
              </div>
            </>
          )}
        </div>

        {data.proofImageUrl && (
          <>
            <Divider />
            <div className="pd-section">
              <h4 className="pd-title">
                <i className="pi pi-image" /> Bukti Bayar
              </h4>
              <div className="pd-proof">
                {data.proofImageUrl.match(/\.(pdf)$/i) ? (
                  <a
                    href={data.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pd-proof-pdf"
                  >
                    <i className="pi pi-file-pdf" />
                    Buka PDF
                  </a>
                ) : (
                  <img src={data.proofImageUrl} alt="Bukti" />
                )}
              </div>
              {data.proofNote && (
                <div className="pd-note">
                  <strong>Catatan user:</strong>
                  <p>{data.proofNote}</p>
                </div>
              )}
              <div className="pd-row">
                <span className="pd-label">Upload ke-</span>
                <span className="pd-value">{data.proofUploadCount}/3</span>
              </div>
            </div>
          </>
        )}

        {data.status === 'REJECTED' && data.rejectionReason && (
          <>
            <Divider />
            <div className="pd-section">
              <h4 className="pd-title pd-title-danger">
                <i className="pi pi-times-circle" /> Alasan Ditolak
              </h4>
              <p className="pd-reason">{data.rejectionReason}</p>
            </div>
          </>
        )}

        {data.status === 'PAID' && data.paidAt && (
          <>
            <Divider />
            <div className="pd-section">
              <h4 className="pd-title pd-title-success">
                <i className="pi pi-check-circle" /> Dikonfirmasi
              </h4>
              <p className="pd-meta">
                Dikonfirmasi oleh{' '}
                <strong>{data.verifiedByName || 'Admin'}</strong> pada{' '}
                {new Date(data.paidAt).toLocaleString('id-ID')}
              </p>
            </div>
          </>
        )}
      </div>
    </Dialog>
  )
}