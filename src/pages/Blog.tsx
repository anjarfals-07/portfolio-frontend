import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Button } from 'primereact/button'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'
import { Paginator } from 'primereact/paginator'
import { Divider } from 'primereact/divider'
import BlogCard from '@/components/BlogCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import AnimatedSection from '@/components/AnimatedSection'
import SEO from '@/components/SEO'
import { blogService } from '@/services/blogService'
import type { BlogPost } from '@/types/blog'

function Blog() {
  const { username } = useParams<{ username: string }>()

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [first, setFirst] = useState(0)
  const [rows] = useState(6)

  // ===== Helper: user path =====
  const userPath = (path: string = '') => {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `/${username}${clean}`
  }

  useEffect(() => {
    if (!username) return

    const fetchPosts = async () => {
      try {
        setLoading(true)
        const data = await blogService.getPublishedByUser(username)
        setPosts(data)
        setError(null)
      } catch (err) {
        console.error(err)
        setError('Gagal memuat artikel.')
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [username])

  const tagOptions = useMemo(() => {
    const map = new Map<string, number>()
    posts.forEach((p) =>
      p.tags?.forEach((t) => map.set(t, (map.get(t) || 0) + 1))
    )
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }))
  }, [posts])

  const filtered = useMemo(() => {
    let result = [...posts]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt?.toLowerCase().includes(q)
      )
    }

    if (selectedTag) {
      result = result.filter((p) => p.tags?.includes(selectedTag))
    }

    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return result
  }, [posts, search, selectedTag])

  const featuredPost = useMemo(() => {
    const featured = filtered.filter((p) => p.featured)
    return featured.length > 0 ? featured[0] : filtered[0]
  }, [filtered])

  const remainingPosts = useMemo(() => {
    return filtered.filter((p) => p.id !== featuredPost?.id)
  }, [filtered, featuredPost])

  const paginated = useMemo(
    () => remainingPosts.slice(first, first + rows),
    [remainingPosts, first, rows]
  )

  const clearFilters = () => {
    setSearch('')
    setSelectedTag(null)
    setFirst(0)
  }

  const toggleTag = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag))
    setFirst(0)
  }

  const hasFilter = !!search.trim() || !!selectedTag

  const handlePageChange = (e: { first: number }) => {
    setFirst(e.first)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ===== Loading =====
  if (loading) {
    return (
      <div className="blog-page">
        <SEO
          title={`Blog ${username}`}
          description="Tulisan, tutorial, dan pemikiran seputar programming."
          url={userPath('/blog')}
          keywords={['blog', 'artikel', 'tutorial']}
        />
        <div className="blog-hero-skeleton">
          <Skeleton width="60%" height="1rem" className="mb-2" />
          <Skeleton width="40%" height="3rem" className="mb-3" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="80%" height="1rem" />
        </div>
        <Divider />
        <LoadingSkeleton variant="blog-grid" count={6} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-page">
        <Message severity="error" text={error} className="w-full" />
      </div>
    )
  }

  return (
    <div className="blog-page-wrapper">
      <SEO
        title={`Blog ${username}`}
        description="Tulisan, tutorial, dan pemikiran seputar programming, karier, dan teknologi."
        url={userPath('/blog')}
        keywords={['blog', 'artikel', 'tutorial', 'programming']}
      />

      {/* ===== HERO ===== */}
      <section className="blog-hero">
        <div className="blog-hero-bg">
          <div className="blog-hero-orb blog-hero-orb-1" />
          <div className="blog-hero-orb blog-hero-orb-2" />
          <div className="blog-hero-grid" />
        </div>

        <AnimatedSection variant="fade-up">
          <div className="blog-hero-container">
            <span className="blog-hero-badge">
              <i className="pi pi-pencil"></i>
              Blog & Tulisan
            </span>

            <h1 className="blog-hero-title">
              Cerita, Tutorial &{' '}
              <span className="blog-hero-title-gradient">Pemikiran</span>
            </h1>

            <p className="blog-hero-desc">
              Kumpulan tulisan tentang programming, karier, dan hal-hal yang
              saya pelajari di perjalanan jadi developer.
            </p>

            {posts.length > 0 && (
              <div className="blog-hero-stats">
                <div className="blog-hero-stat">
                  <span className="blog-hero-stat-value">{posts.length}</span>
                  <span className="blog-hero-stat-label">Artikel</span>
                </div>
                <div className="blog-hero-stat-divider" />
                <div className="blog-hero-stat">
                  <span className="blog-hero-stat-value">
                    {tagOptions.length}
                  </span>
                  <span className="blog-hero-stat-label">Topik</span>
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="blog-main-container">
        {posts.length > 0 && (
          <div className="blog-toolbar-modern">
            <span className="blog-search">
              <i className="pi pi-search"></i>
              <InputText
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setFirst(0)
                }}
                placeholder="Cari artikel..."
                className="w-full"
              />
              {search && (
                <button
                  type="button"
                  className="blog-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <i className="pi pi-times"></i>
                </button>
              )}
            </span>

            {hasFilter && (
              <Button
                label="Reset"
                icon="pi pi-times"
                text
                severity="danger"
                size="small"
                onClick={clearFilters}
                className="blog-reset-btn"
              />
            )}
          </div>
        )}

        {tagOptions.length > 0 && (
          <div className="blog-tags-filter">
            <span className="blog-tags-filter-label">
              <i className="pi pi-filter-fill"></i>
              Filter topik
            </span>
            <div className="blog-tags-filter-chips">
              <button
                className={`blog-tag-chip ${!selectedTag ? 'active' : ''}`}
                onClick={() => {
                  setSelectedTag(null)
                  setFirst(0)
                }}
              >
                <i className="pi pi-th-large"></i>
                Semua
                <span className="blog-tag-chip-count">{posts.length}</span>
              </button>
              {tagOptions.map(({ tag, count }) => (
                <button
                  key={tag}
                  className={`blog-tag-chip ${
                    selectedTag === tag ? 'active' : ''
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                  <span className="blog-tag-chip-count">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {posts.length === 0 && (
          <EmptyState
            icon="pi pi-book"
            title="Belum Ada Artikel"
            description="Blog masih kosong. Artikel akan muncul di sini setelah dipublikasi."
          />
        )}

        {posts.length > 0 && filtered.length === 0 && (
          <EmptyState
            icon="pi pi-search"
            title="Tidak Ada Artikel yang Cocok"
            description="Coba ubah kata kunci atau reset filter."
            actionLabel="Reset Filter"
            actionIcon="pi pi-refresh"
            onAction={clearFilters}
          />
        )}

        {filtered.length > 0 && featuredPost && (
          <section className="blog-featured-section">
            <div className="blog-featured-label">
              <i className="pi pi-star-fill"></i>
              <span>Artikel Pilihan</span>
            </div>
            <AnimatedSection variant="fade-up">
              <BlogCard post={featuredPost} username={username!} variant="featured" />
            </AnimatedSection>
          </section>
        )}

        {filtered.length > 1 && (
          <div className="blog-divider">
            <span>Artikel Lainnya</span>
          </div>
        )}

        {paginated.length > 0 && (
          <div className="grid blog-grid">
            {paginated.map((post, i) => (
              <AnimatedSection
                key={post.id}
                variant="fade-up"
                delay={i * 80}
                className="col-12 md:col-6 lg:col-4"
              >
                <BlogCard post={post} username={username!} />
              </AnimatedSection>
            ))}
          </div>
        )}

        {remainingPosts.length > rows && (
          <Paginator
            first={first}
            rows={rows}
            totalRecords={remainingPosts.length}
            onPageChange={handlePageChange}
            template="PrevPageLink PageLinks NextPageLink"
            className="blog-paginator"
          />
        )}
      </div>
    </div>
  )
}

export default Blog