import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
}

const SITE_NAME = 'Anjar Portfolio'
const BASE_URL = 'https://portfolio-kamu.vercel.app'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`
const DEFAULT_DESCRIPTION =
  'Portfolio Anjar — Creative Professional. Lihat works, skills, tools, dan journey.'
const DEFAULT_TITLE = 'Anjar | Creative Professional'

function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  keywords = [],
  author = 'Anjar',
  publishedTime,
  modifiedTime,
  tags = [],
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL
  const fullImage = image.startsWith('http') ? image : `${BASE_URL}${image}`

  const allKeywords = [
    'portfolio',
    'creative professional',
    'web developer',
    ...keywords,
    ...tags,
  ].join(', ')

  return (
    <Helmet>
      {/* ===== Basic ===== */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={fullUrl} />

      {/* ===== Open Graph ===== */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="id_ID" />

      {/* ===== Twitter Card ===== */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* ===== Article specific ===== */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' &&
        tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
    </Helmet>
  )
}

export default SEO