import { useState } from 'react'
import { ARIZALAR } from '../data/arizalar'
import { ARIZA_FILES } from '../data/arizaFiles'
import AiEvaluationModal from '../components/AiEvaluationModal'
import { ClipboardList, Search, SearchCheck } from 'lucide-react'

function CategoryBadge({ category }) {
  const cls = category === 'I toifa'
    ? 'bg-red-50 text-red-600'
    : category === 'II toifa'
      ? 'bg-amber-50 text-amber-700'
      : 'bg-emerald-50 text-emerald-700'
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{category}</span>
}

export default function ArizalarPage() {
  const [search, setSearch] = useState('')
  const [activeAriza, setActiveAriza] = useState(null)
  const [acceptedOrderNums, setAcceptedOrderNums] = useState(() => new Set())

  const visible = ARIZALAR.filter(a => !acceptedOrderNums.has(a.orderNum))
  const filtered = search
    ? visible.filter(a =>
        a.applicantName.toLowerCase().includes(search.toLowerCase()) ||
        a.orderNum.includes(search) ||
        a.object.toLowerCase().includes(search.toLowerCase()))
    : visible

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Arizalar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Davlat ekologik ekspertizasiga tushgan arizalar ro'yxati</p>
      </div>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buyurtma raqami, tashkilot yoki obyekt bo'yicha qidirish..."
          className="pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent w-full" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">Arizalar ro'yxati</h2>
          <span className="text-xs text-slate-400">{filtered.length} ta ariza</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['#', 'Buyurtma raqami va sanasi', 'Tekshirish', 'F.I.Sh.', 'Telefon raqami', 'AMT darajasi', 'Material turi', 'STIR/JSHSHIR', 'Ekspertiza obyekti'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((a, idx) => {
                const hasFile = !!ARIZA_FILES[a.orderNum]
                return (
                  <tr key={a.orderNum} className="hover:bg-slate-50 transition-colors align-top">
                    <td className="px-4 py-3.5 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-mono text-xs font-semibold text-slate-700">№{a.orderNum}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.orderDate}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setActiveAriza(a)}
                        title={hasFile ? 'Fayl avtomatik yuklanadi' : 'Fayl/link qo\'lda tanlanadi'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap">
                        <SearchCheck className="w-3.5 h-3.5" /> Tekshirish
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
                )
              })}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <ClipboardList className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Ariza topilmadi</p>
          </div>
        )}
      </div>

      {activeAriza && (
        <AiEvaluationModal
          orderNum={activeAriza.orderNum}
          applicantName={activeAriza.applicantName}
          fileUrl={ARIZA_FILES[activeAriza.orderNum]}
          onClose={() => setActiveAriza(null)}
          onAccept={() => setAcceptedOrderNums(prev => new Set(prev).add(activeAriza.orderNum))}
        />
      )}
    </div>
  )
}
