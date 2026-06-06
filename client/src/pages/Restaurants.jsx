import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Pagination from '../components/Pagination'

const empty = { name: '', ownerEmail: '', location: '', city: '', country: '', status: 'active', cuisine: '', phone: '' }

export default function Restaurants() {
  const [data, setData] = useState({ restaurants: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', city: '', country: '', search: '', page: 1 })
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/restaurants?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load restaurants'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { loadData() }, [loadData])

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))
  const openAdd = () => { setForm(empty); setEditId(null); setModal('open') }
  const openEdit = r => {
    setForm({ name: r.name, ownerEmail: r.ownerEmail || '', location: r.location || '', city: r.city || '', country: r.country || '', status: r.status, cuisine: r.cuisine || '', phone: r.phone || '' })
    setEditId(r._id); setModal('open')
  }

  const save = async () => {
    if (!form.name) return toast.error('Name is required')
    setSaving(true)
    try {
      if (editId) { await api.put(`/restaurants/${editId}`, form); toast.success('Restaurant updated') }
      else { await api.post('/restaurants', form); toast.success('Restaurant added') }
      setModal(null); loadData()
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Delete this restaurant?')) return
    try { await api.delete(`/restaurants/${id}`); toast.success('Deleted'); loadData() }
    catch { toast.error('Delete failed') }
  }

  const stars = n => '★'.repeat(Math.min(Math.round(n || 0), 5))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Restaurants</div>
          <div className="page-sub">Manage all restaurants in the system.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={13} /> Add Restaurant</button>
        </div>
      </div>

      <div className="filters">
        <select className="input" style={{ width: 130 }} value={filters.status} onChange={e => setF('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <select className="input" style={{ width: 120 }} value={filters.city} onChange={e => setF('city', e.target.value)}>
          <option value="">All Cities</option>
          <option value="New York">New York</option>
          <option value="Dubai">Dubai</option>
          <option value="Chicago">Chicago</option>
          <option value="Toronto">Toronto</option>
          <option value="Denver">Denver</option>
          <option value="Los Angeles">Los Angeles</option>
        </select>
        <select className="input" style={{ width: 135 }} value={filters.country} onChange={e => setF('country', e.target.value)}>
          <option value="">All Countries</option>
          <option value="USA">USA</option>
          <option value="UAE">UAE</option>
          <option value="Canada">Canada</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search restaurants..."
            value={filters.search} onChange={e => setF('search', e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Restaurant</th><th>Owner</th><th>Location</th>
                <th>Status</th><th>Ratings</th><th>Orders</th>
                <th>Revenue</th><th>Joined On</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.restaurants.length === 0
                  ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No restaurants found</td></tr>
                  : data.restaurants.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: '1px solid rgba(201,168,76,0.2)' }}>🍽️</div>
                          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{r.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#718096', fontSize: 12 }}>{r.ownerEmail || '—'}</td>
                      <td style={{ color: '#718096' }}>{r.city ? `${r.city}, ${r.country}` : r.location || '—'}</td>
                      <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#C9A84C', fontSize: 12 }}>{stars(r.rating)}</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{r.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{r.totalOrders?.toLocaleString() || 0}</td>
                      <td style={{ color: '#C9A84C', fontWeight: 600 }}>${r.revenue?.toLocaleString() || 0}</td>
                      <td style={{ color: '#718096', fontSize: 12 }}>
                        {r.joinedOn ? new Date(r.joinedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn-icon" title="View"><Eye size={13} /></button>
                          <button className="btn-icon" title="Edit" onClick={() => openEdit(r)}><Edit2 size={13} /></button>
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
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.restaurants.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit Restaurant' : 'Add Restaurant'}</div>
              <button className="btn-icon" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Owner Email</label><input className="input" type="email" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">City</label><input className="input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Country</label><input className="input" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Cuisine</label><input className="input" value={form.cuisine} onChange={e => setForm(f => ({ ...f, cuisine: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
