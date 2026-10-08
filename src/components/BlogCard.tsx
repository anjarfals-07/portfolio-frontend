import { Link } from 'react-router-dom'
import { Tag } from 'primereact/tag'
import { useAuthor } from '@/hooks/useAuthor'
import type { BlogPost } from '@/types/blog'

interface BlogCardProps {
  post: BlogPost
  username: string
  variant?: 'default' | 'compact' | 'horizontal' | 'featured'
}

function BlogCard({ post, username, variant = 'default' }: BlogCardProps) {
  const { author } = useAuthor()

  // ===== Helper: generate path user =====
  const blogPath = `/${username}/blog/${post.slug}`

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const AuthorBadge = ({ compact = false }: { compact?: boolean }) => (
    <span className={`blog-card-author ${compact ? 'compact' : ''}`}>
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt={author.name}
          className="blog-card-author-avatar"
        />
      ) : (
        <span className="blog-card-author-avatar-placeholder">
          <i className="pi pi-user"></i>
        </span>
      )}
      <span className="blog-card-author-name">{author.name}</span>
    </span>
  )

  const ImageSection = ({
    className = 'blog-card-image',
  }: {
    className?: string
  }) => {
    if (post.coverUrl) {
      return (
        <Link to={blogPath} className="blog-card-image-link">
          <img
            src={post.coverUrl}
            alt={post.title}
            className={className}
            loading="lazy"
          />
        </Link>
      )
    }
    return (
      <Link to={blogPath} className="blog-card-image-link">
        <div className="blog-card-image-placeholder">
          <i className="pi pi-image text-4xl"></i>
        </div>
      </Link>
    )
  }

  // ===== HORIZONTAL VARIANT =====
  if (variant === 'horizontal') {
    return (
      <article className="blog-card-horizontal">
        <div className="blog-card-horizontal-image">
          <ImageSection className="blog-card-horizontal-img" />
        </div>
        <div className="blog-card-horizontal-content">
          <div className="blog-card-meta">
            <AuthorBadge compact />
            <span>
              <i className="pi pi-calendar"></i>
              {formatDate(post.createdAt)}
            </span>
            {post.readingTime && (
              <span>
                <i className="pi pi-clock"></i>
                {post.readingTime} min
              </span>
            )}
          </div>
          <Link to={blogPath} className="no-underline">
            <h3 className="blog-card-horizontal-title">{post.title}</h3>
          </Link>
          <p className="blog-card-horizontal-excerpt">
            {post.excerpt || 'Baca artikel lengkapnya...'}
          </p>
          <div className="blog-card-horizontal-footer">
            {post.tags && post.tags.length > 0 && (
              <div className="blog-card-tags">
                {post.tags.slice(0, 3).map((tag) => (
                  <Tag key={tag} value={tag} severity="info" />
                ))}
              </div>
            )}
            <Link to={blogPath} className="blog-card-read-more">
              Baca <i className="pi pi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </article>
    )
  }

  // ===== FEATURED VARIANT =====
  if (variant === 'featured') {
    return (
      <article className="blog-card-featured">
        <div className="blog-card-featured-image">
          <ImageSection className="blog-card-featured-img" />
          {post.featured && (
            <span className="blog-card-featured-badge">
              <i className="pi pi-star-fill"></i> Featured
            </span>
          )}
        </div>
        <div className="blog-card-featured-content">
          <div className="blog-card-meta">
            <AuthorBadge compact />
            <span>
              <i className="pi pi-calendar"></i>
              {formatDate(post.createdAt)}
            </span>
            {post.readingTime && (
              <span>
                <i className="pi pi-clock"></i>
                {post.readingTime} min read
              </span>
            )}
          </div>
          <Link to={blogPath} className="no-underline">
            <h2 className="blog-card-featured-title">{post.title}</h2>
          </Link>
          <p className="blog-card-featured-excerpt">
            {post.excerpt || 'Baca artikel lengkapnya...'}
          </p>
          <div className="blog-card-featured-footer">
            {post.tags && post.tags.length > 0 && (
              <div className="blog-card-tags">
                {post.tags.slice(0, 4).map((tag) => (
                  <Tag key={tag} value={tag} severity="info" />
                ))}
              </div>
            )}
            <Link to={blogPath} className="blog-card-read-more featured">
              Baca Artikel <i className="pi pi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </article>
    )
  }

  // ===== COMPACT VARIANT =====
  if (variant === 'compact') {
    return (
      <article className="blog-card-compact">
        <div className="blog-card-compact-image">
          <ImageSection className="blog-card-compact-img" />
        </div>
        <div className="blog-card-compact-content">
          <Link to={blogPath} className="no-underline">
            <h4 className="blog-card-compact-title">{post.title}</h4>
          </Link>
          <span className="blog-card-compact-date">
            {formatDate(post.createdAt)}
          </span>
        </div>
      </article>
    )
  }

  // ===== DEFAULT VARIANT =====
  return (
    <article className="blog-card">
      <div className="blog-card-image-wrapper">
        <ImageSection />
      </div>

      <div className="blog-card-body">
        <div className="blog-card-meta">
          <AuthorBadge compact />
          <span>
            <i className="pi pi-calendar"></i>
            {formatDate(post.createdAt)}
          </span>
          {post.readingTime && (
            <span>
              <i className="pi pi-clock"></i>
              {post.readingTime} min
            </span>
          )}
        </div>

        <Link to={blogPath} className="no-underline">
          <h3 className="blog-card-title">{post.title}</h3>
        </Link>

        <p className="blog-card-excerpt">
          {post.excerpt || 'Baca artikel lengkapnya...'}
        </p>

        <div className="blog-card-footer">
          <div className="blog-card-tags">
            {post.tags?.slice(0, 2).map((tag) => (
              <Tag key={tag} value={tag} severity="info" />
            ))}
            {post.tags && post.tags.length > 2 && (
              <Tag value={`+${post.tags.length - 2}`} severity="secondary" />
            )}
          </div>
          <Link to={blogPath} className="blog-card-read-more">
            Baca <i className="pi pi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </article>
  )
}

export default BlogCard