import { useEffect, useMemo, useRef, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputSwitch } from 'primereact/inputswitch'
import { Chips } from 'primereact/chips'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import { Image } from 'primereact/image'
import { blogService } from '@/services/blogService'
import ImageUpload from '@/components/ImageUpload'
import type { BlogPost, BlogPostFormData } from '@/types/blog'
import EmptyState from '@/components/EmptyState'

/* ============================================================
   CONSTANTS
   ============================================================ */

const EMPTY_FORM: BlogPostFormData = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverUrl: '',
  tags: [],
  published: true,
  featured: false,
}

type StatusFilter = 'all' | 'published' | 'draft' | 'featured'

interface FilterOption {
  label: string
  value: StatusFilter
  icon: string
  tone: 'blue' | 'green' | 'gray' | 'orange'
}

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'Semua', value: 'all', icon: 'pi pi-th-large', tone: 'blue' },
  { label: 'Published', value: 'published', icon: 'pi pi-check-circle', tone: 'green' },
  { label: 'Draft', value: 'draft', icon: 'pi pi-pause-circle', tone: 'gray' },
  { label: 'Featured', value: 'featured', icon: 'pi pi-star-fill', tone: 'orange' },
]

/* ============================================================
   HELPERS
   ============================================================ */

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

/* ============================================================
   COMPONENT
   ============================================================ */

function ManageBlog() {
  const toast = useRef<Toast>(null)

  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [dialogVisible, setDialogVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<BlogPostFormData>(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [slugTouched, setSlugTouched] = useState(false)

  /* ------------------------------------------------------------
     FETCH
     ------------------------------------------------------------ */
  const fetchPosts = async () => {
    try {
      setLoading(true)
      const data = await blogService.getAllForOwner()
      setPosts(data)
    } catch (err) {
      console.error(err)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Gagal memuat blog posts',
        life: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  /* ------------------------------------------------------------
     STATS
     ------------------------------------------------------------ */
  const stats = useMemo(() => {
    const total = posts.length
    const published = posts.filter((p) => p.published).length
    const drafts = posts.filter((p) => !p.published).length
    const featured = posts.filter((p) => p.featured).length
    const views = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0)
    return { total, published, drafts, featured, views }
  }, [posts])

  /* ------------------------------------------------------------
     FILTER
     ------------------------------------------------------------ */
  const filteredPosts = useMemo(() => {
    switch (statusFilter) {
      case 'published':
        return posts.filter((p) => p.published)
      case 'draft':
        return posts.filter((p) => !p.published)
      case 'featured':
        return posts.filter((p) => p.featured)
      default:
        return posts
    }
  }, [posts, statusFilter])

  const filterCount = useMemo<Record<StatusFilter, number>>(
    () => ({
      all: stats.total,
      published: stats.published,
      draft: stats.drafts,
      featured: stats.featured,
    }),
    [stats]
  )

  /* ------------------------------------------------------------
     DIALOG
     ------------------------------------------------------------ */
  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormErrors({})
    setSlugTouched(false)
    setDialogVisible(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverUrl: post.coverUrl || '',
      tags: post.tags || [],
      published: post.published,
      featured: post.featured,
    })
    setFormErrors({})
    setSlugTouched(true)
    setDialogVisible(true)
  }

  /* ------------------------------------------------------------
     AUTO SLUG
     ------------------------------------------------------------ */
  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugTouched ? prev.slug : slugify(title),
    }))
  }

  /* ------------------------------------------------------------
     VALIDATE
     ------------------------------------------------------------ */
  const validate = (): boolean => {
    const errors: Record<string, string> = {}
    if (!form.title.trim()) errors.title = 'Title wajib diisi'
    if (form.title.length > 500) errors.title = 'Title maksimal 500 karakter'
    if (form.excerpt && form.excerpt.length > 5000)
      errors.excerpt = 'Excerpt maksimal 5000 karakter'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  /* ------------------------------------------------------------
     SAVE
     ------------------------------------------------------------ */
  const handleSave = async () => {
    if (!validate()) return

    setSaving(true)
    try {
      if (editingId) {
        await blogService.update(editingId, form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Artikel berhasil diupdate',
          life: 3000,
        })
      } else {
        await blogService.create(form)
        toast.current?.show({
          severity: 'success',
          summary: 'Berhasil',
          detail: 'Artikel berhasil dibuat',
          life: 3000,
        })
      }
      setDialogVisible(false)
      fetchPosts()
    } catch (err) {
      console.error(err)
      const axiosErr = err as { response?: { data?: { message?: string } } }
      toast.current?.show({
        severity: 'error',
        summary: 'Gagal',
        detail: axiosErr.response?.data?.message || 'Terjadi kesalahan',
        life: 4000,
      })
    } finally {
      setSaving(false)
    }
  }

  /* ------------------------------------------------------------
     DELETE
     ------------------------------------------------------------ */
  const handleDelete = (post: BlogPost) => {
    confirmDialog({
      message: `Yakin hapus artikel "${post.title}"?`,
      header: 'Konfirmasi Hapus',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await blogService.delete(post.id)
          toast.current?.show({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Artikel berhasil dihapus',
            life: 3000,
          })
          fetchPosts()
        } catch (err) {
          console.error(err)
          toast.current?.show({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menghapus artikel',
            life: 3000,
          })
        }
      },
    })
  }

  /* ============================================================
     TEMPLATES
     ============================================================ */

  const coverTemplate = (row: BlogPost) => {
    if (!row.coverUrl) {
      return (
        <div className="ab-thumb ab-thumb-empty">
          <i className="pi pi-image"></i>
        </div>
      )
    }
    return (
      <Image
        src={row.coverUrl}
        alt={row.title}
        width="72"
        height="48"
        preview
        className="ab-thumb"
        imageClassName="ab-thumb-img"
      />
    )
  }

  const titleTemplate = (row: BlogPost) => (
    <div className="ab-title-cell">
      <strong className="ab-title-text">{row.title}</strong>
      <span className="ab-slug">
        <i className="pi pi-link"></i>
        {row.slug}
      </span>
      <div className="ab-meta-row">
        {row.readingTime && (
          <span className="ab-meta">
            <i className="pi pi-clock"></i>
            {row.readingTime} min read
          </span>
        )}
        {row.createdAt && (
          <span className="ab-meta">
            <i className="pi pi-calendar"></i>
            {formatDate(row.createdAt)}
          </span>
        )}
      </div>
    </div>
  )

  const tagsTemplate = (row: BlogPost) => (
    <div className="ab-tags">
      {row.tags?.slice(0, 2).map((t) => (
        <span key={t} className="ab-tag">
          {t}
        </span>
      ))}
      {row.tags && row.tags.length > 2 && (
        <span className="ab-tag ab-tag-more">+{row.tags.length - 2}</span>
      )}
      {!row.tags?.length && <span className="ab-tag-empty">—</span>}
    </div>
  )

  const viewsTemplate = (row: BlogPost) => (
    <div className="ab-views">
      <i className="pi pi-eye"></i>
      <strong>{(row.viewCount || 0).toLocaleString('id-ID')}</strong>
    </div>
  )

  const statusTemplate = (row: BlogPost) => (
    <div className="ab-status-cell">
      {row.featured && (
        <span className="ab-status-badge ab-status-featured">
          <i className="pi pi-star-fill"></i>
          Featured
        </span>
      )}
      {row.published ? (
        <span className="ab-status-badge ab-status-published">
          <i className="pi pi-check-circle"></i>
          Published
        </span>
      ) : (
        <span className="ab-status-badge ab-status-draft">
          <i className="pi pi-pause-circle"></i>
          Draft
        </span>
      )}
    </div>
  )

  const actionsTemplate = (row: BlogPost) => (
    <div className="ab-actions-cell">
      <Button
        icon="pi pi-pencil"
        rounded
        text
        severity="info"
        tooltip="Edit"
        tooltipOptions={{ position: 'top' }}
        onClick={() => openEdit(row)}
        className="ab-action-btn"
      />
      <Button
        icon="pi pi-trash"
        rounded
        text
        severity="danger"
        tooltip="Hapus"
        tooltipOptions={{ position: 'top' }}
        onClick={() => handleDelete(row)}
        className="ab-action-btn"
      />
    </div>
  )

  /* ============================================================
     TABLE HEADER
     ============================================================ */
  const header = (
    <div className="ab-table-header">
      <div className="ab-table-header-left">
        <span className="ab-search">
          <i className="pi pi-search"></i>
          <InputText
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cari artikel..."
          />
          {globalFilter && (
            <button
              type="button"
              className="ab-search-clear"
              onClick={() => setGlobalFilter('')}
              aria-label="Clear"
            >
              <i className="pi pi-times"></i>
            </button>
          )}
        </span>
      </div>

      {/* Meta info — pengganti tombol yang dihapus */}
      <span className="ab-table-header-meta">
        <i className="pi pi-list"></i>
        Menampilkan <strong>{filteredPosts.length}</strong> dari{' '}
        <strong>{posts.length}</strong> artikel
      </span>
    </div>
  )

  /* ============================================================
     DIALOG HEADER / FOOTER
     ============================================================ */
  const dialogHeader = (
    <div className="ab-dialog-header">
      <div className="ab-dialog-header-icon">
        <i className={editingId ? 'pi pi-pencil' : 'pi pi-plus'}></i>
      </div>
      <div className="ab-dialog-header-text">
        <strong>{editingId ? 'Edit Artikel' : 'Tulis Artikel Baru'}</strong>
        <span>
          {editingId
            ? 'Update informasi artikel kamu'
            : 'Isi form di bawah untuk menulis artikel'}
        </span>
      </div>
    </div>
  )

  const dialogFooter = (
    <div className="ab-dialog-footer">
      <Button
        label="Batal"
        icon="pi pi-times"
        severity="secondary"
        outlined
        onClick={() => setDialogVisible(false)}
        disabled={saving}
      />
      <Button
        label={saving ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
        icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
        onClick={handleSave}
        disabled={saving}
        className="ab-submit-btn"
      />
    </div>
  )

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="ab-page">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* ============================================
          HEADER
         ============================================ */}
      <header className="ab-header">
        <div className="ab-header-bg">
          <span className="ab-header-orb ab-header-orb-1" />
          <span className="ab-header-orb ab-header-orb-2" />
        </div>

        <div className="ab-header-inner">
          <div className="ab-header-left">
            <div className="ab-header-icon">
              <i className="pi pi-book"></i>
            </div>
            <div className="ab-header-text">
              <span className="ab-header-eyebrow">
                <i className="pi pi-pencil"></i>
                Content Studio
              </span>
              <h1 className="ab-header-title">
                Manage <span className="ab-header-title-gradient">Blog</span>
              </h1>
              <p className="ab-header-subtitle">
                Kelola artikel blog kamu — total{' '}
                <strong>{stats.total} artikel</strong>
              </p>
            </div>
          </div>

          <div className="ab-header-right">
            <Button
              label="Tulis Artikel"
              icon="pi pi-plus"
              onClick={openCreate}
              className="ab-add-btn ab-add-btn-lg"
            />
          </div>
        </div>
      </header>

      {/* ============================================
          STATS
         ============================================ */}
      <div className="ab-stats">
        <div className="ab-stat tone-blue">
          <div className="ab-stat-icon">
            <i className="pi pi-book"></i>
          </div>
          <div className="ab-stat-info">
            <span className="ab-stat-label">Total Artikel</span>
            <strong className="ab-stat-value">{stats.total}</strong>
          </div>
        </div>

        <div className="ab-stat tone-green">
          <div className="ab-stat-icon">
            <i className="pi pi-check-circle"></i>
          </div>
          <div className="ab-stat-info">
            <span className="ab-stat-label">Published</span>
            <strong className="ab-stat-value">{stats.published}</strong>
          </div>
        </div>

        <div className="ab-stat tone-gray">
          <div className="ab-stat-icon">
            <i className="pi pi-pause-circle"></i>
          </div>
          <div className="ab-stat-info">
            <span className="ab-stat-label">Draft</span>
            <strong className="ab-stat-value">{stats.drafts}</strong>
          </div>
        </div>

        <div className="ab-stat tone-orange">
          <div className="ab-stat-icon">
            <i className="pi pi-eye"></i>
          </div>
          <div className="ab-stat-info">
            <span className="ab-stat-label">Total Views</span>
            <strong className="ab-stat-value">
              {stats.views.toLocaleString('id-ID')}
            </strong>
          </div>
        </div>
      </div>

      {/* ============================================
          FILTER CHIPS
         ============================================ */}
      <div className="ab-filters">
        <span className="ab-filters-label">
          <i className="pi pi-filter"></i>
          Filter
        </span>
        <div className="ab-filters-chips">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`ab-chip tone-${opt.tone} ${
                statusFilter === opt.value ? 'is-active' : ''
              }`}
              onClick={() => setStatusFilter(opt.value)}
            >
              <i className={opt.icon}></i>
              <span>{opt.label}</span>
              <span className="ab-chip-count">{filterCount[opt.value]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================
          TABLE
         ============================================ */}
      <div className="ab-table-wrapper">
        <DataTable
          value={filteredPosts}
          loading={loading}
          header={header}
          globalFilter={globalFilter}
          globalFilterFields={['title', 'slug', 'excerpt']}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          emptyMessage={
            <EmptyState
              variant="admin"
              icon="pi pi-book"
              title={
                posts.length === 0 ? 'Belum Ada Artikel' : 'Tidak Ada Hasil'
              }
              description={
                posts.length === 0
                  ? 'Klik tombol di bawah untuk menulis artikel pertama kamu.'
                  : 'Coba ubah kata kunci atau filter.'
              }
              actionLabel="Tulis Artikel"
              actionIcon="pi pi-plus"
              onAction={openCreate}
            />
          }
          responsiveLayout="scroll"
          stripedRows
          sortField="createdAt"
          sortOrder={-1}
          className="ab-table"
        >
          <Column
            header="Cover"
            body={coverTemplate}
            style={{ width: '110px' }}
          />
          <Column
            field="title"
            header="Judul"
            body={titleTemplate}
            sortable
            style={{ minWidth: '300px' }}
          />
          <Column
            header="Tags"
            body={tagsTemplate}
            style={{ minWidth: '180px' }}
          />
          <Column
            header="Views"
            body={viewsTemplate}
            style={{ width: '110px' }}
          />
          <Column
            header="Status"
            body={statusTemplate}
            style={{ minWidth: '200px' }}
          />
          <Column
            header="Aksi"
            body={actionsTemplate}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      {/* ============================================
          DIALOG FORM
         ============================================ */}
      <Dialog
        header={dialogHeader}
        visible={dialogVisible}
        onHide={() => setDialogVisible(false)}
        style={{ width: '860px', maxWidth: '95vw' }}
        footer={dialogFooter}
        modal
        // blockScroll
        className="ab-dialog"
      >
        <div className="ab-form">
          {/* ===== Section 1: Info Utama ===== */}
          <div className="ab-form-section">
            <div className="ab-form-section-header">
              <div className="ab-form-section-icon tone-blue">
                <i className="pi pi-info-circle"></i>
              </div>
              <div>
                <h3 className="ab-form-section-title">Info Artikel</h3>
                <p className="ab-form-section-desc">
                  Judul, slug, dan ringkasan artikel
                </p>
              </div>
            </div>

            <div className="ab-form-grid">
              <div className="ab-form-field ab-form-field-full">
                <label className="ab-form-label">
                  Judul <span className="ab-form-required">*</span>
                </label>
                <InputText
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Cara Belajar Java untuk Pemula"
                  className={
                    formErrors.title ? 'p-invalid w-full' : 'w-full'
                  }
                  maxLength={500}
                />
                <div className="ab-form-hint-row">
                  <small className="ab-form-hint">
                    <i className="pi pi-info-circle"></i>
                    {form.title.length} / 500
                  </small>
                  {formErrors.title && (
                    <small className="ab-form-error">
                      <i className="pi pi-exclamation-circle"></i>
                      {formErrors.title}
                    </small>
                  )}
                </div>
              </div>

              <div className="ab-form-field ab-form-field-full">
                <label className="ab-form-label">Slug</label>
                <InputText
                  value={form.slug || ''}
                  onChange={(e) => {
                    setForm({ ...form, slug: e.target.value })
                    setSlugTouched(true)
                  }}
                  placeholder="auto-generate dari judul"
                  className="w-full"
                  maxLength={500}
                />
                <small className="ab-form-hint">
                  <i className="pi pi-link"></i>
                  Auto-generate dari judul. Bisa diedit manual.
                </small>
              </div>

              <div className="ab-form-field ab-form-field-full">
                <label className="ab-form-label">
                  Excerpt (Ringkasan)
                </label>
                <InputTextarea
                  value={form.excerpt || ''}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  placeholder="Ringkasan singkat artikel (maks 5000 karakter)"
                  rows={3}
                  autoResize
                  className="w-full"
                  maxLength={5000}
                />
                <div className="ab-form-hint-row">
                  <small className="ab-form-hint">
                    {(form.excerpt || '').length} / 5000
                  </small>
                  {formErrors.excerpt && (
                    <small className="ab-form-error">
                      <i className="pi pi-exclamation-circle"></i>
                      {formErrors.excerpt}
                    </small>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ===== Section 2: Konten ===== */}
          <div className="ab-form-section">
            <div className="ab-form-section-header">
              <div className="ab-form-section-icon tone-purple">
                <i className="pi pi-file-edit"></i>
              </div>
              <div>
                <h3 className="ab-form-section-title">Konten</h3>
                <p className="ab-form-section-desc">
                  Tulis konten artikel (mendukung Markdown)
                </p>
              </div>
            </div>

            <div className="ab-form-field">
              <InputTextarea
                value={form.content || ''}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                placeholder="Tulis artikel kamu di sini... (mendukung Markdown)"
                rows={15}
                autoResize
                className="w-full ab-form-content-textarea"
              />
              <small className="ab-form-hint">
                <i className="pi pi-code"></i>
                Mendukung Markdown: **bold**, *italic*, # Heading,
                [link](url), dll
              </small>
            </div>
          </div>

          {/* ===== Section 3: Media & Meta ===== */}
          <div className="ab-form-section">
            <div className="ab-form-section-header">
              <div className="ab-form-section-icon tone-green">
                <i className="pi pi-image"></i>
              </div>
              <div>
                <h3 className="ab-form-section-title">Media & Meta</h3>
                <p className="ab-form-section-desc">
                  Cover image dan tags artikel
                </p>
              </div>
            </div>

            <div className="ab-form-field">
              <ImageUpload
                value={form.coverUrl || null}
                onChange={(url) =>
                  setForm({ ...form, coverUrl: url || '' })
                }
                label="Cover Image"
                aspectRatio="video"
                maxSizeMB={10}
              />
            </div>

            <div className="ab-form-field">
              <label className="ab-form-label">Tags</label>
              <Chips
                value={form.tags || []}
                onChange={(e) =>
                  setForm({ ...form, tags: e.value || [] })
                }
                placeholder="Ketik, tekan Enter"
                className="w-full"
              />
              <small className="ab-form-hint">
                <i className="pi pi-tag"></i>
                Contoh: Java, Tutorial, Programming
              </small>
            </div>
          </div>

          {/* ===== Section 4: Publishing ===== */}
          <div className="ab-form-section">
            <div className="ab-form-section-header">
              <div className="ab-form-section-icon tone-orange">
                <i className="pi pi-send"></i>
              </div>
              <div>
                <h3 className="ab-form-section-title">Publishing</h3>
                <p className="ab-form-section-desc">
                  Atur status publikasi artikel
                </p>
              </div>
            </div>

            <div className="ab-form-toggles">
              <label
                className="ab-form-toggle-card tone-orange"
                htmlFor="featured"
              >
                <div className="ab-form-toggle-icon tone-orange">
                  <i className="pi pi-star-fill"></i>
                </div>
                <div className="ab-form-toggle-content">
                  <span className="ab-form-toggle-label">Featured</span>
                  <span className="ab-form-toggle-desc">
                    Tampilkan di section unggulan
                  </span>
                </div>
                <InputSwitch
                  inputId="featured"
                  checked={form.featured || false}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.value })
                  }
                />
              </label>

              <label
                className="ab-form-toggle-card tone-green"
                htmlFor="published"
              >
                <div className="ab-form-toggle-icon tone-green">
                  <i className="pi pi-check-circle"></i>
                </div>
                <div className="ab-form-toggle-content">
                  <span className="ab-form-toggle-label">Published</span>
                  <span className="ab-form-toggle-desc">
                    Terbitkan artikel sekarang
                  </span>
                </div>
                <InputSwitch
                  inputId="published"
                  checked={form.published !== false}
                  onChange={(e) =>
                    setForm({ ...form, published: e.value })
                  }
                />
              </label>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default ManageBlog