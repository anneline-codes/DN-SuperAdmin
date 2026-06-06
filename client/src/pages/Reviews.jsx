import { useState, useEffect, useCallback } from 'react';
import { Search, Download, Trash2, Eye, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination'

const statusMap = { published: 'active', pending: 'pending', flagged: 'flagged', removed: 'inactive' }

export default function Reviews() {
  const [data, setData] = useState({ reviews: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', targetType: '', search: '', page: 1 })

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/reviews?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load reviews'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id, status) => {
    try { await api.put(`/reviews/${id}`, { status }); toast.success('Status updated'); fetchData() }
    catch { toast.error('Update failed') }
  }

  const remove = async id => {
    if (!confirm('Delete this review?')) return
    try { await api.delete(`/reviews/${id}`); toast.success('Deleted'); fetchData() }
    catch { toast.error('Delete failed') }
  }

  const stars = n => Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < n ? '#C9A84C' : '#cbd5e0', fontSize: 13 }}>★</span>
  ))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Reviews</div>
          <div className="page-sub">Moderate and manage venue reviews.</div>
        </div>
        <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
      </div>

      <div className="filters">
        <select className="input" style={{ width: 145 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="pending">Pending</option>
          <option value="flagged">Flagged</option>
          <option value="removed">Removed</option>
        </select>
        <select className="input" style={{ width: 145 }} value={filters.targetType} onChange={e => setFilters(f => ({ ...f, targetType: e.target.value, page: 1 }))}>
          <option value="">All Types</option>
          <option value="restaurant">Restaurant</option>
          <option value="hotel">Hotel</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search reviews..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th><th>Venue</th><th>Type</th><th>Rating</th>
                <th>Review</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.reviews.length === 0
                  ? <tr><td colSpan={8} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No reviews found</td></tr>
                  : data.reviews.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.reviewerName}</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>{r.reviewerEmail}</div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{r.targetName || '—'}</td>
                      <td><span className={`badge badge-${r.targetType}`}>{r.targetType}</span></td>
                      <td><div style={{ display: 'flex', gap: 1 }}>{stars(r.rating)}</div></td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#718096', fontSize: 12 }}>
                        {r.comment}
                      </td>
                      <td style={{ fontSize: 12, color: '#718096' }}>
                        {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <span className={`badge badge-${statusMap[r.status] || 'pending'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn-icon" title="View"><Eye size={13} /></button>
                          <select className="input" style={{ width: 105, padding: '4px 6px', fontSize: 11 }}
                            value={r.status} onChange={e => updateStatus(r._id, e.target.value)}>
                            <option value="published">Published</option>
                            <option value="pending">Pending</option>
                            <option value="flagged">Flagged</option>
                            <option value="removed">Removed</option>
                          </select>
                          <button className="btn-icon danger" title="Delete" onClick={() => remove(r._id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.reviews.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  )
}
