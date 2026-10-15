import common from './locales/common'
import dashboard from './locales/dashboard'
import evaluation from './locales/evaluation'
import companies from './locales/companies'
import assistant from './locales/assistant'
import taqqoslash from './locales/taqqoslash'
import xarita from './locales/xarita'
import presentation from './locales/presentation'
import geo from './locales/geo'
import { toLatin } from '../utils/dataUtils'

// Tizim tillari. Manba (kalit) matnlar — o'zbek (lotin) tilida yozilgan,
// shuning uchun `uz` uchun lug'at kerak emas: kalitning o'zi ko'rsatiladi.
// Boshqa tillar uchun har bir namespace fayli quyidagi ko'rinishda:
//   { "O'zbekcha matn {n}": { ru: '…', en: '…', kaa: '…' } }
export const LANGUAGES = [
  { code: 'uz', short: 'UZ', label: "O'zbekcha" },
  { code: 'kaa', short: 'QQ', label: 'Qaraqalpaqsha' },
  { code: 'ru', short: 'RU', label: 'Русский' },
  { code: 'en', short: 'EN', label: 'English' },
]

const LANG_CODES = LANGUAGES.map(l => l.code)
const STORAGE_KEY = 'app-lang'

const DICTIONARY = Object.assign({}, common, dashboard, evaluation, companies, assistant, taqqoslash, xarita, presentation, geo)

// Hook'dan tashqaridagi kod (utils, Gemini promptlari) uchun joriy til.
let currentLang = readStoredLang()

function readStoredLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (LANG_CODES.includes(saved)) return saved
  } catch {
    // localStorage mavjud emas — standart tilda qolamiz
  }
  return 'uz'
}

export function getCurrentLang() {
  return currentLang
}

export function setCurrentLang(lang) {
  currentLang = lang
}

export function isSupportedLang(lang) {
  return LANG_CODES.includes(lang)
}

export function saveLang(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // saqlab bo'lmasa ham joriy sessiyada til almashadi
  }
}

function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (m, name) => (vars[name] ?? m))
}

// `key` — o'zbekcha manba matn. Tarjima topilmasa, manba matn qaytadi.
export function translate(key, vars, lang = currentLang) {
  if (key == null) return key
  const entry = lang === 'uz' ? null : DICTIONARY[key]
  return interpolate(entry?.[lang] ?? key, vars)
}

// Joy nomlari (viloyat/tuman). Ma'lumotlarda ular ba'zan krill yozuvida
// keladi ("Самарқанд", "Нуробод т.") — rus tilida krill holicha qoldiriladi,
// qolgan tillarda lotinga o'giriladi, so'ng `geo` lug'atidan qidiriladi.
const CYRILLIC_RE = /[Ѐ-ӿ]/
export function translateGeo(name, lang = currentLang) {
  if (!name || typeof name !== 'string') return name
  if (CYRILLIC_RE.test(name)) return lang === 'ru' ? name : translate(toLatin(name), null, lang)
  return translate(name, null, lang)
}

// Raqamlarni joriy til lokalida formatlash (1 234 / 1,234).
const NUMBER_LOCALES = { uz: 'uz-UZ', kaa: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }
export function formatNumber(n, lang = currentLang) {
  return Number(n).toLocaleString(NUMBER_LOCALES[lang] || 'uz-UZ')
}
