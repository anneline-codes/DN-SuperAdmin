import { useState, useEffect, useCallback } from 'react'
import { Search, Download, Eye, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Pagination from '../components/Pagination'

const priorityClass = { low: 'badge-low', medium: 'badge-medium', high: 'badge-flagged', urgent: 'badge-flagged' }
const statusClass = { open: 'badge-pending', in_progress: 'badge-pending', resolved: 'badge-active', closed: 'badge-inactive' }

export default function Support() {
  const [data, setData] = useState({ tickets: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1 })

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/support?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id, status) => {
    try { await api.put(`/support/${id}`, { status }); toast.success('Status updated'); fetchData() }
    catch { toast.error('Update failed') }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Support Tickets</div>
          <div className="page-sub">Manage customer support tickets.</div>
        </div>
        <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
      </div>

      <div className="filters">
        <select className="input" style={{ width: 145 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select className="input" style={{ width: 145 }} value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value, page: 1 }))}>
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search tickets..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th><th>User</th><th>Subject</th>
                <th>Priority</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.tickets.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No tickets found</td></tr>
                  : data.tickets.map(t => (
                    <tr key={t._id}>
                      <td style={{ fontFamily: 'monospace', color: '#C9A84C', fontSize: 12, fontWeight: 600 }}>{t.ticketId}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{t.userName}</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>{t.userEmail || ''}</div>
                      </td>
                      <td style={{ color: '#4a5568', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</td>
                      <td><span className={`badge ${priorityClass[t.priority]}`}>{t.priority}</span></td>
                      <td><span className={`badge ${statusClass[t.status]}`}>{t.status.replace('_', ' ')}</span></td>
                      <td style={{ fontSize: 12, color: '#718096' }}>
                        {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                          <button className="btn-icon" title="View"><Eye size={13} /></button>
                          <select className="input" style={{ width: 120, padding: '4px 8px', fontSize: 11 }}
                            value={t.status} onChange={e => updateStatus(t._id, e.target.value)}>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.tickets.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  )
}
