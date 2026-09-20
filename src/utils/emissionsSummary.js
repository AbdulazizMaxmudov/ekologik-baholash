import { korxonalarSeed } from '../data/korxonalar'
import { tashkentKorxonalari } from '../data/tashkentKorxonalari'

const ALL_KORXONALAR = [...korxonalarSeed, ...tashkentKorxonalari]

const VILOYAT_LABELS = {
  toshkentshahri: 'Toshkent shahri',
  qoraqalpogiston: "Qoraqalpog'iston",
}
const formatViloyat = key => VILOYAT_LABELS[key] || (key.charAt(0).toUpperCase() + key.slice(1))

const CATEGORY_META = {
  atmosfera: { label: 'Atmosferaga chiqariladigan moddalar', keyField: 'modda', unitField: 'tonna_yiliga', unit: 'tonna/yil' },
  suv_foydalanish: { label: 'Suvdan foydalanish', keyField: 'manba', unitField: 'm3_yiliga', unit: 'm3/yil' },
  oqova_suv: { label: 'Oqova suvlar', keyField: 'modda', unitField: 'm3_yiliga', unit: 'm3/yil' },
  xavfli_chiqindi: { label: 'Xavfli chiqindilar', keyField: 'modda', unitField: 'tonna_yiliga', unit: 'tonna/yil' },
  qattiq_maishiy_chiqindi: { label: 'Qattiq maishiy chiqindi', keyField: 'modda', unitField: 'tonna_yiliga', unit: 'tonna/yil' },
}

let cached = null

// Barcha korxonalarning (korxonalar.js + tashkentKorxonalari.js, jami ~929
// yozuv) tashlanmalarini viloyat + kategoriya + modda/manba bo'yicha
// yig'indilab, Gemini promptiga qo'shish uchun ixcham matnli hisobotga
// aylantiradi — xom (~53 ming qatorli) ma'lumotni to'g'ridan-to'g'ri
// yubormaslik uchun. Natija birinchi chaqiriqda hisoblanib keshlanadi.
export function buildEmissionsSummary() {
  if (cached) return cached

  const byViloyat = {}
  for (const korxona of ALL_KORXONALAR) {
    const viloyat = korxona.viloyat
    if (!byViloyat[viloyat]) byViloyat[viloyat] = { count: 0, categories: {} }
    byViloyat[viloyat].count++

    for (const [catKey, meta] of Object.entries(CATEGORY_META)) {
      const entries = korxona.tashlanmalar?.[catKey] || []
      if (!entries.length) continue
      if (!byViloyat[viloyat].categories[catKey]) byViloyat[viloyat].categories[catKey] = {}
      const catMap = byViloyat[viloyat].categories[catKey]
      for (const entry of entries) {
        const name = entry[meta.keyField] || "Noma'lum"
        catMap[name] = (catMap[name] || 0) + (Number(entry[meta.unitField]) || 0)
      }
    }
  }

  const lines = ["VILOYATLAR BO'YICHA TASHLANMALAR YIG'INDISI (namuna/seed ma'lumot — real monitoring bazasi emas, faqat taxminiy ko'rsatkich sifatida ishlating)"]
  const sortedViloyatlar = Object.entries(byViloyat).sort((a, b) => b[1].count - a[1].count)
  for (const [viloyat, data] of sortedViloyatlar) {
    lines.push(`\n${formatViloyat(viloyat)} (${data.count} ta korxona):`)
    for (const [catKey, meta] of Object.entries(CATEGORY_META)) {
      const catMap = data.categories[catKey]
      if (!catMap) continue
      const rows = Object.entries(catMap)
        .sort((a, b) => b[1] - a[1])
        .map(([name, sum]) => `${name} — ${sum.toFixed(2)} ${meta.unit}`)
        .join('; ')
      lines.push(`- ${meta.label}: ${rows}`)
    }
  }

  cached = lines.join('\n')
  return cached
}
