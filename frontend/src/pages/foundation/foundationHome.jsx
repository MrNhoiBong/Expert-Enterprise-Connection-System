import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FoundationLayout from '../../components/FoundationLayout'
import { dbApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

export default function FoundationHome() {
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dbApi.getProjects().then(p => { if (Array.isArray(p)) setProjects(p.slice(0, 3)) }).finally(() => setLoading(false))
    }, [])

    const name = profile?.name || 'Foundation'

    const KPIS = [
        { label: 'Active Funds', value: '$142.8M', icon: 'account_balance_wallet', sub: '+12% from last quarter', bg: T.primaryFixed },
        { label: 'Pipeline Projects', value: 84, icon: 'search_insights', sub: '22 under review', bg: T.tertiaryFixed },
        { label: 'Funded Projects', value: 312, icon: 'task_alt', sub: '89% success rate', bg: T.secondaryContainer },
        { label: 'Fund Allocation', value: '89%', icon: 'insights', sub: 'Optimal liquidity', bg: T.primaryFixed },
    ]

    const SECTORS = ['AI Research', 'Green Tech', 'Healthcare', 'FinTech', 'Aerospace']

    const ACTIVITY = [
        { icon: 'add_circle', color: T.primary, title: 'Fund Created', desc: 'Neural-Link Phase II allocated $12.5M', time: '2 hours ago' },
        { icon: 'check_circle', color: '#16a34a', title: 'Request Approved', desc: 'Ocean Cleanup Satellite project funded', time: '5 hours ago' },
        { icon: 'warning', color: '#d97706', title: 'Audit Required', desc: 'Unusual activity detected in Urban Grid R3', time: 'Yesterday' },
    ]

    return (
        <FoundationLayout activeKey="dashboard">
            <div className="page-inner fade-up">

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Foundation Dashboard</h1>
                    <p style={{ fontSize: 16, color: T.onSurfaceVariant, marginTop: 8, maxWidth: 560 }}>
                        A panoramic view of the EEN capital ecosystem. Managing global expertise through precise resource allocation.
                    </p>
                </div>

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
                    {KPIS.map(k => (
                        <div key={k.label} className="card" style={{ padding: 24 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>{k.icon}</span>
                            </div>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.outline, marginBottom: 6 }}>{k.label}</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 30, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>{k.value}</div>
                            <p style={{ fontSize: 11, color: T.onSurfaceVariant, marginTop: 4 }}>{k.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Sector chips + Strategic Insight */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                    {SECTORS.map(s => (
                        <span key={s} style={{ padding: '6px 14px', borderRadius: 999, background: T.primaryFixed, color: T.primary, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }}>{s}</span>
                    ))}
                </div>
                <div style={{ background: `linear-gradient(135deg,${T.primary},${T.tertiaryContainer})`, borderRadius: 16, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, color: 'white' }}>
                    <span className="ms ms-fill ms-xl" style={{ color: T.tertiaryFixed, flexShrink: 0 }}>lightbulb</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.tertiaryFixed, marginBottom: 4 }}>Strategic Insight</p>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>Health-tech allocations grew by 18% following Q3 directive. Current liquidity remains optimal for new AI research requests.</p>
                    </div>
                    <button className="btn btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', fontSize: 12 }} onClick={() => navigate('/foundation/funds')}>
                        View Analysis <span className="ms ms-sm">arrow_forward</span>
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

                    {/* Spotlight Project */}
                    <div className="card-dark" style={{ borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(215,226,255,0.5)' }}>Spotlight Project</p>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>Global Network Latency Optimization</h2>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>A cornerstone initiative funded by the Foundation to bridge expert silos across continents, reducing decision latency by 45%.</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => navigate('/foundation/projects')}>
                                <span className="ms ms-sm">trending_up</span> Review Progress
                            </button>
                            <button className="btn btn-ghost" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }} onClick={() => navigate('/foundation/funds')}>
                                View Funding Data
                            </button>
                        </div>
                    </div>

                    {/* Live Activity */}
                    <div className="card" style={{ padding: 24 }}>
                        <div className="flex-between" style={{ marginBottom: 20 }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 16, fontWeight: 700 }}>Live Activity</h3>
                            <button className="btn btn-ghost" style={{ fontSize: 11 }} onClick={() => navigate('/foundation/requests')}>
                                Show All <span className="ms ms-sm">open_in_new</span>
                            </button>
                        </div>
                        {ACTIVITY.map((a, i, arr) => (
                            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < arr.length - 1 ? 16 : 0, marginBottom: i < arr.length - 1 ? 16 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                <span className="ms ms-fill ms-sm" style={{ color: a.color, flexShrink: 0, marginTop: 2 }}>{a.icon}</span>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{a.title}</div>
                                    <div style={{ fontSize: 11, color: T.onSurfaceVariant, lineHeight: 1.5 }}>{a.desc}</div>
                                    <div style={{ fontSize: 10, color: T.outline, marginTop: 3, fontFamily: 'monospace' }}>{a.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Projects quick view */}
                <div className="card" style={{ padding: 28 }}>
                    <div className="flex-between" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700 }}>Active Projects</h3>
                        <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/foundation/projects')}>
                            View All <span className="ms ms-sm">arrow_forward</span>
                        </button>
                    </div>
                    {loading ? <div style={{ textAlign: 'center', padding: 20, color: T.outline }}>Loading...</div>
                        : projects.map((p, i) => (
                            <div key={i} className="flex-between" style={{ padding: '12px 0', borderBottom: i < projects.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="ms ms-sm" style={{ color: T.primary }}>assignment</span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                                        <div style={{ fontSize: 11, color: T.outline }}>{p.projectID} · {p.createBy}</div>
                                    </div>
                                </div>
                                <span className={`tag ${p.status === 'In Progress' ? 'tag-green' : 'tag-amber'}`}>{p.status || 'Active'}</span>
                            </div>
                        ))}
                </div>

            </div>
        </FoundationLayout>
    )
}
