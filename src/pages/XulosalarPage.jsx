import { useState } from 'react'
import { XULOSALAR } from '../data/xulosalar'
import { XULOSA_FILES } from '../data/xulosaFiles'
import XulosaCheckModal from '../components/XulosaCheckModal'
import { FileCheck2, Search, SearchCheck } from 'lucide-react'

const STORAGE_KEY = 'xulosa-reviews'

function loadReviewed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveReviewed(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // localStorage mavjud emas yoki to'lgan — vaqtinchalik holatni yo'qotamiz
  }
}

function ToifaBadge({ toifa }) {
  const cls = toifa === 'I toifa'
    ? 'bg-red-50 text-red-600'
    : toifa === 'II toifa'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700'
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{toifa}</span>
}

function XulosaTurBadge({ tur }) {
  const cls = tur === 'ijobiy' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap capitalize ${cls}`}>{tur}</span>
}

export default function XulosalarPage() {
  const [search, setSearch] = useState('')
  const [activeXulosa, setActiveXulosa] = useState(null)
  const [reviewed, setReviewed] = useState(loadReviewed)

  const markReviewed = (arizaRaqami, decision) => {
    setReviewed(prev => {
      const next = { ...prev, [arizaRaqami]: decision }
      saveReviewed(next)
      return next
    })
  }

  const visible = XULOSALAR.filter(x => !reviewed[x.ariza_raqami])
  const filtered = search
    ? visible.filter(x =>
        x.buyurtmachi_nomi.toLowerCase().includes(search.toLowerCase()) ||
        x.ariza_raqami.includes(search) ||
        x.ekspertiza_obyekti.toLowerCase().includes(search.toLowerCase()))
    : visible

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Xulosalar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Ekspertlar tomonidan yozilgan xulosalarni AI orqali tekshirish va tasdiqlash</p>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buyurtma raqami, tashkilot yoki obyekt bo'yicha qidirish..."
          className="pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent w-full" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">Ko'rib chiqilishi kerak bo'lgan xulosalar</h2>
          <span className="text-xs text-slate-400">{filtered.length} ta</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['#', 'Ariza raqami', 'Tekshirish', 'Buyurtmachi', 'Viloyat', 'Tuman', 'Toifasi', 'Material turi', 'Xulosa turi', 'Ekspertiza obyekti'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((x, idx) => {
                const hasFile = !!XULOSA_FILES[x.ariza_raqami]
                return (
                <tr key={x.ariza_raqami} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <a href={x.hulosa_linki} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline">
                      №{x.ariza_raqami}
                    </a>
                  </td>
                  <td className="px-4 py-3.5">
                    <button onClick={() => setActiveXulosa(x)}
                      title={hasFile ? 'Fayl avtomatik yuklanadi' : "Fayl qo'lda yuklanadi"}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap">
                      <SearchCheck className="w-3.5 h-3.5" /> Tekshirish
                    </button>
                  </td>
                  <td className="px-4 py-3.5 min-w-[220px] max-w-[260px]">
                    <p className="text-xs font-medium text-slate-700 leading-snug">{x.buyurtmachi_nomi}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{x.viloyat}</td>
                  <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{x.tuman}</td>
                  <td className="px-4 py-3.5"><ToifaBadge toifa={x.toifasi} /></td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono font-medium whitespace-nowrap">{x.material_turi}</span>
                  </td>
                  <td className="px-4 py-3.5"><XulosaTurBadge tur={x.hulosa_turi} /></td>
                  <td className="px-4 py-3.5 min-w-[260px] max-w-[360px]">
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3" title={x.ekspertiza_obyekti}>{x.ekspertiza_obyekti}</p>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <FileCheck2 className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Ko'rib chiqilishi kerak bo'lgan xulosa topilmadi</p>
          </div>
        )}
      </div>

      {activeXulosa && (
        <XulosaCheckModal
          arizaRaqami={activeXulosa.ariza_raqami}
          buyurtmachiNomi={activeXulosa.buyurtmachi_nomi}
          fileUrl={XULOSA_FILES[activeXulosa.ariza_raqami]}
          onClose={() => setActiveXulosa(null)}
          onAccept={() => markReviewed(activeXulosa.ariza_raqami, 'accepted')}
          onReject={() => markReviewed(activeXulosa.ariza_raqami, 'rejected')}
        />
      )}
    </div>
  )
}
