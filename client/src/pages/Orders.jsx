import { useState, useEffect, useCallback } from 'react'
import { Search, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Pagination from '../components/Pagination'

export default function Orders() {
  const [data, setData] = useState({ orders: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', category: '', search: '', page: 1 })

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/orders?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id, status) => {
    try { await api.put(`/orders/${id}`, { status }); toast.success('Status updated'); fetchData() }
    catch { toast.error('Update failed') }
  }

  const statusClass = { pending: 'pending', confirmed: 'active', preparing: 'pending', delivered: 'completed', cancelled: 'inactive' }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-sub">Track and manage all orders.</div>
        </div>
        <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
      </div>

      <div className="filters">
        <select className="input" style={{ width: 145 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="input" style={{ width: 145 }} value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}>
          <option value="">All Categories</option>
          <option value="Food">Food</option>
          <option value="Drinks">Drinks</option>
          <option value="Room Service">Room Service</option>
          <option value="Other">Other</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search orders..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Restaurant</th>
                <th>Category</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.orders.length === 0
                  ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No orders found</td></tr>
                  : data.orders.map(o => (
                    <tr key={o._id}>
                      <td style={{ fontFamily: 'monospace', color: '#C9A84C', fontSize: 12, fontWeight: 600 }}>{o.orderId}</td>
                      <td style={{ fontWeight: 500 }}>{o.customerName || '—'}</td>
                      <td style={{ color: '#718096' }}>{o.restaurantName || '—'}</td>
                      <td><span className="badge badge-pending">{o.category}</span></td>
                      <td style={{ fontWeight: 600, color: '#C9A84C' }}>${o.total}</td>
                      <td><span className={`badge badge-${o.paymentStatus}`}>{o.paymentStatus}</span></td>
                      <td><span className={`badge badge-${statusClass[o.status] || 'pending'}`}>{o.status}</span></td>
                      <td style={{ fontSize: 12, color: '#718096' }}>
                        {new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <select className="input" style={{ width: 115, padding: '4px 8px', fontSize: 11 }}
                          value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="delivered">Delivered</option>
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
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.orders.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>
    </div>
  )
}
