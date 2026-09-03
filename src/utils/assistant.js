import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

const REFERENCE_DOC_URL = '/234-qaror.pdf'

const SYSTEM_INSTRUCTION = `Siz Vazirlar Mahkamasining 234-son Qarori bo'yicha ixtisoslashgan yordamchi AI assistentsiz.

QAT'IY QOIDALAR:
1. Faqat sizga biriktirilgan 234-son qaror hujjati matniga asoslanib javob bering.
2. Agar savolga javob hujjatda bo'lmasa, aniq shunday deb ayting: "Bu savolga javob 234-son qarorda topilmadi." Hech qachon hujjatdan tashqari umumiy bilimingizdan taxmin qilib javob bermang.
3. Javoblaringiz to'liq, aniq, tushunarli va batafsil bo'lsin — kerak bo'lsa tegishli bo'lim, band yoki modda raqamiga ishora qiling.
4. Javob tili va yozuvi foydalanuvchi savolining tili/yozuviga ANIQ mos kelishi SHART:
   - Savol o'zbek tilida lotin yozuvida (masalan: "qanday", "bo'yicha") yozilgan bo'lsa — javobni o'zbek tilida, LOTIN yozuvida bering.
   - Savol o'zbek tilida krill yozuvida (masalan: "қандай", "бўйича") yozilgan bo'lsa — javobni o'zbek tilida, KRILL yozuvida bering.
   - Savol rus tilida yozilgan bo'lsa — javobni rus tilida bering.
   Hech qachon savol yozuvidan boshqa yozuvda yoki boshqa tilda javob bermang.`

const PRIMER_INTRO = "Quyida 234-son qaror hujjati biriktirilgan. Bundan keyingi barcha savollarimga faqat shu hujjat asosida, undan tashqariga chiqmasdan javob bering."
const PRIMER_ACK = "Tushunarli. 234-son qaror hujjati bilan tanishib chiqdim. Savolingizni bering — javobni faqat shu hujjat asosida beraman."

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

// `history` — oldingi chat xabarlari: [{ role: 'user' | 'model', text }]
export async function sendAssistantMessage(history, message) {
  const file = await getReferenceFile()

  const contents = [
    { role: 'user', parts: [{ text: PRIMER_INTRO }, { fileData: { fileUri: file.uri, mimeType: file.mimeType } }] },
    { role: 'model', parts: [{ text: PRIMER_ACK }] },
    ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ]

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
