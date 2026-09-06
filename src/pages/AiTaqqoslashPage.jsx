import { useState, useRef, useCallback } from 'react'
import {
  Building2, FileText, ChevronLeft, ChevronRight, ArrowLeft,
  Sparkles, X, AlertTriangle, CheckCircle2, AlertCircle, XCircle, ScanSearch,
} from 'lucide-react'
import { TAQQOSLASH_KORXONALAR } from '../data/taqqoslashKorxonalar'
import { TAQQOSLASH_FILES } from '../data/taqqoslashFiles'
import { compareArizalar } from '../utils/gemini'

const PAGE_SIZE = 4

function KorxonaCard({ korxona, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-emerald-300 transition-all group flex-1 min-w-[220px]"
    >
      <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
        <Building2 className="w-5 h-5 text-emerald-600" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors mb-1">
        {korxona.korxona_nomi}
      </h3>
      <p className="text-xs text-slate-400 font-mono mb-3">INN: {korxona.inn}</p>
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
        <FileText className="w-3 h-3" /> {korxona.arizalar.length} ta hulosa
      </span>
    </button>
  )
}

const DAVR_LABEL = { hozirgi: 'Hozirgi', avvalgi: 'Avvalgi' }

function ArizaCard({ ariza, onDragStart, disabled }) {
  return (
    <div
      draggable={!disabled}
      onDragStart={(e) => onDragStart(e, ariza)}
      className={`bg-white rounded-xl border border-slate-200 p-4 transition-all ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:border-emerald-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          ariza.davr === 'hozirgi' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {DAVR_LABEL[ariza.davr] || ariza.davr}
        </span>
        <span className="text-xs text-slate-400 font-mono">№{ariza.ariza_raqami}</span>
      </div>
      <p className="text-sm text-slate-700 leading-snug line-clamp-2 mb-2">{ariza.ekspertiza_obyekti}</p>
      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <span>{ariza.ariza_kelgan_sanasi}</span>
        {ariza.material_turi && (
          <span className="px-1.5 py-0.5 bg-slate-100 rounded font-mono">{ariza.material_turi}</span>
        )}
      </div>
      <p className="text-xs text-slate-400 italic mt-1.5 truncate">{ariza.statusi}</p>
      <p className="text-[10px] text-slate-300 mt-2">⠿ Sudrab olib o'ting</p>
    </div>
  )
}

function DropSlot({ label, ariza, onDrop, onClear, dragOver, onDragOver, onDragLeave }) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`flex-1 min-h-[120px] rounded-xl border-2 border-dashed p-4 flex flex-col justify-center transition-colors ${
        dragOver ? 'border-emerald-400 bg-emerald-50' : ariza ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <p className="text-xs font-semibold text-slate-500 mb-2">{label}</p>
      {ariza ? (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">№{ariza.ariza_raqami} ({DAVR_LABEL[ariza.davr]})</p>
            <p className="text-xs text-slate-500 truncate">{ariza.ekspertiza_obyekti}</p>
          </div>
          <button onClick={onClear} className="p-1 hover:bg-emerald-100 rounded text-slate-400 hover:text-slate-600 flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center">Ariza kartasini shu yerga tashlang</p>
      )}
    </div>
  )
}

function VerdictBadge({ verdict }) {
  const map = {
    mos: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Mos keladi' },
    qisman_mos: { icon: AlertCircle, cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Qisman mos' },
    nomuvofiq: { icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-200', label: 'Nomuvofiqlik aniqlandi' },
  }
  const v = map[verdict] || map.qisman_mos
  const Icon = v.icon
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${v.cls}`}>
      <Icon className="w-4 h-4" /> {v.label}
    </span>
  )
}

const MUHIMLIK_CLS = {
  yuqori: 'bg-red-50 text-red-600 border-red-200',
  "o'rta": 'bg-amber-50 text-amber-600 border-amber-200',
  past: 'bg-slate-100 text-slate-500 border-slate-200',
}

function CompareResult({ result }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <VerdictBadge verdict={result.moslik_xulosasi} />
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">{result.moslik_izohi}</p>
      </div>

      {result.nomuvofiqliklar?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Aniqlangan nomuvofiqliklar</h3>
          <div className="space-y-3">
            {result.nomuvofiqliklar.map((n, i) => (
              <div key={i} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <p className="text-sm font-semibold text-slate-800">{n.mezon}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${MUHIMLIK_CLS[n.muhimlik] || MUHIMLIK_CLS.past}`}>
                    {n.muhimlik} muhimlik
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">1-ariza</p>
                    <p className="text-sm text-slate-700">{n.ariza_1_qiymati}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">2-ariza</p>
                    <p className="text-sm text-slate-700">{n.ariza_2_qiymati}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{n.izoh}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.mos_keluvchi_korsatkichlar?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Mos keluvchi ko'rsatkichlar</h3>
          <ul className="space-y-1.5">
            {result.mos_keluvchi_korsatkichlar.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function KorxonalarList({ onSelect }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(TAQQOSLASH_KORXONALAR.length / PAGE_SIZE))
  const pageItems = TAQQOSLASH_KORXONALAR.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-5">
        {pageItems.map((k) => (
          <KorxonaCard key={k.inn} korxona={k} onClick={() => onSelect(k)} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

function KorxonaDetail({ korxona, onBack }) {
  const [slotA, setSlotA] = useState(null)
  const [slotB, setSlotB] = useState(null)
  const [dragOverSlot, setDragOverSlot] = useState(null)
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  const handleDragStart = (e, ariza) => {
    e.dataTransfer.setData('text/plain', ariza.ariza_raqami)
  }

  const findAriza = (raqami) => korxona.arizalar.find((a) => a.ariza_raqami === raqami)

  const handleDrop = (setSlot) => (e) => {
    e.preventDefault()
    setDragOverSlot(null)
    const raqami = e.dataTransfer.getData('text/plain')
    const found = findAriza(raqami)
    if (found) setSlot(found)
  }

  const runCompare = useCallback(async () => {
    if (!slotA || !slotB) return
    const urlA = TAQQOSLASH_FILES[slotA.ariza_raqami]
    const urlB = TAQQOSLASH_FILES[slotB.ariza_raqami]
    if (!urlA || !urlB) {
      setError('Ariza uchun PDF fayl topilmadi')
      setStatus('error')
      return
    }
    setStatus('loading')
    setError('')
    setResult(null)
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    try {
      const res = await compareArizalar(urlA, urlB)
      setResult(res)
      setStatus('done')
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      setStatus('error')
    } finally {
      clearInterval(timerRef.current)
    }
  }, [slotA, slotB])

  const handleReset = () => {
    setSlotA(null)
    setSlotB(null)
    setStatus('idle')
    setResult(null)
    setError('')
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Korxonalar ro'yxatiga qaytish
      </button>

      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-800">{korxona.korxona_nomi}</h2>
        <p className="text-sm text-slate-400 font-mono">INN: {korxona.inn}</p>
      </div>

      {/* 2 ta drop-slot */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <DropSlot
          label="1-ariza"
          ariza={slotA}
          dragOver={dragOverSlot === 'A'}
          onDragOver={(e) => { e.preventDefault(); setDragOverSlot('A') }}
          onDragLeave={() => setDragOverSlot(null)}
          onDrop={handleDrop(setSlotA)}
          onClear={() => setSlotA(null)}
        />
        <DropSlot
          label="2-ariza"
          ariza={slotB}
          dragOver={dragOverSlot === 'B'}
          onDragOver={(e) => { e.preventDefault(); setDragOverSlot('B') }}
          onDragLeave={() => setDragOverSlot(null)}
          onDrop={handleDrop(setSlotB)}
          onClear={() => setSlotB(null)}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
        </div>
      )}

      <button
        onClick={runCompare}
        disabled={!slotA || !slotB || status === 'loading'}
        className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
      >
        <ScanSearch className="w-4 h-4" /> Solishtirish
      </button>

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center py-12 mb-6">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-700">AI ikkala arizani solishtirmoqda...</p>
          <p className="text-xs text-slate-400 mt-1">{elapsed} soniya o'tdi</p>
        </div>
      )}

      {status === 'done' && result && (
        <div className="mb-6">
          <CompareResult result={result} />
          <button onClick={handleReset}
            className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Yangi taqqoslash
          </button>
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-700 mb-3">Korxonaning arizalari</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {korxona.arizalar.map((a) => (
          <ArizaCard
            key={a.ariza_raqami}
            ariza={a}
            onDragStart={handleDragStart}
            disabled={slotA?.ariza_raqami === a.ariza_raqami || slotB?.ariza_raqami === a.ariza_raqami}
          />
        ))}
      </div>
    </div>
  )
}

export default function AiTaqqoslashPage() {
  const [selectedKorxona, setSelectedKorxona] = useState(null)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">AI Taqqoslash</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Bitta korxonaning turli davrdagi arizalarini solishtirib, ular orasidagi nomuvofiqliklarni aniqlang
        </p>
      </div>

      {selectedKorxona ? (
        <KorxonaDetail korxona={selectedKorxona} onBack={() => setSelectedKorxona(null)} />
      ) : (
        <KorxonalarList onSelect={setSelectedKorxona} />
      )}
    </div>
  )
}
