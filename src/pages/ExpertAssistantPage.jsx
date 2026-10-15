import { useState } from 'react'
import { ARIZALAR } from '../data/arizalar'
import { ARIZA_FILES } from '../data/arizaFiles'
import ExpertQuestionWidget from '../components/ExpertQuestionWidget'
import { NotebookPen, ClipboardList, Search, FileEdit, ArrowLeft } from 'lucide-react'
import { useI18n } from '../i18n'

function CategoryBadge({ category }) {
  const { t } = useI18n()
  const cls = category === 'I toifa'
    ? 'bg-red-50 text-red-600'
    : category === 'II toifa'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700'
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{t(category)}</span>
}

// Xulosa yozish uchun ariza tanlash ro'yxati — ArizalarPage bilan bir xil
// ma'lumot (`ARIZALAR`/`ARIZA_FILES`) va jadval ko'rinishidan foydalanadi,
// faqat "Tekshirish" o'rniga "Xulosa yozish" tugmasi bilan.
function ArizaListView({ onSelect }) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')

  const filtered = search
    ? ARIZALAR.filter(a =>
        a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        a.orderNum.includes(search) ||
        a.object.toLowerCase().includes(search.toLowerCase()))
    : ARIZALAR

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{t('Expert Assistant')}</h1>
        <p className="text-slate-500 text-sm mt-0.5">{t('Xulosa yozish uchun arizani tanlang')}</p>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={t("Buyurtma raqami, tashkilot yoki obyekt bo'yicha qidirish...")}
          className="pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent w-full" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">{t("Arizalar ro'yxati")}</h2>
          <span className="text-xs text-slate-400">{t('{n} ta ariza', { n: filtered.length })}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['#', 'Buyurtma raqami va sanasi', 'Xulosa yozish', 'F.I.Sh.', 'Telefon raqami', 'AMT darajasi', 'Material turi', 'STIR/JSHSHIR', 'Ekspertiza obyekti'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{t(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((a, idx) => (
                <tr key={a.orderNum} onClick={() => onSelect(a)}
                  className="hover:bg-slate-50 transition-colors align-top cursor-pointer">
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <p className="font-mono text-xs font-semibold text-slate-700">№{a.orderNum}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.orderDate}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={e => { e.stopPropagation(); onSelect(a) }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap">
                      <FileEdit className="w-3.5 h-3.5" /> {t('Xulosa yozish')}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 min-w-[220px] max-w-[260px]">
                    <p className="text-xs font-medium text-slate-700 leading-snug">{a.applicantName}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap font-mono">{a.phone}</td>
                  <td className="px-4 py-3.5"><CategoryBadge category={a.category} /></td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono font-medium whitespace-nowrap">{a.materialType}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap font-mono">{a.stir}</td>
                  <td className="px-4 py-3.5 min-w-[260px] max-w-[360px]">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3" title={a.object}>{a.object}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{t('Ariza topilmadi')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Ekspert xulosa yozish maydoni — Word'ga o'xshash oddiy sahifa (sarlavha +
// matn). Alohida saqlash/format vositalari yo'q, chunki hozircha faqat matn
// yozish va kerak bo'lganda yordamchidan so'rash (ExpertQuestionWidget) talab
// qilingan. `key={ariza.orderNum}` orqali ExpertAssistantPage'da har safar
// boshqa ariza tanlanganda qayta yaratiladi — shu bilan oldingi qoralama
// keyingi arizaga o'tib qolmaydi.
function XulosaEditorView({ ariza, onBack }) {
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} title={t("Arizalar ro'yxatiga qaytish")}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <NotebookPen className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-800 truncate">{t('Xulosa — Ariza №{n}', { n: ariza.orderNum })}</h1>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{ariza.applicantName}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6">
        <div className="max-w-3xl mx-auto bg-white rounded-sm shadow-md border border-slate-200 px-6 md:px-16 py-10 md:py-14 min-h-[1000px]">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t('Xulosa sarlavhasi...')}
            className="w-full text-2xl font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal focus:outline-none mb-6 font-serif"
          />
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('Xulosa matnini shu yerga yozing...')}
            className="w-full min-h-[700px] resize-none text-[15px] leading-relaxed text-slate-700 placeholder:text-slate-300 focus:outline-none font-serif"
          />
        </div>
      </div>

      <ExpertQuestionWidget arizaSource={ARIZA_FILES[ariza.orderNum] ?? null} emissionsAware />
    </div>
  )
}

export default function ExpertAssistantPage() {
  const [activeAriza, setActiveAriza] = useState(null)

  if (activeAriza) {
    return <XulosaEditorView key={activeAriza.orderNum} ariza={activeAriza} onBack={() => setActiveAriza(null)} />
  }

  return <ArizaListView onSelect={setActiveAriza} />
}
