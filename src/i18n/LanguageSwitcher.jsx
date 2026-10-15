import { useI18n } from './context'
import { LANGUAGES } from './core'

export function LanguageSwitcher({ variant = 'dark', className = '' }) {
  const { lang, setLang } = useI18n()
  const base = variant === 'dark'
    ? { wrap: 'bg-slate-800', on: 'bg-emerald-500 text-white', off: 'text-slate-400 hover:text-white' }
    : { wrap: 'bg-white/10 backdrop-blur', on: 'bg-white text-slate-900', off: 'text-white/70 hover:text-white' }
  return (
    <div className={`flex items-center gap-0.5 rounded-lg p-0.5 ${base.wrap} ${className}`}>
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLang(l.code)}
          title={l.label}
          aria-pressed={lang === l.code}
          className={`flex-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${lang === l.code ? base.on : base.off}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
