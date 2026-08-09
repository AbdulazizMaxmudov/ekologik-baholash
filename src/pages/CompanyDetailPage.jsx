import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCompanyProjects } from '../utils/dataUtils'
import { ArrowLeft, ExternalLink, FileText, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 50

const STATUS_MAP = {
  CONCLUDED:              { label: 'Yakunlangan',        color: 'bg-emerald-100 text-emerald-700' },
  CONCLUSION_REJECTED:    { label: 'Rad etilgan',         color: 'bg-red-100 text-red-700'        },
  REPROCESSING_EXPIRED:   { label: "Muddati o'tgan",     color: 'bg-slate-100 text-slate-600'    },
  DIRECTOR_RETURNED:      { label: 'Qaytarilgan',         color: 'bg-orange-100 text-orange-700'  },
  EXPERT_RETURNED:        { label: 'Eksp. qaytargan',     color: 'bg-orange-100 text-orange-700'  },
  AGREEMENT_AGREED:       { label: 'Kelishilgan',         color: 'bg-blue-100 text-blue-700'      },
  EXPERT_REVIEWING:       { label: "Ko'rib chiqilmoqda", color: 'bg-blue-100 text-blue-700'      },
  AT_LEADER:              { label: 'Rahbarda',            color: 'bg-purple-100 text-purple-700'  },
  AT_DEPUTY:              { label: "O'rinbosarda",       color: 'bg-purple-100 text-purple-700'  },
  AT_AGREEMENT:           { label: 'Kelishuv jarayoni',   color: 'bg-blue-100 text-blue-700'      },
  EXPERT_SEND_INSPECTOR:  { label: 'Inspektorda',         color: 'bg-indigo-100 text-indigo-700'  },
  EXPERT_SEND_AGREEMENT:  { label: 'Yuborilgan',          color: 'bg-indigo-100 text-indigo-700'  },
  EXPERT_LEADER_ACCEPTED: { label: 'Qabul qilindi',       color: 'bg-emerald-100 text-emerald-700'},
  AGREEMENT_RETURNED:     { label: "Kelishuvdan qayt.",  color: 'bg-orange-100 text-orange-700'  },
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? { label: status, color: 'bg-slate-100 text-slate-600' }
  return <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${s.color}`}>{s.label}</span>
}

function FinalStatus({ label }) {
  if (label === 'ijobiy') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
      <CheckCircle className="w-3 h-3" /> Ijobiy
    </span>
  )
  if (label === 'salbiy') return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
      <XCircle className="w-3 h-3" /> Salbiy
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-semibold">
      <Clock className="w-3 h-3" /> Jarayonda
    </span>
  )
}

function RatingBar({ value }) {
  const num = Math.min(parseInt(value) || 0, 100)
  const color  = num >= 70 ? 'bg-emerald-500' : num >= 40 ? 'bg-amber-400' : 'bg-red-400'
  const textCl = num >= 70 ? 'text-emerald-700' : num >= 40 ? 'text-amber-700' : 'text-red-600'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden flex-shrink-0">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${num}%` }} />
      </div>
      <span className={`text-xs font-semibold ${textCl}`}>{value}/100</span>
    </div>
  )
}

export default function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [projPage, setProjPage] = useState(1)

  useEffect(() => {
    getCompanyProjects(id).then(setData).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
    </div>
  )
  if (!data) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
      <p className="mb-3">Korxona topilmadi</p>
      <button onClick={() => navigate('/')} className="text-emerald-500 text-sm hover:underline">Orqaga</button>
    </div>
  )

  const ijobiy   = data.projects.filter(p => p.status_label === 'ijobiy').length
  const salbiy   = data.projects.filter(p => p.status_label === 'salbiy').length
  const jarayonda = data.projects.filter(p => p.status_label === 'jarayonda').length
  const totalPages   = Math.max(1, Math.ceil(data.projects.length / PAGE_SIZE))
  const pagedProjects = data.projects.slice((projPage - 1) * PAGE_SIZE, projPage * PAGE_SIZE)

  return (
    <div className="p-4 md:p-6">
      <button onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-5 group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Loyihachilar ro'yxatiga qaytish
      </button>

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-snug">{data.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">PIN: <span className="font-mono">{id}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Jami arizalar', value: data.projects.length, bg: 'bg-slate-50',   text: 'text-slate-700'   },
            { label: 'Ijobiy',        value: ijobiy,               bg: 'bg-emerald-50', text: 'text-emerald-700' },
            { label: 'Salbiy',        value: salbiy,               bg: 'bg-red-50',     text: 'text-red-600'     },
            { label: 'Jarayonda',     value: jarayonda,            bg: 'bg-blue-50',    text: 'text-blue-600'    },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-lg px-5 py-3 text-center`}>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-700 text-sm">Loyihalar ro'yxati</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{data.projects.length} ta ariza</span>
            {totalPages > 1 && <span className="text-xs text-slate-400">{projPage}/{totalPages}-sahifa</span>}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['#','Ariza №','Hulosa №','Toifa','Material','Ekspert bahosi','Qabul bahosi','Holat','Natija'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pagedProjects.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5 text-slate-400 text-xs">{(projPage-1)*PAGE_SIZE + idx + 1}</td>
                  <td className="px-4 py-3.5">
                    <a href={p.application_doc} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700 font-mono text-xs font-medium hover:underline">
                      #{p.application_num}<ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3.5">
                    {p.conclusion_num ? (
                      <a href={p.conclusion_doc} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs hover:underline">
                        {p.conclusion_num}<ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium whitespace-nowrap">
                      {p.application_type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono font-medium whitespace-nowrap">
                      {p.material_type || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <RatingBar value={p.expert_rating} />
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[160px]">{p.expert_name}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <RatingBar value={p.receiver_rating} />
                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[160px]">{p.receiver_name}</p>
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3.5 text-center"><FinalStatus label={p.status_label} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {(projPage-1)*PAGE_SIZE+1}–{Math.min(projPage*PAGE_SIZE, data.projects.length)} / {data.projects.length} ta
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setProjPage(p => Math.max(1, p-1))} disabled={projPage===1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({length: totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setProjPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p===projPage?'bg-slate-800 text-white':'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setProjPage(p => Math.min(totalPages, p+1))} disabled={projPage===totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
