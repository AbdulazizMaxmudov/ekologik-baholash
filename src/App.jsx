import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import CompaniesPage from './pages/CompaniesPage'
import CompanyDetailPage from './pages/CompanyDetailPage'
import AiPage from './pages/AiPage'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-700 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-white font-bold text-sm">Eco Reyting</span>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<CompaniesPage />} />
              <Route path="/company/:id" element={<CompanyDetailPage />} />
              <Route path="/ai-baholash" element={<AiPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
