import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Pagination from '../components/Pagination'

const empty = { name: '', managerEmail: '', location: '', city: '', country: '', status: 'active', stars: 3, phone: '' }

export default function Hotels() {
  const [data, setData] = useState({ hotels: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', city: '', country: '', search: '', page: 1 })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/hotels?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load hotels'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { loadData() }, [loadData])

  const setF = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }))
  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = h => {
    setForm({ name: h.name, managerEmail: h.managerEmail || '', location: h.location || '', city: h.city || '', country: h.country || '', status: h.status, stars: h.stars || 3, phone: h.phone || '' })
    setEditId(h._id); setModal(true)
  }

  const save = async () => {
    if (!form.name) return toast.error('Name is required')
    setSaving(true)
    try {
      if (editId) { await api.put(`/hotels/${editId}`, form); toast.success('Hotel updated') }
      else { await api.post('/hotels', form); toast.success('Hotel added') }
      setModal(false); loadData()
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Delete this hotel?')) return
    try { await api.delete(`/hotels/${id}`); toast.success('Deleted'); loadData() }
    catch { toast.error('Delete failed') }
  }

  const stars = n => '★'.repeat(Math.min(Math.round(n || 0), 5))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Hotels</div>
          <div className="page-sub">Manage all hotels in the system.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={13} /> Add Hotel</button>
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
          <option value="Miami">Miami</option>
          <option value="Denver">Denver</option>
          <option value="Bali">Bali</option>
          <option value="New York">New York</option>
          <option value="Dubai">Dubai</option>
        </select>
        <select className="input" style={{ width: 135 }} value={filters.country} onChange={e => setF('country', e.target.value)}>
          <option value="">All Countries</option>
          <option value="USA">USA</option>
          <option value="UAE">UAE</option>
          <option value="Indonesia">Indonesia</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search hotels..."
            value={filters.search} onChange={e => setF('search', e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hotel</th><th>Manager</th><th>Location</th>
                <th>Status</th><th>Ratings</th><th>Bookings</th>
                <th>Revenue</th><th>Joined On</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.hotels.length === 0
                  ? <tr><td colSpan={9} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No hotels found</td></tr>
                  : data.hotels.map(h => (
                    <tr key={h._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(128,90,213,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, border: '1px solid rgba(128,90,213,0.2)' }}>🏨</div>
                          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{h.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#718096', fontSize: 12 }}>{h.managerEmail || '—'}</td>
                      <td style={{ color: '#718096' }}>{h.city ? `${h.city}, ${h.country}` : h.location || '—'}</td>
                      <td><span className={`badge badge-${h.status}`}>{h.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#C9A84C', fontSize: 12 }}>{stars(h.rating)}</span>
                          <span style={{ fontSize: 12, fontWeight: 600 }}>{h.rating?.toFixed(1) || '0.0'}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{h.totalBookings?.toLocaleString() || 0}</td>
                      <td style={{ color: '#C9A84C', fontWeight: 600 }}>${h.revenue?.toLocaleString() || 0}</td>
                      <td style={{ color: '#718096', fontSize: 12 }}>
                        {h.joinedOn ? new Date(h.joinedOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn-icon" title="View"><Eye size={13} /></button>
                          <button className="btn-icon" title="Edit" onClick={() => openEdit(h)}><Edit2 size={13} /></button>
                          <button className="btn-icon danger" title="Delete" onClick={() => remove(h._id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.hotels.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit Hotel' : 'Add Hotel'}</div>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="grid-2">
              {[['name','Name *','text'],['managerEmail','Manager Email','email'],['city','City','text'],['country','Country','text'],['phone','Phone','text']].map(([key,label,type]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="input" type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Stars</label>
                <select className="input" value={form.stars} onChange={e => setForm(f => ({ ...f, stars: Number(e.target.value) }))}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
