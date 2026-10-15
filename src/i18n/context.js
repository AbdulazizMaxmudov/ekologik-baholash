import { createContext, useContext } from 'react'
import { translate, translateGeo, formatNumber } from './core'

export const LanguageContext = createContext({
  lang: 'uz',
  setLang: () => {},
  t: (key, vars) => translate(key, vars, 'uz'),
  tg: name => translateGeo(name, 'uz'),
  fmt: n => formatNumber(n, 'uz'),
})

export function useI18n() {
  return useContext(LanguageContext)
}
