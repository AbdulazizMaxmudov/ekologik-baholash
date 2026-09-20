import { useState, useRef, useCallback, useEffect } from 'react'
import { evaluateProject, checkArizaAcceptance } from '../utils/gemini'
import { Upload, FileText, X, Sparkles, XCircle, CheckCircle, CheckCircle2, HelpCircle, AlertTriangle, ChevronDown, ChevronUp, RotateCcw, ArrowRight } from 'lucide-react'

function scoreColor(score, max = 20) {
  const pct = (score / max) * 100
  if (pct >= 75) return { bar: 'bg-emerald-500', text: 'text-emerald-700' }
  if (pct >= 50) return { bar: 'bg-amber-400',   text: 'text-amber-700'   }
  return               { bar: 'bg-red-400',      text: 'text-red-700'     }
}

function totalColor(score) {
  if (score >= 80) return { ring: 'ring-emerald-400', text: 'text-emerald-600', label: 'Yashil'  }
  if (score >= 50) return { ring: 'ring-amber-400',   text: 'text-amber-600',   label: 'Sariq'   }
  return               { ring: 'ring-red-400',       text: 'text-red-600',     label: 'Qizil'   }
}

export function UploadZone({ file, onFile, onClear }) {
  const inputRef = useRef()
  const [drag, setDrag] = useState(false)

  const onDrop = useCallback(e => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') onFile(f)
  }, [onFile])

  if (file) return (
    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText className="w-5 h-5 text-emerald-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">{(file.size/1024/1024).toFixed(1)} MB • PDF</p>
      </div>
      <button onClick={onClear} className="p-1.5 hover:bg-emerald-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  )

  return (
    <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop}
      onClick={()=>inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl px-6 py-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${
        drag ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
      }`}>
      <input ref={inputRef} type="file" accept=".pdf" className="hidden"
        onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Upload className="w-7 h-7 text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-700 mb-1">PDF faylni bu yerga tashlang</p>
      <p className="text-xs text-slate-400">yoki bosib tanlang • Maksimum 50 MB</p>
    </div>
  )
}

function LoadingState({ elapsed, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-emerald-500" />
        </div>
      </div>
      <p className="text-base font-semibold text-slate-800 mb-1">{label || 'AI hujjatlarni tahlil qilmoqda...'}</p>
      <p className="text-sm text-slate-400 mb-6">{elapsed} soniya o'tdi</p>
      <p className="text-xs text-slate-400 max-w-xs text-center">100 sahifali hujjat uchun 30–90 soniya ketishi mumkin</p>
    </div>
  )
}

function CriterionRow({ item }) {
  const [open, setOpen] = useState(false)
  const c = scoreColor(item.assigned_score, 20)
  const pct = Math.round((item.assigned_score / 20) * 100)
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(v=>!v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
        <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
          {item.criterion_number}
        </span>
        <span className="flex-1 text-sm text-slate-700 font-medium">{item.criterion_name}</span>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
            <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${pct}%` }} />
          </div>
          <span className={`text-sm font-bold w-16 text-right ${c.text}`}>{item.assigned_score}/20</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">{item.justification}</p>
          {item.evidence_citation && <p className="text-xs text-slate-400 italic">📄 {item.evidence_citation}</p>}
        </div>
      )}
    </div>
  )
}

const QABUL_HOLATI = {
  bajarilgan:       { icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50', label: 'Bajarilgan' },
  bajarilmagan:     { icon: XCircle,      cls: 'text-red-600 bg-red-50',        label: 'Bajarilmagan' },
  aniqlab_bolmadi:  { icon: HelpCircle,   cls: 'text-amber-600 bg-amber-50',    label: "Aniqlab bo'lmadi" },
}

function QabulRow({ item }) {
  const [open, setOpen] = useState(false)
  const h = QABUL_HOLATI[item.holati] || QABUL_HOLATI.aniqlab_bolmadi
  const Icon = h.icon
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left">
        <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
          {item.band}
        </span>
        <span className="flex-1 text-sm text-slate-700">{item.talab}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${h.cls}`}>
            <Icon className="w-3.5 h-3.5" /> {h.label}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <p className="text-xs text-slate-600 leading-relaxed">{item.izoh}</p>
          {item.manba && <p className="text-xs text-slate-400 italic">📄 {item.manba}</p>}
        </div>
      )}
    </div>
  )
}

// Ariza qabul qilish talablari (234-son qaror, 17 band) tekshiruvi natijasi —
// loyihani mazmunan ballashdan (ResultView) oldingi dastlabki bosqich.
function AcceptanceView({ acceptance, onProceed, onReset, onReject }) {
  const { talablar = [], xulosa } = acceptance
  const accepted = !!xulosa?.qabul_qilinishi_mumkin

  return (
    <div className="space-y-5">
      <div className={`flex items-start gap-3 rounded-xl p-4 border ${
        accepted ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
      }`}>
        {accepted
          ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          : <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
        <div>
          <p className={`text-sm font-semibold ${accepted ? 'text-emerald-700' : 'text-red-700'}`}>
            {accepted ? 'Ariza qabul qilinishi mumkin' : 'Ariza qabul qilinishi mumkin emas'}
          </p>
          {xulosa?.umumiy_izoh && (
            <p className={`text-xs mt-0.5 ${accepted ? 'text-emerald-600' : 'text-red-600'}`}>{xulosa.umumiy_izoh}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Ariza qabul qilish talablari</h3>
          <span className="text-xs text-slate-400">{talablar.length} ta band</span>
        </div>
        <div className="p-4 space-y-2">
          {talablar.map((item) => <QabulRow key={item.band} item={item} />)}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onReject && (
          <button onClick={() => onReject(acceptance)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 bg-white text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">
            <XCircle className="w-4 h-4" /> Rad etish
          </button>
        )}
        <button onClick={onProceed}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
          Loyihani baholashga o'tish <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <button onClick={onReset}
        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
        <RotateCcw className="w-4 h-4" /> Yangi ariza tekshirish
      </button>
    </div>
  )
}

function ResultView({ result, onReset, onAccept, onReject }) {
  const { project_identification: pi, evaluation_matrix: matrix, summary } = result
  const tc  = totalColor(summary.total_score)
  const pct = summary.total_score

  return (
    <div className="space-y-5">
      {pi?.critical_violation_found && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Jiddiy qoidabuzarlik aniqlandi — 0 ball</p>
            <p className="text-xs text-red-600 mt-0.5">{pi.critical_violation_reason}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
              Loyiha turi: {pi?.project_type}
            </span>
            <h2 className="text-base font-bold text-slate-800 leading-snug mt-2 mb-1">{pi?.project_title}</h2>
            {pi?.developer_name && <p className="text-xs text-slate-500">{pi.developer_name}</p>}
          </div>
          <div className={`flex-shrink-0 w-24 h-24 rounded-full ring-4 ${tc.ring} flex flex-col items-center justify-center`}>
            <span className={`text-3xl font-bold ${tc.text}`}>{summary.total_score}</span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{summary.category}</span>
            <span className={`font-semibold ${tc.text}`}>{tc.label}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${pct>=80?'bg-emerald-500':pct>=50?'bg-amber-400':'bg-red-400'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Mezonlar bo'yicha baholash</h3>
        </div>
        <div className="p-4 space-y-2">
          {(matrix||[]).map((item,idx) => <CriterionRow key={idx} item={item} />)}
        </div>
      </div>

      {summary?.main_deficiencies?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Asosiy kamchiliklar</h3>
          <ul className="space-y-2">
            {summary.main_deficiencies.map((d,i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />{d}
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAccept || onReject ? (
        <div className="flex items-center gap-3">
          <button onClick={() => onReject?.(result)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 bg-white text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">
            <XCircle className="w-4 h-4" /> Rad etish
          </button>
          <button onClick={() => onAccept?.(result)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
            <CheckCircle className="w-4 h-4" /> Qabul qilish
          </button>
        </div>
      ) : (
        <button onClick={onReset}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
          <RotateCcw className="w-4 h-4" /> Yangi loyiha baholash
        </button>
      )}
    </div>
  )
}

// Reusable evaluation flow, used inline in AiAssistantPage's chat (after a
// "/baholash" trigger) and inside a modal (ArizalarPage "Tekshirish" button).
// If `initialFile`/`initialLink` is given with `autoStart`, evaluation kicks
// off automatically on mount.
export default function AiEvaluationPanel({ initialFile = null, initialLink = '', autoStart = false, onAccept, onReject }) {
  const hasAutoSource = autoStart && !!(initialFile || initialLink)
  const [file, setFile]     = useState(initialFile)
  // idle -> checking (17 talab) -> checked -> loading (100 ball) -> done
  const [status, setStatus] = useState(hasAutoSource ? 'checking' : 'idle')
  const [acceptance, setAcceptance] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const autoStartedRef = useRef(false)
  // Tracks whichever source (uploaded File or initialLink URL) the acceptance
  // check actually ran against, so "proceed to scoring" can reuse it even
  // when auto-started from a link (file state stays null in that case).
  const sourceRef = useRef(null)

  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(() => setElapsed(s => s+1), 1000) }
  const stopTimer  = () => clearInterval(timerRef.current)

  const source = file

  const runAcceptanceCheck = useCallback(async (src) => {
    if (!src) return
    sourceRef.current = src
    setStatus('checking'); setAcceptance(null); setResult(null); setError(''); startTimer()
    try {
      const res = await checkArizaAcceptance(src)
      setAcceptance(res); setStatus('checked')
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      setStatus('error')
    } finally { stopTimer() }
  }, [])

  const runEvaluation = useCallback(async (src) => {
    if (!src) return
    setStatus('loading'); setResult(null); setError(''); startTimer()
    try {
      const res = await evaluateProject(src)
      setResult(res); setStatus('done')
    } catch (err) {
      setError(err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring.")
      setStatus('error')
    } finally { stopTimer() }
  }, [])

  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      const initialSource = initialFile || initialLink
      if (initialSource) {
        autoStartedRef.current = true
        runAcceptanceCheck(initialSource)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = () => { setFile(null); setStatus('idle'); setAcceptance(null); setResult(null); setError('') }

  if (status === 'done' && result) {
    return <ResultView result={result} onReset={handleReset} onAccept={onAccept} onReject={onReject} />
  }

  if (status === 'checked' && acceptance) {
    return (
      <AcceptanceView acceptance={acceptance} onReset={handleReset}
        onProceed={() => runEvaluation(sourceRef.current)}
        onReject={onReject ? () => onReject(acceptance) : null} />
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {status === 'checking' || status === 'loading' ? (
        <LoadingState elapsed={elapsed}
          label={status === 'checking' ? 'AI arizani qabul qilish talablari bo\'yicha tekshirmoqda...' : 'AI loyihani mezonlar bo\'yicha baholamoqda...'} />
      ) : (
        <div className="space-y-5">
          <UploadZone file={file} onFile={setFile} onClear={() => setFile(null)} />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <button onClick={() => runAcceptanceCheck(source)} disabled={!source}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Sparkles className="w-4 h-4" /> Tekshirishni boshlash
          </button>
          <p className="text-xs text-slate-400 text-center">Faqat PDF format • Maksimum 50 MB • 100 sahifagacha</p>
        </div>
      )}
    </div>
  )
}
