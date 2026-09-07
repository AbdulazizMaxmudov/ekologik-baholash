import { useEffect, useState } from 'react'
import { getDashboardData, getLoyihachilarRating } from '../utils/dataUtils'
import {
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList,
} from 'recharts'

const MAT_COLORS = ['#6366f1','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6']

const GROUP_COLORS = { A: '#22c55e', B: '#3b82f6', C: '#eab308' }
const GROUP_LABELS = { A: 'Yashil', B: "Ko'k", C: 'Sariq' }
const TIER_ORDER = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C']

const ACTIVITY_MAPPING = [
  {
    group: 'A',
    label: 'Yashil',
    desc: "Atrof-muhitga ta'sir ko'rsatishning barcha toifalariga (I, II, III toifa) mansub faoliyat turlari bo'yicha loyiha hujjatlarini ishlab chiqishi mumkin.",
  },
  {
    group: 'B',
    label: "Ko'k",
    desc: "Atrof-muhitga ta'sir ko'rsatishning II va III toifalariga mansub faoliyat turlari bo'yicha loyiha hujjatlarini ishlab chiqishi mumkin.",
  },
  {
    group: 'C',
    label: 'Sariq',
    desc: "Atrof-muhitga ta'sir ko'rsatishning faqat III toifasiga mansub faoliyat turlari bo'yicha loyiha hujjatlarini ishlab chiqishi mumkin.",
  },
]

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

const tooltipStyle = { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }
const legendFmt = v => <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>

function RatingBarChart({ rating }) {
  const data = ['A', 'B', 'C'].map(group => {
    const count = TIER_ORDER
      .filter(key => rating.tiers.find(x => x.key === key)?.group === group)
      .reduce((sum, key) => sum + (rating.tiers.find(x => x.key === key)?.count ?? 0), 0)
    return { group, label: GROUP_LABELS[group], count }
  })

  return (
    <ChartCard title="Loyihachilar reytingi bo'yicha taqsimoti">
      <p className="text-sm text-slate-600 mb-3">
        Jami loyihachilar soni: <span className="font-bold text-slate-800">{rating.total}</span>
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis type="category" dataKey="label" width={60} tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
          <Tooltip formatter={(v, _n, p) => [`${v} ta`, p.payload.label]} contentStyle={tooltipStyle} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map(d => <Cell key={d.group} fill={GROUP_COLORS[d.group]} />)}
            <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: '#475569' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

function ActivityScopeTable() {
  return (
    <ChartCard title="Toifalarga ko'ra ruxsat etilgan faoliyat turlari">
      <div className="space-y-3">
        {ACTIVITY_MAPPING.map(row => (
          <div key={row.group} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ background: GROUP_COLORS[row.group] }}
            >
              {row.group}
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">{row.label} toifa</p>
              <p className="text-xs text-slate-500 mt-0.5">{row.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  )
}

export default function DashboardTab() {
  const [data, setData] = useState(null)
  const [rating, setRating] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardData(), getLoyihachilarRating()])
      .then(([d, r]) => { setData(d); setRating(r) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RatingBarChart rating={rating} />
        <ActivityScopeTable />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ChartCard title="Jami hulosalar — material turlari bo'yicha">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.chart2_material} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip formatter={v => [`${v} ta`, 'Arizalar']} contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.chart2_material.map((_, i) => <Cell key={i} fill={MAT_COLORS[i % MAT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ijobiy / Salbiy — toifalar bo'yicha">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.chart3_toifa} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend formatter={legendFmt} />
              <Bar dataKey="ijobiy"    name="Ijobiy"    fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="salbiy"    name="Salbiy"    fill="#ef4444" radius={[3, 3, 0, 0]} />
              <Bar dataKey="jarayonda" name="Jarayonda" fill="#94a3b8" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
