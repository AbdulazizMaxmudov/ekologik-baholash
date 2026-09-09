// Bir martalik konversiya skripti: kmz-source/*.kmz -> public/data/ormon/<viloyat>.json
//
// Har bir KMZ — o'rmon fondi yerlari kadastr uchastkalarining KML fayli (zip
// ichida). Bu skript uni GeoJSON'ga o'giradi va har bir uchastka uchun
// tavsif HTML jadvalidan faqat kerakli maydonlarni ajratib oladi (qolgan
// texnik ustunlar va inline HTML/skript olib tashlanadi, fayl hajmi kamayadi).
//
// Ishga tushirish: node scripts/convert-kmz-to-geojson.mjs
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'
import { DOMParser } from '@xmldom/xmldom'
import { kml } from '@tmcw/togeojson'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SRC_DIR = join(__dirname, '..', 'kmz-source')
const OUT_DIR = join(__dirname, '..', 'public', 'data', 'ormon')

// KMZ fayl nomi -> loyihada allaqachon ishlatilayotgan viloyat kaliti
// (src/pages/XaritaPage.jsx dagi `data` obyekti kalitlariga mos)
const FILE_TO_REGION_KEY = {
  Buxoro: 'buxoro',
  Fargona: 'fargona',
  Jizzax: 'jizzax',
  Namangan: 'namangan',
  Navoiy: 'navoiy',
  Qashqadaryo_urmon_yeri: 'qashqadaryo',
  Qoraqalpogiston: 'qoraqalpogiston',
  Samarqand: 'samarqand',
  Sirdaryo: 'sirdaryo',
  Surxondaryo: 'surxondaryo',
  Toshkent: 'toshkent',
  Xorazim: 'xorazm',
}

// KML <description> ichidagi HTML jadvaldan qoldirmoqchi bo'lgan maydonlar.
const KEEP_KEYS = {
  cadastral_number: 'cadastralNumber',
  land_fund_category_description: 'yerFondiToifasi',
  land_fund_type_description: 'yerFondiTuri',
  Subyekt_nomi: 'subyekt',
  Tuman: 'tuman',
  'Royxatga(hisobga)_olingan_holati': 'royxatHolati',
  Qishloq_hojaligi_yer_turi_nomi: 'yerTuri',
}

function parseDescriptionTable(html) {
  if (!html) return {}
  const props = {}
  const rowRe = /<tr[^>]*>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/g
  let m
  while ((m = rowRe.exec(html))) {
    const key = m[1].trim()
    const mapped = KEEP_KEYS[key]
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

function cleanGeometry(geometry) {
  if (geometry.type === 'GeometryCollection') {
    return { type: geometry.type, geometries: geometry.geometries.map(cleanGeometry) }
  }
  return { type: geometry.type, coordinates: cleanCoords(geometry.coordinates) }
}

async function convertOne(fileBase, regionKey) {
  const kmzPath = join(SRC_DIR, `${fileBase}.kmz`)
  const buf = readFileSync(kmzPath)
  const zip = await JSZip.loadAsync(buf)
  const kmlEntry = Object.values(zip.files).find((f) => f.name.toLowerCase().endsWith('.kml'))
  if (!kmlEntry) throw new Error(`${fileBase}: KML topilmadi`)
  const kmlText = await kmlEntry.async('text')

  const dom = new DOMParser({ errorHandler: () => {} }).parseFromString(kmlText, 'text/xml')
  const geojson = kml(dom)

  const features = geojson.features
    .filter((f) => f.geometry)
    .map((f) => {
      const descriptionHtml =
        typeof f.properties?.description === 'string'
          ? f.properties.description
          : f.properties?.description?.value
      const props = parseDescriptionTable(descriptionHtml)
      return {
        type: 'Feature',
        properties: props,
        geometry: cleanGeometry(f.geometry),
      }
    })

  const out = { type: 'FeatureCollection', features }
  mkdirSync(OUT_DIR, { recursive: true })
  const outPath = join(OUT_DIR, `${regionKey}.json`)
  writeFileSync(outPath, JSON.stringify(out))
  console.log(`${fileBase}.kmz -> data/ormon/${regionKey}.json (${features.length} ta uchastka)`)
}

async function main() {
  const files = readdirSync(SRC_DIR).filter((f) => f.endsWith('.kmz'))
  for (const file of files) {
    const base = file.replace(/\.kmz$/, '')
    const regionKey = FILE_TO_REGION_KEY[base]
    if (!regionKey) {
      console.warn(`Nomaʼlum fayl, o'tkazib yuborildi: ${file}`)
      continue
    }
    await convertOne(base, regionKey)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
