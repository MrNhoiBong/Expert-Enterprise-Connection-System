import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EnterpriseLayout from '../../components/EnterpriseLayout'
import { dbApi, bizApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth'
import { T } from '../../styles/theme.js'

export default function EnterpriseHome() {
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [experts, setExperts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([dbApi.getProjects(), dbApi.getExperts()])
            .then(([p, e]) => {
                if (Array.isArray(p)) setProjects(p.slice(0, 4))
                if (Array.isArray(e)) setExperts(e.slice(0, 3))
            }).finally(() => setLoading(false))
    }, [])

    const name = profile?.company_name || profile?.name || 'Enterprise'

    const KPIS = [
        { label: 'Active Projects', value: projects.length || 4, icon: 'work', sub: '+1 this month', bg: T.primaryFixed },
        { label: 'Total Grants', value: 3, icon: 'monetization_on', sub: 'Approved', bg: T.tertiaryFixed },
        { label: 'Expert Network', value: experts.length || 8, icon: 'group', sub: 'Verified', bg: T.secondaryContainer },
        { label: 'Engagement Success', value: '96.8%', icon: 'task_alt', sub: 'Exceeding KPI', bg: T.primaryFixed },
    ]

    const S = {
        'In Progress': { cls: 'tag-green', dot: '#16a34a' },
        'Planning': { cls: 'tag-amber', dot: '#d97706' },
        'Completed': { cls: 'tag-slate', dot: '#64748b' },
    }

    return (
        <EnterpriseLayout activeKey="dashboard">
            <div className="page-inner fade-up">

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>
                        Strategic Overview
                    </h1>
                    <p style={{ fontSize: 16, color: T.onSurfaceVariant, marginTop: 8 }}>
                        Welcome back, <strong>{name}</strong>. Real-time intelligence and resource allocation.
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
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 34, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>{k.value}</div>
                            <p style={{ fontSize: 11, color: T.onSurfaceVariant, marginTop: 4 }}>{k.sub}</p>
                        </div>
                    ))}
                </div>

                {/* AI Insight Banner */}
                <div style={{ background: `linear-gradient(135deg,${T.primary},${T.tertiaryContainer})`, borderRadius: 16, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, color: 'white' }}>
                    <span className="ms ms-fill ms-xl" style={{ color: T.tertiaryFixed, flexShrink: 0 }}>lightbulb</span>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.tertiaryFixed, marginBottom: 4 }}>Strategic Intelligence</p>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>AI detects 15% demand shift toward Biotech Engineering in EMEA. Recommend diversifying talent pipeline for Q4.</p>
                    </div>
                    <button className="btn btn-ghost" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', fontSize: 12 }} onClick={() => navigate('/enterprise/discovery')}>
                        View Analysis <span className="ms ms-sm">arrow_forward</span>
                    </button>
                </div>

                {/* Projects + Grants */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div className="card" style={{ padding: 28 }}>
                        <div className="flex-between" style={{ marginBottom: 24 }}>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 19, fontWeight: 700 }}>Active Pipeline</h2>
                            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/enterprise/projects')}>
                                Explore All <span className="ms ms-sm">arrow_forward</span>
                            </button>
                        </div>
                        {loading ? <div style={{ textAlign: 'center', padding: 20, color: T.outline }}>Loading...</div>
                            : projects.map((p, i) => {
                                const st = S[p.status] || S['Planning']
                                return (
                                    <div key={i} className="flex-between" style={{ padding: '14px 0', borderBottom: i < projects.length - 1 ? `1px solid ${T.outlineVariant}30` : 'none', cursor: 'pointer' }}
                                        onClick={() => navigate('/enterprise/projects')}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="ms ms-sm" style={{ color: T.primary }}>work</span>
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{p.name}</div>
                                                <div style={{ fontSize: 11, color: T.outline }}>{p.projectID} · {p.createBy}</div>
                                            </div>
                                        </div>
                                        <span className={`tag ${st.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                                            {p.status || 'Planning'}
                                        </span>
                                    </div>
                                )
                            })}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="card-dark" style={{ borderRadius: 16, padding: 28, flex: 1 }}>
                            <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(215,226,255,0.5)', marginBottom: 10 }}>Grant Portfolio</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 38, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>$14.2M</div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 18 }}>Total committed grants · +8.4% QoQ</p>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                                <div style={{ width: '68%', height: '100%', background: T.primaryFixed, borderRadius: 3 }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                                <span>Disbursed $9.7M</span><span>Remaining $4.5M</span>
                            </div>
                            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 18, fontSize: 12 }} onClick={() => navigate('/enterprise/grants')}>
                                Manage Grants
                            </button>
                        </div>
                        <div className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate('/enterprise/projects')}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: T.tertiaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>add_circle</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>Grant a Project</div>
                                <div style={{ fontSize: 11, color: T.outline }}>Fund expert initiatives</div>
                            </div>
                            <span className="ms ms-sm" style={{ color: T.outline }}>chevron_right</span>
                        </div>
                    </div>
                </div>

                {/* Experts + Activity */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div className="card" style={{ padding: 28 }}>
                        <div className="flex-between" style={{ marginBottom: 20 }}>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Expert Network</h2>
                            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/enterprise/discovery')}>
                                Browse <span className="ms ms-sm">arrow_forward</span>
                            </button>
                        </div>
                        {experts.map((e, i) => (
                            <div key={i} className="flex-between" style={{ padding: '11px 0', borderBottom: i < experts.length - 1 ? `1px solid ${T.outlineVariant}30` : 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
                                        {(e.name || 'EX').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{e.name}</div>
                                        <div style={{ fontSize: 11, color: T.outline }}>{Array.isArray(e.skills) ? e.skills.slice(0, 2).join(' · ') : ''}</div>
                                    </div>
                                </div>
                                <button className="btn btn-secondary" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => navigate('/enterprise/discovery')}>Contact</button>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: 28 }}>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Recent Activity</h2>
                        {[
                            { text: 'Grant Approved: Project Helios', time: '2 hours ago', dept: 'Finance Dept', color: T.primary },
                            { text: 'New Expert: Dr. Elena Kozlov connected', time: '5 hours ago', dept: 'Talent Acquisition', color: '#16a34a' },
                            { text: 'Engagement Success: MetaGrid v2', time: 'Yesterday', dept: 'Delivery Unit', color: T.secondary },
                            { text: 'Milestone approved for PRJ001', time: '2 days ago', dept: 'Project Center', color: '#d97706' },
                        ].map((a, i, arr) => (
                            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: 5 }} />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>{a.text}</div>
                                    <div style={{ fontSize: 10, color: T.outline, marginTop: 2 }}>{a.time} · {a.dept}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </EnterpriseLayout>
    )
}
