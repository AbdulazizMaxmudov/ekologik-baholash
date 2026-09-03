import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// Finds PDF link-annotation URLs (attached project documents referenced
// inside the "Ilova" section of an ariza PDF) and labels them using the
// nearby text on the same line. `buffer` is an ArrayBuffer of the PDF bytes.
export async function extractAttachmentLinks(buffer) {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise

  const results = []
  const seen = new Set()

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const annotations = await page.getAnnotations()
    const links = annotations.filter(a => a.subtype === 'Link' && a.url)
    if (!links.length) continue

    const textContent = await page.getTextContent()

    for (const link of links) {
      if (seen.has(link.url)) continue
      seen.add(link.url)

      const [, y0, , y1] = link.rect
      const label = textContent.items
        .filter(it => it.transform[5] >= y0 - 2 && it.transform[5] <= y1 + 2)
        .sort((a, b) => a.transform[4] - b.transform[4])
        .map(it => it.str)
        .join('')
        .trim()

      results.push({ label: label || `Ilova hujjat ${results.length + 1}`, url: link.url })
    }
  }

  return results
}
