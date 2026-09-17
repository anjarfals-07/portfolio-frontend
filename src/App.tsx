import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'

type BackendStatus = 'loading' | 'connected' | 'error'

function App() {
  const [status, setStatus] = useState<BackendStatus>('loading')

  useEffect(() => {
    fetch('http://localhost:8080/api/projects')
      .then((res) => res.json())
      .then((data) => {
        console.log('Backend response:', data)
        setStatus('connected')
      })
      .catch((err) => {
        console.error('Backend error:', err)
        setStatus('error')
      })
  }, [])

  return (
    <div className="min-h-screen surface-ground p-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <div className="flex align-items-center gap-3 mb-4">
            <i className="pi pi-check-circle text-4xl text-green-500"></i>
            <h1 className="m-0">PrimeReact + TypeScript Setup Berhasil! 🎉</h1>
          </div>

          <p className="text-lg line-height-3">
            Kalau kamu lihat ini dengan styling yang bagus, berarti setup berhasil.
          </p>

          <div className="flex gap-2 mb-4">
            <Tag value="React" severity="info" />
            <Tag value="TypeScript" severity="info" />
            <Tag value="Vite" severity="success" />
            <Tag value="PrimeReact" severity="warning" />
            <Tag value="PrimeFlex" severity="danger" />
          </div>

          <div className="mb-4">
            <strong>Backend Status: </strong>
            {status === 'loading' && <Tag value="Checking..." severity="info" />}
            {status === 'connected' && <Tag value="Connected ✅" severity="success" />}
            {status === 'error' && <Tag value="Error ❌" severity="danger" />}
          </div>

          <div className="flex gap-2">
            <Button label="Primary" icon="pi pi-check" />
            <Button label="Secondary" icon="pi pi-star" severity="secondary" />
            <Button label="Success" icon="pi pi-thumbs-up" severity="success" />
            <Button label="Help" icon="pi pi-question" severity="help" outlined />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default App