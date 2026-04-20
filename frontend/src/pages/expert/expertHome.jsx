import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EENLayout from '../../components/Layout'
import { dbApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

const MILESTONES = [
    { date: 'OCT 14, 2024', title: 'Final Delivery: Cloud Audit', desc: 'Submit the comprehensive architecture security review and gap analysis report.', active: true },
    { date: 'OCT 19, 2024', title: 'Project Kickoff: FinTech UX', desc: 'Initial stakeholder meeting and definition of design sprint parameters.', active: false },
    { date: 'OCT 24, 2024', title: 'Mid-term QA Review', desc: 'Verification of implementation phase 2 against compliance standards.', active: false },
]

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG']
const BAR_H = [40, 55, 45, 85, 60, 70, 50, 65]

export default function ExpertHome() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const [projects, setProjects] = useState([])

    useEffect(() => {
        dbApi.getProjects().then(d => { if (Array.isArray(d)) setProjects(d.slice(0, 2)) })
    }, [])

    const name = profile?.name?.split(' ')[0] || 'Expert'

    return (
        <EENLayout activeKey="dashboard">
            <div className="page-inner fade-up">

                {/* ── Hero ── */}
                <section className="page-hero" style={{ marginBottom: 40 }}>
                    <h1 className="page-title">Expert Overview</h1>
                    <p className="page-subtitle">
                        Precision metrics for your active enterprise engagements. Manage your workflow,
                        track milestones, and optimize your architectural advisory.
                    </p>
                </section>

                {/* ── 3-metric bento row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 20, marginBottom: 40 }}>

                    {/* Earnings */}
                    <div className="card card-hover fade-up fade-up-1" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="ms ms-fill" style={{ color: T.primary, fontSize: 20 }}>payments</span>
                            </div>
                            <span className="tag tag-teal">This Quarter</span>
                        </div>
                        <div>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 30, fontWeight: 700, marginBottom: 4 }}>$42,850.00</div>
                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, marginBottom: 20 }}>Total Project Earnings</p>
                            <div className="progress-track" style={{ marginBottom: 8 }}>
                                <div className="progress-fill" style={{ width: '75%' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.outline, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <span>Target: $60k</span><span>75% Achieved</span>
                            </div>
                        </div>
                    </div>

                    {/* Utilization — dark card */}
                    <div className="card-dark card-hover fade-up fade-up-2" style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, position: 'relative', zIndex: 1 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="ms" style={{ color: 'white', fontSize: 20 }}>schedule</span>
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: 4 }}>Utilization</span>
                        </div>
                        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 36, fontWeight: 700, color: 'white', marginBottom: 4, position: 'relative', zIndex: 1 }}>164 Hours</div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 24, position: 'relative', zIndex: 1 }}>Active Billable Time</p>
                        {/* mini bar chart */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 40, position: 'relative', zIndex: 1 }}>
                            {[40, 80, 60, 100, 85, 70, 50].map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 3 ? 'white' : 'rgba(255,255,255,0.25)', borderRadius: 3 }} />
                            ))}
                        </div>
                    </div>

                    {/* Expert Index */}
                    <div className="card card-hover fade-up fade-up-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.tertiaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="ms ms-fill" style={{ color: T.tertiary, fontSize: 20 }}>hub</span>
                            </div>
                            <span className="tag tag-blue">Expert Index</span>
                        </div>
                        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 30, fontWeight: 700, marginBottom: 4 }}>Top 2%</div>
                        <p style={{ fontSize: 13, color: T.onSurfaceVariant, marginBottom: 20 }}>Expert Performance Tier</p>
                        <div style={{ display: 'flex', gap: -8 }}>
                            {['AB', 'CD', 'EF'].map((t, i) => (
                                <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: T.primary, border: '2px solid white', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white' }}>{t}</div>
                            ))}
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: T.surfaceContainerHigh, border: '2px solid white', marginLeft: -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: T.outline }}>+12</div>
                        </div>
                    </div>
                </div>

                {/* ── Projects + Milestones ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 40 }}>

                    {/* Active Projects */}
                    <div>
                        <div className="flex-between" style={{ marginBottom: 20 }}>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 700 }}>Active Projects</h2>
                            <button className="btn btn-ghost" onClick={() => navigate('/expert/projects')}>
                                View All Projects <span className="ms ms-sm">arrow_forward</span>
                            </button>
                        </div>

                        {(projects.length ? projects : [
                            { projectID: 'PRJ001', name: 'Global HQ Cloud Migration', tags: ['High Priority', 'Architectural Advisory'], value: '$18.5k', desc: 'Infrastructure assessment for Fortune 50...' },
                            { projectID: 'PRJ006', name: 'Predictive Supply Chain Model', tags: ['In Progress', 'Data Science'], value: '$12.0k', desc: 'ML implementation for European retail...' },
                        ]).map((p, i) => (
                            <div key={p.projectID} className="card card-hover" style={{ cursor: 'pointer', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 20 }}
                                onClick={() => navigate(`/expert/projects/${p.projectID}`)}>
                                <div style={{ width: 72, height: 72, borderRadius: 12, background: T.surfaceContainerLow, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill ms-xl" style={{ color: T.primary, fontSize: 30 }}>assignment</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                                        {(p.tags || ['Active']).map(t => (
                                            <span key={t} className={`tag ${i === 0 ? 'tag-teal' : 'tag-blue'}`}>{t}</span>
                                        ))}
                                    </div>
                                    <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{p.name}</div>
                                    <p style={{ fontSize: 12, color: T.onSurfaceVariant }}>{p.description || p.desc}</p>
                                </div>
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, color: T.primary }}>{p.value || p.projectID}</div>
                                    <div style={{ fontSize: 10, color: T.outline, marginTop: 2 }}>Project Value</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Milestones */}
                    <div>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Upcoming Milestones</h2>
                        <div>
                            {MILESTONES.map((m, i) => (
                                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: i < MILESTONES.length - 1 ? 0 : 0 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.active ? T.primaryFixed : T.surfaceContainerHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="ms ms-fill ms-sm" style={{ color: m.active ? T.primary : T.outline }}>calendar_today</span>
                                        </div>
                                        {i < MILESTONES.length - 1 && <div style={{ width: 1, flex: 1, background: T.surfaceContainerHigh, minHeight: 24 }} />}
                                    </div>
                                    <div style={{ paddingBottom: 24 }}>
                                        <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: m.active ? T.primary : T.outline, marginBottom: 4 }}>{m.date}</div>
                                        <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.title}</div>
                                        <p style={{ fontSize: 12, color: T.onSurfaceVariant, lineHeight: 1.5 }}>{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Support card */}
                        <div style={{ background: T.surfaceContainerLow, borderRadius: 14, padding: 20, position: 'relative', overflow: 'hidden' }}>
                            <span className="ms ms-fill" style={{ position: 'absolute', right: -12, bottom: -12, fontSize: 80, color: 'rgba(0,52,111,0.05)' }}>support_agent</span>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Need Support?</div>
                            <p style={{ fontSize: 12, color: T.onSurfaceVariant, marginBottom: 14 }}>Dedicated account manager is online.</p>
                            <button className="btn btn-primary" style={{ fontSize: 11, padding: '7px 16px' }}>Contact Advisor</button>
                        </div>
                    </div>
                </div>

                {/* ── Performance Analytics ── */}
                <section style={{ background: T.surfaceContainerLow, borderRadius: 24, padding: 40 }}>
                    <div className="flex-between" style={{ marginBottom: 32 }}>
                        <div>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 700 }}>Performance Analytics</h2>
                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, marginTop: 4 }}>Your engagement ratings over the last 12 months.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                            {[['#00346f', 'Earnings'], ['#3cd7ff', 'Rating']].map(([c, l]) => (
                                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: T.outline, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, borderBottom: `1px solid ${T.outlineVariant}40`, paddingBottom: 8 }}>
                        {MONTHS.map((m, i) => (
                            <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ width: '100%', height: `${BAR_H[i]}%`, background: i === 3 ? T.primary : `${T.primary}25`, borderRadius: '4px 4px 0 0', transition: 'background 0.2s', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.background = i === 3 ? T.primaryContainer : `${T.primary}45`}
                                    onMouseLeave={e => e.currentTarget.style.background = i === 3 ? T.primary : `${T.primary}25`}
                                />
                                <span style={{ fontSize: 9, fontWeight: 700, color: T.outline, letterSpacing: '0.08em' }}>{m}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* FAB */}
            <button className="btn btn-primary"
                style={{ position: 'fixed', bottom: 32, right: 32, width: 52, height: 52, borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,52,111,0.28)', zIndex: 200 }}
                onClick={() => navigate('/expert/projects')}>
                <span className="ms" style={{ color: 'white', fontSize: 22 }}>add</span>
            </button>
        </EENLayout>
    )
}
