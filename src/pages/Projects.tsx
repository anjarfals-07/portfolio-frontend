import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'
import { Paginator } from 'primereact/paginator'
import ProjectCard from '@/components/ProjectCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
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
  const { username } = useParams<{ username: string }>()

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const [first, setFirst] = useState(0)
  const [rows] = useState(6)

  // ===== Helper: user path =====
  const userPath = (path: string = '') => {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `/${username}${clean}`
  }

  useEffect(() => {
    if (!username) return

    const fetchProjects = async () => {
      try {
        setLoading(true)
        const data = await projectService.getPublicProjects(username)
        setProjects(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Gagal memuat works.')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [username])

  const techOptions = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => p.techStack?.forEach((t) => set.add(t)))
    return Array.from(set)
      .sort()
      .map((t) => ({ label: t, value: t }))
  }, [projects])

  const topTechs = useMemo(() => {
    const counts: Record<string, number> = {}
    projects.forEach((p) =>
      p.techStack?.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    )
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tech, count]) => ({ tech, count }))
  }, [projects])

  const featuredCount = useMemo(
    () => projects.filter((p) => p.featured).length,
    [projects]
  )

  const filtered = useMemo(() => {
    let result = [...projects]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      )
    }

    if (selectedTech) {
      result = result.filter((p) => p.techStack?.includes(selectedTech))
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
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

  const paginated = useMemo(
    () => filtered.slice(first, first + rows),
    [filtered, first, rows]
  )

  const onPageChange = (e: { first: number }) => {
    setFirst(e.first)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearch('')
    setSelectedTech(null)
    setSortBy('newest')
    setFirst(0)
  }

  const toggleTech = (tech: string) => {
    setSelectedTech((prev) => (prev === tech ? null : tech))
    setFirst(0)
  }

  const hasFilter = !!search.trim() || !!selectedTech || sortBy !== 'newest'

  if (loading) {
    return (
      <div className="page-container">
        <SEO
          title={`Works ${username}`}
          description="Kumpulan karya dan project yang pernah saya kerjakan."
          url={userPath('/projects')}
          keywords={['works', 'projects', 'portfolio']}
        />
        <div className="projects-header">
          <Skeleton width="12rem" height="2.5rem" />
          <Skeleton width="20rem" height="1rem" className="mt-2" />
        </div>
        <div className="mt-4">
          <LoadingSkeleton variant="card-grid" count={6} />
        </div>
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
    <div className="projects-page">
      <SEO
        title={`Works ${username}`}
        description="Kumpulan karya dan project yang pernah saya kerjakan."
        url={userPath('/projects')}
        keywords={['works', 'projects', 'portfolio', 'karya']}
      />

      <section className="projects-hero">
        <div className="projects-hero-bg">
          <div className="projects-hero-orb projects-hero-orb-1" />
          <div className="projects-hero-orb projects-hero-orb-2" />
          <div className="projects-hero-grid" />
        </div>

        <AnimatedSection variant="fade-up">
          <div className="page-container projects-hero-inner">
            <span className="projects-hero-eyebrow">
              <i className="pi pi-briefcase"></i>
              Portfolio
            </span>

            <h1 className="projects-hero-title">
              My <span className="projects-hero-title-gradient">Works</span>
            </h1>

            <p className="projects-hero-desc">
              Kumpulan karya yang pernah saya kerjakan — dari web apps, tools,
              hingga eksperimen kreatif.
            </p>

            {projects.length > 0 && (
              <div className="projects-hero-stats">
                <div className="projects-hero-stat">
                  <span className="projects-hero-stat-value">
                    {projects.length}
                  </span>
                  <span className="projects-hero-stat-label">Total Works</span>
                </div>
                <div className="projects-hero-stat-divider" />
                <div className="projects-hero-stat">
                  <span className="projects-hero-stat-value">
                    {techOptions.length}
                  </span>
                  <span className="projects-hero-stat-label">Tools Used</span>
                </div>
                {featuredCount > 0 && (
                  <>
                    <div className="projects-hero-stat-divider" />
                    <div className="projects-hero-stat">
                      <span className="projects-hero-stat-value">
                        {featuredCount}
                      </span>
                      <span className="projects-hero-stat-label">Featured</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </AnimatedSection>
      </section>

      <div className="page-container projects-content">
        {projects.length > 0 && (
          <div className="projects-toolbar">
            <span className="projects-search">
              <i className="pi pi-search"></i>
              <InputText
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setFirst(0)
                }}
                placeholder="Cari works..."
                className="w-full"
              />
              {search && (
                <button
                  type="button"
                  className="projects-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <i className="pi pi-times"></i>
                </button>
              )}
            </span>

            <Dropdown
              value={sortBy}
              options={SORT_OPTIONS}
              onChange={(e) => setSortBy(e.value)}
              className="projects-sort"
            />

            <div className="projects-view-toggle">
              <button
                type="button"
                className={`projects-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <i className="pi pi-th-large"></i>
              </button>
              <button
                type="button"
                className={`projects-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <i className="pi pi-list"></i>
              </button>
            </div>
          </div>
        )}

        {projects.length > 0 && topTechs.length > 0 && (
          <div className="projects-quick-filters">
            <span className="projects-quick-label">
              <i className="pi pi-bolt"></i>
              Quick filter:
            </span>
            <div className="projects-quick-chips">
              <button
                type="button"
                className={`projects-quick-chip ${!selectedTech ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTech(null)
                  setFirst(0)
                }}
              >
                <i className="pi pi-th-large"></i>
                All
                <span className="projects-quick-chip-count">
                  {projects.length}
                </span>
              </button>
              {topTechs.map(({ tech, count }) => (
                <button
                  key={tech}
                  type="button"
                  className={`projects-quick-chip ${selectedTech === tech ? 'active' : ''}`}
                  onClick={() => toggleTech(tech)}
                >
                  {tech}
                  <span className="projects-quick-chip-count">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="projects-meta-row">
            <div className="projects-result-count">
              <span className="projects-result-badge">
                <i className="pi pi-briefcase"></i>
                <strong>{filtered.length}</strong>
                {filtered.length === 1 ? ' work' : ' works'}
                {hasFilter && (
                  <button
                    type="button"
                    className="projects-clear-all"
                    onClick={clearFilters}
                  >
                    Clear
                  </button>
                )}
              </span>
            </div>
          </div>
        )}

        {projects.length === 0 && (
          <EmptyState
            icon="pi pi-briefcase"
            title="Belum Ada Works"
            description="Saya belum menambahkan karya apapun. Cek kembali nanti!"
          />
        )}

        {projects.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon="pi pi-search"
            title="Tidak Ada Works yang Cocok"
            description="Coba ubah kata kunci atau reset filter untuk melihat semua works."
            actionLabel="Reset Filter"
            actionIcon="pi pi-refresh"
            onAction={clearFilters}
          />
        )}

        {viewMode === 'grid' && paginated.length > 0 && (
          <div className="grid projects-grid">
            {paginated.map((p, i) => (
              <AnimatedSection
                key={p.id}
                variant="fade-up"
                delay={i * 80}
                className="col-12 md:col-6 lg:col-4"
              >
                <ProjectCard project={p} username={username!} />
              </AnimatedSection>
            ))}
          </div>
        )}

        {viewMode === 'list' && paginated.length > 0 && (
          <div className="projects-list">
            {paginated.map((p, i) => (
              <AnimatedSection
                key={p.id}
                variant="fade-left"
                delay={i * 60}
              >
                <ProjectCard project={p} username={username!} />
              </AnimatedSection>
            ))}
          </div>
        )}

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
    </div>
  )
}

export default Projects