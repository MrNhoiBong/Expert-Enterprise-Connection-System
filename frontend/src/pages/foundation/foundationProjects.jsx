import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FoundationLayout from '../../components/FoundationLayout'
import { dbApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

export default function FoundationProjects() {
    const navigate = useNavigate()
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        dbApi.getProjects().then(p => { if (Array.isArray(p)) setProjects(p) }).finally(() => setLoading(false))
    }, [])

    const filtered = projects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))

    const STATUS_MAP = {
        'In Progress': { cls: 'tag-green', dot: '#16a34a', label: 'In Progress' },
        'Planning': { cls: 'tag-amber', dot: '#d97706', label: 'Planning' },
        'Completed': { cls: 'tag-slate', dot: '#64748b', label: 'Completed' },
    }

    const STATS = [
        { label: 'Total Projects', value: projects.length || 84, icon: 'assignment', bg: T.primaryFixed },
        { label: 'In Progress', value: projects.filter(p => p.status === 'In Progress').length || 42, icon: 'pending', bg: T.tertiaryFixed },
        { label: 'Success Rate', value: '89%', icon: 'task_alt', bg: T.secondaryContainer },
        { label: 'Funded Volume', value: '$98.5M', icon: 'payments', bg: T.primaryFixed },
    ]

    return (
        <FoundationLayout activeKey="projects">
            <div className="page-inner fade-up">

                {/* Header */}
                <div className="flex-between" style={{ marginBottom: 36 }}>
                    <div>
                        <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Funded Projects</h1>
                        <p style={{ fontSize: 15, color: T.onSurfaceVariant, marginTop: 8 }}>Monitor project execution and capital deployment across the EEN network.</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <span className="ms" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 18 }}>search</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            style={{ background: T.surfaceContainerLow, border: 'none', borderRadius: 999, padding: '10px 16px 10px 40px', fontSize: 13, width: 280, outline: 'none' }}
                            placeholder="Search projects..." />
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
                    {STATS.map(s => (
                        <div key={s.label} className="card" style={{ padding: 20 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>{s.icon}</span>
                            </div>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 4 }}>{s.label}</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 24, fontWeight: 800, color: T.primary }}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {/* Projects list */}
                {loading ? <div style={{ textAlign: 'center', padding: 40, color: T.outline }}>Loading...</div>
                    : filtered.length === 0 ? (
                        <div className="empty-state"><span className="ms ms-xl" style={{ color: T.outlineVariant }}>folder_off</span><p>No projects found</p></div>
                    ) : filtered.map((p, i) => {
                        const st = STATUS_MAP[p.status] || STATUS_MAP['Planning']
                        return (
                            <div key={i} className="card" style={{ padding: 24, marginBottom: 12 }}>
                                <div className="flex-between">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="ms ms-sm" style={{ color: T.primary }}>assignment</span>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <span className={`tag ${st.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />{st.label}
                                                </span>
                                                <span style={{ fontSize: 10, color: T.outline, fontFamily: 'monospace' }}>{p.projectID}</span>
                                            </div>
                                            <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{p.name}</h3>
                                            <p style={{ fontSize: 12, color: T.onSurfaceVariant }}>{p.description || 'Foundation-funded expert initiative.'}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexShrink: 0, paddingLeft: 24 }}>
                                        {[
                                            { label: 'Created by', value: p.createBy },
                                            { label: 'Timeline', value: `${p.start_date || '2025'} – ${p.end_date || '2026'}` },
                                        ].map(r => (
                                            <div key={r.label} style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 10, color: T.outline }}>{r.label}</div>
                                                <div style={{ fontSize: 12, fontWeight: 600 }}>{r.value}</div>
                                            </div>
                                        ))}
                                        <button className="btn btn-ghost" style={{ fontSize: 12 }}
                                            onClick={() => navigate(`/foundation/projects/${p.projectID}`)}>
                                            Review <span className="ms ms-sm">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
            </div>
        </FoundationLayout>
    )
}
