import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardList, FileCheck2, Leaf, Map, AlertTriangle,
  ArrowRight, Wind, Trash2,
} from 'lucide-react'
import {
  Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts'
import DashboardTab from '../components/DashboardTab'
import { getDashboardData } from '../utils/dataUtils'
import { ARIZALAR } from '../data/arizalar'
import { XULOSALAR } from '../data/xulosalar'
import { korxonalarSeed } from '../data/korxonalar'
import { tashkentKorxonalari } from '../data/tashkentKorxonalari'

// XulosalarPage.jsx dagi bilan bir xil kalit — foydalanuvchi u yerda
// ko'rib chiqqan xulosalarni shu yerda ham "kutilayotgan" hisobidan
// chiqarib tashlash uchun.
const XULOSA_REVIEWED_KEY = 'xulosa-reviews'

function loadReviewedXulosalar() {
  try {
    return JSON.parse(localStorage.getItem(XULOSA_REVIEWED_KEY) || '{}')
  } catch {
    return {}
  }
}

const ALL_KORXONALAR = [...korxonalarSeed, ...tashkentKorxonalari]

const VILOYAT_LABELS = {
  toshkentshahri: 'Toshkent shahri',
  qoraqalpogiston: "Qoraqalpog'iston",
}
const formatViloyat = key => VILOYAT_LABELS[key] || (key.charAt(0).toUpperCase() + key.slice(1))

const VILOYAT_COLORS = ['#059669', '#0284c7', '#7c3aed', '#f59e0b', '#ef4444', '#0891b2', '#65a30d', '#db2777']

function sumTashlanma(korxona, categoryKey) {
  const entries = korxona.tashlanmalar?.[categoryKey] || []
  return entries.reduce((sum, e) => sum + (Number(e.tonna_yiliga) || 0), 0)
}

function KpiCard({ icon, iconBg, label, value, sub, to }) {
  const content = (
    <div className="bg-white rounded-xl border border-slate-200 p-4 h-full hover:border-emerald-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </span>
      </div>
      <p className="text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

function QuickListCard({ title, icon, to, ctaLabel, items, emptyLabel, renderItem }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">{icon}{title}</h3>
        <Link to={to} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
          {ctaLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-50">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">{emptyLabel}</p>
        ) : items.map(renderItem)}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [totalHujjatlar, setTotalHujjatlar] = useState(null)
  useEffect(() => { getDashboardData().then(d => setTotalHujjatlar(d.total)) }, [])

  const reviewedXulosalar = useMemo(loadReviewedXulosalar, [])

  const urgentArizalar = useMemo(
    () => [...ARIZALAR].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5),
    []
  )
  const shoshilinchCount = ARIZALAR.filter(a => a.daysLeft <= 3).length

  const pendingXulosalar = useMemo(
    () => XULOSALAR.filter(x => !reviewedXulosalar[x.ariza_raqami]).slice(0, 5),
    [reviewedXulosalar]
  )
  const pendingXulosalarCount = XULOSALAR.filter(x => !reviewedXulosalar[x.ariza_raqami]).length

  const pollution = useMemo(() => {
    let atmosfera = 0
    let xavfli = 0
    const byViloyat = {}
    for (const k of ALL_KORXONALAR) {
      atmosfera += sumTashlanma(k, 'atmosfera')
      xavfli += sumTashlanma(k, 'xavfli_chiqindi')
      if (!byViloyat[k.viloyat]) byViloyat[k.viloyat] = { viloyat: formatViloyat(k.viloyat), count: 0 }
      byViloyat[k.viloyat].count++
    }
    const chart = Object.values(byViloyat).sort((a, b) => b.count - a.count).slice(0, 8)
    return { atmosfera, xavfli, chart }
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Boshqaruv paneli</h1>
        <p className="text-slate-500 text-sm mt-0.5">Ekologik ekspertiza tizimi bo'yicha umumiy ko'rinish</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard
          to="/arizalar"
          icon={<ClipboardList className="w-4.5 h-4.5 text-white" />} iconBg="#3b82f6"
          value={ARIZALAR.length}
          label="Kutilayotgan arizalar"
          sub={shoshilinchCount > 0 ? `${shoshilinchCount} tasi shoshilinch` : undefined}
        />
        <KpiCard
          to="/xulosalar"
          icon={<FileCheck2 className="w-4.5 h-4.5 text-white" />} iconBg="#8b5cf6"
          value={pendingXulosalarCount}
          label="Ko'rib chiqilishi kerak xulosalar"
        />
        <KpiCard
          to="/loyihachilar"
          icon={<Leaf className="w-4.5 h-4.5 text-white" />} iconBg="#10b981"
          value={totalHujjatlar != null ? totalHujjatlar.toLocaleString() : '…'}
          label="Jami ariza/xulosa hujjati"
        />
        <KpiCard
          to="/xarita"
          icon={<Map className="w-4.5 h-4.5 text-white" />} iconBg="#f59e0b"
          value={ALL_KORXONALAR.length.toLocaleString()}
          label="Kuzatilayotgan korxonalar"
        />
        <KpiCard
          to="/xarita"
          icon={<Wind className="w-4.5 h-4.5 text-white" />} iconBg="#ef4444"
          value={`${Math.round(pollution.atmosfera).toLocaleString()} t`}
          label="Atmosferaga tashlanma/yil"
        />
      </div>

      {/* Quick access: urgent arizalar + pending xulosalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <QuickListCard
          title="Shoshilinch arizalar"
          icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
          to="/arizalar"
          ctaLabel="Barchasini ko'rish"
          items={urgentArizalar}
          emptyLabel="Kutilayotgan ariza yo'q"
          renderItem={a => (
            <div key={a.orderNum} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{a.applicantName}</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">№{a.orderNum}</p>
              </div>
              <span className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                a.daysLeft <= 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
              }`}>
                {a.daysLeft} kun qoldi
              </span>
            </div>
          )}
        />
        <QuickListCard
          title="Ko'rib chiqilishi kerak xulosalar"
          icon={<FileCheck2 className="w-4 h-4 text-purple-500" />}
          to="/xulosalar"
          ctaLabel="Barchasini ko'rish"
          items={pendingXulosalar}
          emptyLabel="Ko'rib chiqilishi kerak xulosa yo'q"
          renderItem={x => (
            <div key={x.ariza_raqami} className="px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">{x.buyurtmachi_nomi}</p>
                <p className="text-xs text-slate-400 mt-0.5">{x.viloyat}, {x.tuman}</p>
              </div>
              <span className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-semibold whitespace-nowrap capitalize ${
                x.hulosa_turi === 'ijobiy' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
                {x.hulosa_turi}
              </span>
            </div>
          )}
        />
      </div>

      {/* Loyihachilar reytingi va hujjatlar statistikasi */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-600 mb-3">Loyihachilar va hujjatlar</h2>
        <DashboardTab />
      </div>

      {/* Ekologik monitoring (Xarita) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-600">Ekologik monitoring</h2>
          <Link to="/xarita" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            Xaritada ko'rish <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-1 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Wind className="w-5 h-5 text-red-500" />
              </span>
              <div>
                <p className="text-lg font-bold text-slate-800">{Math.round(pollution.atmosfera).toLocaleString()} t/yil</p>
                <p className="text-xs text-slate-500">Atmosferaga chiqariladigan ifloslantiruvchi moddalar</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-amber-600" />
              </span>
              <div>
                <p className="text-lg font-bold text-slate-800">{Math.round(pollution.xavfli).toLocaleString()} t/yil</p>
                <p className="text-xs text-slate-500">Xavfli chiqindilar miqdori</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Viloyat bo'yicha kuzatilayotgan korxonalar</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pollution.chart} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="viloyat" width={110} tick={{ fontSize: 11, fill: '#334155' }} />
                <Tooltip formatter={v => [`${v} ta`, 'Korxona']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {pollution.chart.map((_, i) => <Cell key={i} fill={VILOYAT_COLORS[i % VILOYAT_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
