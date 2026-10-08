import { useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { InputTextarea } from 'primereact/inputtextarea'
import { Message } from 'primereact/message'

interface Props {
  onUpload: (file: File, note: string) => Promise<void>
  loading?: boolean
}

export function ProofUploader({ onUpload, loading }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    setError(null)
    if (!f) return

    if (f.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB')
      return
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(f.type)) {
      setError('Format file: JPG, PNG, WEBP, atau PDF')
      return
    }

    setFile(f)

    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      setError('Pilih file bukti bayar dulu')
      return
    }
    setError(null)
    await onUpload(file, note)
  }

  const clearFile = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="proof-uploader">
      <h3 className="proof-title">
        <i className="pi pi-upload" /> Upload Bukti Bayar
      </h3>

      {error && (
        <Message severity="error" text={error} className="w-full mb-3" />
      )}

      {!file ? (
        <div
          className="proof-dropzone"
          onClick={() => fileRef.current?.click()}
        >
          <i className="pi pi-cloud-upload" />
          <span>Klik untuk pilih file</span>
          <small>JPG, PNG, WEBP, PDF. Max 5MB.</small>
        </div>
      ) : (
        <div className="proof-preview">
          {preview ? (
            <img src={preview} alt="Preview" />
          ) : (
            <div className="proof-preview-file">
              <i className="pi pi-file-pdf" />
              <span>{file.name}</span>
            </div>
          )}
          <Button
            icon="pi pi-times"
            severity="danger"
            text
            rounded
            onClick={clearFile}
          />
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0] || null)}
      />

      <div className="proof-note">
        <label>Catatan (opsional)</label>
        <InputTextarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            note.toLowerCase().includes('0x')
              ? 'Tx hash...'
              : 'Nama pengirim, waktu transfer, atau tx hash untuk crypto...'
          }
          rows={3}
          autoResize
          maxLength={500}
          className="w-full"
        />
      </div>

      <Button
        label={loading ? 'Mengupload...' : 'Kirim Bukti Bayar'}
        icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
        onClick={handleSubmit}
        disabled={loading || !file}
        className="proof-submit"
      />
    </div>
  )
}