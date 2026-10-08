// ============================================================
// Type shim untuk html2pdf.js
// ============================================================
// Library ini sudah punya type bawaan di node_modules,
// tapi tidak lengkap (tidak ada `compress`, dst).
//
// Shim ini meng-override type bawaan dengan versi yang lebih lengkap.
// ============================================================

declare module 'html2pdf.js' {
  /** Opsi untuk html2pdf.js */
  export interface Html2PdfOptions {
    /** Margin di setiap sisi (mm) — number atau [top, right, bottom, left] */
    margin?: number | [number, number, number, number]

    /** Nama file output (tanpa .pdf) */
    filename?: string

    /** Image config */
    image?: {
      type?: 'jpeg' | 'png' | 'webp'
      quality?: number
    }

    /** html2canvas options */
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      allowTaint?: boolean
      logging?: boolean
      backgroundColor?: string
      windowWidth?: number
      windowHeight?: number
      scrollX?: number
      scrollY?: number
      [key: string]: unknown
    }

    /** jsPDF options */
    jsPDF?: {
      unit?: 'mm' | 'cm' | 'in' | 'px' | 'pt'
      format?: 'a4' | 'letter' | 'legal' | [number, number]
      orientation?: 'portrait' | 'landscape'
      compress?: boolean
      putOnlyUsedFonts?: boolean
      precision?: number
      [key: string]: unknown
    }

    /** Page break config */
    pagebreak?: {
      mode?: string | string[]
      before?: string | string[]
      after?: string | string[]
      avoid?: string | string[]
    }
  }

  /** Worker instance untuk chaining */
  export interface Html2PdfWorker {
    set: (options: Html2PdfOptions) => Html2PdfWorker
    from: (element: HTMLElement | string) => Html2PdfWorker
    save: (filename?: string) => Promise<void>
    toPdf: () => Html2PdfWorker
    outputPdf: (
      type?: 'blob' | 'datauristring' | 'arraybuffer' | 'dataurlnewwindow'
    ) => Promise<Blob>
    output: (type: string, options?: unknown) => Promise<unknown>
    then: (onFulfilled?: (value: unknown) => unknown) => Promise<unknown>
  }

  /** Main function */
  export default function html2pdf(): Html2PdfWorker
}