import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Message } from 'primereact/message'
import { Skeleton } from 'primereact/skeleton'
import { Toast } from 'primereact/toast'
import BlogCard from '@/components/BlogCard'
import AnimatedSection from '@/components/AnimatedSection'
import { blogService } from '@/services/blogService'
import { useAuthor } from '@/hooks/useAuthor'
import type { BlogPost } from '@/types/blog'
import SEO from '@/components/SEO'

function BlogDetail() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const navigate = useNavigate()
  const toast = useRef<Toast>(null)

  const { author } = useAuthor()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [related, setRelated] = useState<BlogPost[]>([])
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // ===== Helper: user path =====
  const userPath = (path: string = '') => {
    const clean = path.startsWith('/') ? path : `/${path}`
    return `/${username}${clean}`
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!username || !slug) return

    const fetchPost = async () => {
      try {
        setLoading(true)
        const data = await blogService.getPublicBySlug(username, slug)
        setPost(data)
        setError(null)

        const all = await blogService.getPublishedByUser(username)
        setAllPosts(all)
        const relatedPosts = all
          .filter((p) => p.id !== data.id)
          .filter((p) => p.tags?.some((t) => data.tags?.includes(t)))
          .slice(0, 3)
        setRelated(relatedPosts)
      } catch (err) {
        console.error(err)
        setError('Artikel tidak ditemukan.')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [username, slug])

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || '',
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.current?.show({
          severity: 'success',
          summary: 'Link dicopy!',
          detail: 'Link artikel berhasil disalin',
          life: 2000,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.current?.show({
        severity: 'success',
        summary: 'Link dicopy!',
        detail: 'Link artikel berhasil disalin',
        life: 2000,
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <>
        <SEO
          title="Memuat..."
          description="Memuat artikel..."
          url={userPath(`/blog/${slug}`)}
        />
        <div className="page-container blog-detail-container">
          <Skeleton width="8rem" height="1.5rem" className="mb-4" />
          <Skeleton width="80%" height="3rem" className="mb-3" />
          <Skeleton width="60%" height="1.25rem" className="mb-4" />
          <Skeleton height="400px" className="mb-4" borderRadius="20px" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="80%" height="1rem" />
        </div>
      </>
    )
  }

  if (error || !post) {
    return (
      <>
        <SEO
          title="Artikel Tidak Ditemukan"
          description="Artikel yang kamu cari tidak ada."
          url={userPath(`/blog/${slug}`)}
        />
        <div className="page-container blog-detail-container">
          <div className="detail-notfound">
            <div className="detail-notfound-icon-wrapper">
              <i className="pi pi-exclamation-triangle"></i>
            </div>
            <h1>Artikel Tidak Ditemukan</h1>
            <p className="detail-notfound-desc">
              {error || 'Artikel yang kamu cari nggak ada atau udah dihapus.'}
            </p>
            <div className="detail-notfound-actions">
              <Link to={userPath('/blog')}>
                <Button
                  label="Lihat Semua Artikel"
                  icon="pi pi-arrow-left"
                  className="detail-btn-primary"
                />
              </Link>
              <Button
                label="Kembali"
                icon="pi pi-times"
                severity="secondary"
                outlined
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>
      </>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const currentIndex = allPosts.findIndex((p) => p.id === post.id)
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null
  const nextPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null

  return (
    <>
      <Toast ref={toast} />

      <SEO
        title={post.title}
        description={
          post.excerpt || `Baca artikel "${post.title}" di blog saya.`
        }
        image={post.coverUrl || undefined}
        url={userPath(`/blog/${post.slug}`)}
        type="article"
        author={author.name}
        publishedTime={post.createdAt}
        modifiedTime={post.updatedAt}
        tags={post.tags || []}
        keywords={post.tags || []}
      />

      <div className="reading-progress">
        <div
          className="reading-progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="blog-detail-page">
        <section className="blog-detail-hero">
          <div className="blog-detail-hero-bg">
            <div className="blog-detail-hero-orb blog-detail-hero-orb-1" />
            <div className="blog-detail-hero-orb blog-detail-hero-orb-2" />
            <div className="blog-detail-hero-grid" />
          </div>

          <AnimatedSection variant="fade-up">
            <div className="blog-detail-hero-inner">
              <nav className="detail-breadcrumb-nav">
                <Link to={userPath('/blog')} className="detail-breadcrumb-link">
                  <i className="pi pi-arrow-left"></i>
                  <span>Blog</span>
                </Link>
                <span className="detail-breadcrumb-divider">/</span>
                <span className="detail-breadcrumb-active">{post.title}</span>
              </nav>

              <div className="detail-badges">
                {post.featured && (
                  <span className="detail-badge detail-badge-featured">
                    <i className="pi pi-star-fill"></i>
                    Featured
                  </span>
                )}
                <span className="detail-badge detail-badge-date">
                  <i className="pi pi-calendar"></i>
                  {formatDate(post.createdAt)}
                </span>
                {post.readingTime && (
                  <span className="detail-badge detail-badge-date">
                    <i className="pi pi-clock"></i>
                    {post.readingTime} min read
                  </span>
                )}
                <span className="detail-badge detail-badge-date">
                  <i className="pi pi-eye"></i>
                  {post.viewCount} views
                </span>
              </div>

              <h1 className="blog-detail-hero-title">{post.title}</h1>

              {post.excerpt && (
                <p className="blog-detail-hero-excerpt">{post.excerpt}</p>
              )}

              <div className="blog-detail-hero-author">
                <div className="blog-detail-hero-author-avatar">
                  {author.avatarUrl ? (
                    <img src={author.avatarUrl} alt={author.name} />
                  ) : (
                    <i className="pi pi-user"></i>
                  )}
                </div>
                <div className="blog-detail-hero-author-info">
                  <span className="blog-detail-hero-author-label">
                    Ditulis oleh
                  </span>
                  <strong>{author.name}</strong>
                  <small>{author.role}</small>
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="blog-detail-hero-tags">
                  {post.tags.map((tag) => (
                    <Link key={tag} to={userPath(`/blog?tag=${tag}`)}>
                      <span className="blog-detail-hero-tag">
                        <i className="pi pi-tag"></i>
                        {tag}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </AnimatedSection>
        </section>

        <div className="blog-detail-main">
          {post.coverUrl && (
            <AnimatedSection variant="zoom-in">
              <figure className="blog-detail-browser-frame">
                <div className="blog-detail-browser-bar">
                  <div className="detail-browser-dots">
                    <span className="detail-browser-dot detail-browser-dot-red" />
                    <span className="detail-browser-dot detail-browser-dot-yellow" />
                    <span className="detail-browser-dot detail-browser-dot-green" />
                  </div>
                  <div className="detail-browser-url">
                    <i className="pi pi-lock"></i>
                    <span>blog/{post.slug}</span>
                  </div>
                  <div className="detail-browser-actions">
                    <i className="pi pi-ellipsis-h"></i>
                  </div>
                </div>
                <div className="detail-browser-content">
                  <img src={post.coverUrl} alt={post.title} loading="lazy" />
                </div>
              </figure>
            </AnimatedSection>
          )}

          <AnimatedSection variant="fade-up" delay={100}>
            <div className="blog-detail-sharebar">
              <span className="blog-detail-sharebar-label">
                <i className="pi pi-share-alt"></i>
                Bagikan artikel ini
              </span>
              <div className="blog-detail-sharebar-actions">
                <button
                  type="button"
                  className="blog-detail-sharebtn blog-detail-sharebtn-primary"
                  onClick={handleShare}
                >
                  <i className="pi pi-share-alt"></i>
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  className="blog-detail-sharebtn"
                  onClick={handleCopy}
                >
                  <i className="pi pi-copy"></i>
                  <span>Copy Link</span>
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title
                  )}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-detail-sharebtn"
                >
                  <i className="pi pi-twitter"></i>
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    window.location.href
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blog-detail-sharebtn"
                >
                  <i className="pi pi-linkedin"></i>
                </a>
              </div>
            </div>
          </AnimatedSection>

          {post.content ? (
            <AnimatedSection variant="fade-up" delay={200}>
              <div className="blog-detail-content markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </AnimatedSection>
          ) : (
            <Message
              severity="info"
              text="Konten artikel belum tersedia."
              className="w-full"
            />
          )}

          <Divider className="blog-detail-divider" />

          <div className="blog-detail-author-card">
            <div className="blog-detail-author-card-avatar">
              {author.avatarUrl ? (
                <img src={author.avatarUrl} alt={author.name} />
              ) : (
                <i className="pi pi-user"></i>
              )}
            </div>
            <div className="blog-detail-author-card-info">
              <span className="blog-detail-author-card-label">
                <i className="pi pi-pen-to-square"></i>
                Ditulis oleh
              </span>
              <h4 className="blog-detail-author-card-name">{author.name}</h4>
              <p className="blog-detail-author-card-role">{author.role}</p>
              {author.bio && (
                <p className="blog-detail-author-card-bio">{author.bio}</p>
              )}
              <div className="blog-detail-author-card-links">
                <Link to={userPath('/about')}>
                  <Button
                    label="Tentang Saya"
                    icon="pi pi-user"
                    size="small"
                    outlined
                  />
                </Link>
                <Link to={userPath('/contact')}>
                  <Button
                    label="Hubungi"
                    icon="pi pi-envelope"
                    size="small"
                    outlined
                  />
                </Link>
              </div>
            </div>
          </div>

          {(prevPost || nextPost) && (
            <nav className="blog-detail-nav">
              {prevPost ? (
                <Link
                  to={userPath(`/blog/${prevPost.slug}`)}
                  className="blog-detail-nav-item prev"
                >
                  <span className="blog-detail-nav-label">
                    <i className="pi pi-arrow-left"></i>
                    Sebelumnya
                  </span>
                  <span className="blog-detail-nav-title">
                    {prevPost.title}
                  </span>
                </Link>
              ) : (
                <div />
              )}
              {nextPost && (
                <Link
                  to={userPath(`/blog/${nextPost.slug}`)}
                  className="blog-detail-nav-item next"
                >
                  <span className="blog-detail-nav-label">
                    Selanjutnya
                    <i className="pi pi-arrow-right"></i>
                  </span>
                  <span className="blog-detail-nav-title">
                    {nextPost.title}
                  </span>
                </Link>
              )}
            </nav>
          )}

          <AnimatedSection variant="zoom-in">
            <div className="blog-detail-cta">
              <div className="cta-bg-grid" />
              <div className="cta-orb cta-orb-1" />
              <div className="cta-orb cta-orb-2" />

              <div className="blog-detail-cta-content">
                <span className="cta-badge">
                  <i className="pi pi-comments"></i>
                  Let's Talk
                </span>
                <h3 className="blog-detail-cta-title">
                  Ada <span className="cta-title-gradient">pertanyaan?</span>
                </h3>
                <p className="blog-detail-cta-desc">
                  Diskusi atau feedback? Hubungi saya.
                </p>
                <div className="blog-detail-cta-actions">
                  <Link
                    to={userPath('/contact')}
                    className="blog-detail-cta-btn blog-detail-cta-btn-primary"
                  >
                    <span className="blog-detail-cta-btn-icon">
                      <i className="pi pi-envelope"></i>
                    </span>
                    <span className="blog-detail-cta-btn-content">
                      <span className="blog-detail-cta-btn-label">
                        Hubungi Saya
                      </span>
                      <span className="blog-detail-cta-btn-sub">
                        Balas dalam 24 jam
                      </span>
                    </span>
                    <i className="pi pi-arrow-right blog-detail-cta-btn-arrow"></i>
                  </Link>

                  <Link
                    to={userPath('/blog')}
                    className="blog-detail-cta-btn blog-detail-cta-btn-secondary"
                  >
                    <span className="blog-detail-cta-btn-icon">
                      <i className="pi pi-book"></i>
                    </span>
                    <span className="blog-detail-cta-btn-content">
                      <span className="blog-detail-cta-btn-label">
                        Artikel Lain
                      </span>
                      <span className="blog-detail-cta-btn-sub">
                        Jelajahi lebih banyak
                      </span>
                    </span>
                    <i className="pi pi-arrow-right blog-detail-cta-btn-arrow"></i>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {related.length > 0 && (
          <section className="blog-detail-related">
            <AnimatedSection variant="fade-up">
              <div className="blog-detail-related-header">
                <div>
                  <span className="section-eyebrow">Baca Juga</span>
                  <h2 className="blog-detail-related-title">
                    Artikel{' '}
                    <span className="section-title-gradient">Terkait</span>
                  </h2>
                </div>
                <Link to={userPath('/blog')}>
                  <Button
                    label="Lihat Semua"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    text
                  />
                </Link>
              </div>
            </AnimatedSection>
            <div className="grid">
              {related.map((p, i) => (
                <AnimatedSection
                  key={p.id}
                  variant="fade-up"
                  delay={i * 80}
                  className="col-12 md:col-6 lg:col-4"
                >
                  <BlogCard post={p} username={username!} />
                </AnimatedSection>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default BlogDetail