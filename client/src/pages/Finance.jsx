import { useState, useEffect, useCallback } from 'react';
import { Search, Download, DollarSign, Clock, RotateCcw, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast';
import api from '../api/axios'
import Pagination from '../components/Pagination'

export default function Finance() {
  const [data, setData] = useState({ transactions: [], total: 0, pages: 1, page: 1, summary: {} })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ type: '', status: '', search: '', page: 1 })

  const loadData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/finance?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load transactions'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { loadData() }, [loadData])

  const { summary = {} } = data
  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))
  const fmt = n => `$${(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  const kpis = [
    { label: 'Total Revenue', value: fmt(summary.totalRevenue), icon: DollarSign, iconBg: 'rgba(201,168,76,0.12)', iconColor: '#C9A84C' },
    { label: 'Total Payouts', value: fmt(summary.totalPayouts || summary.pendingPayout), icon: TrendingUp, iconBg: 'rgba(56,161,105,0.12)', iconColor: '#38a169' },
    { label: 'Pending Payouts', value: fmt(summary.pendingPayout), icon: Clock, iconBg: 'rgba(214,158,46,0.12)', iconColor: '#d69e2e' },
    { label: 'Refunds', value: fmt(summary.totalRefunds), icon: RotateCcw, iconBg: 'rgba(229,62,62,0.12)', iconColor: '#e53e3e' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Finance</div>
          <div className="page-sub">Track and manage all financial transactions.</div>
        </div>
        <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 22 }}>
        {kpis.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background: iconBg }}>
              <Icon size={22} color={iconColor} />
            </div>
            <div>
              <div className="stat-label">{label}</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="filters">
        <select className="input" style={{ width: 145 }} value={filters.type} onChange={e => setF('type', e.target.value)}>
          <option value="">All Transactions</option>
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
          <option value="payout">Payout</option>
        </select>
        <select className="input" style={{ width: 130 }} value={filters.status} onChange={e => setF('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search transactions..."
            value={filters.search} onChange={e => setF('search', e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Type</th><th>Description</th>
                <th>Amount</th><th>Venue</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.transactions.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No transactions found</td></tr>
                  : data.transactions.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontFamily: 'monospace', color: '#C9A84C', fontSize: 12, fontWeight: 600 }}>{t.transactionId}</td>
                      <td>
                        <span className={`badge ${t.type === 'payment' ? 'badge-active' : t.type === 'refund' ? 'badge-inactive' : 'badge-pending'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td style={{ color: '#718096' }}>{t.description}</td>
                      <td style={{ fontWeight: 600, color: t.type === 'refund' ? '#e53e3e' : '#38a169' }}>
                        {t.type === 'refund' ? '-' : '+'}${t.amount?.toLocaleString()}
                      </td>
                      <td style={{ color: '#718096' }}>{t.venue || '—'}</td>
                      <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                      <td style={{ color: '#718096', fontSize: 12 }}>
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.transactions.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  )
}
