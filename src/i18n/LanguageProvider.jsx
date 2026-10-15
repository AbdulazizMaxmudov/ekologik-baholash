import { useCallback, useEffect, useMemo, useState } from 'react'
import { LanguageContext } from './context'
import { getCurrentLang, setCurrentLang, isSupportedLang, saveLang, translate, translateGeo, formatNumber } from './core'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getCurrentLang)

  useEffect(() => {
    setCurrentLang(lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    if (!isSupportedLang(next)) return
    setCurrentLang(next)
    saveLang(next)
    setLangState(next)
  }, [])

  const value = useMemo(() => ({
    lang,
    setLang,
    t: (key, vars) => translate(key, vars, lang),
    tg: name => translateGeo(name, lang),
    fmt: n => formatNumber(n, lang),
  }), [lang, setLang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
