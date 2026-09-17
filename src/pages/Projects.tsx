import { useEffect, useMemo, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'
import { Paginator } from 'primereact/paginator'
import { Chip } from 'primereact/chip'
import ProjectCard from '@/components/ProjectCard'
import { projectService } from '@/services/projectService'
import type { Project } from '@/types/project'

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'
type ViewMode = 'grid' | 'list'

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Terbaru', value: 'newest' },
  { label: 'Terlama', value: 'oldest' },
  { label: 'Judul A-Z', value: 'title-asc' },
  { label: 'Judul Z-A', value: 'title-desc' },
]

function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter & search
  const [search, setSearch] = useState('')
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Pagination
  const [first, setFirst] = useState(0)
  const [rows] = useState(6)

  // Fetch data
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

  // Ambil semua tech unik buat filter
  const techOptions = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => p.techStack?.forEach((t) => set.add(t)))
    return Array.from(set).sort().map((t) => ({ label: t, value: t }))
  }, [projects])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...projects]

    // Search by title/desc
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    // Filter by tech
    if (selectedTech) {
      result = result.filter((p) => p.techStack?.includes(selectedTech))
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'title-asc':
          return a.title.localeCompare(b.title)
        case 'title-desc':
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    return result
  }, [projects, search, selectedTech, sortBy])

  // Paginated
  const paginated = useMemo(
    () => filtered.slice(first, first + rows),
    [filtered, first, rows]
  )

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first)
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedTech(null)
    setSortBy('newest')
    setFirst(0)
  }

  const hasFilter = !!search.trim() || !!selectedTech || sortBy !== 'newest'

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="page-container">
        <div className="projects-header">
          <Skeleton width="12rem" height="2.5rem" />
          <Skeleton width="20rem" height="1rem" className="mt-2" />
        </div>
        <div className="grid mt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-12 md:col-6 lg:col-4">
              <div className="skeleton-card">
                <Skeleton height="180px" />
                <Skeleton height="2rem" className="mt-3" />
                <Skeleton height="1rem" className="mt-2" />
                <Skeleton height="1rem" width="80%" className="mt-2" />
                <Skeleton height="1rem" width="60%" className="mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ===== ERROR =====
  if (error) {
    return (
      <div className="page-container">
        <Message severity="error" text={error} className="w-full" />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* ===== HEADER ===== */}
      <div className="projects-header">
        <h1 className="projects-title">My Projects</h1>
        <p className="projects-subtitle">
          Kumpulan project yang pernah saya kerjakan —{' '}
          <strong>{projects.length}</strong> project total
        </p>
      </div>

      {/* ===== TOOLBAR ===== */}
      {projects.length > 0 && (
        <div className="projects-toolbar">
          {/* Search */}
          <span className="projects-search">
            <i className="pi pi-search"></i>
            <InputText
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setFirst(0)
              }}
              placeholder="Cari project..."
              className="w-full"
            />
          </span>

          {/* Filter tech */}
          <Dropdown
            value={selectedTech}
            options={techOptions}
            onChange={(e) => {
              setSelectedTech(e.value)
              setFirst(0)
            }}
            placeholder="Semua Tech"
            showClear
            className="projects-filter"
          />

          {/* Sort */}
          <Dropdown
            value={sortBy}
            options={SORT_OPTIONS}
            onChange={(e) => setSortBy(e.value)}
            className="projects-sort"
          />

          {/* View toggle */}
          <div className="projects-view-toggle">
            <Button
              icon="pi pi-th-large"
              rounded
              text
              severity={viewMode === 'grid' ? undefined : 'secondary'}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            />
            <Button
              icon="pi pi-list"
              rounded
              text
              severity={viewMode === 'list' ? undefined : 'secondary'}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            />
          </div>
        </div>
      )}

      {/* ===== ACTIVE FILTERS ===== */}
      {hasFilter && (
        <div className="projects-active-filters">
          <span className="text-sm text-color-secondary">Filter aktif:</span>
          {search && (
            <Chip
              label={`"${search}"`}
              icon="pi pi-search"
              removable
              onRemove={() => {
                setSearch('')
                return true
              }}
            />
          )}
          {selectedTech && (
            <Chip
              label={selectedTech}
              icon="pi pi-tag"
              removable
              onRemove={() => {
                setSelectedTech(null)
                return true
              }}
            />
          )}
          <Button
            label="Reset"
            icon="pi pi-times"
            text
            size="small"
            severity="danger"
            onClick={clearFilters}
          />
        </div>
      )}

      {/* ===== RESULT COUNT ===== */}
      {projects.length > 0 && (
        <div className="projects-result-count">
          Menampilkan <strong>{paginated.length}</strong> dari{' '}
          <strong>{filtered.length}</strong> project
        </div>
      )}

      {/* ===== EMPTY STATE ===== */}
      {projects.length === 0 && (
        <Message
          severity="info"
          text="Belum ada project. Tambah via API atau admin panel nanti."
          className="w-full"
        />
      )}

      {/* ===== NO RESULT ===== */}
      {projects.length > 0 && filtered.length === 0 && (
        <div className="projects-empty">
          <i className="pi pi-search text-5xl text-color-secondary"></i>
          <h3>Tidak ada project yang cocok</h3>
          <p className="text-color-secondary">
            Coba ubah kata kunci atau reset filter.
          </p>
          <Button label="Reset Filter" icon="pi pi-refresh" onClick={clearFilters} />
        </div>
      )}

      {/* ===== GRID VIEW ===== */}
      {viewMode === 'grid' && paginated.length > 0 && (
        <div className="grid">
          {paginated.map((p) => (
            <div key={p.id} className="col-12 md:col-6 lg:col-4">
              <ProjectCard project={p} />
            </div>
          ))}
        </div>
      )}

      {/* ===== LIST VIEW ===== */}
      {viewMode === 'list' && paginated.length > 0 && (
        <div className="projects-list">
          {paginated.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* ===== PAGINATION ===== */}
      {filtered.length > rows && (
        <Paginator
          first={first}
          rows={rows}
          totalRecords={filtered.length}
          onPageChange={onPageChange}
          template="PrevPageLink PageLinks NextPageLink"
          className="projects-paginator"
        />
      )}
    </div>
  )
}

export default Projects