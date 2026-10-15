import { GoogleGenAI } from '@google/genai'
import { buildEmissionsSummary } from './emissionsSummary'
import LEGAL_DOCS from '../data/qonunchilikHujjatlari.json'
import { interfaceLanguageHint } from './outputLanguage'
import { translate } from '../i18n'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

const REFERENCE_DOC_URL = '/234-qaror.pdf'

const SYSTEM_INSTRUCTION = `Siz O'zbekiston Respublikasi ekologiya va atrof-muhitni muhofaza qilish sohasidagi qonunchilik (qonunlar, Prezident farmonlari va qarorlari, Vazirlar Mahkamasi qarorlari, shu jumladan 234-son Qaror) bo'yicha ixtisoslashgan yordamchi AI assistentsiz.

QAT'IY QOIDALAR:
1. Javoblaringizni faqat ushbu suhbatda sizga taqdim etilgan manbalarga asoslanib bering — 234-son qaror hujjati va qonunchilik hujjatlari to'plami (qonunlar, farmonlar, qarorlar) doim mavjud; ba'zi suhbatlarda bunga qo'shimcha ravishda aniq bir loyiha/ariza hujjati va/yoki korxonalarning tashlanmalari bo'yicha jamlanma ma'lumot ham beriladi. Savol qaysi manbaga tegishli bo'lsa, shu manbadan foydalaning.
2. Agar savolga javob taqdim etilgan hech qanday manbada topilmasa, aniq shunday deb ayting: "Bu savolga javob taqdim etilgan hujjat/ma'lumotlarda topilmadi." Hech qachon manbalardan tashqari umumiy bilimingizdan taxmin qilib javob bermang.
3. Javoblaringiz to'liq, aniq, tushunarli va batafsil bo'lsin — kerak bo'lsa tegishli bo'lim, band yoki modda raqamiga ishora qiling.
4. Javob tili va yozuvi foydalanuvchi savolining tili/yozuviga ANIQ mos kelishi SHART:
   - Savol o'zbek tilida lotin yozuvida (masalan: "qanday", "bo'yicha") yozilgan bo'lsa — javobni o'zbek tilida, LOTIN yozuvida bering.
   - Savol o'zbek tilida krill yozuvida (masalan: "қандай", "бўйича") yozilgan bo'lsa — javobni o'zbek tilida, KRILL yozuvida bering.
   - Savol rus tilida yozilgan bo'lsa — javobni rus tilida bering.
   - Savol ingliz tilida yozilgan bo'lsa — javobni ingliz tilida bering.
   - Savol qoraqalpoq tilida (masalan: "qalay", "boyınsha", "ne ushın") yozilgan bo'lsa — javobni qoraqalpoq tilida, savol qaysi yozuvda bo'lsa (lotin yoki krill) shu yozuvda bering.
   Hech qachon savol yozuvidan boshqa yozuvda yoki boshqa tilda javob bermang.`

const PRIMER_INTRO = "Quyida 234-son qaror hujjati biriktirilgan. Bundan keyingi barcha savollarimga shu hujjat va (agar keyinroq berilsa) boshqa taqdim etiladigan manbalar asosida javob bering."
const PRIMER_ACK = "Tushunarli. 234-son qaror hujjati bilan tanishib chiqdim. Savolingizni bering."

const LEGAL_DOCS_PRIMER_INTRO = "Quyida O'zbekiston Respublikasining ekologiya sohasidagi asosiy qonunlari, Prezident farmonlari va qarorlari hamda Vazirlar Mahkamasi qarorlari biriktirilgan (har biridan oldin uning nomi matn sifatida berilgan). Bundan buyon shu hujjatlarga oid savollarga ham javob bering."
const LEGAL_DOCS_PRIMER_ACK = 'Tushunarli. Taqdim etilgan qonunlar, farmonlar va qarorlar bilan tanishib chiqdim.'

const PROJECT_PRIMER_INTRO = "Quyida aniq bir ariza hujjati va unga ilova qilingan loyiha hujjatlari biriktirilgan. Bundan buyon shu loyiha haqidagi savollarga ham shu hujjatlar asosida javob bering."
const PROJECT_PRIMER_ACK = 'Tushunarli. Loyiha va ariza hujjatlari bilan tanishib chiqdim.'

const EMISSIONS_PRIMER_ACK = "Tushunarli. Korxonalarning tashlanmalari bo'yicha jamlanma ma'lumot bilan tanishib chiqdim."

let referenceFilePromise = null

async function getReferenceFile() {
  if (!referenceFilePromise) {
    referenceFilePromise = (async () => {
      const res = await fetch(REFERENCE_DOC_URL)
      const blob = await res.blob()
      let file = await ai.files.upload({ file: blob, config: { mimeType: 'application/pdf', displayName: '234-qaror' } })

      const start = Date.now()
      while (file.state === 'PROCESSING' && Date.now() - start < 45000) {
        await new Promise(r => setTimeout(r, 1000))
        file = await ai.files.get({ name: file.name })
      }
      if (file.state !== 'ACTIVE') throw new Error(translate("Ma'lumotnoma hujjati tayyorlanmadi, sahifani yangilab qaytadan urinib ko'ring"))
      return file
    })().catch(err => { referenceFilePromise = null; throw err })
  }
  return referenceFilePromise
}

// `qonunchilikHujjatlari.json` — 234-qarordan tashqari qonunlar, Prezident
// farmonlari/qarorlari va Vazirlar Mahkamasi qarorlari (public/qonunchilik/
// ostidagi PDF'lar, scripts/convert-legal-docs-to-pdf.ps1 orqali .doc dan
// generatsiya qilingan). Bir marta yuklanib, sessiya davomida memoizatsiya
// qilinadi (`getReferenceFile` bilan bir xil naqsh).
let legalDocsPromise = null

async function uploadLegalDoc(meta) {
  const res = await fetch(meta.url)
  const blob = await res.blob()
  let file = await ai.files.upload({ file: blob, config: { mimeType: 'application/pdf', displayName: meta.slug } })

  const start = Date.now()
  while (file.state === 'PROCESSING' && Date.now() - start < 45000) {
    await new Promise(r => setTimeout(r, 1000))
    file = await ai.files.get({ name: file.name })
  }
  if (file.state !== 'ACTIVE') throw new Error(translate('{name} tayyorlanmadi', { name: meta.slug }))
  return { meta, file }
}

async function getLegalDocs() {
  if (!legalDocsPromise) {
    legalDocsPromise = Promise.all(LEGAL_DOCS.map(uploadLegalDoc))
      .catch(err => { legalDocsPromise = null; throw err })
  }
  return legalDocsPromise
}

function buildLegalDocsParts(entries) {
  const parts = []
  for (const { meta, file } of entries) {
    const label = [meta.category, meta.subfolder, meta.title].filter(Boolean).join(' — ')
    parts.push({ text: `Hujjat: ${label}` })
    parts.push({ fileData: { fileUri: file.uri, mimeType: file.mimeType } })
  }
  return parts
}

// `history` — oldingi chat xabarlari: [{ role: 'user' | 'model', text }].
// `context` — ixtiyoriy qo'shimcha manbalar: { projectParts, includeEmissions }.
// `projectParts` — `gemini.js`dagi `buildDocumentParts()` natijasi (aniq bir
// ariza + unga ilova qilingan loyiha hujjatlari), `includeEmissions: true`
// bo'lsa korxonalarning tashlanmalari bo'yicha jamlanma (`emissionsSummary.js`)
// ham primerlanadi. Ikkalasi ham Expert Assistant'ning savol-javob vidjeti
// uchun — oddiy AI Assistant chatida ishlatilmaydi.
export async function sendAssistantMessage(history, message, context = {}) {
  const { projectParts = null, includeEmissions = false } = context
  const [file, legalDocs] = await Promise.all([getReferenceFile(), getLegalDocs()])

  const contents = [
    { role: 'user', parts: [{ text: PRIMER_INTRO }, { fileData: { fileUri: file.uri, mimeType: file.mimeType } }] },
    { role: 'model', parts: [{ text: PRIMER_ACK }] },
    { role: 'user', parts: [{ text: LEGAL_DOCS_PRIMER_INTRO }, ...buildLegalDocsParts(legalDocs)] },
    { role: 'model', parts: [{ text: LEGAL_DOCS_PRIMER_ACK }] },
  ]

  if (projectParts?.length) {
    contents.push(
      { role: 'user', parts: [{ text: PROJECT_PRIMER_INTRO }, ...projectParts] },
      { role: 'model', parts: [{ text: PROJECT_PRIMER_ACK }] },
    )
  }

  if (includeEmissions) {
    contents.push(
      { role: 'user', parts: [{ text: buildEmissionsSummary() }] },
      { role: 'model', parts: [{ text: EMISSIONS_PRIMER_ACK }] },
    )
  }

  contents.push(
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: message }] },
  )

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\n${interfaceLanguageHint()}`,
      temperature: 0.2,
    },
  })

  return response.text ?? translate("Javob olinmadi, qaytadan urinib ko'ring.")
}
