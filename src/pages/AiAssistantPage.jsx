import { useState, useRef, useEffect } from 'react'
import { sendAssistantMessage } from '../utils/assistant'
import { Bot, User, Send, Sparkles, FileText } from 'lucide-react'

const WELCOME = "Salom! Men 234-son qaror bo'yicha yordamchi AI'man. Faqat shu hujjat asosida javob beraman. Savolingizni yozing."

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

export default function AiAssistantPage() {
  // Real exchanged turns only (sent to the API as history). The static
  // welcome message is shown but never sent — it didn't come from Gemini.
  const [apiMessages, setApiMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const messages = [{ role: 'model', text: WELCOME }, ...apiMessages]

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, loading])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const history = apiMessages
    setApiMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const reply = await sendAssistantMessage(history, text)
      setApiMessages(prev => [...prev, { role: 'model', text: reply }])
    } catch (err) {
      setApiMessages(prev => [...prev, { role: 'model', text: err.message || "Xatolik yuz berdi. Qaytadan urinib ko'ring." }])
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
    <div className="flex flex-col h-full">
      <div className="px-4 md:px-6 py-4 border-b border-slate-200 bg-white flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-slate-800">AI Assistant</h1>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <FileText className="w-3 h-3" /> 234-son qaror asosida javob beradi
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((m, i) => <Message key={i} role={m.role} text={m.text} />)}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 border-t border-slate-200 bg-white flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="234-son qaror bo'yicha savolingizni yozing..."
            className="flex-1 resize-none px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent max-h-32"
          />
          <button onClick={handleSend} disabled={!input.trim() || loading}
            className="flex-shrink-0 w-11 h-11 flex items-center justify-center bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
