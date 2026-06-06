import { useState, useEffect, useCallback } from 'react'
import { Search, Download } from 'lucide-react'
import toast from 'react-hot-toast';
import api from '../api/axios';
import Pagination from '../components/Pagination'

export default function Bookings() {
  const [data, setData] = useState({ bookings: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 })

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/bookings?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id, status) => {
    try { await api.put(`/bookings/${id}`, { status }); toast.success('Status updated'); fetchData() }
    catch { toast.error('Update failed') }
  }

  const statusClass = s => s === 'confirmed' ? 'active' : s === 'cancelled' ? 'inactive' : s === 'checked_out' ? 'checked_out' : 'pending'

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Bookings</div>
          <div className="page-sub">Track all hotel room bookings.</div>
        </div>
        <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
      </div>

      <div className="filters">
        <select className="input" style={{ width: 145 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
          <option value="checked_out">Checked Out</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search bookings..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking ID</th><th>Guest</th><th>Hotel</th><th>Room</th>
                <th>Check-in</th><th>Check-out</th><th>Nights</th>
                <th>Total</th><th>Payment</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={11} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.bookings.length === 0
                  ? <tr><td colSpan={11} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No bookings found</td></tr>
                  : data.bookings.map(b => (
                    <tr key={b._id}>
                      <td style={{ fontFamily: 'monospace', color: '#C9A84C', fontSize: 12, fontWeight: 600 }}>{b.bookingId}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1a1a2e' }}>{b.guestName}</div>
                        <div style={{ fontSize: 11, color: '#718096' }}>{b.guestEmail}</div>
                      </td>
                      <td style={{ color: '#718096' }}>{b.hotelName}</td>
                      <td><span className="badge badge-pending">{b.roomType}</span></td>
                      <td style={{ fontSize: 12 }}>{b.checkIn ? new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td style={{ fontSize: 12 }}>{b.checkOut ? new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td style={{ fontWeight: 500 }}>{b.nights}</td>
                      <td style={{ fontWeight: 600, color: '#C9A84C' }}>${b.total?.toLocaleString()}</td>
                      <td><span className={`badge badge-${b.paymentStatus}`}>{b.paymentStatus}</span></td>
                      <td><span className={`badge badge-${statusClass(b.status)}`}>{b.status}</span></td>
                      <td>
                        <select className="input" style={{ width: 120, padding: '4px 8px', fontSize: 11 }}
                          value={b.status} onChange={e => updateStatus(b._id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="checked_out">Checked Out</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.bookings.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  )
}
