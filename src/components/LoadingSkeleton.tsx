import { Skeleton } from 'primereact/skeleton'

interface LoadingSkeletonProps {
  variant?: 'page' | 'card-grid' | 'list' | 'detail' | 'blog-grid' | 'admin-table'
  count?: number
}

function LoadingSkeleton({
  variant = 'page',
  count = 6,
}: LoadingSkeletonProps) {
  // ===== PAGE SKELETON =====
  if (variant === 'page') {
    return (
      <div className="page-container">
        <div className="skeleton-page">
          <Skeleton width="12rem" height="2.5rem" className="mb-3" />
          <Skeleton width="20rem" height="1rem" className="mb-4" />
          <Skeleton height="400px" className="mb-4" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="100%" height="1rem" className="mb-2" />
          <Skeleton width="80%" height="1rem" />
        </div>
      </div>
    )
  }

  // ===== CARD GRID SKELETON =====
  if (variant === 'card-grid') {
    return (
      <div className="grid projects-grid">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="col-12 md:col-6 lg:col-4 projects-grid-item"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="skeleton-card">
              <Skeleton height="200px" />
              <Skeleton height="2rem" className="mt-3" />
              <Skeleton height="1rem" className="mt-2" />
              <Skeleton height="1rem" width="80%" className="mt-2" />
              <Skeleton height="1rem" width="60%" className="mt-2" />
              <div className="flex gap-2 mt-3">
                <Skeleton width="4rem" height="1.5rem" borderRadius="16px" />
                <Skeleton width="4rem" height="1.5rem" borderRadius="16px" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ===== BLOG GRID SKELETON =====
  if (variant === 'blog-grid') {
    return (
      <div className="grid">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="col-12 md:col-6 lg:col-4">
            <div className="skeleton-card blog-skeleton">
              <Skeleton height="200px" />
              <Skeleton height="0.8rem" width="40%" className="mt-3" />
              <Skeleton height="1.5rem" className="mt-2" />
              <Skeleton height="1rem" className="mt-2" />
              <Skeleton height="1rem" width="80%" className="mt-2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ===== LIST SKELETON =====
  if (variant === 'list') {
    return (
      <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-list-item">
            <Skeleton shape="circle" size="3rem" />
            <div className="skeleton-list-content">
              <Skeleton width="40%" height="1rem" />
              <Skeleton width="70%" height="0.8rem" className="mt-2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ===== DETAIL SKELETON =====
  if (variant === 'detail') {
    return (
      <div className="page-container">
        <Skeleton width="8rem" height="2rem" className="mb-3" />
        <Skeleton width="70%" height="3rem" className="mb-3" />
        <Skeleton width="40%" height="1.5rem" className="mb-4" />
        <Skeleton height="400px" className="mb-4" />
        <Skeleton width="100%" height="1rem" className="mb-2" />
        <Skeleton width="100%" height="1rem" className="mb-2" />
        <Skeleton width="80%" height="1rem" />
      </div>
    )
  }

  // ===== ADMIN TABLE SKELETON =====
  if (variant === 'admin-table') {
    return (
      <div className="admin-table-wrapper">
        <div className="admin-table-skeleton-header">
          <Skeleton width="240px" height="2.5rem" />
          <Skeleton width="140px" height="2.5rem" />
        </div>
        <div className="admin-table-skeleton-body">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="admin-table-skeleton-row">
              <Skeleton width="60px" height="40px" />
              <Skeleton width="200px" height="1rem" />
              <Skeleton width="120px" height="1rem" />
              <Skeleton width="80px" height="1rem" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default LoadingSkeleton