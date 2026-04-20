import { useState, useEffect } from 'react'
import EnterpriseLayout from '../../components/EnterpriseLayout'
import { dbApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth'
import { T } from '../../styles/theme.js'

const MOCK_GRANTS = [
    { name: 'Project Alpha: Quantum Neural Latency', desc: 'Deep tech exploration for low-latency network architectures.', value: 2450000, disbursed: 75, roi: 24.8, status: 'Active', expert: 'Dr. Aris Thorne', milestone: 'Phase 2 Benchmarking', color: T.primary },
    { name: 'EcoGrid Sustain-X Initiative', desc: 'Renewable energy distribution protocols.', value: 1200000, disbursed: 45, roi: 18.4, status: 'Active', expert: 'Sarah Jenkins', milestone: 'Grid Integration', color: '#16a34a' },
    { name: 'Silicon Logic Optima', desc: 'Next-gen chip architectural research.', value: 900000, disbursed: 60, roi: 12.0, status: 'Disbursing', expert: 'Marcus Thorne', milestone: 'Final Testing', color: '#7c3aed' },
    { name: 'BioSynth Material Phase', desc: 'Organic polymer synthesis at scale.', value: 420000, disbursed: 100, roi: 9.4, status: 'Complete', expert: 'Dr. Leila Vance', milestone: 'Final Review', color: T.secondary },
]

export default function EnterpriseGrants() {
    const [tab, setTab] = useState('All Grants')

    const fmt = n => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`

    const STATS = [
        { label: 'Total Committed', value: '$48.2M', icon: 'payments', trend: '+8.4% QoQ', bg: T.primaryFixed },
        { label: 'Avg. ROI Metric', value: '+18.4%', icon: 'trending_up', trend: 'Above target', bg: T.tertiaryFixed },
        { label: 'Active Grants', value: '142', icon: 'verified', trend: 'Across network', bg: T.secondaryContainer },
        { label: 'Pending Review', value: '12', icon: 'pending_actions', trend: 'Awaiting audit', bg: T.errorContainer },
    ]

    const STATUS_CLR = { Active: 'tag-green', Disbursing: 'tag-blue', Complete: 'tag-slate' }

    return (
        <EnterpriseLayout activeKey="grants">
            <div className="page-inner fade-up">

                {/* Header */}
                <div className="flex-between" style={{ marginBottom: 36 }}>
                    <div>
                        <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Grant Management</h1>
                        <p style={{ fontSize: 15, color: T.onSurfaceVariant, marginTop: 8 }}>Enterprise funding disbursement and performance tracking.</p>
                    </div>
                    <button className="btn btn-primary">
                        <span className="ms ms-sm">add</span> New Allocation
                    </button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
                    {STATS.map(s => (
                        <div key={s.label} className="card" style={{ padding: 22 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 11, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                <span className="ms ms-fill" style={{ color: T.primary, fontSize: 20 }}>{s.icon}</span>
                            </div>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.outline, marginBottom: 4 }}>{s.label}</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 30, fontWeight: 800, color: T.primary }}>{s.value}</div>
                            <p style={{ fontSize: 11, color: T.onSurfaceVariant, marginTop: 4 }}>{s.trend}</p>
                        </div>
                    ))}
                </div>

                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: `1px solid ${T.outlineVariant}40`, paddingBottom: 0 }}>
                    {['All Grants', 'Milestone Due', 'ROI High'].map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: tab === t ? 700 : 500, fontSize: 13, color: tab === t ? T.primary : T.onSurfaceVariant, borderBottom: tab === t ? `2px solid ${T.primary}` : '2px solid transparent', marginBottom: -1 }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Grant cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                    {MOCK_GRANTS.map((g, i) => (
                        <div key={i} className="card" style={{ padding: 28 }}>
                            <div className="flex-between" style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: g.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="ms ms-fill ms-sm" style={{ color: g.color }}>monetization_on</span>
                                    </div>
                                    <span className={`tag ${STATUS_CLR[g.status] || 'tag-slate'}`}>{g.status}</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 800, color: g.color }}>{fmt(g.value)}</div>
                                    <div style={{ fontSize: 10, color: T.outline }}>Total Funding</div>
                                </div>
                            </div>
                            <h3 style={{ fontWeight: 700, fontSize: 15, color: T.onSurface, marginBottom: 4 }}>{g.name}</h3>
                            <p style={{ fontSize: 12, color: T.onSurfaceVariant, marginBottom: 14 }}>{g.desc}</p>

                            {/* Progress bar */}
                            <div style={{ marginBottom: 12 }}>
                                <div className="flex-between" style={{ marginBottom: 6 }}>
                                    <span style={{ fontSize: 11, color: T.outline }}>Disbursement Progress</span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: T.onSurface }}>{g.disbursed}%</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${g.disbursed}%`, background: g.color }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 16 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: T.outline, marginBottom: 2 }}>ROI (3-Yr Proj.)</div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}>
                                        <span className="ms ms-sm">arrow_upward</span>{g.roi}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: T.outline, marginBottom: 2 }}>Lead Expert</div>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>{g.expert}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: T.outline, marginBottom: 2 }}>Next Milestone</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: T.primary, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span className="ms ms-sm">event</span>{g.milestone}
                                    </div>
                                </div>
                            </div>

                            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 16, fontSize: 12 }}>
                                View Full Audit <span className="ms ms-sm">arrow_forward</span>
                            </button>
                        </div>
                    ))}
                </div>

                {/* Risk Exposure */}
                <div className="card" style={{ padding: 28 }}>
                    <div className="flex-between" style={{ marginBottom: 24 }}>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Risk Exposure</h2>
                        <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                            <span className="ms ms-sm">download</span> Download Report
                        </button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                        {[
                            { label: 'Stable / Low', pct: 62, color: '#16a34a' },
                            { label: 'Moderate / Tech-Edge', pct: 28, color: '#d97706' },
                            { label: 'High / Experimental', pct: 10, color: T.error },
                        ].map(r => (
                            <div key={r.label} style={{ padding: '20px 24px', background: T.surfaceContainerLow, borderRadius: 12 }}>
                                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'Manrope,sans-serif', color: r.color, marginBottom: 8 }}>{r.pct}%</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: T.onSurface, marginBottom: 10 }}>{r.label}</div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${r.pct}%`, background: r.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </EnterpriseLayout>
    )
}
