import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EENLayout from '../../components/Layout'
import { dbApi, bizApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

/* ── Mock invitations (displayed when no projectID param) ─── */
const MOCK_INVITES = [
    {
        id: 'INV001', status: 'pending',
        projectName: 'Next-Gen Quantum Network Infrastructure',
        domain: 'Quantum Compute Core', projectID: 'EEN-2024-089',
        from: 'Dr. Elena Rodriguez', fromRole: 'Lead Architect | University of Madrid',
        desc: 'Scalable multi-node quantum key distribution architecture for secure enterprise communications across EMEA regions.',
        budget: '€2.45M', deadline: 'Dec 2024', role: 'Senior Reviewer',
    },
    {
        id: 'INV002', status: 'pending',
        projectName: 'Precision mRNA Synthesis Phase IV',
        domain: 'Global Health Initiative', projectID: 'EEN-2024-042',
        from: 'Sarah Jenkins', fromRole: 'Grant Coordinator | EEN Central',
        desc: 'Infrastructure review and methodology audit for pan-European therapeutic distribution networks.',
        budget: '€1.2M', deadline: 'Mar 2025', role: 'Compliance Auditor',
    },
    {
        id: 'INV003', status: 'accepted',
        projectName: 'Sustainable Grid Resilience',
        domain: 'Energy Transition', projectID: 'EEN-2024-031',
        from: 'Marcus Thorne', fromRole: 'Security Specialist | CyberGuard SA',
        desc: 'Nordic energy corridor optimization using decentralised expert nodes.',
        budget: '€850k', deadline: 'Feb 2025', role: 'Technical Expert',
    },
]

const MEMBERS = [
    { name: 'Dr. Elena Rodriguez', sub: 'Lead Architect | University of Madrid', role: 'Project Owner', roleCls: 'tag-teal' },
    { name: 'Marcus Thorne', sub: 'Security Specialist | CyberGuard SA', role: 'Reviewer', roleCls: 'tag-blue' },
    { name: 'Sarah Jenkins', sub: 'Grant Coordinator | EEN Central', role: 'Administrator', roleCls: 'tag-slate' },
]

/* ── Project Detail view (when /expert/projects/:id) ────────── */
function ProjectDetail({ projectID }) {
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [tab, setTab] = useState('members')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dbApi.getProject(projectID).then(p => { if (p?.projectID) setProject(p) }).finally(() => setLoading(false))
    }, [projectID])

    if (loading) return <div className="page-inner"><div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div></div>

    const p = project || {}

    return (
        <div className="page-inner fade-up">
            {/* Hero */}
            <section style={{ borderBottom: `1px solid ${T.surfaceContainerHigh}`, paddingBottom: 32, marginBottom: 40 }}>
                <div className="flex-between" style={{ alignItems: 'flex-end', gap: 24 }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <span className="tag tag-teal">{p.domain || 'Quantum Compute Core'}</span>
                            <span style={{ fontSize: 13, color: T.outline }}>Project ID: {p.projectID || projectID}</span>
                        </div>
                        <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12 }}>
                            {p.name || 'Project Details'}
                        </h1>
                        <p style={{ fontSize: 16, color: T.onSurfaceVariant, maxWidth: 600, lineHeight: 1.6 }}>
                            {p.description || 'Enterprise project details and consortium management.'}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                        <button className="btn btn-secondary">
                            <span className="ms ms-sm">person_add</span> Invite Member
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/expert/projects')}>
                            <span className="ms ms-sm">arrow_back</span> Back to Projects
                        </button>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <nav style={{ display: 'flex', gap: 40, borderBottom: `1px solid ${T.surfaceContainerHigh}`, marginBottom: 36 }}>
                {['members', 'documents', 'funding', 'timeline'].map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{
                        paddingBottom: 16, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em',
                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Manrope,sans-serif',
                        color: tab === t ? T.primary : T.outline,
                        borderBottom: tab === t ? `2px solid ${T.primary}` : '2px solid transparent',
                        transition: 'all 0.2s',
                    }}>
                        {t}
                    </button>
                ))}
            </nav>

            {/* Content grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 24 }}>

                {/* Main panel */}
                <div style={{ gridColumn: 'span 8' }}>
                    {tab === 'members' && (
                        <div className="card" style={{ padding: 36 }}>
                            <div className="flex-between" style={{ marginBottom: 28 }}>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 700, color: T.primary }}>Core Consortium</h2>
                                <span style={{ fontSize: 13, color: T.outline }}>12 Experts Active</span>
                            </div>
                            {MEMBERS.map((m, i) => (
                                <div key={i} className="flex-between" style={{ padding: '14px 16px', borderRadius: 10, marginBottom: 6, transition: 'background 0.15s', cursor: 'default' }}
                                    onMouseEnter={e => e.currentTarget.style.background = T.surfaceContainer}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                            {m.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: T.onSurface }}>{m.name}</div>
                                            <div style={{ fontSize: 12, color: T.onSurfaceVariant }}>{m.sub}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <span className={`tag ${m.roleCls}`}>{m.role}</span>
                                        <span className="ms ms-sm" style={{ color: T.outlineVariant }}>more_vert</span>
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${T.surfaceContainerHigh}`, textAlign: 'center' }}>
                                <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                                    View Full Directory <span className="ms ms-sm">trending_flat</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {tab === 'documents' && (
                        <div className="card" style={{ padding: 36 }}>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 700, color: T.primary, marginBottom: 24 }}>Project Documents</h2>
                            {[
                                { icon: 'description', name: 'Tech_Specs_v2.pdf', sub: 'Added 2h ago by Marcus T.', color: '#ba1a1a' },
                                { icon: 'table_chart', name: 'Budget_Allocation.xlsx', sub: 'Added yesterday by Sarah J.', color: '#065f46' },
                            ].map((f, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: T.surfaceContainerLow, borderRadius: 10, marginBottom: 10, cursor: 'pointer' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 8, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span className="ms ms-fill ms-sm" style={{ color: f.color }}>{f.icon}</span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{f.name}</div>
                                        <div style={{ fontSize: 11, color: T.outline }}>{f.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {tab === 'funding' && (
                        <div className="card" style={{ padding: 36 }}>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 700, color: T.primary, marginBottom: 24 }}>Funding Details</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {[['Total Allocated', '€2.45M'], ['Disbursed', '€1.6M'], ['Remaining', '€850k'], ['ROI Target', '+18%']].map(([k, v]) => (
                                    <div key={k} style={{ background: T.surfaceContainerLow, borderRadius: 12, padding: '20px 24px' }}>
                                        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, color: T.outline, marginBottom: 6 }}>{k}</p>
                                        <p style={{ fontFamily: 'Manrope,sans-serif', fontSize: 28, fontWeight: 700, color: T.primary }}>{v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'timeline' && (
                        <div className="card" style={{ padding: 36 }}>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 22, fontWeight: 700, color: T.primary, marginBottom: 24 }}>Project Timeline</h2>
                            {[
                                { label: 'Kickoff', date: 'Jan 2024', done: true },
                                { label: 'Phase 1 Delivery', date: 'Apr 2024', done: true },
                                { label: 'Mid-term Review', date: 'Jul 2024', done: true },
                                { label: 'Phase 2 Delivery', date: 'Oct 2024', done: false, active: true },
                                { label: 'Final Delivery', date: 'Dec 2024', done: false },
                            ].map((step, i, arr) => (
                                <div key={i} style={{ display: 'flex', gap: 16, paddingBottom: i < arr.length - 1 ? 24 : 0 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: step.done ? T.primary : step.active ? T.primaryFixed : T.surfaceContainerHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="ms ms-fill ms-sm" style={{ color: step.done ? 'white' : step.active ? T.primary : T.outline }}>{step.done ? 'check' : step.active ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
                                        </div>
                                        {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: step.done ? T.primary : T.surfaceContainerHigh, minHeight: 16, opacity: step.done ? 1 : 0.3 }} />}
                                    </div>
                                    <div style={{ paddingTop: 6 }}>
                                        <div style={{ fontWeight: 700, fontSize: 14, color: step.done || step.active ? T.onSurface : T.outline }}>{step.label}</div>
                                        <div style={{ fontSize: 12, color: T.outline }}>{step.date}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Funding overview dark */}
                    <div className="card-dark" style={{ borderRadius: 16, padding: 28 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(215,226,255,0.55)', marginBottom: 12 }}>Funding Overview</p>
                        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 36, fontWeight: 800, color: 'white', marginBottom: 4 }}>€2.45M</div>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>Total Grant Allocated</p>
                        <div style={{ height: 8, background: T.primaryContainer, borderRadius: 4, overflow: 'hidden', marginBottom: 10 }}>
                            <div style={{ width: '65%', height: '100%', background: T.primaryFixed, borderRadius: 4 }} />
                        </div>
                        <div className="flex-between" style={{ fontSize: 12, fontWeight: 700 }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Disbursed: €1.6M</span>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Remaining: €850k</span>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="card" style={{ padding: 24, borderLeft: `4px solid ${T.primary}` }}>
                        {[
                            { icon: 'event', text: `Start Date: ${p.projectTimeline?.start_date || 'Jan 2024'}` },
                            { icon: 'public', text: 'Region: European Union' },
                            { icon: 'category', text: 'Domain: Deep Tech' },
                        ].map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 14 : 0 }}>
                                <span className="ms ms-sm" style={{ color: T.primary }}>{m.icon}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: T.onSurface }}>{m.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Health analysis */}
            <section style={{ background: T.surfaceContainerLow, borderRadius: 28, padding: 48, marginTop: 32, display: 'flex', alignItems: 'center', gap: 48 }}>
                <div style={{ width: '45%', height: 220, borderRadius: 20, background: T.surfaceContainerHighest, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="ms ms-fill" style={{ fontSize: 64, color: T.outlineVariant }}>analytics</span>
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 28, fontWeight: 800, color: T.primary, marginBottom: 12 }}>Consortium Health Analysis</h3>
                    <p style={{ fontSize: 14, color: T.onSurfaceVariant, lineHeight: 1.7, marginBottom: 24 }}>
                        Engagement levels are up by 24% this month. The project is currently tracking towards early completion of Milestone 3. Consider expanding the document library for cross-border compliance reviews.
                    </p>
                    <div style={{ display: 'flex', gap: 14 }}>
                        {[['98%', 'Efficiency'], ['1.2k', 'Assets']].map(([v, l]) => (
                            <div key={l} style={{ background: 'white', padding: '16px 24px', borderRadius: 14, textAlign: 'center', flex: 1, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 24, fontWeight: 700, color: T.primary }}>{v}</div>
                                <div style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.outline, marginTop: 4 }}>{l}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

/* ── Invitations list ────────────────────────────────────────── */
export default function ExpertInvitations() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [invites, setInvites] = useState(MOCK_INVITES)
    const [selected, setSelected] = useState(null)
    const [acting, setActing] = useState(null)

    /* If routed with :id, show project detail */
    if (id) return <EENLayout activeKey="projects"><ProjectDetail projectID={id} /></EENLayout>

    const pending = invites.filter(i => i.status === 'pending')
    const archived = invites.filter(i => i.status !== 'pending')

    async function handleAction(inv, action) {
        setActing(inv.id)
        await new Promise(r => setTimeout(r, 600)) // simulate API
        setInvites(prev => prev.map(i => i.id === inv.id ? { ...i, status: action } : i))
        setSelected(null)
        setActing(null)
    }

    return (
        <EENLayout activeKey="projects">
            <div className="page-inner fade-up">

                <section className="page-hero" style={{ marginBottom: 36 }}>
                    <h1 className="page-title">Invitations</h1>
                    <p className="page-subtitle" style={{ marginTop: 8 }}>
                        Review project invitations from enterprise partners and consortium leaders.
                    </p>
                </section>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 36 }}>
                    {[
                        { label: 'Pending', value: pending.length, icon: 'pending_actions', bg: T.primaryFixed, color: T.primary },
                        { label: 'Accepted', value: invites.filter(i => i.status === 'accepted').length, icon: 'check_circle', bg: '#d1fae5', color: '#065f46' },
                        { label: 'Declined', value: invites.filter(i => i.status === 'declined').length, icon: 'cancel', bg: T.errorContainer, color: T.error },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 24 }}>
                            <div style={{ width: 48, height: 48, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: s.color }}>{s.icon}</span>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 32, fontWeight: 800, color: T.primary }}>{s.value}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pending */}
                {pending.length > 0 && (
                    <div style={{ marginBottom: 40 }}>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            Awaiting Response
                            <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.primary, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {pending.map(inv => (
                                <div key={inv.id} className="card card-hover" style={{ padding: 28, cursor: 'pointer' }} onClick={() => setSelected(inv)}>
                                    <div className="flex-between" style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="ms ms-fill" style={{ color: T.primary, fontSize: 20 }}>assignment</span>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 3 }}>{inv.domain}</div>
                                                <h3 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 16, color: T.primary }}>{inv.projectName}</h3>
                                            </div>
                                        </div>
                                        <span className="tag tag-blue">{inv.role}</span>
                                    </div>
                                    <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.55, marginBottom: 16 }}>{inv.desc}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: 20 }}>
                                            <div>
                                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 2 }}>Invited by</p>
                                                <p style={{ fontSize: 13, fontWeight: 600 }}>{inv.from}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 2 }}>Budget</p>
                                                <p style={{ fontSize: 13, fontWeight: 600 }}>{inv.budget}</p>
                                            </div>
                                            <div>
                                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 2 }}>Deadline</p>
                                                <p style={{ fontSize: 13, fontWeight: 600 }}>{inv.deadline}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10 }} onClick={e => e.stopPropagation()}>
                                            <button className="btn btn-secondary" style={{ padding: '9px 20px', fontSize: 12 }} onClick={() => handleAction(inv, 'declined')} disabled={acting === inv.id}>
                                                Decline
                                            </button>
                                            <button className="btn btn-primary" style={{ padding: '9px 20px', fontSize: 12 }} onClick={() => handleAction(inv, 'accepted')} disabled={acting === inv.id}>
                                                {acting === inv.id ? 'Accepting...' : 'Accept Invitation'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Archived */}
                {archived.length > 0 && (
                    <div>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 16, color: T.outline }}>History</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {archived.map(inv => (
                                <div key={inv.id} style={{ background: T.surfaceContainerLowest, borderRadius: 12, padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                                    <div>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: T.onSurface }}>{inv.projectName}</span>
                                        <span style={{ fontSize: 12, color: T.outline, marginLeft: 12 }}>{inv.domain}</span>
                                    </div>
                                    <span className={`tag ${inv.status === 'accepted' ? 'tag-green' : 'tag-red'}`}>{inv.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {pending.length === 0 && archived.length === 0 && (
                    <div className="empty-state">
                        <span className="ms">mail</span>
                        <p>No invitations yet</p>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selected && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
                    <div className="modal" style={{ maxWidth: 600 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                            <span className="tag tag-teal">{selected.domain}</span>
                        </div>
                        <div className="modal-title" style={{ marginBottom: 6 }}>{selected.projectName}</div>
                        <p style={{ fontSize: 12, color: T.outline, marginBottom: 16 }}>ID: {selected.projectID}</p>
                        <p style={{ fontSize: 14, color: T.onSurfaceVariant, lineHeight: 1.65, marginBottom: 20 }}>{selected.desc}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
                            {[['Role', selected.role], ['Budget', selected.budget], ['Deadline', selected.deadline]].map(([k, v]) => (
                                <div key={k} style={{ background: T.surfaceContainerLow, borderRadius: 10, padding: '12px 14px' }}>
                                    <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 4 }}>{k}</p>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: T.onSurface }}>{v}</p>
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => { handleAction(selected, 'declined'); setSelected(null) }}>Decline</button>
                            <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} onClick={() => { handleAction(selected, 'accepted'); setSelected(null) }}>
                                Accept Invitation <span className="ms ms-sm">check</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </EENLayout>
    )
}
