import { Helmet } from 'react-helmet-async'

interface StructuredDataProps {
  type?: 'Person' | 'WebSite' | 'BlogPosting' | 'BreadcrumbList'
  data?: Record<string, unknown>
  // ===== Multi-tenant props =====
  name?: string
  url?: string
  jobTitle?: string
  image?: string
  description?: string
  sameAs?: string[]
  // ===== BlogPosting props =====
  headline?: string
  datePublished?: string
  dateModified?: string
  authorName?: string
}

const BASE_URL = 'https://portfolio-kamu.vercel.app'

function StructuredData({
  type = 'Person',
  data,
  // Person / WebSite
  name,
  url,
  jobTitle,
  image,
  description,
  sameAs,
  // BlogPosting
  headline,
  datePublished,
  dateModified,
  authorName,
}: StructuredDataProps) {
  // ===== BUILD FULL URL =====
  const fullUrl = url
    ? url.startsWith('http')
      ? url
      : `${BASE_URL}${url.startsWith('/') ? url : `/${url}`}`
    : BASE_URL

  // ===== DEFAULT DATA PER TYPE (multi-tenant aware) =====
  const defaultData: Record<string, Record<string, unknown>> = {
    Person: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: name || 'User',
      url: fullUrl,
      jobTitle: jobTitle || 'Creative Professional',
      ...(description && { description }),
      ...(image && { image }),
      ...(sameAs &&
        sameAs.length > 0 && {
          sameAs,
        }),
    },

    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: name ? `${name} — Portfolio` : 'Portfolio',
      url: fullUrl,
      ...(description && { description }),
      potentialAction: {
        '@type': 'SearchAction',
        target: `${fullUrl}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },

    BlogPosting: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: headline || name || '',
      image: image || '',
      datePublished: datePublished || '',
      dateModified: dateModified || datePublished || '',
      author: {
        '@type': 'Person',
        name: authorName || name || 'User',
        url: fullUrl,
      },
      ...(description && { description }),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullUrl,
      },
    },

    BreadcrumbList: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [],
    },
  }

  // ===== PRIORITAS: custom `data` > default per type =====
  const jsonLd = data || defaultData[type]

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  )
}

export default StructuredData