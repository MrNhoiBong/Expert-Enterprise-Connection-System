import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EnterpriseLayout from '../../components/EnterpriseLayout'
import { dbApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

const DOMAINS = ['All Domains', 'Renewables', 'Quantum Tech', 'Supply Chain', 'FinTech']
const STATUS_MAP = {
    'In Progress': { tag: 'tag-green', dot: '#16a34a', label: 'On Track' },
    'Planning': { tag: 'tag-amber', dot: '#d97706', label: 'Discovery' },
    'Completed': { tag: 'tag-slate', dot: '#64748b', label: 'Complete' },
}

export default function EnterpriseProjects() {
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [grants, setGrants] = useState([])   // grant records
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [domain, setDomain] = useState('All Domains')
    const [showGrant, setShowGrant] = useState(null)
    const [grantForm, setGrantForm] = useState({ description: '', amount: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        Promise.all([
            dbApi.getProjects(),
            dbApi.getGrants(),       // load grant records
        ]).then(([p, g]) => {
            if (Array.isArray(p)) setProjects(p)
            if (Array.isArray(g)) setGrants(g)
        }).finally(() => setLoading(false))
    }, [])

    const filtered = projects.filter(p =>
        !search || p.name?.toLowerCase().includes(search.toLowerCase())
    )

    // Lấy TẤT CẢ grant của 1 project
    function getGrants(projectId) {
        return grants.filter(g => g.projectID === projectId)
    }

    const [grantMsg, setGrantMsg] = useState('')

    async function handleGrant(e) {
        e.preventDefault(); if (!showGrant) return
        setSaving(true)
        const res = await dbApi.grantProject(showGrant.projectID, {
            description: grantForm.description,
            amount: parseFloat(grantForm.amount) || 0,
        })
        if (res) {
            const g = await dbApi.getGrants()
            if (Array.isArray(g)) setGrants(g)
            setGrantMsg(res.message || 'Grant submitted!')
            setTimeout(() => setGrantMsg(''), 3000)
        }
        setShowGrant(null); setGrantForm({ description: '', amount: '' }); setSaving(false)
    }

    return (
        <EnterpriseLayout activeKey="projects">
            <div className="page-inner fade-up">

                {/* Toast */}
                {grantMsg && (
                    <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#065f46', color: 'white', padding: '12px 20px', borderRadius: 12, fontSize: 13, fontWeight: 600, zIndex: 400, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                        <span className="ms ms-sm">check_circle</span>{grantMsg}
                    </div>
                )}

                {/* Header */}
                <div className="flex-between" style={{ marginBottom: 36 }}>
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: T.tertiary, marginBottom: 8 }}>Central Registry</p>
                        <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.onSurface, letterSpacing: '-0.02em' }}>Active Projects</h1>
                        <p style={{ fontSize: 16, color: T.onSurfaceVariant, marginTop: 8, maxWidth: 520 }}>Curated oversight of high-impact corporate initiatives and strategic expert deployments.</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <span className="ms" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 18 }}>search</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            style={{ background: T.surfaceContainerLow, border: 'none', borderRadius: 999, padding: '10px 16px 10px 38px', fontSize: 13, width: 260, outline: 'none', color: T.onSurface }}
                            placeholder="Search projects..." />
                    </div>
                </div>

                {/* Domain chips */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    {DOMAINS.map(d => (
                        <button key={d} onClick={() => setDomain(d)}
                            style={{ padding: '7px 16px', borderRadius: 999, border: `1.5px solid ${domain === d ? T.primary : T.outlineVariant}`, background: domain === d ? T.primaryFixed : 'white', color: domain === d ? T.primary : T.onSurfaceVariant, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {d}
                        </button>
                    ))}
                </div>

                {/* Projects list */}
                {loading ? <div style={{ textAlign: 'center', padding: 40, color: T.outline }}>Loading...</div>
                    : filtered.length === 0
                        ? <div className="empty-state"><span className="ms ms-xl" style={{ color: T.outlineVariant }}>work_off</span><p>No projects found</p></div>
                        : filtered.map((p, i) => {
                            const st = STATUS_MAP[p.status] || STATUS_MAP['Planning']
                            const pgrants = getGrants(p.projectID)
                            const totalGranted = pgrants.reduce((sum, g) => sum + (g.amount || 0), 0)
                            return (
                                <div key={p.projectID || i} className="card" style={{ padding: 28, marginBottom: 14 }}>
                                    <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1, paddingRight: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                <span className={`tag ${st.tag}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                                                    {st.label}
                                                </span>
                                                <span style={{ fontSize: 10, color: T.outline, fontWeight: 600, letterSpacing: '0.1em' }}>{p.projectID}</span>
                                                {pgrants.length > 0 && (
                                                    <span className="tag tag-teal" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                                                        <span className="ms ms-sm" style={{ fontSize: 12 }}>monetization_on</span>
                                                        {pgrants.length} Grant{pgrants.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{p.name}</h3>
                                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.6 }}>{p.description || 'Enterprise-grade initiative.'}</p>
                                            <div style={{ display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
                                                {[['calendar_today', `${p.start_date || '—'} – ${p.end_date || '—'}`], ['person', p.createBy || '—']].map(([icon, val]) => (
                                                    <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        <span className="ms ms-sm" style={{ color: T.outline }}>{icon}</span>
                                                        <span style={{ fontSize: 12, color: T.outline }}>{val}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Grant history */}
                                            {pgrants.length > 0 && (
                                                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    {pgrants.map((g, gi) => (
                                                        <div key={g.grantID || gi} style={{ padding: '8px 14px', background: T.primaryFixed, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
                                                            <span className="ms ms-fill ms-sm" style={{ color: T.primary, flexShrink: 0 }}>verified</span>
                                                            <span style={{ fontWeight: 700, color: T.primary }}>${Number(g.amount || 0).toLocaleString()}</span>
                                                            <span style={{ color: T.outline }}>by</span>
                                                            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{g.enterpriseID}</span>
                                                            <span style={{ color: T.outlineVariant, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.description}</span>
                                                            <span style={{ color: T.outline, flexShrink: 0 }}>{g.grantDate}</span>
                                                        </div>
                                                    ))}
                                                    {pgrants.length > 1 && (
                                                        <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, paddingLeft: 14 }}>
                                                            Total: ${totalGranted.toLocaleString()} USD
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Grant button — luôn hiện, enterprise có thể grant nhiều lần */}
                                        <button className="btn btn-primary" style={{ fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
                                            onClick={() => { setShowGrant(p); setGrantForm({ description: '', amount: '' }) }}>
                                            <span className="ms ms-sm">monetization_on</span> Grant Project
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                }

                {/* ── Grant Modal ── */}
                {showGrant && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGrant(null)}>
                        <form className="modal" onSubmit={handleGrant}>
                            <div className="modal-title">Grant Project — {showGrant.name}</div>

                            {/* Amount */}
                            <div className="input-group">
                                <label className="input-label">Grant Amount (USD) *</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 14, fontWeight: 700, color: T.outline }}>$</span>
                                    <input className="input-field" style={{ paddingLeft: 28 }}
                                        type="number" min="1" step="0.01" required
                                        placeholder="e.g. 50000"
                                        value={grantForm.amount}
                                        onChange={e => setGrantForm({ ...grantForm, amount: e.target.value })} />
                                </div>
                                {grantForm.amount > 0 && (
                                    <p style={{ fontSize: 11, color: T.primary, marginTop: 4, fontWeight: 600 }}>
                                        = ${parseFloat(grantForm.amount).toLocaleString()} USD
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="input-group">
                                <label className="input-label">Grant Description *</label>
                                <textarea className="input-field" rows={3} style={{ resize: 'none' }} required
                                    placeholder="Describe the purpose and scope of this grant..."
                                    value={grantForm.description}
                                    onChange={e => setGrantForm({ ...grantForm, description: e.target.value })} />
                            </div>

                            {/* Summary */}
                            {grantForm.amount && grantForm.description && (
                                <div style={{ background: T.primaryFixed, borderRadius: 10, padding: '10px 14px', marginBottom: 8, fontSize: 12 }}>
                                    <span style={{ fontWeight: 700, color: T.primary }}>${parseFloat(grantForm.amount).toLocaleString()}</span>
                                    <span style={{ color: T.outline }}> → {showGrant.name} · by {profile?.company_name || profile?.enterpriseID}</span>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowGrant(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                                    {saving ? 'Submitting...' : <><span className="ms ms-sm">send</span> Confirm Grant</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </EnterpriseLayout>
    )
}
