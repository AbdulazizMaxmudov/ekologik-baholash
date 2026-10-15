import { useState, useRef, useEffect, useCallback } from 'react'
import { sendAssistantMessage } from '../utils/assistant'
import AiEvaluationPanel from '../components/AiEvaluationPanel'
import { Bot, User, Send, Sparkles, FileText, Paperclip, X } from 'lucide-react'
import { useI18n, translate } from '../i18n'

const WELCOME = "Salom! Men 234-son qaror bo'yicha yordamchi AI'man. Savolingizni yozing, yoki PDF ariza biriktirib \"/baholash\" tugmasini bosing — loyihani mezonlar bo'yicha baholayman."

function Message({ role, text }) {
  const isUser = role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-slate-700' : 'bg-emerald-500'}`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser ? 'bg-slate-800 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
      }`}>
        {text}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
      </div>
    </div>
  )
}

// Ariza faylini biriktirib "/baholash" bosilganda paydo bo'ladigan blok — foydalanuvchi
// tomonidan yuborilgan fayl (o'ng tomonda) va uning ostida AiEvaluationPanel (17 talab
// tekshiruvi + 100 ballik baholash), xuddi shu faylni chatda "yubordi" deb ko'rsatiladi.
function EvaluationEntry({ file }) {
  const { t } = useI18n()
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-3 bg-slate-800 text-white text-sm flex items-center gap-2">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{file?.name || t('Ariza fayli')}</span>
          <span className="text-slate-400 font-mono text-xs">/baholash</span>
        </div>
      </div>
      <AiEvaluationPanel initialFile={file} autoStart />
    </div>
  )
}

let nextId = 0
const makeId = () => `msg-${Date.now()}-${nextId++}`

export default function AiAssistantPage() {
  // Real chat/evaluation turns only (the static welcome message below is never
  // sent to the API — it didn't come from Gemini). Two item kinds share one
  // ordered list so evaluations appear inline where the user triggered them:
  // { kind: 'text', role, text } and { kind: 'evaluation', file }.
  const { t } = useI18n()
  const [items, setItems] = useState([])
  const [input, setInput] = useState('')
  const [attachedFile, setAttachedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items.length, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const history = items.filter(it => it.kind === 'text').map(({ role, text }) => ({ role, text }))
    setItems(prev => [...prev, { id: makeId(), kind: 'text', role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const reply = await sendAssistantMessage(history, text)
      setItems(prev => [...prev, { id: makeId(), kind: 'text', role: 'model', text: reply }])
    } catch (err) {
      setItems(prev => [...prev, { id: makeId(), kind: 'text', role: 'model', text: err.message || translate("Xatolik yuz berdi. Qaytadan urinib ko'ring.") }])
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

  const handleAttach = useCallback(file => {
    if (file?.type === 'application/pdf') setAttachedFile(file)
  }, [])

  const handleBaholash = () => {
    if (!attachedFile) return
    setItems(prev => [...prev, { id: makeId(), kind: 'evaluation', file: attachedFile }])
    setAttachedFile(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-800">{t('AI Assistant')}</h1>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <FileText className="w-3 h-3" /> {t("234-son qaror bo'yicha savol-javob va ariza baholash")}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
        <div className="max-w-3xl mx-auto space-y-5">
          <Message role="model" text={t(WELCOME)} />
          {items.map(it => it.kind === 'evaluation'
            ? <EvaluationEntry key={it.id} file={it.file} />
            : <Message key={it.id} role={it.role} text={it.text} />
          )}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {attachedFile && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-700">
              <FileText className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-1 truncate font-medium">{attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="p-0.5 hover:bg-emerald-100 rounded">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
              onChange={e => { if (e.target.files[0]) handleAttach(e.target.files[0]); e.target.value = '' }} />
            <button onClick={() => fileInputRef.current?.click()} title={t('PDF fayl biriktirish')}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={t("234-son qaror bo'yicha savolingizni yozing...")}
              className="flex-1 min-w-0 resize-none px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent max-h-32"
            />
            <button onClick={handleBaholash} disabled={!attachedFile}
              title={t('Biriktirilgan arizani AI orqali baholash')}
              className="flex-shrink-0 h-11 px-3 flex items-center justify-center gap-1.5 border border-emerald-300 text-emerald-600 text-xs font-mono font-semibold rounded-xl hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
              /baholash
            </button>
            <button onClick={handleSend} disabled={!input.trim() || loading}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
