// Bir martalik generatsiya skripti: tashkent_korxona_jamlama.json (Toshkent
// shahar korxonalari, koordinatasiz) -> src/data/tashkentKorxonalari.js
//
// Manba faylda har bir korxona uchun faqat tuman nomi bor, aniq koordinata
// yo'q. Shuning uchun har bir korxona uchun o'z tumani chegarasi ichida
// tasodifiy (lekin quyidagilarga to'g'ri kelmaydigan) nuqta tanlanadi:
//   - boshqa endi joylashtirilgan korxonalar bilan (shu ishga tushirishda),
//   - src/data/korxonalar.js dagi mavjud 66 ta korxona hududi bilan,
//   - respublika miqyosidagi KMZ qatlamlari (suv omborlari, ichimlik suvi
//     konlari, SMQZ, o'rmon-ov xo'jaliklari) va viloyat bo'yicha o'rmon fondi
//     yerlari bilan — ustma-ust tushmasligi kerak.
//
// Ishga tushirish: node scripts/generate-tashkent-korxonalar.mjs
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ---------------------------------------------------------------------------
// Geometriya yordamchilari
// ---------------------------------------------------------------------------

function ringBbox(ring) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const [x, y] of ring) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  return [minX, minY, maxX, maxY]
}

// Ray-casting: nuqta [lng,lat] halqa ichidami (even-odd qoida)
function pointInRing([px, py], ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

function distToSegment([px, py], [x1, y1], [x2, y2]) {
  const dx = x2 - x1
  const dy = y2 - y1
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1)
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

function distToLine(pt, line) {
  let min = Infinity
  for (let i = 0; i < line.length - 1; i++) {
    const d = distToSegment(pt, line[i], line[i + 1])
    if (d < min) min = d
  }
  return min
}

// Har xil turdagi KMZ-manba GeoJSON geometriyalarini "taqiqlangan hudud"
// tekshiruvchilar ro'yxatiga tekislaydi (har birida bbox + contains(pt)).
const LINE_BUFFER_DEG = 0.0006 // ~60-65m — chiziqli obyektlar (soy va h.k.) atrofida
const POINT_BUFFER_DEG = 0.0009 // ~90-100m — nuqta obyektlar (suv ombori markazi) atrofida

function flattenGeometry(geometry, out) {
  if (!geometry) return
  switch (geometry.type) {
    case 'Polygon': {
      const ring = geometry.coordinates[0]
      if (ring && ring.length >= 3) out.push({ bbox: ringBbox(ring), test: (pt) => pointInRing(pt, ring) })
      break
    }
    case 'MultiPolygon': {
      for (const poly of geometry.coordinates) {
        const ring = poly[0]
        if (ring && ring.length >= 3) out.push({ bbox: ringBbox(ring), test: (pt) => pointInRing(pt, ring) })
      }
      break
    }
    case 'LineString': {
      const line = geometry.coordinates
      const [minX, minY, maxX, maxY] = ringBbox(line)
      out.push({
        bbox: [minX - LINE_BUFFER_DEG, minY - LINE_BUFFER_DEG, maxX + LINE_BUFFER_DEG, maxY + LINE_BUFFER_DEG],
        test: (pt) => distToLine(pt, line) < LINE_BUFFER_DEG,
      })
      break
    }
    case 'MultiLineString': {
      for (const line of geometry.coordinates) {
        const [minX, minY, maxX, maxY] = ringBbox(line)
        out.push({
          bbox: [minX - LINE_BUFFER_DEG, minY - LINE_BUFFER_DEG, maxX + LINE_BUFFER_DEG, maxY + LINE_BUFFER_DEG],
          test: (pt) => distToLine(pt, line) < LINE_BUFFER_DEG,
        })
      }
      break
    }
    case 'Point': {
      const [x, y] = geometry.coordinates
      out.push({
        bbox: [x - POINT_BUFFER_DEG, y - POINT_BUFFER_DEG, x + POINT_BUFFER_DEG, y + POINT_BUFFER_DEG],
        test: (pt) => Math.hypot(pt[0] - x, pt[1] - y) < POINT_BUFFER_DEG,
      })
      break
    }
    case 'MultiPoint': {
      for (const [x, y] of geometry.coordinates) {
        out.push({
          bbox: [x - POINT_BUFFER_DEG, y - POINT_BUFFER_DEG, x + POINT_BUFFER_DEG, y + POINT_BUFFER_DEG],
          test: (pt) => Math.hypot(pt[0] - x, pt[1] - y) < POINT_BUFFER_DEG,
        })
      }
      break
    }
    case 'GeometryCollection': {
      for (const g of geometry.geometries) flattenGeometry(g, out)
      break
    }
  }
}

function bboxIntersects(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1]
}

// ---------------------------------------------------------------------------
// 1) Barcha KMZ-manba "taqiqlangan hudud" qatlamlarini yuklaymiz
// ---------------------------------------------------------------------------

const hazardSources = [
  'public/data/suv_omborlari.json',
  'public/data/ichimlik_suvi_konlari.json',
  'public/data/smqz.json',
  'public/data/urmon_ov_xujaliklari.json',
  ...readdirSync(join(ROOT, 'public/data/ormon')).map((f) => `public/data/ormon/${f}`),
]

const allHazards = []
for (const rel of hazardSources) {
  const data = JSON.parse(readFileSync(join(ROOT, rel), 'utf8'))
  for (const f of data.features) flattenGeometry(f.geometry, allHazards)
}
console.log(`Yuklandi: ${allHazards.length} ta xavfli/taqiqlangan geometriya (${hazardSources.length} manba fayldan)`)

// Toshkent shahri atrofidagi kengaytirilgan bbox — faqat shu hududga tegishli
// xavf geometriyalarini oldindan filtrlab, tasodifiy joylashtirish tsiklini
// tezlashtiramiz (863 nuqta uchun butun respublika bo'yicha qidirish shart emas).
const TASHKENT_CITY_BBOX = [68.95, 41.1, 69.45, 41.45]
const localHazards = allHazards.filter((h) => bboxIntersects(h.bbox, TASHKENT_CITY_BBOX))
console.log(`Toshkent shahri atrofida: ${localHazards.length} ta lokal xavf geometriyasi`)

function collidesWithHazards(pt, hazards) {
  for (const h of hazards) {
    if (pt[0] < h.bbox[0] || pt[0] > h.bbox[2] || pt[1] < h.bbox[1] || pt[1] > h.bbox[3]) continue
    if (h.test(pt)) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// 2) Mavjud 66 ta korxona (src/data/korxonalar.js) — respublika bo'yicha
//    KMZ qatlamlari bilan to'qnashuvini tekshiramiz (faqat tekshirish,
//    o'zgartirmaymiz — hozircha hech biri to'qnashmagani ma'lum bo'ldi).
// ---------------------------------------------------------------------------

const { korxonalarSeed } = await import('../src/data/korxonalar.js')

let existingCollisions = 0
for (const k of korxonalarSeed) {
  // hudud [lat,lng] formatida — geometriya tekshiruvchilar [lng,lat] kutadi
  const center = k.hudud.reduce((acc, [lat, lng]) => [acc[0] + lng, acc[1] + lat], [0, 0])
  const pt = [center[0] / k.hudud.length, center[1] / k.hudud.length]
  if (collidesWithHazards(pt, allHazards)) {
    existingCollisions++
    console.warn(`  DIQQAT: mavjud korxona "${k.nomi}" (${k.id}) KMZ qatlamiga to'g'ri kelib qoldi`)
  }
}
console.log(`Mavjud 66 ta korxonadan to'qnashganlari: ${existingCollisions}`)

// ---------------------------------------------------------------------------
// 3) Toshkent shahar tumanlari poligonlari (src/utils/uzbekistanGeoJson/data/toshkent.js)
// ---------------------------------------------------------------------------

const toshkentGeo = (await import('../src/utils/uzbekistanGeoJson/data/toshkent.js')).default

const DISTRICT_GEO_NAMES = {
  bektemir: 'Bektemir',
  sergeli: 'Sergeli',
  chilanzar: 'Chilanzar',
  uchtepa: 'Uchtepa',
  yakkasaray: 'Yakkasaray',
  almazar: 'Almazar',
  shaykhantokhur: 'Shaykhantokhur',
  yunusabad: 'Yunusabad',
  yashnobod: 'Yashnobod',
  mirabad: 'Mirabad',
  'mirzo ulugbek': 'Mirzo Ulugbek',
}

const districtPolygons = {}
for (const [key, geoName] of Object.entries(DISTRICT_GEO_NAMES)) {
  const f = toshkentGeo.features.find((f) => f.properties.name === geoName)
  if (!f) throw new Error(`GeoJSON'da topilmadi: ${geoName}`)
  const ring = f.geometry.type === 'Polygon' ? f.geometry.coordinates[0] : f.geometry.coordinates[0][0]
  districtPolygons[key] = { ring, bbox: ringBbox(ring) }
}

// Manba fayldagi kirill tuman nomlarini ilova ichida ishlatiladigan tuman
// kalitlariga o'giramiz (src/pages/XaritaPage.jsx dagi `data.toshkent.subData`
// bilan mos). "Yangi Ҳаёт" — 2020-yilda Bektemir/Sergeli/Uchtepa hisobidan
// tashkil topgan yangi tuman, eski GeoJSON chegaralarida alohida poligon
// sifatida yo'q — shu uchtala tumandan tasodifiy tanlab joylashtiramiz.
const DISTRICT_MAP = {
  'Сирғали т.': 'sergeli',
  'Сирғали т. Тошкент вилояти': 'sergeli',
  'Чилонзор т.': 'chilanzar',
  'Учтепа т.': 'uchtepa',
  'М.Улугбек т.': 'mirzo ulugbek',
  'Бектемир т.': 'bektemir',
  'Шайхонтохур т.': 'shaykhantokhur',
  'Олмазор т.': 'almazar',
  'Яшнобод т': 'yashnobod',
  'Яккасарой т': 'yakkasaray',
  'Миробод т.': 'mirabad',
  'Юнусобод т.': 'yunusabad',
  'Янги Ҳаёт т.': 'yangihayot',
}

const YANGI_HAYOT_FALLBACK = ['bektemir', 'sergeli', 'uchtepa']
const NULL_DISTRICT_FALLBACK = Object.keys(DISTRICT_GEO_NAMES)

function pickPlacementKey(tumanKey, rng) {
  if (tumanKey === 'yangihayot') return YANGI_HAYOT_FALLBACK[Math.floor(rng() * YANGI_HAYOT_FALLBACK.length)]
  if (tumanKey === null) return NULL_DISTRICT_FALLBACK[Math.floor(rng() * NULL_DISTRICT_FALLBACK.length)]
  return tumanKey
}

// ---------------------------------------------------------------------------
// 4) Tasodifiy (lekin determinist — takror ishga tushirilsa bir xil natija
//    chiqishi uchun) nuqta generatori
// ---------------------------------------------------------------------------

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20250205)

const MIN_SEPARATION_DEG = 0.0011 // ~110-120m — joylashtirilgan nuqtalar orasidagi eng kam masofa
const placedPoints = [] // {pt:[lng,lat], bbox}

// Toshkent shahridagi mavjud 66 dan hech biri yo'q (barchasi sun'iy shaharlarda),
// shunga qaramay xavfsizlik uchun ularning markazlarini ham "band" deb qo'shamiz.
for (const k of korxonalarSeed) {
  const center = k.hudud.reduce((acc, [lat, lng]) => [acc[0] + lng, acc[1] + lat], [0, 0])
  const pt = [center[0] / k.hudud.length, center[1] / k.hudud.length]
  if (bboxIntersects([pt[0], pt[1], pt[0], pt[1]], TASHKENT_CITY_BBOX)) {
    placedPoints.push(pt)
  }
}

function tooCloseToPlaced(pt) {
  for (const p of placedPoints) {
    if (Math.abs(p[0] - pt[0]) > MIN_SEPARATION_DEG || Math.abs(p[1] - pt[1]) > MIN_SEPARATION_DEG) continue
    if (Math.hypot(p[0] - pt[0], p[1] - pt[1]) < MIN_SEPARATION_DEG) return true
  }
  return false
}

function randomPointInDistrict(districtKey, allowRelaxed) {
  const { ring, bbox } = districtPolygons[districtKey]
  const [minX, minY, maxX, maxY] = bbox
  const maxAttempts = allowRelaxed ? 400 : 250
  for (let i = 0; i < maxAttempts; i++) {
    const pt = [minX + rng() * (maxX - minX), minY + rng() * (maxY - minY)]
    if (!pointInRing(pt, ring)) continue
    if (collidesWithHazards(pt, localHazards)) continue
    if (!allowRelaxed && tooCloseToPlaced(pt)) continue
    return pt
  }
  return null
}

// ---------------------------------------------------------------------------
// 5) Manba faylni o'qib, korxonalar ro'yxatini quramiz
// ---------------------------------------------------------------------------

const source = JSON.parse(readFileSync(join(ROOT, 'tashkent_korxona_jamlama.json'), 'utf8'))

function round(n, digits = 3) {
  const f = 10 ** digits
  return Math.round(n * f) / f
}

function buildTashlanmalar(e) {
  const em = e.emissions_pdv || {}
  const atmosfera = []
  const pushAtmosfera = (modda, val) => {
    if (val) atmosfera.push({ modda, tonna_yiliga: round(val) })
  }
  pushAtmosfera('Anorganik chang', em.inorganic_dust)
  pushAtmosfera('Azot dioksidi (A-II 001)', em.nitrogen_dioxide)
  pushAtmosfera('Uglerod oksidi', em.carbon_monoxide)
  pushAtmosfera('Oltingugurt dioksidi', em.sulfur_dioxide)
  pushAtmosfera('Azot oksidi', em.nitric_oxide)
  pushAtmosfera('Fenol', em.phenol)
  pushAtmosfera('Formaldegid', em.formaldehyde)
  pushAtmosfera('Ammiak', em.ammonia)
  pushAtmosfera("Boshqa moddalar", em.other)

  const w = e.waste_pdo || {}
  const xavfli = []
  const pushXavfli = (modda, val) => {
    if (val) xavfli.push({ modda, tonna_yiliga: round(val) })
  }
  pushXavfli('1-xavflilik sinfi chiqindisi', w.class_1)
  pushXavfli('2-xavflilik sinfi chiqindisi', w.class_2)
  pushXavfli('3-xavflilik sinfi chiqindisi', w.class_3)
  pushXavfli('4-xavflilik sinfi chiqindisi', w.class_4)
  pushXavfli('5-xavflilik sinfi chiqindisi', w.class_5)

  return {
    atmosfera,
    suv_foydalanish: [],
    oqova_suv: [],
    xavfli_chiqindi: xavfli,
    qattiq_maishiy_chiqindi: [],
  }
}

// Kichik olti burchakli "hudud" — mavjud korxonalarSeed uslubiga o'xshash,
// lekin ancha kichikroq (real joylashuvi noma'lum, zich shahar sharoitida
// katta hexagon ustma-ust tushishga olib keladi).
const HEX_RADIUS_LAT = 0.00055
function buildHudud(lng, lat) {
  const lngScale = 1 / Math.cos((lat * Math.PI) / 180)
  const points = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    const dLat = HEX_RADIUS_LAT * Math.sin(angle)
    const dLng = HEX_RADIUS_LAT * lngScale * Math.cos(angle)
    points.push([round(lat + dLat, 6), round(lng + dLng, 6)])
  }
  return points
}

const result = []
let failedCount = 0
let usedRelaxed = 0

source.enterprises.forEach((e, idx) => {
  const rawDistrict = e.district ? e.district.trim() : null
  const tumanKey = rawDistrict ? (DISTRICT_MAP[rawDistrict] ?? null) : null
  if (rawDistrict && !(rawDistrict in DISTRICT_MAP)) {
    console.warn(`  Nomaʼlum tuman nomi: "${rawDistrict}" (${e.enterprise_name})`)
  }

  const placementKey = pickPlacementKey(tumanKey, rng)
  let pt = randomPointInDistrict(placementKey, false)
  if (!pt) {
    // Zichlik yuqori bo'lgan joylarda minimal masofa talabini bo'shashtirib
    // qayta urinamiz — lekin xavfli hududlardan saqlanish sharti saqlanadi.
    pt = randomPointInDistrict(placementKey, true)
    if (pt) usedRelaxed++
  }
  if (!pt) {
    failedCount++
    console.warn(`  Joy topilmadi: ${e.enterprise_name} (${rawDistrict})`)
    return
  }
  placedPoints.push(pt)

  result.push({
    id: `tsh-${String(idx + 1).padStart(4, '0')}`,
    inn: e.stir || null,
    nomi: e.enterprise_name?.trim() || `Korxona №${e.no}`,
    viloyat: 'toshkentshahri',
    tuman: tumanKey,
    hudud: buildHudud(pt[0], pt[1]),
    tashlanmalar: buildTashlanmalar(e),
  })
})

console.log(`Jami joylashtirildi: ${result.length} / ${source.enterprises.length}`)
console.log(`  shundan bo'shashtirilgan masofa bilan: ${usedRelaxed}`)
console.log(`  joylashtirib bo'lmaganlar: ${failedCount}`)

// Yakuniy tekshiruv: barcha yangi nuqtalar mahalliy xavf geometriyalaridan xoli ekanini tasdiqlaymiz
let finalCollisions = 0
for (const item of result) {
  const center = item.hudud.reduce((acc, [lat, lng]) => [acc[0] + lng, acc[1] + lat], [0, 0])
  const pt = [center[0] / item.hudud.length, center[1] / item.hudud.length]
  if (collidesWithHazards(pt, localHazards)) finalCollisions++
}
console.log(`Yakuniy tekshiruv — KMZ qatlamiga to'g'ri kelganlar: ${finalCollisions}`)

// ---------------------------------------------------------------------------
// 6) Natijani yozamiz
// ---------------------------------------------------------------------------

const header = `// Toshkent shahar korxonalari — tashkent_korxona_jamlama.json (Тошкент_шаҳар_
// корхона_жамламаси_05_02_2025.xls dan) manbasidan scripts/generate-tashkent-korxonalar.mjs
// skripti orqali generatsiya qilingan.
//
// MUHIM: manba faylda korxonalar uchun aniq koordinata yo'q — faqat tuman
// nomi bor edi. Shuning uchun har bir korxona o'z tumani chegarasi ichida
// tasodifiy joylashtirilgan (KMZ qatlamlari — suv omborlari, SMQZ, o'rmon
// fondi va h.k. — bilan to'qnashmasligi va bir-biriga judayam yaqin
// tushmasligi tekshirilgan holda). Demak \`hudud\` maydoni korxonaning haqiqiy
// joylashuvi EMAS, faqat tumani ichidagi taxminiy vizual nuqta.
//
// Qayta generatsiya qilish: node scripts/generate-tashkent-korxonalar.mjs

export const tashkentKorxonalari = ${JSON.stringify(result, null, 2)};
`

writeFileSync(join(ROOT, 'src/data/tashkentKorxonalari.js'), header)
console.log('Yozildi: src/data/tashkentKorxonalari.js')
