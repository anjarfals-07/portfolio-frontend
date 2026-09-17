import { useEffect, useState } from 'react'
import { Card } from 'primereact/card'
import { Tag } from 'primereact/tag'
import { ProgressSpinner } from 'primereact/progressspinner'
import { Message } from 'primereact/message'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/project'

function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await projectService.getAll()
        setProjects(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Gagal memuat project. Pastikan backend jalan.')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="page-container flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <ProgressSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <Message severity="error" text={error} className="w-full" />
      </div>
    )
  }

  return (
    <div className="page-container">
      <h1>Projects</h1>
      <p className="text-color-secondary">
        Total: {projects.length} project
      </p>

      {projects.length === 0 ? (
        <Message
          severity="info"
          text="Belum ada project. Tambah via API atau admin panel nanti."
          className="w-full"
        />
      ) : (
        <div className="grid">
          {projects.map((p) => (
            <div key={p.id} className="col-12 md:col-6 lg:col-4">
              <Card title={p.title} subTitle={p.slug}>
                <p>{p.description || 'Tanpa deskripsi'}</p>
                <div className="flex flex-wrap gap-1">
                  {p.techStack?.map((tech) => (
                    <Tag key={tech} value={tech} severity="info" />
                  ))}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects