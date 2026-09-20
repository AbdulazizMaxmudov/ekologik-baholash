import { GoogleGenAI } from '@google/genai'
import { buildEmissionsSummary } from './emissionsSummary'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

const REFERENCE_DOC_URL = '/234-qaror.pdf'

const SYSTEM_INSTRUCTION = `Siz Vazirlar Mahkamasining 234-son Qarori bo'yicha ixtisoslashgan yordamchi AI assistentsiz.

QAT'IY QOIDALAR:
1. Javoblaringizni faqat ushbu suhbatda sizga taqdim etilgan manbalarga asoslanib bering — 234-son qaror hujjati doim mavjud; ba'zi suhbatlarda bunga qo'shimcha ravishda aniq bir loyiha/ariza hujjati va/yoki korxonalarning tashlanmalari bo'yicha jamlanma ma'lumot ham beriladi. Savol qaysi manbaga tegishli bo'lsa, shu manbadan foydalaning.
2. Agar savolga javob taqdim etilgan hech qanday manbada topilmasa, aniq shunday deb ayting: "Bu savolga javob taqdim etilgan hujjat/ma'lumotlarda topilmadi." Hech qachon manbalardan tashqari umumiy bilimingizdan taxmin qilib javob bermang.
3. Javoblaringiz to'liq, aniq, tushunarli va batafsil bo'lsin — kerak bo'lsa tegishli bo'lim, band yoki modda raqamiga ishora qiling.
4. Javob tili va yozuvi foydalanuvchi savolining tili/yozuviga ANIQ mos kelishi SHART:
   - Savol o'zbek tilida lotin yozuvida (masalan: "qanday", "bo'yicha") yozilgan bo'lsa — javobni o'zbek tilida, LOTIN yozuvida bering.
   - Savol o'zbek tilida krill yozuvida (masalan: "қандай", "бўйича") yozilgan bo'lsa — javobni o'zbek tilida, KRILL yozuvida bering.
   - Savol rus tilida yozilgan bo'lsa — javobni rus tilida bering.
   Hech qachon savol yozuvidan boshqa yozuvda yoki boshqa tilda javob bermang.`

const PRIMER_INTRO = "Quyida 234-son qaror hujjati biriktirilgan. Bundan keyingi barcha savollarimga shu hujjat va (agar keyinroq berilsa) boshqa taqdim etiladigan manbalar asosida javob bering."
const PRIMER_ACK = "Tushunarli. 234-son qaror hujjati bilan tanishib chiqdim. Savolingizni bering."

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
      if (file.state !== 'ACTIVE') throw new Error("Ma'lumotnoma hujjati tayyorlanmadi, sahifani yangilab qaytadan urinib ko'ring")
      return file
    })().catch(err => { referenceFilePromise = null; throw err })
  }
  return referenceFilePromise
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
  const file = await getReferenceFile()

  const contents = [
    { role: 'user', parts: [{ text: PRIMER_INTRO }, { fileData: { fileUri: file.uri, mimeType: file.mimeType } }] },
    { role: 'model', parts: [{ text: PRIMER_ACK }] },
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
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.2,
    },
  })

  return response.text ?? "Javob olinmadi, qaytadan urinib ko'ring."
}
