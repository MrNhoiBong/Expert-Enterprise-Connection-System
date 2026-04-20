import { useState, useEffect } from 'react'
import EENLayout from '../../components/Layout'
import { dbApi, bizApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

const MOCK_GRANTS = [
    { id: 'GRT001', title: 'Horizon Europe — Deep Tech Cluster', status: 'Active', amount: '€480k', disbursed: '€320k', deadline: 'Dec 2024', roi: '+22%', pct: 66 },
    { id: 'GRT002', title: 'EIC Accelerator — Quantum Readiness', status: 'Active', amount: '€240k', disbursed: '€180k', deadline: 'Mar 2025', roi: '+14%', pct: 75 },
    { id: 'GRT003', title: 'EEN Innovation Bridge 2024', status: 'Pending', amount: '€120k', disbursed: '—', deadline: 'Jan 2025', roi: 'TBD', pct: 0 },
    { id: 'GRT004', title: 'Nordic Energy Transition Fund', status: 'Completed', amount: '€360k', disbursed: '€360k', deadline: 'Jun 2024', roi: '+31%', pct: 100 },
]

const STATUS_STYLE = {
    Active: { tag: 'tag-green', label: 'Active' },
    Pending: { tag: 'tag-amber', label: 'Pending' },
    Completed: { tag: 'tag-slate', label: 'Completed' },
}

export default function ExpertFunds() {
    const [grants, setGrants] = useState(MOCK_GRANTS)
    const [loading, setLoading] = useState(false)
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState({ title: '', amount: '', project_id: '' })
    const [saving, setSaving] = useState(false)
    const [filter, setFilter] = useState('All')

    const filtered = filter === 'All' ? grants : grants.filter(g => g.status === filter)
    const totalAllocated = '€1.2M'
    const totalDisbursed = '€860k'
    const avgROI = '+22.3%'
    const activeCount = grants.filter(g => g.status === 'Active').length

    async function handleApply(e) {
        e.preventDefault(); setSaving(true)
        await new Promise(r => setTimeout(r, 700))
        setGrants(prev => [...prev, {
            id: `GRT${String(prev.length + 1).padStart(3, '0')}`,
            title: form.title, status: 'Pending',
            amount: form.amount, disbursed: '—', deadline: 'TBD', roi: 'TBD', pct: 0,
        }])
        setModal(false); setForm({ title: '', amount: '', project_id: '' }); setSaving(false)
    }

    return (
        <EENLayout activeKey="projects">
            <div className="page-inner fade-up">

                {/* Hero */}
                <div className="flex-between" style={{ marginBottom: 40, alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="page-title">Grant Management</h1>
                        <p className="page-subtitle" style={{ marginTop: 8 }}>
                            Enterprise funding disbursement and performance tracking for your active grant portfolio.
                        </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setModal(true)}>
                        <span className="ms ms-sm">add</span> New Allocation
                    </button>
                </div>

                {/* KPI row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 40 }}>
                    {[
                        { label: 'Total Committed', value: totalAllocated, icon: 'payments', iconBg: T.secondaryContainer },
                        { label: 'Avg. ROI Metric', value: avgROI, icon: 'trending_up', iconBg: T.tertiaryFixed },
                        { label: 'Active Grants', value: activeCount, icon: 'verified', iconBg: T.primaryFixed },
                        { label: 'Pending Review', value: grants.filter(g => g.status === 'Pending').length, icon: 'pending_actions', iconBg: T.errorContainer },
                    ].map(k => (
                        <div key={k.label} className="card" style={{ padding: 28 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>{k.icon}</span>
                            </div>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.outline, marginBottom: 6 }}>{k.label}</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 30, fontWeight: 800, color: T.primary }}>{k.value}</div>
                        </div>
                    ))}
                </div>

                {/* Funding portfolio */}
                <div>
                    <div className="flex-between" style={{ marginBottom: 20 }}>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700 }}>Funding Portfolio</h2>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {['All', 'Active', 'Pending', 'Completed'].map(f => (
                                <button key={f} onClick={() => setFilter(f)} style={{
                                    padding: '6px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                                    fontFamily: 'Manrope,sans-serif', fontSize: 11, fontWeight: 700,
                                    background: filter === f ? T.primary : T.surfaceContainerLowest,
                                    color: filter === f ? 'white' : T.onSurfaceVariant, transition: 'all 0.2s',
                                }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {filtered.map((g, i) => {
                            const st = STATUS_STYLE[g.status] || STATUS_STYLE['Pending']
                            return (
                                <div key={g.id} className="card card-hover" style={{ padding: 28, display: 'flex', alignItems: 'center', gap: 24 }}>
                                    {/* Left */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>account_balance</span>
                                            </div>
                                            <div>
                                                <h3 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 15, color: T.primary }}>{g.title}</h3>
                                                <p style={{ fontSize: 11, color: T.outline, fontFamily: 'monospace' }}>{g.id}</p>
                                            </div>
                                        </div>
                                        {g.pct > 0 && (
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                    <span style={{ fontSize: 10, color: T.outline, fontWeight: 600 }}>Disbursement progress</span>
                                                    <span style={{ fontSize: 10, color: T.outline, fontWeight: 700 }}>{g.pct}%</span>
                                                </div>
                                                <div className="progress-track">
                                                    <div className="progress-fill" style={{ width: `${g.pct}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Metrics */}
                                    <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
                                        {[
                                            ['Total', g.amount],
                                            ['Disbursed', g.disbursed],
                                            ['Deadline', g.deadline],
                                            ['ROI', g.roi],
                                        ].map(([k, v]) => (
                                            <div key={k} style={{ textAlign: 'center', minWidth: 70 }}>
                                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 4 }}>{k}</p>
                                                <p style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 15, color: k === 'ROI' && v.startsWith('+') ? '#16a34a' : T.onSurface }}>{v}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Status */}
                                    <span className={`tag ${st.tag}`} style={{ flexShrink: 0 }}>{g.status}</span>

                                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.outline }}>
                                        <span className="ms ms-sm">more_vert</span>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* ROI chart section */}
                <section style={{ background: T.surfaceContainerLow, borderRadius: 24, padding: 40, marginTop: 32 }}>
                    <div className="flex-between" style={{ marginBottom: 28 }}>
                        <div>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700 }}>Portfolio ROI Trend</h2>
                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, marginTop: 4 }}>12-month grant performance overview.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            {[['#00346f', 'ROI'], ['#3cd7ff', 'Disbursement']].map(([c, l]) => (
                                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: T.outline, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: 140, display: 'flex', alignItems: 'flex-end', gap: 8, borderBottom: `1px solid ${T.outlineVariant}40`, paddingBottom: 8 }}>
                        {['Q1', 'Q2', 'Q3', 'Q4', 'Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                            <div key={`${q}-${i}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ width: '100%', height: `${[45, 60, 50, 80, 65, 75, 55, 90][i]}%`, background: i === 7 ? T.primary : `${T.primary}20`, borderRadius: '4px 4px 0 0', transition: 'background 0.2s', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = i === 7 ? T.primaryContainer : `${T.primary}40`}
                                    onMouseLeave={e => e.currentTarget.style.background = i === 7 ? T.primary : `${T.primary}20`}
                                />
                                <span style={{ fontSize: 9, fontWeight: 700, color: T.outline }}>{q} '{i < 4 ? '23' : '24'}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Apply modal */}
            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <form className="modal" onSubmit={handleApply}>
                        <div className="modal-title">Apply for Grant Allocation</div>
                        <div className="input-group">
                            <label className="input-label">Grant / Fund Name</label>
                            <input className="input-field" required placeholder="e.g. Horizon Europe — Deep Tech" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Requested Amount</label>
                            <input className="input-field" required placeholder="e.g. €150,000" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Associated Project ID</label>
                            <input className="input-field" placeholder="e.g. PRJ001 (optional)" value={form.project_id} onChange={e => setForm({ ...form, project_id: e.target.value })} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                                {saving ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </EENLayout>
    )
}
