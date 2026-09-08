import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Bot,
  Map,
  FileCheck2,
  GitCompareArrows,
  UploadCloud,
  Link2,
  Send,
  ListChecks,
  Calculator,
  Tag,
  MessageSquareText,
  LayoutDashboard,
  UserCheck,
  Layers,
  TrendingUp,
  History,
  Target,
  ShieldCheck,
  Clock,
  Factory,
  MapPin,
  BarChart3,
  Wind,
  AlertTriangle,
  BadgeCheck,
  Archive,
  Eye,
  AlertCircle,
  BookOpenCheck,
  Languages,
  FileUp,
  MessageCircleQuestion,
  Users,
  Timer,
} from 'lucide-react'
import logoMarkaz from '../assets/logo_Markaz.png'

// Har bir funksiya kartasi bosilganda ochiladigan mini-taqdimot (3-4 bet).
// Matnlarni shu yerda tahrirlang.
const functionDetails = {
  'ai-baholash': {
    title: 'AI Baholash',
    icon: Bot,
    pages: [
      {
        heading: 'Hujjatni yuklash va tahlil',
        bullets: [
          { icon: UploadCloud, text: "Ariza PDF formatida yuklanadi yoki havola orqali biriktiriladi" },
          { icon: Link2, text: "Ariza ichidagi havolalar (ilova qilingan boshqa hujjatlar) tizim tomonidan avtomatik aniqlanadi va tortib olinadi" },
          { icon: Send, text: "Barcha hujjatlar birgalikda AI modeliga yuboriladi" },
        ],
      },
      {
        heading: '234-sonli Qaror mezonlari',
        bullets: [
          { icon: ListChecks, text: "Har bir mezon (bo'lim) bo'yicha alohida ball qo'yiladi" },
          { icon: Calculator, text: "Umumiy ball mezonlar yig'indisi asosida avtomatik hisoblanadi" },
          { icon: Tag, text: "Natijaga ko'ra loyihachi korxona Yashil, Ko'k yoki Sariq toifaga ajratiladi" },
        ],
      },
      {
        heading: 'Natija va shaffoflik',
        bullets: [
          { icon: MessageSquareText, text: "Har bir mezon bo'yicha AI'ning izohi va asoslamasi ko'rsatiladi" },
          { icon: LayoutDashboard, text: "Natija tuzilgan (JSON) formatda saqlanib, UI'da vizual ko'rinishda chiqariladi" },
          { icon: UserCheck, text: "Ekspert natijani ko'rib chiqib, kerak bo'lsa qayta baholashi mumkin" },
        ],
      },
    ],
  },
  'ai-taqqoslash': {
    title: 'AI Taqqoslash',
    icon: GitCompareArrows,
    pages: [
      {
        heading: "Korxona hujjatlarini o'zaro solishtirish",
        bullets: [
          { icon: Layers, text: "Bitta korxonaning turli davrlarga oid barcha hujjatlari/arizalari bir joyga yig'iladi" },
          { icon: GitCompareArrows, text: "Ularning ko'rsatkichlari va mezonlari bir-biri bilan taqqoslanadi" },
          { icon: TrendingUp, text: "Korxonaning vaqt davomida yaxshilangan yoki yomonlashgan jihatlari aniqlanadi" },
        ],
      },
      {
        heading: 'Qachon foydali',
        bullets: [
          { icon: History, text: "Bitta korxonaning ekologik holati vaqt bo'yicha qanday o'zgarganini kuzatishda" },
          { icon: Target, text: "Qaysi ko'rsatkich bo'yicha korxona kuchli/zaifligini aniqlashda" },
        ],
      },
      {
        heading: 'Afzalligi',
        bullets: [
          { icon: ShieldCheck, text: "Qo'lda solishtirish paytida yo'l qo'yiladigan xatoliklarni kamaytiradi" },
          { icon: Clock, text: "Qaror qabul qilish vaqtini bir necha barobar qisqartiradi" },
        ],
      },
    ],
  },
  xarita: {
    title: 'Interaktiv xarita',
    icon: Map,
    pages: [
      {
        heading: 'Hududiy ekologik nazorat',
        bullets: [
          { icon: Factory, text: "Respublika, viloyat va tuman kesimida har bir korxonaning tashlanmalari (chiqindi va chiqindi gazlari) aniqlanadi" },
          { icon: MapPin, text: "O'zbekiston xaritasida viloyatni bosish orqali uning tumanlariga o'tiladi (drill-down)" },
          { icon: BarChart3, text: "Har bir hudud bo'yicha ko'rsatkichlar alohida, aniq ko'rinadi" },
        ],
      },
      {
        heading: "Shamol va tabiiy omillar ta'siri",
        bullets: [
          { icon: Wind, text: "Shamol yo'nalishi va tezligi hisobga olinib, ifloslanishning qaysi hududlarga tarqalishi xaritada vizual ko'rsatiladi" },
          { icon: AlertTriangle, text: "Bu orqali qaysi aholi punkti yoki hudud ko'proq ta'sir ostida qolishi oldindan aniqlanadi" },
        ],
      },
      {
        heading: 'Korxonaning eco-pasporti',
        bullets: [
          { icon: BadgeCheck, text: "Har bir korxona uchun yagona ekologik pasport (eco-pasport) shakllantiriladi" },
          { icon: Archive, text: "Korxonaning barcha ko'rsatkichlari, tarixi va reytingi shu pasportda bir joyda jamlanadi" },
          { icon: Eye, text: "Nazorat organlari va investorlar korxona holatini bir necha soniyada ko'rishi mumkin" },
        ],
      },
      {
        heading: 'Boshqa imkoniyatlar',
        bullets: [
          { icon: BarChart3, text: "Viloyat va tumanlar o'rtasida ekologik ko'rsatkichlarni solishtirish" },
          { icon: History, text: "Vaqt bo'yicha o'zgarish dinamikasini (monitoring tarixini) kuzatish" },
          { icon: AlertCircle, text: "Muammoli hududlarni tezda aniqlab, ustuvor ravishda chora ko'rish" },
        ],
      },
    ],
  },
  'ai-assistant': {
    title: 'AI Assistant',
    icon: FileCheck2,
    pages: [
      {
        heading: "234-sonli Qaror bo'yicha chat",
        bullets: [
          { icon: BookOpenCheck, text: "Faqat qonun hujjati matni asosida javob beradi, o'zidan narsa qo'shmaydi" },
          { icon: Languages, text: 'Foydalanuvchi qaysi tilda/yozuvda yozsa (lotin, kirill, rus), shu tilda javob qaytaradi' },
        ],
      },
      {
        heading: 'Ishlash tartibi',
        bullets: [
          { icon: FileUp, text: "234-Qaror hujjati tizimga bir marta yuklab qo'yiladi" },
          { icon: MessageCircleQuestion, text: 'Har bir savol aynan shu hujjat konteksti asosida javoblanadi' },
        ],
      },
      {
        heading: 'Foydasi',
        bullets: [
          { icon: Users, text: 'Mutaxassislar va tashqi foydalanuvchilar uchun tezkor ma\'lumot manbai' },
          { icon: Timer, text: "Qonun matnini qo'lda qidirib o'tirish shart emas" },
        ],
      },
    ],
  },
}

const functionCards = [
  { key: 'ai-baholash', title: 'AI Baholash', desc: "Hujjatlarni yuklab, avtomatik ball qo'yish", icon: Bot },
  { key: 'ai-taqqoslash', title: 'AI Taqqoslash', desc: "Korxona hujjatlarini o'zaro solishtirish", icon: GitCompareArrows },
  { key: 'xarita', title: 'Interaktiv xarita', desc: "Tashlanmalar, shamol ta'siri va eco-pasport", icon: Map },
  { key: 'ai-assistant', title: 'AI Assistant', desc: "234-Qaror bo'yicha savol-javob", icon: FileCheck2 },
]

function Bullets({ items }) {
  return (
    <ul className="space-y-4 mt-8">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <li
            key={item.text}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xl md:text-2xl text-slate-700 leading-snug">{item.text}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default function PresentationPage() {
  const [activeFunction, setActiveFunction] = useState(null)
  const [detailPage, setDetailPage] = useState(0)
  const navigate = useNavigate()

  const activeDetail = activeFunction ? functionDetails[activeFunction] : null
  const detailPagesCount = activeDetail ? activeDetail.pages.length : 0

  const openFunction = useCallback((key) => {
    setActiveFunction(key)
    setDetailPage(0)
  }, [])

  const closeDetail = useCallback(() => {
    setActiveFunction(null)
    setDetailPage(0)
  }, [])

  const goNext = useCallback(() => {
    setDetailPage((p) => Math.min(p + 1, detailPagesCount - 1))
  }, [detailPagesCount])

  const goPrev = useCallback(() => {
    setDetailPage((p) => Math.max(p - 1, 0))
  }, [])

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!activeDetail) {
        if (e.key === 'Escape') navigate('/')
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        goPrev()
      } else if (e.key === 'Escape') {
        closeDetail()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeDetail, goNext, goPrev, navigate, closeDetail])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      {activeDetail ? (
        <>
          <button
            onClick={closeDetail}
            className="absolute z-10 top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Funksiyalar
          </button>

          <div
            className="relative z-0 flex h-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${detailPage * 100}%)` }}
          >
            {activeDetail.pages.map((page) => {
              const Icon = activeDetail.icon
              return (
                <div
                  key={page.heading}
                  className="w-full h-full flex-shrink-0 flex flex-col justify-center px-10 md:px-24"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <p className="text-emerald-600 font-semibold tracking-widest text-lg">
                      {activeDetail.title.toUpperCase()}
                    </p>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-slate-900">{page.heading}</h2>
                  <Bullets items={page.bullets} />
                </div>
              )
            })}
          </div>

          {detailPage > 0 && (
            <button
              onClick={goPrev}
              className="absolute z-10 left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-2"
              aria-label="Oldingi"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}
          {detailPage < detailPagesCount - 1 && (
            <button
              onClick={goNext}
              className="absolute z-10 right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors p-2"
              aria-label="Keyingi"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          <div className="absolute z-10 bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
            <div className="flex gap-2">
              {activeDetail.pages.map((page, i) => (
                <button
                  key={page.heading}
                  onClick={() => setDetailPage(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i === detailPage ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`${i + 1}-betga o'tish`}
                />
              ))}
            </div>
            <span className="text-slate-400 text-xs font-medium">
              {detailPage + 1} / {detailPagesCount}
            </span>
          </div>
        </>
      ) : (
        <div className="h-full flex items-center px-10 md:px-20">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
            {/* Chap: sarlavha */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <img src={logoMarkaz} alt="Markaz logo" className="w-28 h-28 object-contain mb-8" />
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">ECO EXPERT AI</h1>
              <p className="text-2xl md:text-3xl text-slate-600 max-w-lg leading-snug">
                Ekologik ekspertiza arizalarini sun'iy intellekt yordamida{' '}
                <span className="text-emerald-600 font-semibold">tezkor, shaffof va xolisona</span>{' '}
                baholovchi platforma
              </p>
            </div>

            {/* O'ng: funksiya kartalari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {functionCards.map((f) => {
                const Icon = f.icon
                return (
                  <button
                    key={f.key}
                    onClick={() => openFunction(f.key)}
                    className="text-left bg-white border border-slate-200 rounded-2xl p-7 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h3 className="text-slate-900 text-2xl font-semibold mb-2">{f.title}</h3>
                    <p className="text-slate-500 text-base">{f.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => navigate('/')}
        className="absolute z-10 top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Yopish"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  )
}
