// Bir martalik konversiya skripti: kmz-source/*.kmz -> public/data/<key>.json
//
// convert-kmz-to-geojson.mjs skriptidan farqli o'laroq, bu yerdagi qatlamlar
// viloyat bo'yicha bo'linmagan — respublika miqyosida bitta fayl.
//
// Ishga tushirish: node scripts/convert-extra-layers.mjs
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import { DOMParser } from '@xmldom/xmldom'
import { kml } from '@tmcw/togeojson'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(__dirname, '..', 'kmz-source')
const OUT_DIR = join(__dirname, '..', 'public', 'data')

// Har bir qatlam: manba KMZ fayl nomi, chiqish kaliti (src/pages/XaritaPage.jsx
// dagi EXTRA_LAYERS bilan mos) va KML <description> ichidagi HTML jadvaldan
// qoldirmoqchi bo'lgan maydonlar xaritasi.
const LAYERS = [
  {
    file: 'ВОДОХРАНИЛИЩА',
    out: 'suv_omborlari',
    keepKeys: {},
  },
  {
    file: 'Месторождение_подземных_питьевых_вод',
    out: 'ichimlik_suvi_konlari',
    keepKeys: {},
  },
  {
    file: 'СМҚЗ_23 16.09.2024г',
    out: 'smqz',
    keepKeys: {
      oby_nomi: 'nomi',
      Idora_man: 'idora',
      sana: 'sana',
      s_umumiy: 'umumiyMaydon',
      s_qishloq: 'qishloqMaydon',
      s_sugoril: 'sugorilMaydon',
      s_urmon: 'urmonMaydon',
      s_boshqa: 'boshqaMaydon',
    },
    // Manba: daryo/soy bo'ylab chizilgan sanitariya-muhofaza zonasi
    // poligonlari juda ko'p uchli (ba'zilari 80 000+ nuqta) — 22 MB fayl
    // hosil bo'lardi. ~0.0002° (~15-20 m) tolerans bilan soddalashtirish
    // vizual aniqlikni deyarli saqlab, hajmni ~7 barobar kamaytiradi.
    simplifyTolerance: 0.0002,
  },
  {
    file: 'Ўрмон_ов_хўжаликлари',
    out: 'urmon_ov_xujaliklari',
    keepKeys: {
      cadastral_: 'kadastr',
      full_name: 'nomi',
      legal_area: 'qonuniyMaydon',
      gis_area: 'gisMaydon',
      viloyat: 'viloyat',
      tuman: 'tuman',
      reg_date: 'royxatSana',
      rrr_right: 'huquqHolati',
    },
  },
]

function parseDescriptionTable(html, keepKeys) {
  if (!html) return {}
  const props = {}
  const rowRe = /<tr[^>]*>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/g
  let m
  while ((m = rowRe.exec(html))) {
    const key = m[1].trim()
    const mapped = keepKeys[key]
    if (mapped) props[mapped] = m[2].trim()
  }
  return props
}

// Balandlik (z) koordinatasini olib tashlab, sonlarni yumaloqlaymiz — fayl
// hajmini sezilarli kamaytiradi, vizual aniqlik uchun 5 xona kifoya.
function round(n) {
  return Math.round(n * 1e5) / 1e5
}

function cleanCoords(coords) {
  if (!Array.isArray(coords) || coords.length === 0) return coords
  if (typeof coords[0] === 'number') {
    return [round(coords[0]), round(coords[1])]
  }
  return coords.map(cleanCoords)
}

// Ramer-Douglas-Peucker: chiziqdagi (yoki poligon halqasidagi) nuqtalar
// orasidan berilgan tolerans (daraja, taxminan metrga proporsional)dan
// kamroq og'ishadiganlarini tashlab yuboradi — shakl deyarli o'zgarmaydi,
// lekin ayrim manba fayllardagi haddan tashqari ko'p uchli poligonlar
// (o'nlab ming nuqta) sezilarli yengillashadi.
function perpendicularDistance(pt, lineStart, lineEnd) {
  const [x, y] = pt
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1)
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy))
}

function douglasPeucker(points, tolerance) {
  if (points.length < 3) return points
  let maxDist = 0
  let index = 0
  const end = points.length - 1
  for (let i = 1; i < end; i++) {
    const dist = perpendicularDistance(points[i], points[0], points[end])
    if (dist > maxDist) {
      maxDist = dist
      index = i
    }
  }
  if (maxDist > tolerance) {
    const left = douglasPeucker(points.slice(0, index + 1), tolerance)
    const right = douglasPeucker(points.slice(index), tolerance)
    return left.slice(0, -1).concat(right)
  }
  return [points[0], points[end]]
}

// Poligon halqasi kamida 4 nuqta (3 ta noyob + yopilish nuqtasi) bo'lishi
// kerak — aks holda soddalashtirish natijasini rad etib, asl halqani qoldiramiz.
function simplifyRing(ring, tolerance) {
  if (ring.length <= 4) return ring
  const simplified = douglasPeucker(ring, tolerance)
  return simplified.length < 4 ? ring : simplified
}

function simplifyCoordsByType(type, coords, tolerance) {
  switch (type) {
    case 'LineString':
      return douglasPeucker(coords, tolerance)
    case 'MultiLineString':
      return coords.map((line) => douglasPeucker(line, tolerance))
    case 'Polygon':
      return coords.map((ring) => simplifyRing(ring, tolerance))
    case 'MultiPolygon':
      return coords.map((poly) => poly.map((ring) => simplifyRing(ring, tolerance)))
    default:
      return coords
  }
}

function cleanGeometry(geometry, tolerance) {
  if (geometry.type === 'GeometryCollection') {
    return {
      type: geometry.type,
      geometries: geometry.geometries.map((g) => cleanGeometry(g, tolerance)),
    }
  }
  const coords = tolerance
    ? simplifyCoordsByType(geometry.type, geometry.coordinates, tolerance)
    : geometry.coordinates
  return { type: geometry.type, coordinates: cleanCoords(coords) }
}

async function convertOne({ file, out, keepKeys, simplifyTolerance }) {
  const kmzPath = join(SRC_DIR, `${file}.kmz`)
  const buf = readFileSync(kmzPath)
  const zip = await JSZip.loadAsync(buf)
  const kmlEntry = Object.values(zip.files).find((f) => f.name.toLowerCase().endsWith('.kml'))
  if (!kmlEntry) throw new Error(`${file}: KML topilmadi`)
  let kmlText = await kmlEntry.async('text')

  // Google Earth Pro eksport qilgan ba'zi fayllarda `xsi:schemaLocation`
  // atributi xmlns:xsi e'lon qilinmasdan ishlatiladi — xmldom buni namespace
  // xatosi deb rad etadi, shuning uchun uni oldindan olib tashlaymiz.
  kmlText = kmlText.replace(/\s+xsi:schemaLocation="[^"]*"/g, '')

  const dom = new DOMParser({ errorHandler: () => {} }).parseFromString(kmlText, 'text/xml')
  const geojson = kml(dom)

  const features = geojson.features
    .filter((f) => f.geometry)
    .map((f) => {
      const descriptionHtml =
        typeof f.properties?.description === 'string'
          ? f.properties.description
          : f.properties?.description?.value
      const props = parseDescriptionTable(descriptionHtml, keepKeys)
      if (!props.nomi && f.properties?.name) props.nomi = f.properties.name
      return {
        type: 'Feature',
        properties: props,
        geometry: cleanGeometry(f.geometry, simplifyTolerance),
      }
    })

  const outData = { type: 'FeatureCollection', features }
  mkdirSync(OUT_DIR, { recursive: true })
  const outPath = join(OUT_DIR, `${out}.json`)
  writeFileSync(outPath, JSON.stringify(outData))
  console.log(`${file}.kmz -> data/${out}.json (${features.length} ta obyekt)`)
}

async function main() {
  for (const layer of LAYERS) {
    await convertOne(layer)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
