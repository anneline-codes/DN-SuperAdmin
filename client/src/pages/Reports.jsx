import { useState, useEffect } from 'react'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../api/axios'

const COLORS = ['#C9A84C', '#38a169', '#3182ce', '#dd6b20']

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  labelStyle: { color: '#718096', fontWeight: 600 },
}

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><p style={{ color: '#718096' }}>Loading reports...</p></div>
  if (!data) return <div className="page"><p style={{ color: '#718096' }}>Failed to load.</p></div>

  const { summary, revenueChart, ordersByCategory } = data

  const kpis = [
    { label: 'Total Revenue', value: `$${(summary.totalRevenue || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, change: 12.8, color: '#C9A84C', bg: 'rgba(201,168,76,0.08)' },
    { label: 'Total Orders', value: summary.totalOrders?.toLocaleString(), change: -2.1, color: '#3182ce', bg: 'rgba(49,130,206,0.08)' },
    { label: 'New Users', value: summary.totalUsers?.toLocaleString(), change: 5.2, color: '#38a169', bg: 'rgba(56,161,105,0.08)' },
    { label: 'New Venues', value: ((summary.totalRestaurants || 0) + (summary.totalHotels || 0)).toLocaleString(), change: 8.4, color: '#dd6b20', bg: 'rgba(221,107,32,0.08)' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-sub">View detailed system analytics reports.</div>
        </div>
        <button className="btn btn-outline btn-sm"><Download size={13} /> Export Report</button>
      </div>

      {/* KPI row */}
      <div className="grid-4" style={{ marginBottom: 22 }}>
        {kpis.map(({ label, value, change, color, bg }) => {
          const up = change >= 0
          return (
            <div key={label} className="card" style={{ background: bg, border: 'none' }}>
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: up ? '#38a169' : '#e53e3e' }}>
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {Math.abs(change)}% vs last period
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 16 }}>Revenue Report</div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={revenueChart}>
              <defs>
                <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" fill="url(#rGrad)" strokeWidth={2} name="Revenue ($)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 16 }}>Orders by Type</div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={ordersByCategory} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                dataKey="count" nameKey="category" paddingAngle={3}>
                {ordersByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend iconType="circle" iconSize={8}
                formatter={v => <span style={{ color: '#718096', fontSize: 11 }}>{v}</span>} />
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform summary */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 14 }}>Platform Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {[
            ['Restaurants', summary.totalRestaurants, '#C9A84C'],
            ['Hotels', summary.totalHotels, '#805ad5'],
            ['Users', summary.totalUsers, '#3182ce'],
            ['Orders', summary.totalOrders, '#dd6b20'],
            ['Bookings', summary.totalBookings, '#38a169'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: 'center', padding: '14px 10px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color }}>{val?.toLocaleString() || 0}</div>
              <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
