import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, ChevronLeft, ChevronRight, Bot, Map, FileCheck2, GitCompareArrows } from 'lucide-react'
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
          "Ariza PDF formatida yuklanadi yoki havola orqali biriktiriladi",
          "Ariza ichidagi havolalar (ilova qilingan boshqa hujjatlar) tizim tomonidan avtomatik aniqlanadi va tortib olinadi",
          "Barcha hujjatlar birgalikda AI modeliga yuboriladi",
        ],
      },
      {
        heading: '234-sonli Qaror mezonlari',
        bullets: [
          "Har bir mezon (bo'lim) bo'yicha alohida ball qo'yiladi",
          "Umumiy ball mezonlar yig'indisi asosida avtomatik hisoblanadi",
          "Natijaga ko'ra loyihachi korxona Yashil, Ko'k yoki Sariq toifaga ajratiladi",
        ],
      },
      {
        heading: 'Natija va shaffoflik',
        bullets: [
          "Har bir mezon bo'yicha AI'ning izohi va asoslamasi ko'rsatiladi",
          "Natija tuzilgan (JSON) formatda saqlanib, UI'da vizual ko'rinishda chiqariladi",
          "Ekspert natijani ko'rib chiqib, kerak bo'lsa qayta baholashi mumkin",
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
          "Bitta korxonaning turli davrlarga oid barcha hujjatlari/arizalari bir joyga yig'iladi",
          "Ularning ko'rsatkichlari va mezonlari bir-biri bilan taqqoslanadi",
          "Korxonaning vaqt davomida yaxshilangan yoki yomonlashgan jihatlari aniqlanadi",
        ],
      },
      {
        heading: 'Qachon foydali',
        bullets: [
          "Bitta korxonaning ekologik holati vaqt bo'yicha qanday o'zgarganini kuzatishda",
          "Qaysi ko'rsatkich bo'yicha korxona kuchli/zaifligini aniqlashda",
        ],
      },
      {
        heading: 'Afzalligi',
        bullets: [
          "Qo'lda solishtirish paytida yo'l qo'yiladigan xatoliklarni kamaytiradi",
          "Qaror qabul qilish vaqtini bir necha barobar qisqartiradi",
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
          "Respublika, viloyat va tuman kesimida har bir korxonaning tashlanmalari (chiqindi va chiqindi gazlari) aniqlanadi",
          "O'zbekiston xaritasida viloyatni bosish orqali uning tumanlariga o'tiladi (drill-down)",
          "Har bir hudud bo'yicha ko'rsatkichlar alohida, aniq ko'rinadi",
        ],
      },
      {
        heading: "Shamol va tabiiy omillar ta'siri",
        bullets: [
          "Shamol yo'nalishi va tezligi hisobga olinib, ifloslanishning qaysi hududlarga tarqalishi xaritada vizual ko'rsatiladi",
          "Bu orqali qaysi aholi punkti yoki hudud ko'proq ta'sir ostida qolishi oldindan aniqlanadi",
        ],
      },
      {
        heading: 'Korxonaning eco-pasporti',
        bullets: [
          "Har bir korxona uchun yagona ekologik pasport (eco-pasport) shakllantiriladi",
          "Korxonaning barcha ko'rsatkichlari, tarixi va reytingi shu pasportda bir joyda jamlanadi",
          "Nazorat organlari va investorlar korxona holatini bir necha soniyada ko'rishi mumkin",
        ],
      },
      {
        heading: 'Boshqa imkoniyatlar',
        bullets: [
          "Viloyat va tumanlar o'rtasida ekologik ko'rsatkichlarni solishtirish",
          "Vaqt bo'yicha o'zgarish dinamikasini (monitoring tarixini) kuzatish",
          "Muammoli hududlarni tezda aniqlab, ustuvor ravishda chora ko'rish",
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
          "Faqat qonun hujjati matni asosida javob beradi, o'zidan narsa qo'shmaydi",
          'Foydalanuvchi qaysi tilda/yozuvda yozsa (lotin, kirill, rus), shu tilda javob qaytaradi',
        ],
      },
      {
        heading: 'Ishlash tartibi',
        bullets: [
          "234-Qaror hujjati tizimga bir marta yuklab qo'yiladi",
          'Har bir savol aynan shu hujjat konteksti asosida javoblanadi',
        ],
      },
      {
        heading: 'Foydasi',
        bullets: [
          'Mutaxassislar va tashqi foydalanuvchilar uchun tezkor ma\'lumot manbai',
          "Qonun matnini qo'lda qidirib o'tirish shart emas",
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
    <ul className="space-y-4 mt-6">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <ChevronRight className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span className="text-lg md:text-xl text-slate-700">{item}</span>
        </li>
      ))}
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
            {activeDetail.pages.map((page) => (
              <div
                key={page.heading}
                className="w-full h-full flex-shrink-0 flex flex-col justify-center px-10 md:px-24"
              >
                <p className="text-emerald-600 font-semibold tracking-widest mb-2">
                  {activeDetail.title.toUpperCase()}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">{page.heading}</h2>
                <Bullets items={page.bullets} />
              </div>
            ))}
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
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Chap: sarlavha */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <img src={logoMarkaz} alt="Markaz logo" className="w-20 h-20 object-contain mb-6" />
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">ECO EXPERT AI</h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-md">
                Ekologik ekspertiza arizalarini sun'iy intellekt yordamida{' '}
                <span className="text-emerald-600 font-semibold">tezkor, shaffof va xolisona</span>{' '}
                baholovchi platforma
              </p>
            </div>

            {/* O'ng: funksiya kartalari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {functionCards.map((f) => {
                const Icon = f.icon
                return (
                  <button
                    key={f.key}
                    onClick={() => openFunction(f.key)}
                    className="text-left bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
                  >
                    <Icon className="w-6 h-6 text-emerald-600 mb-3" />
                    <h3 className="text-slate-900 text-lg font-semibold mb-1">{f.title}</h3>
                    <p className="text-slate-500 text-sm">{f.desc}</p>
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
