import { NavLink } from 'react-router-dom'
import { Leaf, Bot } from 'lucide-react'

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-green-600 text-white'
        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
    }`

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-800 text-lg">Eco Reyting</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            <Leaf className="w-4 h-4" />
            Loyihachi korxonalar
          </NavLink>
          <NavLink to="/ai-baholash" className={linkClass}>
            <Bot className="w-4 h-4" />
            AI baholash
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
