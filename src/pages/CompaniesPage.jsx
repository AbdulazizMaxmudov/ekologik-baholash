import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCompanies } from '../utils/dataUtils'
import {
  Search, Building2, CheckCircle, XCircle,
  Star, ChevronRight, BarChart3, List,
  ChevronLeft, ArrowUpDown,
} from 'lucide-react'
import DashboardTab from '../components/DashboardTab'

const SORT_OPTIONS = [
  { key: 'total',  label: 'Arizalar soni'   },
  { key: 'rating', label: "Reyting bo'yicha" },
  { key: 'ijobiy', label: "Ijobiylik %"      },
]

function CompanyCard({ company, rank, onClick }) {
  const pct = company.ijobiy_pct ?? 0
  const ratingBadge = r =>
    r >= 70 ? 'bg-emerald-100 text-emerald-700' :
    r >= 40 ? 'bg-amber-100 text-amber-700'   :
              'bg-red-100 text-red-600'

  return (
    <div onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md hover:border-emerald-300 transition-all group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center text-xs font-bold">
            {rank}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
              {company.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">PIN: {company.pin}</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 flex-shrink-0 mt-0.5 transition-colors" />
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Ijobiylik ko'rsatkichi</span>
          <span className="font-medium text-slate-700">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs flex-wrap">
        <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium">
          <Building2 className="w-3 h-3" />{company.total_projects} ta
        </span>
        <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md font-medium">
          <CheckCircle className="w-3 h-3" />{company.ijobiy}
        </span>
        <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md font-medium">
          <XCircle className="w-3 h-3" />{company.salbiy}
        </span>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium ml-auto ${ratingBadge(company.avg_expert_rating)}`}>
          <Star className="w-3 h-3" />{company.avg_expert_rating}
        </span>
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const [data, setData]         = useState(null)
  const [search, setSearch]     = useState('')
  const [inputVal, setInputVal] = useState('')
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sortBy, setSortBy]     = useState('total')
  const [page, setPage]         = useState(1)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    getCompanies({ search, page, pageSize: 50, sortBy })
      .then(setData)
      .finally(() => setLoading(false))
  }, [search, page, sortBy])

  const handleSearch = e => { e.preventDefault(); setPage(1); setSearch(inputVal) }
  const handleSort   = key => { setSortBy(key); setPage(1) }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Loyihachi korxonalar</h1>
        <p className="text-slate-500 text-sm mt-0.5">Ekologik ekspertiza loyihalarini tayyorlovchi tashkilotlar</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-lg w-fit mb-6">
        {[
          { key: 'dashboard', icon: <BarChart3 className="w-4 h-4" />, label: 'Dashboard' },
          { key: 'list',      icon: <List className="w-4 h-4" />,     label: "Loyihachilar ro'yxati" },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' ? <DashboardTab /> : (
        <>
          {/* Search + Sort */}
          <div className="flex flex-col gap-3 mb-5">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)}
                  placeholder="Korxona nomi yoki PIN..."
                  className="pl-9 pr-4 py-2 border border-slate-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent w-full" />
              </div>
              <button type="submit" className="px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors whitespace-nowrap">
                Qidirish
              </button>
              {search && (
                <button type="button" onClick={() => { setInputVal(''); setSearch(''); setPage(1) }}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-500 text-sm rounded-lg hover:bg-slate-50 whitespace-nowrap">
                  Tozalash
                </button>
              )}
            </form>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> Saralash:
              </span>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.key} onClick={() => handleSort(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === opt.key ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {data && (
            <p className="text-xs text-slate-500 mb-4">
              Jami <span className="font-semibold text-slate-700">{data.total}</span> ta loyihachi
              {search && <> — "<span className="text-emerald-600">{search}</span>" bo'yicha</>}
            </p>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
            </div>
          ) : !data?.items?.length ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <Building2 className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Korxona topilmadi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.items.map((company, idx) => (
                <CompanyCard key={company.pin} company={company} rank={(page - 1) * 50 + idx + 1}
                  onClick={() => navigate(`/company/${company.pin}`)} />
              ))}
            </div>
          )}

          {data?.total_pages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-slate-500">{page}-sahifa / {data.total_pages} sahifa</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: data.total_pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(data.total_pages, p + 1))} disabled={page === data.total_pages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
