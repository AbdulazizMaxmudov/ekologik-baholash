import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import CompaniesPage from './pages/CompaniesPage'
import CompanyDetailPage from './pages/CompanyDetailPage'
import AiPage from './pages/AiPage'
import ArizalarPage from './pages/ArizalarPage'
import XulosalarPage from './pages/XulosalarPage'
import AiAssistantPage from './pages/AiAssistantPage'
import XaritaPage from './pages/XaritaPage'
import AiTaqqoslashPage from './pages/AiTaqqoslashPage'
import PresentationPage from './pages/PresentationPage'

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (location.pathname === '/taqdimot') {
    return (
      <Routes>
        <Route path="/taqdimot" element={<PresentationPage />} />
      </Routes>
    )
  }

  return (
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
            <span className="text-white font-bold text-sm">ECO EXPERT AI</span>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/loyihachilar" element={<CompaniesPage />} />
              <Route path="/company/:id" element={<CompanyDetailPage />} />
              <Route path="/ai-baholash" element={<AiPage />} />
              <Route path="/arizalar" element={<ArizalarPage />} />
              <Route path="/xulosalar" element={<XulosalarPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/xarita" element={<XaritaPage />} />
              <Route path="/ai-taqqoslash" element={<AiTaqqoslashPage />} />
            </Routes>
          </main>
        </div>
      </div>
  )
}
