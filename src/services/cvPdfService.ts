// // ============================================================
// // cvPdfService — Generate PDF dari HTML di frontend
// // ============================================================
// // v8 FINAL: PDF = A4 PAS
// //  - Force iframe = 210x297mm
// //  - Screenshot pakai dimensi A4 (794x1123 px)
// //  - Convert ke PDF pakai ukuran A4 (210x297 mm)
// //  - Kalau konten > A4, auto multi-page
// // ============================================================

// import html2canvas from 'html2canvas'
// import { jsPDF } from 'jspdf'

// /* ============================================================
//    TYPES
//    ============================================================ */

// export interface GeneratePdfOptions {
//   html: string
//   filename?: string
//   format?: 'a4' | 'letter'
//   orientation?: 'portrait' | 'landscape'
//   scale?: number
//   margin?: number | [number, number, number, number]
//   onProgress?: (progress: number, stage: PdfStage) => void
// }

// export type PdfStage =
//   | 'init'
//   | 'rendering'
//   | 'loading-images'
//   | 'loading-fonts'
//   | 'generating'
//   | 'finalizing'
//   | 'done'

// /* ============================================================
//    CONSTANTS — Ukuran A4
//    ============================================================ */

// const A4_WIDTH_MM = 210
// const A4_HEIGHT_MM = 297
// const A4_WIDTH_PX = 794
// const A4_HEIGHT_PX = 1123
// const RENDER_TIMEOUT_MS = 15000

// /* ============================================================
//    MAIN FUNCTION
//    ============================================================ */

// export async function generatePdfFromHtml(
//   options: GeneratePdfOptions
// ): Promise<Blob> {
//   const {
//     html,
//     format = 'a4',
//     orientation = 'portrait',
//     scale = 2,
//     margin = 0,
//     onProgress,
//   } = options

//   onProgress?.(5, 'init')

//   // ===== 1. IFRAME ukuran A4 =====
//   const iframe = document.createElement('iframe')
//   iframe.style.position = 'fixed'
//   iframe.style.top = '0'
//   iframe.style.left = '-10000px'
//   iframe.style.width = `${A4_WIDTH_MM}mm`
//   iframe.style.height = `${A4_HEIGHT_MM}mm`
//   iframe.style.border = '0'
//   iframe.style.background = '#ffffff'
//   iframe.style.overflow = 'hidden'
//   iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts')
//   iframe.setAttribute('data-cv-pdf-iframe', 'true')

//   document.body.appendChild(iframe)

//   onProgress?.(10, 'rendering')

//   try {
//     // ===== 2. Tulis HTML =====
//     const iframeDoc = iframe.contentDocument
//     const iframeWin = iframe.contentWindow

//     if (!iframeDoc || !iframeWin) {
//       throw new Error('Tidak bisa akses iframe document')
//     }

//     iframeDoc.open()
//     iframeDoc.write(html)
//     iframeDoc.close()

//     // ===== 3. Tunggu load =====
//     await waitForIframeLoad(iframe, RENDER_TIMEOUT_MS)

//     // ===== 4. Tunggu stylesheet =====
//     onProgress?.(15, 'loading-fonts')
//     const iframeBody = iframeDoc.body
//     await waitForStylesheets(iframeDoc)

//     // ===== 5. Tunggu image =====
//     onProgress?.(25, 'loading-images')
//     await waitForImages(iframeBody)
//     onProgress?.(40, 'loading-images')

//     // ===== 6. Tunggu font =====
//     onProgress?.(50, 'loading-fonts')
//     if (iframeDoc.fonts?.ready) {
//       try {
//         await iframeDoc.fonts.ready
//       } catch {
//         // ignore
//       }
//     }
//     await waitForFonts(iframeBody, iframeWin)
//     onProgress?.(60, 'loading-fonts')

//     // ===== 7. Delay settle =====
//     await delay(800)
//     onProgress?.(70, 'generating')

//     // ===== 8. Debug info =====
//     const bodyW = iframeBody.scrollWidth || iframeBody.offsetWidth
//     const bodyH = iframeBody.scrollHeight || iframeBody.offsetHeight

//     const contentFitsA4 = bodyH <= A4_HEIGHT_PX
//     const overflowPx = Math.max(0, bodyH - A4_HEIGHT_PX)

//     console.log('🎨 Screenshot info:', {
//       bodyWidth: bodyW,
//       bodyHeight: bodyH,
//       a4Width: A4_WIDTH_PX,
//       a4Height: A4_HEIGHT_PX,
//       contentFitsA4,
//       overflowPx,
//     })

//     // ===== 9. Screenshot =====
//     const screenshotWidth = A4_WIDTH_PX
//     const screenshotHeight = Math.max(bodyH, A4_HEIGHT_PX)

//     const canvas = await html2canvas(iframeBody, {
//       scale,
//       useCORS: true,
//       allowTaint: true,
//       logging: false,
//       backgroundColor: '#ffffff',
//       width: screenshotWidth,
//       height: screenshotHeight,
//       windowWidth: screenshotWidth,
//       windowHeight: screenshotHeight,
//       scrollX: 0,
//       scrollY: 0,
//     })

//     console.log('🎨 Canvas result:', {
//       width: canvas.width,
//       height: canvas.height,
//       isEmpty: canvas.width === 0 || canvas.height === 0,
//     })

//     onProgress?.(85, 'generating')

//     // ===== 10. Convert canvas → jsPDF =====
//     const pdf = new jsPDF({
//       unit: 'mm',
//       format,
//       orientation,
//       compress: true,
//     })

//     const pdfWidth = orientation === 'landscape' ? A4_HEIGHT_MM : A4_WIDTH_MM
//     const pdfHeight = orientation === 'landscape' ? A4_WIDTH_MM : A4_HEIGHT_MM

//     const [mt, mr, mb, ml] = normalizeMargin(margin)
//     const contentWidth = pdfWidth - ml - mr
//     const contentHeight = pdfHeight - mt - mb

//     // ⭐ Hitung tinggi image di PDF berdasarkan aspect ratio canvas
//     const pxToMm = contentWidth / A4_WIDTH_PX
//     const imgWidth = contentWidth
//     const imgHeight = screenshotHeight * pxToMm

//     console.log('📄 PDF image layout:', {
//       pdfWidth,
//       pdfHeight,
//       contentWidth,
//       contentHeight,
//       imgWidth,
//       imgHeight,
//       willFit: imgHeight <= contentHeight,
//       pageCount: Math.ceil(imgHeight / contentHeight),
//     })

//     if (imgHeight <= contentHeight) {
//       // ===== SINGLE PAGE =====
//       const imgData = canvas.toDataURL('image/jpeg', 0.98)
//       pdf.addImage(imgData, 'JPEG', ml, mt, imgWidth, imgHeight)
//     } else {
//       // ===== MULTI-PAGE =====
//       const pxPerPage = A4_HEIGHT_PX * (canvas.height / screenshotHeight)
//       const pageCount = Math.ceil(canvas.height / pxPerPage)

//       for (let i = 0; i < pageCount; i++) {
//         const srcY = i * pxPerPage
//         const srcHeight = Math.min(pxPerPage, canvas.height - srcY)

//         if (srcHeight <= 0) break

//         const pageCanvas = document.createElement('canvas')
//         pageCanvas.width = canvas.width
//         pageCanvas.height = pxPerPage

//         const ctx = pageCanvas.getContext('2d')
//         if (ctx) {
//           ctx.fillStyle = '#ffffff'
//           ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

//           ctx.drawImage(
//             canvas,
//             0,
//             srcY,
//             canvas.width,
//             srcHeight,
//             0,
//             0,
//             canvas.width,
//             srcHeight
//           )
//         }

//         const pageData = pageCanvas.toDataURL('image/jpeg', 0.98)

//         if (i > 0) pdf.addPage()

//         const renderHeight = (srcHeight * imgWidth) / canvas.width
//         pdf.addImage(pageData, 'JPEG', ml, mt, imgWidth, renderHeight)
//       }
//     }

//     onProgress?.(95, 'finalizing')

//     const blob = pdf.output('blob')
//     console.log('✅ PDF blob size:', blob.size, 'bytes')

//     return blob
//   } finally {
//     document.body.removeChild(iframe)
//     onProgress?.(100, 'done')
//   }
// }

// /* ============================================================
//    DOWNLOAD
//    ============================================================ */

// export function downloadPdf(blob: Blob, filename: string = 'CV.pdf'): void {
//   const url = URL.createObjectURL(blob)
//   const link = document.createElement('a')
//   link.href = url
//   link.download = filename
//   link.style.display = 'none'
//   document.body.appendChild(link)
//   link.click()
//   document.body.removeChild(link)
//   setTimeout(() => URL.revokeObjectURL(url), 1000)
// }

// export async function generateAndDownloadPdf(
//   options: GeneratePdfOptions
// ): Promise<void> {
//   const blob = await generatePdfFromHtml(options)
//   downloadPdf(blob, `${options.filename || 'CV'}.pdf`)
// }

// /* ============================================================
//    HELPERS
//    ============================================================ */

// function normalizeMargin(
//   margin: number | [number, number, number, number]
// ): [number, number, number, number] {
//   if (typeof margin === 'number') return [margin, margin, margin, margin]
//   return margin
// }

// function waitForIframeLoad(
//   iframe: HTMLIFrameElement,
//   timeoutMs: number
// ): Promise<void> {
//   return new Promise((resolve) => {
//     let resolved = false

//     const done = () => {
//       if (resolved) return
//       resolved = true
//       resolve()
//     }

//     if (iframe.contentDocument?.readyState === 'complete') {
//       setTimeout(done, 100)
//       return
//     }

//     iframe.addEventListener('load', done, { once: true })
//     setTimeout(done, timeoutMs)
//   })
// }

// async function waitForStylesheets(doc: Document): Promise<void> {
//   const links = Array.from(
//     doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
//   )
//   if (links.length === 0) return

//   await Promise.all(
//     links.map(
//       (link) =>
//         new Promise<void>((resolve) => {
//           if (link.sheet) {
//             resolve()
//             return
//           }
//           const onLoad = () => resolve()
//           const onError = () => resolve()
//           link.addEventListener('load', onLoad, { once: true })
//           link.addEventListener('error', onError, { once: true })
//           setTimeout(() => {
//             link.removeEventListener('load', onLoad)
//             link.removeEventListener('error', onError)
//             resolve()
//           }, 8000)
//         })
//     )
//   )
// }

// async function waitForImages(root: HTMLElement): Promise<void> {
//   const images = Array.from(root.querySelectorAll('img'))
//   if (images.length === 0) return

//   await Promise.all(
//     images.map(
//       (img) =>
//         new Promise<void>((resolve) => {
//           if (img.complete && img.naturalWidth > 0) {
//             resolve()
//             return
//           }
//           const onLoad = () => resolve()
//           const onError = () => resolve()
//           img.addEventListener('load', onLoad, { once: true })
//           img.addEventListener('error', onError, { once: true })
//           setTimeout(() => {
//             img.removeEventListener('load', onLoad)
//             img.removeEventListener('error', onError)
//             resolve()
//           }, 8000)
//         })
//     )
//   )
// }

// async function waitForFonts(
//   root: HTMLElement,
//   win: Window
// ): Promise<void> {
//   if (!win.document.fonts) return
//   try {
//     const families = new Set<string>()
//     const elements = root.querySelectorAll('*')
//     elements.forEach((el) => {
//       const computed = win.getComputedStyle(el)
//       const fontFamily = computed.fontFamily
//       if (fontFamily) families.add(fontFamily)
//     })
//     const loadPromises: Promise<unknown>[] = []
//     families.forEach((family) => {
//       loadPromises.push(win.document.fonts.load(`400 16px ${family}`))
//       loadPromises.push(win.document.fonts.load(`700 16px ${family}`))
//     })
//     await Promise.all(loadPromises)
//   } catch (err) {
//     console.warn('[cvPdfService] waitForFonts error:', err)
//   }
// }

// function delay(ms: number): Promise<void> {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }





// ============================================================
// cvPdfService — Generate PDF dari HTML di frontend
// ============================================================
// v11 FINAL: PDF A4 + FULL COLOR-MIX SUPPORT
//  - FIX: html2canvas tidak support color-mix()
//  - Solusi 5-layer:
//    1. Resolve CSS variables (:root) yang pakai color-mix
//    2. Rewrite <style> tags — replace color-mix → rgb
//    3. Rewrite inline styles — replace color-mix → rgb
//    4. Inject override stylesheet (!important) → paksa solid
//    5. onclone callback — re-apply polyfill di cloned doc
//  - FIX: sandbox warning → hapus allow-scripts
//  - Header: nama user + template + halaman
//  - Footer: brand + nomor halaman
//  - Accent bar + border halus
//  - Multi-page support
// ============================================================

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

/* ============================================================
   TYPES
   ============================================================ */

export interface GeneratePdfOptions {
  html: string
  filename?: string
  format?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  scale?: number
  margin?: number | [number, number, number, number]
  onProgress?: (progress: number, stage: PdfStage) => void
  /** Nama lengkap user — untuk header PDF */
  userName?: string
  /** Template label — untuk header PDF */
  templateLabel?: string
}

export type PdfStage =
  | 'init'
  | 'rendering'
  | 'loading-images'
  | 'loading-fonts'
  | 'generating'
  | 'finalizing'
  | 'done'

/* ============================================================
   CONSTANTS
   ============================================================ */

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const A4_WIDTH_PX = 794
const A4_HEIGHT_PX = 1123
const RENDER_TIMEOUT_MS = 15000

// Margin default (mm) — [top, right, bottom, left]
const DEFAULT_MARGIN: [number, number, number, number] = [14, 12, 14, 12]

// Ruang untuk header & footer (mm)
const HEADER_HEIGHT_MM = 8
const FOOTER_HEIGHT_MM = 8

// Regex untuk match color-mix() dengan balanced parentheses
const COLOR_MIX_REGEX = /color-mix\(\s*(?:[^()]|\([^()]*\))*\)/g

// CSSRule type constants — hindari ketergantungan ke `win.CSSStyleRule`
const CSS_RULE_TYPE_STYLE = 1
const CSS_RULE_TYPE_MEDIA = 4
const CSS_RULE_TYPE_SUPPORTS = 12
const CSS_RULE_TYPE_LAYER = 15

/* ============================================================
   MAIN FUNCTION
   ============================================================ */

export async function generatePdfFromHtml(
  options: GeneratePdfOptions
): Promise<Blob> {
  const {
    html,
    format = 'a4',
    orientation = 'portrait',
    scale = 2,
    margin = DEFAULT_MARGIN,
    onProgress,
    userName,
    templateLabel,
  } = options

  onProgress?.(5, 'init')

  // ===== 1. IFRAME ukuran A4 =====
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '0'
  iframe.style.left = '-10000px'
  iframe.style.width = `${A4_WIDTH_MM}mm`
  iframe.style.height = `${A4_HEIGHT_MM}mm`
  iframe.style.border = '0'
  iframe.style.background = '#ffffff'
  iframe.style.overflow = 'hidden'
  // ⭐ FIX: hapus sandbox — konten kita sendiri (trusted)
  iframe.setAttribute('data-cv-pdf-iframe', 'true')

  document.body.appendChild(iframe)

  onProgress?.(10, 'rendering')

  try {
    // ===== 2. Tulis HTML ke iframe =====
    const iframeDoc = iframe.contentDocument
    const iframeWin = iframe.contentWindow

    if (!iframeDoc || !iframeWin) {
      throw new Error('Tidak bisa akses iframe document')
    }

    iframeDoc.open()
    iframeDoc.write(html)
    iframeDoc.close()

    await waitForIframeLoad(iframe, RENDER_TIMEOUT_MS)

    // ===== 3. Tunggu resources =====
    onProgress?.(15, 'loading-fonts')
    const iframeBody = iframeDoc.body
    await waitForStylesheets(iframeDoc)

    onProgress?.(25, 'loading-images')
    await waitForImages(iframeBody)
    onProgress?.(40, 'loading-images')

    onProgress?.(50, 'loading-fonts')
    if (iframeDoc.fonts?.ready) {
      try {
        await iframeDoc.fonts.ready
      } catch {
        // ignore
      }
    }
    await waitForFonts(iframeBody, iframeWin)
    onProgress?.(60, 'loading-fonts')

    // ⭐ FIX COLOR-MIX: apply 4-layer polyfill ke iframe asli
    applyColorMixPolyfill(iframeDoc, iframeWin)

    await delay(800)
    onProgress?.(70, 'generating')

    // ===== 4. Debug info =====
    const bodyW = iframeBody.scrollWidth || iframeBody.offsetWidth
    const bodyH = iframeBody.scrollHeight || iframeBody.offsetHeight

    console.log('🎨 Screenshot info:', {
      bodyWidth: bodyW,
      bodyHeight: bodyH,
      a4Width: A4_WIDTH_PX,
      a4Height: A4_HEIGHT_PX,
      totalHeightMm: ((bodyH / A4_HEIGHT_PX) * A4_HEIGHT_MM).toFixed(1),
    })

    // Debug: cek sisa color-mix
    const remaining = (iframeDoc.body.innerHTML.match(/color-mix/g) || [])
      .length
    console.log('🔍 Remaining color-mix in iframe DOM:', remaining)

    // ===== 5. Screenshot full content =====
    const screenshotWidth = A4_WIDTH_PX
    const screenshotHeight = Math.max(bodyH, A4_HEIGHT_PX)

    const canvas = await html2canvas(iframeBody, {
      scale,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: screenshotWidth,
      height: screenshotHeight,
      windowWidth: screenshotWidth,
      windowHeight: screenshotHeight,
      scrollX: 0,
      scrollY: 0,
      // ⭐ FIX PALING PENTING: re-apply polyfill di cloned document
      onclone: (clonedDoc: Document) => {
        const clonedWin = clonedDoc.defaultView
        if (!clonedWin) return
        try {
          applyColorMixPolyfill(clonedDoc, clonedWin)
          console.log('🎨 Polyfill re-applied on cloned document')
        } catch (err) {
          console.warn('[cvPdfService] onclone polyfill error:', err)
        }
      },
    })

    console.log('🎨 Canvas result:', {
      width: canvas.width,
      height: canvas.height,
      isEmpty: canvas.width === 0 || canvas.height === 0,
    })

    onProgress?.(85, 'generating')

    // ===== 6. Setup PDF =====
    const pdf = new jsPDF({
      unit: 'mm',
      format,
      orientation,
      compress: true,
    })

    const pdfWidth =
      orientation === 'landscape' ? A4_HEIGHT_MM : A4_WIDTH_MM
    const pdfHeight =
      orientation === 'landscape' ? A4_WIDTH_MM : A4_HEIGHT_MM

    const [mt, mr, mb, ml] = normalizeMargin(margin)

    const contentWidth = pdfWidth - ml - mr
    const contentHeight =
      pdfHeight - mt - mb - HEADER_HEIGHT_MM - FOOTER_HEIGHT_MM

    const pxPerMm = canvas.width / contentWidth
    const pageContentHeightPx = contentHeight * pxPerMm

    const totalPages = Math.ceil(canvas.height / pageContentHeightPx)

    const accentColor = getAccentColorFromHtml(html) ?? '#3b82f6'

    console.log('📄 PDF layout:', {
      pdfWidth,
      pdfHeight,
      contentWidth,
      contentHeight,
      totalPages,
      marginTop: mt,
      marginLeft: ml,
      accentColor,
    })

    // ===== 7. Render per halaman =====
    for (let i = 0; i < totalPages; i++) {
      if (i > 0) pdf.addPage()

      const srcY = i * pageContentHeightPx
      const srcHeight = Math.min(pageContentHeightPx, canvas.height - srcY)

      if (srcHeight <= 0) break

      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvas.width
      pageCanvas.height = srcHeight

      const ctx = pageCanvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
        ctx.drawImage(
          canvas,
          0,
          srcY,
          canvas.width,
          srcHeight,
          0,
          0,
          canvas.width,
          srcHeight
        )
      }

      const pageData = pageCanvas.toDataURL('image/jpeg', 0.98)
      const renderHeight = srcHeight / pxPerMm

      drawHeader(pdf, {
        page: i + 1,
        totalPages,
        userName: userName ?? 'CV',
        templateLabel,
        pdfWidth,
        marginLeft: ml,
        marginRight: mr,
        y: mt / 2,
      })

      drawAccentBar(pdf, {
        x: ml / 2,
        y: mt - 1,
        width: pdfWidth - ml,
        color: accentColor,
        thickness: 0.8,
      })

      pdf.addImage(
        pageData,
        'JPEG',
        ml,
        mt + HEADER_HEIGHT_MM,
        contentWidth,
        renderHeight
      )

      drawFooter(pdf, {
        page: i + 1,
        totalPages,
        pdfWidth,
        pdfHeight,
        marginLeft: ml,
        marginRight: mr,
        y: pdfHeight - mb / 2,
      })

      drawBorder(pdf, {
        x: ml / 2,
        y: mt / 2,
        width: pdfWidth - ml,
        height: pdfHeight - mt,
        color: '#e2e8f0',
      })
    }

    onProgress?.(95, 'finalizing')

    const blob = pdf.output('blob')
    console.log('✅ PDF blob size:', blob.size, 'bytes')

    return blob
  } finally {
    document.body.removeChild(iframe)
    onProgress?.(100, 'done')
  }
}

/* ============================================================
   COLOR-MIX POLYFILL — 4 LAYERS
   ============================================================
   Layer 1: Resolve CSS variables (:root) yang pakai color-mix
   Layer 2: Rewrite <style> tags — replace color-mix → rgb
   Layer 3: Rewrite inline styles — replace color-mix → rgb
   Layer 4: Inject override stylesheet (!important) → paksa solid
   Layer 5 (di onclone): Re-apply semua layer di cloned doc
   ============================================================ */

/**
 * Apply semua 4 layer polyfill ke document.
 */
function applyColorMixPolyfill(doc: Document, win: Window): void {
  // Layer 1: resolve CSS variables di :root
  resolveCssVariablesWithColorMix(doc, win)

  // Layer 2: rewrite <style> tags
  stripColorMixFromStyles(doc, win)

  // Layer 3: rewrite inline styles
  stripColorMixFromInlineStyles(doc, win)

  // Layer 4: inject override stylesheet dengan !important
  injectColorMixOverrides(doc, win)

  // Force reflow
  if (doc.body) {
    void doc.body.offsetHeight
  }
}

/* ------------------------------------------------------------
   HELPER: iterate CSS rules termasuk nested @media/@supports/@layer
   ------------------------------------------------------------ */

/**
 * Iterate semua CSSRule termasuk nested (di dalam @media, @supports, @layer).
 * Callback dipanggil hanya untuk CSSStyleRule (type === 1).
 */
function forEachStyleRule(
  rules: CSSRuleList | CSSRule[],
  callback: (rule: CSSStyleRule) => void
): void {
  Array.from(rules).forEach((rule) => {
    // STYLE_RULE = 1
    if (rule.type === CSS_RULE_TYPE_STYLE) {
      callback(rule as CSSStyleRule)
      return
    }

    // MEDIA_RULE = 4, SUPPORTS_RULE = 12, LAYER = 15
    if (
      rule.type === CSS_RULE_TYPE_MEDIA ||
      rule.type === CSS_RULE_TYPE_SUPPORTS ||
      rule.type === CSS_RULE_TYPE_LAYER
    ) {
      try {
        const groupRule = rule as CSSGroupingRule
        if (groupRule.cssRules && groupRule.cssRules.length > 0) {
          forEachStyleRule(groupRule.cssRules, callback)
        }
      } catch {
        // CORS — skip
      }
    }
  })
}

/* ------------------------------------------------------------
   CORE: resolve 1 color-mix() string → rgb
   ------------------------------------------------------------ */

function resolveSingleColorMix(
  colorMix: string,
  win: Window,
  doc?: Document
): string | null {
  // 1. Coba getComputedStyle (cara paling akurat)
  try {
    const probe = win.document.createElement('div')
    probe.style.position = 'fixed'
    probe.style.left = '-99999px'
    probe.style.top = '0'
    probe.style.visibility = 'hidden'
    probe.style.pointerEvents = 'none'
    probe.style.color = '#000000'
    win.document.body.appendChild(probe)
    void probe.offsetHeight // force reflow

    probe.style.color = colorMix
    const resolved = win.getComputedStyle(probe).color

    win.document.body.removeChild(probe)

    if (
      resolved &&
      resolved !== colorMix &&
      !resolved.includes('color-mix') &&
      /^(rgb|rgba|#|hsl|hsla)/i.test(resolved)
    ) {
      return resolved
    }
  } catch {
    // ignore
  }

  // 2. Fallback: parse manual
  if (doc) {
    const parsed = parseColorMixManually(colorMix, win, doc)
    if (parsed) return parsed
  }

  return null
}

/* ------------------------------------------------------------
   LAYER 1: Resolve CSS variables (:root) yang pakai color-mix
   ------------------------------------------------------------ */

function resolveCssVariablesWithColorMix(
  doc: Document,
  win: Window
): void {
  const root = doc.documentElement
  const sheets = Array.from(doc.styleSheets)
  let count = 0

  sheets.forEach((sheet) => {
    try {
      const rules = sheet.cssRules
      if (!rules) return

      forEachStyleRule(rules, (styleRule) => {
        const style = styleRule.style
        if (!style) return

        for (let i = 0; i < style.length; i++) {
          const prop = style.item(i)
          if (!prop.startsWith('--')) continue
          const value = style.getPropertyValue(prop)
          if (!value || !value.includes('color-mix')) continue

          const resolved = resolveSingleColorMix(value, win, doc)
          if (resolved) {
            root.style.setProperty(prop, resolved)
            count++
          }
        }
      })
    } catch {
      // CORS — skip
    }
  })

  if (count > 0) {
    console.log(`🎨 Layer 1: resolved ${count} CSS variables`)
  }
}

/* ------------------------------------------------------------
   LAYER 2: Rewrite <style> tags
   ------------------------------------------------------------ */

function stripColorMixFromStyles(doc: Document, win: Window): void {
  const styleTags = doc.querySelectorAll<HTMLStyleElement>('style')
  let count = 0

  styleTags.forEach((styleTag) => {
    if (!styleTag.textContent) return
    if (!styleTag.textContent.includes('color-mix')) return

    try {
      styleTag.textContent = resolveAllColorMixInCss(
        styleTag.textContent,
        win,
        doc
      )
      count++
    } catch (err) {
      console.warn('[cvPdfService] stripColorMixFromStyles error:', err)
    }
  })

  if (count > 0) {
    console.log(`🎨 Layer 2: rewrote ${count} <style> tags`)
  }
}

function resolveAllColorMixInCss(
  css: string,
  win: Window,
  doc?: Document
): string {
  if (!css || !css.includes('color-mix')) return css

  return css.replace(COLOR_MIX_REGEX, (match) => {
    const resolved = resolveSingleColorMix(match, win, doc)
    return resolved ?? 'transparent'
  })
}

/* ------------------------------------------------------------
   LAYER 3: Rewrite inline styles
   ------------------------------------------------------------ */

function stripColorMixFromInlineStyles(
  doc: Document,
  win: Window
): void {
  const elements = doc.querySelectorAll<HTMLElement>('[style*="color-mix"]')
  let count = 0

  elements.forEach((el) => {
    const inlineStyle = el.getAttribute('style')
    if (!inlineStyle || !inlineStyle.includes('color-mix')) return

    try {
      el.setAttribute(
        'style',
        resolveAllColorMixInCss(inlineStyle, win, doc)
      )
      count++
    } catch (err) {
      console.warn(
        '[cvPdfService] stripColorMixFromInlineStyles error:',
        err
      )
    }
  })

  if (count > 0) {
    console.log(`🎨 Layer 3: rewrote ${count} inline styles`)
  }
}

/* ------------------------------------------------------------
   LAYER 4: Inject override stylesheet (!important)
   ------------------------------------------------------------ */

function injectColorMixOverrides(doc: Document, win: Window): void {
  // Hapus override lama (kalau re-apply)
  doc
    .querySelectorAll('[data-cv-color-mix-override]')
    .forEach((el) => el.remove())

  const overrides: string[] = []
  const sheets = Array.from(doc.styleSheets)

  sheets.forEach((sheet) => {
    try {
      const rules = sheet.cssRules
      if (!rules) return

      forEachStyleRule(rules, (styleRule) => {
        if (!styleRule.selectorText) return
        // Skip override style kita sendiri
        if (styleRule.selectorText.includes('data-cv-color-mix-override')) {
          return
        }

        const declarations: string[] = []
        const style = styleRule.style
        if (!style) return

        for (let i = 0; i < style.length; i++) {
          const prop = style.item(i)
          const value = style.getPropertyValue(prop)

          if (value && value.includes('color-mix')) {
            const resolved = resolveSingleColorMix(value, win, doc)
            if (resolved) {
              declarations.push(`${prop}: ${resolved} !important`)
            } else if (prop.includes('background')) {
              declarations.push(`${prop}: transparent !important`)
            }
          }
        }

        if (declarations.length > 0) {
          overrides.push(
            `${styleRule.selectorText} { ${declarations.join('; ')} }`
          )
        }
      })
    } catch {
      // CORS — skip
    }
  })

  if (overrides.length === 0) return

  const styleEl = doc.createElement('style')
  styleEl.setAttribute('data-cv-color-mix-override', 'true')
  styleEl.textContent = overrides.join('\n')
  doc.head.appendChild(styleEl)

  console.log(
    `🎨 Layer 4: injected ${overrides.length} override rules`
  )
}

/* ------------------------------------------------------------
   MANUAL PARSER — fallback kalau getComputedStyle gagal
   ------------------------------------------------------------ */

function parseColorMixManually(
  colorMix: string,
  win: Window,
  doc: Document
): string | null {
  try {
    const inner = colorMix
      .replace(/^color-mix\(\s*in\s+srgb\s*,\s*/i, '')
      .replace(/\)\s*$/, '')

    const parts = splitTopLevelCommas(inner)
    if (parts.length !== 2) return null

    const c1 = parseColorPart(parts[0], win, doc)
    const c2 = parseColorPart(parts[1], win, doc)
    if (!c1 || !c2) return null

    const totalPct = c1.pct + c2.pct
    if (totalPct <= 0) return null

    const w1 = c1.pct / totalPct
    const w2 = c2.pct / totalPct

    const r = Math.round(c1.rgb.r * w1 + c2.rgb.r * w2)
    const g = Math.round(c1.rgb.g * w1 + c2.rgb.g * w2)
    const b = Math.round(c1.rgb.b * w1 + c2.rgb.b * w2)
    const a =
      Math.round((c1.rgb.a * w1 + c2.rgb.a * w2) * 100) / 100

    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`
  } catch {
    return null
  }
}

function splitTopLevelCommas(str: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of str) {
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function parseColorPart(
  part: string,
  win: Window,
  doc: Document
): {
  rgb: { r: number; g: number; b: number; a: number }
  pct: number
} | null {
  const match = part.match(/^(.+?)\s+(\d+(?:\.\d+)?)%\s*$/)
  if (!match) return null

  const colorStr = match[1].trim()
  const pct = parseFloat(match[2]) / 100

  const rgb = colorToRgb(colorStr, win, doc)
  if (!rgb) return null

  return { rgb, pct }
}

function colorToRgb(
  color: string,
  win: Window,
  doc: Document
): { r: number; g: number; b: number; a: number } | null {
  let resolved = color

  // Resolve var(--x) dulu
  if (color.startsWith('var(')) {
    const varName = color.match(/var\(\s*(--[\w-]+)/)?.[1]
    if (varName) {
      const computed = win
        .getComputedStyle(doc.documentElement)
        .getPropertyValue(varName)
        .trim()
      if (computed) resolved = computed
    }
  }

  // Pakai probe element
  try {
    const probe = doc.createElement('div')
    probe.style.color = resolved
    doc.body.appendChild(probe)
    const computed = win.getComputedStyle(probe).color
    doc.body.removeChild(probe)

    const rgba = parseRgbString(computed)
    if (rgba) return rgba
  } catch {
    // ignore
  }

  // Fallback: parse hex
  if (/^#[0-9a-fA-F]{6}$/.test(resolved)) {
    return {
      r: parseInt(resolved.slice(1, 3), 16),
      g: parseInt(resolved.slice(3, 5), 16),
      b: parseInt(resolved.slice(5, 7), 16),
      a: 1,
    }
  }

  // Fallback: named color "transparent"
  if (resolved === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 }
  }

  return null
}

function parseRgbString(
  str: string
): { r: number; g: number; b: number; a: number } | null {
  const m = str.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)/
  )
  if (!m) return null
  return {
    r: parseInt(m[1], 10),
    g: parseInt(m[2], 10),
    b: parseInt(m[3], 10),
    a: m[4] ? parseFloat(m[4]) : 1,
  }
}

/* ============================================================
   PDF DECORATIONS
   ============================================================ */

interface HeaderOptions {
  page: number
  totalPages: number
  userName: string
  templateLabel?: string
  pdfWidth: number
  marginLeft: number
  marginRight: number
  y: number
}

function drawHeader(pdf: jsPDF, opts: HeaderOptions): void {
  const {
    page,
    totalPages,
    userName,
    templateLabel,
    pdfWidth,
    marginLeft,
    marginRight,
    y,
  } = opts

  const leftX = marginLeft / 2 + 2
  const rightX = pdfWidth - marginRight / 2 - 2

  pdf.setFontSize(8)
  pdf.setTextColor(100, 116, 139)
  pdf.setFont('helvetica', 'normal')
  pdf.text(userName, leftX, y + 2)

  const rightText = templateLabel
    ? `${templateLabel} · Hal. ${page}/${totalPages}`
    : `Hal. ${page}/${totalPages}`

  pdf.setFontSize(8)
  pdf.setTextColor(100, 116, 139)
  pdf.text(rightText, rightX, y + 2, { align: 'right' })
}

interface FooterOptions {
  page: number
  totalPages: number
  pdfWidth: number
  pdfHeight: number
  marginLeft: number
  marginRight: number
  y: number
}

function drawFooter(pdf: jsPDF, opts: FooterOptions): void {
  const { page, totalPages, pdfWidth, marginLeft, marginRight, y } = opts

  const leftX = marginLeft / 2 + 2
  const rightX = pdfWidth - marginRight / 2 - 2

  pdf.setFontSize(7)
  pdf.setTextColor(148, 163, 184)
  pdf.setFont('helvetica', 'normal')

  pdf.text('Generated with Portfolio App', leftX, y + 2)
  pdf.text(`Page ${page} of ${totalPages}`, rightX, y + 2, {
    align: 'right',
  })
}

interface BorderOptions {
  x: number
  y: number
  width: number
  height: number
  color: string
}

function drawBorder(pdf: jsPDF, opts: BorderOptions): void {
  const { x, y, width, height } = opts

  pdf.setDrawColor(226, 232, 240)
  pdf.setLineWidth(0.15)
  pdf.rect(x, y, width, height, 'S')
}

interface AccentBarOptions {
  x: number
  y: number
  width: number
  color: string
  thickness?: number
}

function drawAccentBar(pdf: jsPDF, opts: AccentBarOptions): void {
  const { x, y, width, color, thickness = 1.5 } = opts

  const rgb = hexToRgb(color)
  if (!rgb) return

  pdf.setFillColor(rgb.r, rgb.g, rgb.b)
  pdf.rect(x, y, width, thickness, 'F')
}

/* ============================================================
   HELPERS
   ============================================================ */

function normalizeMargin(
  margin: number | [number, number, number, number]
): [number, number, number, number] {
  if (typeof margin === 'number') return [margin, margin, margin, margin]
  return margin
}

function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return null
  return {
    r: parseInt(hex.substring(1, 3), 16),
    g: parseInt(hex.substring(3, 5), 16),
    b: parseInt(hex.substring(5, 7), 16),
  }
}

function getAccentColorFromHtml(html: string): string | null {
  const match = html.match(/--cv-accent:\s*(#[0-9a-fA-F]{6})/i)
  return match ? match[1] : null
}

function waitForIframeLoad(
  iframe: HTMLIFrameElement,
  timeoutMs: number
): Promise<void> {
  return new Promise((resolve) => {
    let resolved = false
    const done = () => {
      if (resolved) return
      resolved = true
      resolve()
    }

    if (iframe.contentDocument?.readyState === 'complete') {
      setTimeout(done, 100)
      return
    }

    iframe.addEventListener('load', done, { once: true })
    setTimeout(done, timeoutMs)
  })
}

async function waitForStylesheets(doc: Document): Promise<void> {
  const links = Array.from(
    doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  )
  if (links.length === 0) return

  await Promise.all(
    links.map(
      (link) =>
        new Promise<void>((resolve) => {
          if (link.sheet) {
            resolve()
            return
          }
          const onLoad = () => resolve()
          const onError = () => resolve()
          link.addEventListener('load', onLoad, { once: true })
          link.addEventListener('error', onError, { once: true })
          setTimeout(() => {
            link.removeEventListener('load', onLoad)
            link.removeEventListener('error', onError)
            resolve()
          }, 8000)
        })
    )
  )
}

async function waitForImages(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'))
  if (images.length === 0) return

  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          const onLoad = () => resolve()
          const onError = () => resolve()
          img.addEventListener('load', onLoad, { once: true })
          img.addEventListener('error', onError, { once: true })
          setTimeout(() => {
            img.removeEventListener('load', onLoad)
            img.removeEventListener('error', onError)
            resolve()
          }, 8000)
        })
    )
  )
}

async function waitForFonts(
  root: HTMLElement,
  win: Window
): Promise<void> {
  if (!win.document.fonts) return
  try {
    const families = new Set<string>()
    const elements = root.querySelectorAll('*')
    elements.forEach((el) => {
      const computed = win.getComputedStyle(el)
      const fontFamily = computed.fontFamily
      if (fontFamily) families.add(fontFamily)
    })
    const loadPromises: Promise<unknown>[] = []
    families.forEach((family) => {
      loadPromises.push(win.document.fonts.load(`400 16px ${family}`))
      loadPromises.push(win.document.fonts.load(`700 16px ${family}`))
    })
    await Promise.all(loadPromises)
  } catch (err) {
    console.warn('[cvPdfService] waitForFonts error:', err)
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/* ============================================================
   DOWNLOAD
   ============================================================ */

export function downloadPdf(
  blob: Blob,
  filename: string = 'CV.pdf'
): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function generateAndDownloadPdf(
  options: GeneratePdfOptions
): Promise<void> {
  const blob = await generatePdfFromHtml(options)
  downloadPdf(blob, `${options.filename || 'CV'}.pdf`)
}