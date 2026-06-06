import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import DinewayLogo from '../components/DinewayLogo'

const TABS = ['General', 'Payment', 'Email', 'Notifications', 'Integrations', 'Security', 'System']

export default function Settings() {
  const [tab, setTab] = useState('General')
  const [form, setForm] = useState({
    siteName: 'Dineway Global', siteEmail: '', sitePhone: '',
    siteAddress: '', timezone: '(UTC-05:00) Eastern Time (US & Canada)',
    currency: 'USD - US Dollar', maintenanceMode: false,
    emailNotifications: true, smsNotifications: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/settings')
      .then(r => setForm(f => ({ ...f, ...r.data })))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try { await api.put('/settings', form); toast.success('Settings saved') }
    catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  if (loading) return <div className="page"><p style={{ color: '#718096' }}>Loading settings...</p></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-sub">Manage system settings and preferences.</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          <Save size={13} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t} className={`tab-btn${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'General' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 16 }}>Site Information</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Site Name</label>
                  <input className="input" value={form.siteName} onChange={e => set('siteName', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Site Email</label>
                  <input className="input" type="email" value={form.siteEmail} onChange={e => set('siteEmail', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Site Phone</label>
                  <input className="input" value={form.sitePhone || ''} onChange={e => set('sitePhone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="input" value={form.siteAddress || ''} onChange={e => set('siteAddress', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select className="input" value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                    <option>(UTC-05:00) Eastern Time (US &amp; Canada)</option>
                    <option>(UTC+00:00) UTC</option>
                    <option>(UTC+01:00) London</option>
                    <option>(UTC+04:00) Dubai</option>
                    <option>(UTC+05:30) Mumbai</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                    <option>AED - UAE Dirham</option>
                    <option>INR - Indian Rupee</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right col */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Logo panel */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 28, background: '#1a1a2e' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.6)', alignSelf: 'flex-start' }}>Logo</div>
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                border: '2px solid #C9A84C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#0f0e0a',
              }}>
                <DinewayLogo size={110} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', letterSpacing: 3 }}>DINEWAY</div>
                <div style={{ fontSize: 9, color: 'rgba(201,168,76,0.6)', letterSpacing: 2, marginTop: 3 }}>GLOBAL ADMIN</div>
              </div>
              <button className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(201,168,76,0.4)', color: '#C9A84C' }}>
                Change Logo
              </button>
            </div>

            {/* System toggles */}
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e', marginBottom: 16 }}>System</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  ['maintenanceMode', 'Maintenance Mode'],
                  ['emailNotifications', 'Email Notifications'],
                  ['smsNotifications', 'SMS Notifications'],
                ].map(([key, label]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#1a1a2e' }}>{label}</span>
                    <div
                      className="toggle"
                      style={{ background: form[key] ? '#C9A84C' : '#e2e8f0' }}
                      onClick={() => set(key, !form[key])}
                    >
                      <div className="toggle-thumb" style={{ left: form[key] ? 21 : 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab !== 'General' && (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>⚙️</div>
          <div style={{ color: '#718096', fontSize: 14 }}>{tab} settings coming soon</div>
        </div>
      )}
    </div>
  )
}
