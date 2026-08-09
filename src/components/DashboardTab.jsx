import { useEffect, useState } from 'react'
import { getDashboardData } from '../utils/dataUtils'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

const MAT_COLORS = ['#6366f1','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6']

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      {children}
    </div>
  )
}

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null
  const R = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * R)
  const y = cy + r * Math.sin(-midAngle * R)
  return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>{`${(percent*100).toFixed(0)}%`}</text>
}

const tooltipStyle = { borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }
const legendFmt = v => <span style={{ fontSize: 12, color: '#475569' }}>{v}</span>

export default function DashboardTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardData().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <ChartCard title="Loyihachilar umumiy bahosi bo'yicha">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data.chart1_rating} cx="50%" cy="50%" labelLine={false} label={renderLabel} outerRadius={100} dataKey="value">
              {data.chart1_rating.map(e => <Cell key={e.name} fill={e.color} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v} ta korxona`, n]} contentStyle={tooltipStyle} />
            <Legend formatter={legendFmt} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Jami hulosalar — material turlari bo'yicha">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.chart2_material} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={v => [`${v} ta`, 'Arizalar']} contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[4,4,0,0]}>
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
            <Bar dataKey="ijobiy"    name="Ijobiy"    fill="#10b981" radius={[3,3,0,0]} />
            <Bar dataKey="salbiy"    name="Salbiy"    fill="#ef4444" radius={[3,3,0,0]} />
            <Bar dataKey="jarayonda" name="Jarayonda" fill="#94a3b8" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Oylik dinamika — arizalar soni">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.chart4_monthly} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={v => [`${v} ta`, 'Arizalar']} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
