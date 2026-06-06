import { useState, useEffect } from 'react'
import { UtensilsCrossed, Hotel, Users, ShoppingBag, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../api/axios'

const COLORS = ['#C9A84C', '#4a90e0', '#dd6b20', '#38a169']

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#1a1a2e', fontSize: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  labelStyle: { color: '#718096', fontWeight: 600 },
}

function StatCard({ icon: Icon, label, value, change, iconBg, iconColor, prefix = '' }) {
  const up = change >= 0
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {change !== undefined && (
          <div className={`stat-change ${up ? 'up' : 'down'}`}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(change)}% vs last week
          </div>
        )}
      </div>
    </div>
  )
}


export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <span style={{ color: '#718096' }}>Loading dashboard...</span>
    </div>
  )
  if (!data) return <div className="page"><p style={{ color: '#718096' }}>Failed to load data.</p></div>

  const { stats, revenueChart, topRestaurants, topHotels, recentActivity } = data

  const catData = [
    { name: 'Food', value: Math.round(stats.totalOrders * 0.41) },
    { name: 'Drinks', value: Math.round(stats.totalOrders * 0.28) },
    { name: 'Room Service', value: Math.round(stats.totalOrders * 0.19) },
    { name: 'Others', value: Math.round(stats.totalOrders * 0.12) },
  ]

  const topVenues = [
    ...topRestaurants.slice(0, 4).map(r => ({ ...r, type: 'Restaurant', count: r.totalOrders })),
    ...topHotels.slice(0, 3).map(h => ({ ...h, type: 'Hotel', count: h.totalBookings })),
  ]

  return (
    <div className="page">
      {/* 5 KPI stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        <StatCard icon={UtensilsCrossed} label="Total Restaurants" value={stats.totalRestaurants} change={10.5}
          iconBg="rgba(201,168,76,0.12)" iconColor="#C9A84C" />
        <StatCard icon={Hotel} label="Total Hotels" value={stats.totalHotels} change={7.8}
          iconBg="rgba(128,90,213,0.12)" iconColor="#805ad5" />
        <StatCard icon={Users} label="Total Users" value={stats.totalUsers} change={5.2}
          iconBg="rgba(49,130,206,0.12)" iconColor="#3182ce" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.totalOrders} change={-2.1}
          iconBg="rgba(221,107,32,0.12)" iconColor="#dd6b20" />
        <StatCard icon={DollarSign} label="Total Revenue" value={stats.totalRevenue?.toLocaleString('en-US', { maximumFractionDigits: 0 })} change={12.8}
          iconBg="rgba(56,161,105,0.12)" iconColor="#38a169" prefix="$" />
      </div>

      {/* Row 2: Revenue chart + Top Rated Venues + System Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Revenue Overview */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Revenue Overview</div>
            <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#718096' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 3, background: '#C9A84C', display: 'inline-block', borderRadius: 2 }} /> Revenue ($)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 3, background: '#4a90e0', display: 'inline-block', borderRadius: 2 }} /> Orders
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={revenueChart} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4a90e0" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4a90e0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#a0aec0', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="revenue" stroke="#C9A84C" fill="url(#revG)" strokeWidth={2} name="Revenue ($)" dot={false} />
              <Area type="monotone" dataKey="orders" stroke="#4a90e0" fill="url(#ordG)" strokeWidth={2} name="Orders" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Top Rated Venues */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Top Rated Venues</div>
            <a href="/restaurants" style={{ fontSize: 11, color: '#C9A84C', fontWeight: 500 }}>View all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...topRestaurants.slice(0, 3), ...topHotels.slice(0, 2)].slice(0, 5).map((v, i) => (
              <div key={v._id} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 5, background: 'rgba(201,168,76,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#C9A84C', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{
                  width: 34, height: 34, borderRadius: 7, background: '#f7fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 16, border: '1px solid #e2e8f0',
                }}>
                  {v.type === 'Hotel' ? '🏨' : '🍽️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</div>
                  <div style={{ fontSize: 10, color: '#718096' }}>{v.type} • {v.city || v.location}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                  <span style={{ color: '#C9A84C', fontSize: 12 }}>★</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{v.rating?.toFixed(1) || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview donut */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 10 }}>System Overview</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Restaurants', value: stats.totalRestaurants },
                    { name: 'Hotels', value: stats.totalHotels },
                  ]}
                  cx="50%" cy="50%" innerRadius={45} outerRadius={65}
                  dataKey="value" paddingAngle={3}
                >
                  <Cell fill="#C9A84C" />
                  <Cell fill="#805ad5" />
                </Pie>
                <Tooltip {...tooltipStyle} />
                <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="700" fill="#1a1a2e">
                  {(stats.totalRestaurants + stats.totalHotels).toLocaleString()}
                </text>
                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#718096">
                  Total Venues
                </text>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '100%', marginTop: 6 }}>
              {[
                { label: 'Restaurants', val: stats.totalRestaurants, color: '#C9A84C' },
                { label: 'Hotels', val: stats.totalHotels, color: '#805ad5' },
              ].map(({ label, val, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 11, color: '#718096' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1a1a2e' }}>{val?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Orders by Category + Recent Activities + Top Performing Venues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.5fr', gap: 16 }}>

        {/* Orders by Category donut */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 10 }}>Orders by Category</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={3}>
                {catData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip {...tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
            {catData.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                  <span style={{ fontSize: 11, color: '#718096' }}>{c.name}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#1a1a2e', fontWeight: 500 }}>{c.value?.toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: COLORS[i], fontWeight: 600 }}>{Math.round(c.value / stats.totalOrders * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Recent Activities</div>
            <a href="#" style={{ fontSize: 11, color: '#C9A84C', fontWeight: 500 }}>View all</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recentActivity.orders?.slice(0, 3).map((o, i) => (
              <div key={o._id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(201,168,76,0.2)' }}>
                  <ShoppingBag size={14} color="#C9A84C" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a2e', lineHeight: 1.4 }}>
                    New order <span style={{ color: '#C9A84C' }}>{o.orderId}</span> received
                  </div>
                  <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{o.restaurantName}</div>
                  <div style={{ fontSize: 10, color: '#a0aec0', marginTop: 2 }}>
                    {i === 0 ? '2 mins ago' : i === 1 ? '1 hour ago' : '3 hours ago'}
                  </div>
                </div>
              </div>
            ))}
            {recentActivity.users?.slice(0, 2).map((u, i) => (
              <div key={u._id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(56,161,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(56,161,105,0.2)' }}>
                  <Users size={14} color="#38a169" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#1a1a2e' }}>User <span style={{ color: '#C9A84C' }}>{u.name}</span> registered</div>
                  <div style={{ fontSize: 10, color: '#a0aec0', marginTop: 2 }}>{i === 0 ? '5 hours ago' : '1 day ago'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Venues table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>Top Performing Venues</div>
            <a href="/restaurants" style={{ fontSize: 11, color: '#C9A84C', fontWeight: 500 }}>View all</a>
          </div>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 0 }}>Venue</th>
                <th>Type</th>
                <th>Orders</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topVenues.slice(0, 6).map(v => (
                <tr key={v._id}>
                  <td style={{ fontWeight: 600, fontSize: 12, paddingLeft: 0 }}>{v.name}</td>
                  <td>
                    <span className={`badge ${v.type === 'Restaurant' ? 'badge-restaurant' : 'badge-hotel'}`}>
                      {v.type}
                    </span>
                  </td>
                  <td style={{ fontSize: 12 }}>{v.count?.toLocaleString() || 0}</td>
                  <td style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600 }}>${v.revenue?.toLocaleString() || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
