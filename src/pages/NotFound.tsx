import { Link } from 'react-router-dom'
import { Button } from 'primereact/button'

function NotFound() {
  return (
    <div className="page-container flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <h1 className="text-8xl font-bold text-primary m-0">404</h1>
      <h2 className="mt-2">Halaman Tidak Ditemukan</h2>
      <p className="text-color-secondary mb-4">
        Halaman yang kamu cari nggak ada.
      </p>
      <Link to="/">
        <Button label="Kembali ke Home" icon="pi pi-home" />
      </Link>
    </div>
  )
}

export default NotFound