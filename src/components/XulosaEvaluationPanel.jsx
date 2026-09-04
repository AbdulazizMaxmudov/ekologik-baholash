import { useState, useRef, useCallback, useEffect } from 'react'
import { evaluateXulosa } from '../utils/xulosaGemini'
import { UploadZone } from './AiEvaluationPanel'
import { Sparkles, XCircle, CheckCircle, AlertTriangle } from 'lucide-react'

const SEVERITY_STYLE = {
  yuqori: { dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
  "o'rta": { dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  past: { dot: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
}

const RECOMMENDATION_STYLE = {
  'Tasdiqlash mumkin': { ring: 'ring-emerald-400', text: 'text-emerald-600' },
  "Qo'shimcha tekshirish talab etiladi": { ring: 'ring-amber-400', text: 'text-amber-600' },
  'Rad etish tavsiya etiladi': { ring: 'ring-red-400', text: 'text-red-600' },
}

function LoadingState({ elapsed }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-7 h-7 text-emerald-500" />
        </div>
      </div>
      <p className="text-base font-semibold text-slate-800 mb-1">AI xulosani tahlil qilmoqda...</p>
      <p className="text-sm text-slate-400">{elapsed} soniya o'tdi</p>
    </div>
  )
}

function ResultView({ result, onAccept, onReject }) {
  const rec = RECOMMENDATION_STYLE[result.tavsiya] ?? RECOMMENDATION_STYLE["Qo'shimcha tekshirish talab etiladi"]
  const kamchiliklar = Array.isArray(result.kamchiliklar) ? result.kamchiliklar : []

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
              Hulosa holati: {result.hulosa_holati ?? 'aniqlanmadi'}
            </span>
            <p className="text-sm text-slate-600 leading-relaxed mt-3">{result.xulosa_matni_qisqacha}</p>
          </div>
          <div className={`flex-shrink-0 px-3 py-2 rounded-xl ring-2 ${rec.ring} text-center`}>
            <p className={`text-xs font-bold ${rec.text}`}>{result.tavsiya}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Aniqlangan kamchiliklar</h3>
          <span className="text-xs text-slate-400">{kamchiliklar.length} ta</span>
        </div>
        {kamchiliklar.length ? (
          <div className="p-4 space-y-2">
            {kamchiliklar.map((k, idx) => {
              const s = SEVERITY_STYLE[k.jiddiylik] ?? SEVERITY_STYLE.past
              return (
                <div key={idx} className={`rounded-lg border px-4 py-3 ${s.bg} ${s.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <p className={`text-sm font-medium ${s.text}`}>{k.tavsif}</p>
                  </div>
                  {k.izoh && <p className="text-xs text-slate-500 mt-1.5 ml-4">{k.izoh}</p>}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <CheckCircle className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Kamchilik aniqlanmadi</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => onReject?.(result)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 bg-white text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition-colors">
          <XCircle className="w-4 h-4" /> Rad etish
        </button>
        <button onClick={() => onAccept?.(result)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-lg hover:bg-emerald-600 transition-colors">
          <CheckCircle className="w-4 h-4" /> Tasdiqlash
        </button>
      </div>
    </div>
  )
}

// Reusable xulosa-tekshirish oqimi. Agar `initialFile`/`initialLink` va `autoStart`
// berilsa (demo fayl mavjud bo'lsa), tahlil avtomatik boshlanadi. Aks holda rahbar
// xulosa PDF-ni qo'lda yuklaydi (hulosa_linki hujjat.uz'dagi JS-render sahifa bo'lgani
// uchun undan to'g'ridan-to'g'ri PDF olib bo'lmaydi).
export default function XulosaEvaluationPanel({ initialFile = null, initialLink = '', autoStart = false, onAccept, onReject }) {
  const hasAutoSource = autoStart && !!(initialFile || initialLink)
  const [file, setFile] = useState(initialFile)
  const [status, setStatus] = useState(hasAutoSource ? 'loading' : 'idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const autoStartedRef = useRef(false)

  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000) }
  const stopTimer = () => clearInterval(timerRef.current)

  const runEvaluation = useCallback(async (src) => {
    if (!src) return
    setStatus('loading'); setResult(null); setError(''); startTimer()
    try {
      const res = await evaluateXulosa(src)
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
        runEvaluation(initialSource)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'done' && result) return <ResultView result={result} onAccept={onAccept} onReject={onReject} />

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {status === 'loading' ? <LoadingState elapsed={elapsed} /> : (
        <div className="space-y-5">
          <UploadZone file={file} onFile={setFile} onClear={() => setFile(null)} />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <button onClick={() => runEvaluation(file)} disabled={!file}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Sparkles className="w-4 h-4" /> Xulosani tekshirish
          </button>
          <p className="text-xs text-slate-400 text-center">Faqat PDF format • Maksimum 50 MB</p>
        </div>
      )}
    </div>
  )
}
