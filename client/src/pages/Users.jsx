import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Edit2, Trash2, Eye, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Pagination from '../components/Pagination'

const empty = { name: '', email: '', password: '', role: 'customer', phone: '', status: 'active' }

const roleLabels = {
  super_admin: 'Super Admin', admin: 'Admin',
  hotel_manager: 'Hotel Manager', restaurant_manager: 'Rest. Manager', customer: 'Customer'
}

export default function Users() {
  const [data, setData] = useState({ users: [], total: 0, pages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ role: '', status: '', search: '', page: 1 })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    api.get(`/users?${params}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => { fetchData() }, [fetchData])

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true) }
  const openEdit = u => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, phone: u.phone || '', status: u.status })
    setEditId(u._id); setModal(true)
  }

  const save = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required')
    if (!editId && !form.password) return toast.error('Password required for new user')
    setSaving(true)
    try {
      if (editId) { await api.put(`/users/${editId}`, form); toast.success('User updated') }
      else { await api.post('/users', form); toast.success('User added') }
      setModal(false); fetchData()
    } catch (e) { toast.error(e.response?.data?.message || 'Error saving') }
    finally { setSaving(false) }
  }

  const remove = async id => {
    if (!confirm('Delete this user?')) return
    try { await api.delete(`/users/${id}`); toast.success('Deleted'); fetchData() }
    catch { toast.error('Delete failed') }
  }

  const initials = name => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const avatarColors = ['#C9A84C', '#805ad5', '#3182ce', '#38a169', '#dd6b20']
  const avatarColor = name => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Users</div>
          <div className="page-sub">Manage all users in the system.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline btn-sm"><Download size={13} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={openAdd}><Plus size={13} /> Add User</button>
        </div>
      </div>

      <div className="filters">
        <select className="input" style={{ width: 155 }} value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="hotel_manager">Hotel Manager</option>
          <option value="restaurant_manager">Restaurant Manager</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
        <select className="input" style={{ width: 130 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
          <input className="input" style={{ paddingLeft: 32, width: 220 }} placeholder="Search users..."
            value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined On</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>Loading...</td></tr>
                : data.users.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#718096', padding: 36 }}>No users found</td></tr>
                  : data.users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: avatarColor(u.name), color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>{initials(u.name)}</div>
                          <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#718096' }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role}`}>{roleLabels[u.role] || u.role}</span></td>
                      <td><span className={`badge badge-${u.status}`}>{u.status}</span></td>
                      <td style={{ color: '#718096', fontSize: 12 }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button className="btn-icon" title="View"><Eye size={13} /></button>
                          <button className="btn-icon" title="Edit" onClick={() => openEdit(u)}><Edit2 size={13} /></button>
                          <button className="btn-icon danger" title="Delete" onClick={() => remove(u._id)}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span style={{ fontSize: 12, color: '#718096' }}>Showing {data.users.length} of {data.total} results</span>
          <Pagination page={data.page} pages={data.pages} onPage={p => setFilters(f => ({ ...f, page: p }))} />
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? 'Edit User' : 'Add User'}</div>
              <button className="btn-icon" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Full Name *</label><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Email *</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">{editId ? 'New Password (optional)' : 'Password *'}</label><input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="customer">Customer</option><option value="hotel_manager">Hotel Manager</option>
                  <option value="restaurant_manager">Restaurant Manager</option><option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="active">Active</option><option value="inactive">Inactive</option><option value="banned">Banned</option>
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
