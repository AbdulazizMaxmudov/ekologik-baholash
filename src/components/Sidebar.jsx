import { NavLink, useLocation } from 'react-router-dom'
import { Leaf, Bot } from 'lucide-react'
import logoMarkaz from '../assets/logo_Markaz.png'

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const isCompanies =
    location.pathname === '/' || location.pathname.startsWith('/company/')

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-56 flex-shrink-0 bg-slate-900 flex flex-col h-full transition-transform duration-200 md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
        <img src={logoMarkaz} alt="Markaz logo" className="w-10 h-10 object-contain flex-shrink-0" />
        <div>
          <p className="text-white font-bold text-sm leading-tight">Eco Reyting</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink
          to="/"
          onClick={onClose}
          className={() =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isCompanies
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Leaf className="w-4 h-4 flex-shrink-0" />
          <span>Loyihachi korxonalar</span>
        </NavLink>

        <NavLink
          to="/ai-baholash"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Bot className="w-4 h-4 flex-shrink-0" />
          <span>AI baholash</span>
        </NavLink>
      </nav>

      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">© 2026 Eco Reyting</p>
      </div>
    </aside>
  )
}
