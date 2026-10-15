import { getCurrentLang } from '../i18n'

const LANGUAGE_NAMES = {
  ru: 'rus tilida',
  en: 'ingliz tilida',
  kaa: "qoraqalpoq tilida (lotin yozuvida)",
}

// JSON qaytaradigan Gemini chaqiruvlari uchun: tizim tili o'zbekcha bo'lmasa,
// erkin matnli maydonlarni tanlangan tilda yozishni so'raydi. JSON kalitlari
// va oldindan belgilangan enum qiymatlar (masalan "bajarilgan", "yuqori",
// "Tasdiqlash mumkin") o'zgarmaydi — UI ularni solishtirib, o'zi tarjima
// qilib ko'rsatadi. O'zbek tilida hech narsa qo'shilmaydi (null).
export function outputLanguagePart() {
  const name = LANGUAGE_NAMES[getCurrentLang()]
  if (!name) return null
  return {
    text: `JAVOB TILI: JSON kalitlarini va promptda qat'iy belgilangan enum qiymatlarni (holat, jiddiylik, muhimlik, tavsiya, moslik va h.k. uchun ruxsat etilgan qiymatlar) AYNAN o'zbekcha ko'rsatilgandek, o'zgartirmasdan qoldiring. Qolgan barcha erkin matnli qiymatlarni (nomlar, izohlar, asoslamalar, tavsiflar, kamchiliklar, xulosalar) ${name} yozing.`,
  }
}

// Chat assistenti uchun: foydalanuvchi savolining tili ustun turadi, bu
// faqat tilni aniqlab bo'lmagan hollarda (masalan, faqat raqam yoki nom)
// qaysi tilga qaytishni bildiradi.
const FALLBACK_NAMES = {
  uz: "o'zbek tilida (lotin yozuvida)",
  ru: 'rus tilida',
  en: 'ingliz tilida',
  kaa: "qoraqalpoq tilida (lotin yozuvida)",
}

export function interfaceLanguageHint() {
  return `Foydalanuvchi interfeysi tili: ${FALLBACK_NAMES[getCurrentLang()] || FALLBACK_NAMES.uz}. Savol tilini aniqlab bo'lmasa, javobni shu tilda bering.`
}
