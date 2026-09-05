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

const RATING_SCALE_ROWS = [
  { group: 'A', tier: 'AAA', level: '1-yuqori daraja', from: 94,  to: 100 },
  { group: 'A', tier: 'AA',  level: '2-yuqori daraja', from: 87,  to: 94  },
  { group: 'A', tier: 'A',   level: '3-yuqori daraja', from: 81,  to: 87  },
  { group: 'B', tier: 'BBB', level: "1-o'rta daraja",  from: 71,  to: 80  },
  { group: 'B', tier: 'BB',  level: "2-o'rta daraja",  from: 61,  to: 71  },
  { group: 'B', tier: 'B',   level: "3-o'rta daraja",  from: 51,  to: 61  },
  { group: 'C', tier: 'CCC', level: '1-quyi daraja',   from: 34,  to: 50  },
  { group: 'C', tier: 'CC',  level: '2-quyi daraja',   from: 17,  to: 34  },
  { group: 'C', tier: 'C',   level: '3-quyi daraja',   from: 0,   to: 17  },
]

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
  const data = TIER_ORDER.map(key => {
    const t = rating.tiers.find(x => x.key === key)
    return { key, count: t?.count ?? 0, group: t?.group }
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
          <YAxis type="category" dataKey="key" width={40} tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }} />
          <Tooltip formatter={(v, _n, p) => [`${v} ta`, p.payload.key]} contentStyle={tooltipStyle} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map(d => <Cell key={d.key} fill={GROUP_COLORS[d.group]} />)}
            <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: '#475569' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-3 flex-wrap">
        {['A', 'B', 'C'].map(g => (
          <span key={g} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: GROUP_COLORS[g] }} />
            {g} — {GROUP_LABELS[g]}
          </span>
        ))}
      </div>
    </ChartCard>
  )
}

function RatingScaleTable() {
  return (
    <ChartCard title="Loyihachilar reytingi shkalasi">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-200">
              <th className="text-left py-2 px-2">Toifa</th>
              <th className="text-left py-2 px-2">Reyting bahosi</th>
              <th className="text-left py-2 px-2">Ishonchlilik darajasi</th>
              <th className="text-right py-2 px-2">Dan</th>
              <th className="text-right py-2 px-2">Gacha</th>
            </tr>
          </thead>
          <tbody>
            {RATING_SCALE_ROWS.map((row, i) => (
              <tr key={row.tier} className="border-b border-slate-100 last:border-0">
                {i === 0 || RATING_SCALE_ROWS[i - 1].group !== row.group ? (
                  <td rowSpan={3} className="align-middle py-2 px-2 font-bold" style={{ color: GROUP_COLORS[row.group] }}>
                    {row.group}
                  </td>
                ) : null}
                <td className="py-2 px-2 font-medium text-slate-700">{row.tier}</td>
                <td className="py-2 px-2 text-slate-500 whitespace-nowrap">{row.level}</td>
                <td className="py-2 px-2 text-right text-slate-600">{row.from} ≤</td>
                <td className="py-2 px-2 text-right text-slate-600">≤ {row.to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        <RatingScaleTable />
      </div>

      <ActivityScopeTable />

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
