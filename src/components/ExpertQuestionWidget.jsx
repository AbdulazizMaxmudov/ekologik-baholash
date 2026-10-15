import { useState, useRef, useEffect } from 'react'
import { sendAssistantMessage } from '../utils/assistant'
import { buildDocumentParts } from '../utils/gemini'
import { Bot, User, Send, MessageCircle, X } from 'lucide-react'
import { useI18n, translate } from '../i18n'

const WELCOME_BASE = "Salom! Xulosa yozish jarayonida savollaringiz bo'lsa, shu yerdan so'rang."
const WELCOME_SOURCES = {
  base: '234-son qaror asosida javob beraman.',
  withProject: '234-son qaror va shu ariza/loyiha hujjatlari asosida javob beraman.',
  withEmissions: "234-son qaror va korxonalarning tashlanmalari bo'yicha jamlanma ma'lumot asosida javob beraman.",
  withBoth: "234-son qaror, shu ariza/loyiha hujjatlari va korxonalarning tashlanmalari bo'yicha jamlanma ma'lumot asosida javob beraman.",
}

function WidgetMessage({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-slate-700' : 'bg-emerald-500'}`}>
        {isUser ? <User className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
      </div>
      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
        isUser ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'
      }`}>
        {text}
      </div>
    </div>
  )
}

function WidgetTyping() {
  return (
    <div className="flex gap-2">
      <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-3 h-3 text-white" />
      </div>
      <div className="bg-slate-100 rounded-xl rounded-tl-sm px-3 py-2.5 flex items-center gap-1">
        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce" />
      </div>
    </div>
  )
}

let nextId = 0
const makeId = () => `q-${Date.now()}-${nextId++}`

// Floating "savol-javob" widget — Expert Assistant sahifasida xulosa yozayotgan
// ekspert uchun, boshqa sahifalarga ham xuddi shunday joylashtirish mumkin bo'lsin
// deb mustaqil komponent qilib ajratilgan. `utils/assistant.js`dagi 234-qaror
// asosidagi yordamchini qayta ishlatadi — AiAssistantPage bilan bir xil mantiq,
// faqat bu yerda ixtiyoriy ravishda aniq bir loyihaga (`arizaSource`) va/yoki
// tashlanmalar jamlanmasiga (`emissionsAware`) ham asoslanadi.
//
// `arizaSource` — ariza fayli (File yoki URL string); berilgan bo'lsa, ariza
// va unga ilova qilingan loyiha hujjatlari birinchi savolda bir marta
// yuklanadi (`buildDocumentParts`) va shu sessiya davomida qayta ishlatiladi
// — har bir xabar uchun qayta yuklab olinmaydi.
export default function ExpertQuestionWidget({ arizaSource = null, emissionsAware = false }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const projectPartsRef = useRef(null)

  const welcome = `${t(WELCOME_BASE)} ${t(
    arizaSource && emissionsAware ? WELCOME_SOURCES.withBoth
      : arizaSource ? WELCOME_SOURCES.withProject
      : emissionsAware ? WELCOME_SOURCES.withEmissions
      : WELCOME_SOURCES.base
  )}`

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items.length, loading, open])

  const getProjectParts = async () => {
    if (!arizaSource) return null
    if (!projectPartsRef.current) {
      projectPartsRef.current = buildDocumentParts(arizaSource).catch(() => null)
    }
    return projectPartsRef.current
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const history = items.map(({ role, text }) => ({ role, text }))
    setItems(prev => [...prev, { id: makeId(), role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const projectParts = await getProjectParts()
      const reply = await sendAssistantMessage(history, text, { projectParts, includeEmissions: emissionsAware })
      setItems(prev => [...prev, { id: makeId(), role: 'model', text: reply }])
    } catch (err) {
      setItems(prev => [...prev, { id: makeId(), role: 'model', text: err.message || translate("Xatolik yuz berdi. Qaytadan urinib ko'ring.") }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 md:right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-500 text-white flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Bot className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-semibold truncate">{t('Yordamchi')}</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-emerald-600 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            <WidgetMessage role="model" text={welcome} />
            {items.map(it => <WidgetMessage key={it.id} role={it.role} text={it.text} />)}
            {loading && <WidgetTyping />}
            <div ref={bottomRef} />
          </div>
          <div className="p-2.5 border-t border-slate-200 flex items-end gap-2 flex-shrink-0">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={t('Savolingizni yozing...')}
              className="flex-1 min-w-0 resize-none px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent max-h-24"
            />
            <button onClick={handleSend} disabled={!input.trim() || loading}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen(v => !v)} title={t("Yordamchidan so'rash")}
        className="fixed bottom-5 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-colors">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </>
  )
}
