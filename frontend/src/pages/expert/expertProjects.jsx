import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import EENLayout from '../../components/Layout'
import { dbApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

export default function ExpertProjects() {
    const navigate = useNavigate()
    const { profile } = useAuth()
    const myId = profile?.expertID || ''
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' })
    const [saving, setSaving] = useState(false)
    const [suggested, setSuggested] = useState([])

    useEffect(() => {
        dbApi.getProjects().then(d => { if (Array.isArray(d)) setProjects(d) }).finally(() => setLoading(false))
    }, [])

    const myProjects = useMemo(() => projects.filter(p => p.createBy === myId), [projects, myId])
    const otherProjects = useMemo(() => projects.filter(p => p.createBy !== myId), [projects, myId])

    const filtered = useMemo(() => {
        if (!search) return projects
        return projects.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    }, [projects, search])

    const filteredMine = useMemo(() => myProjects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase())), [myProjects, search])
    const filteredOther = useMemo(() => otherProjects.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase())), [otherProjects, search])

    async function handleCreate(e) {
        e.preventDefault(); setSaving(true)
        const res = await dbApi.createProject(form)
        if (res?.projectID) {
            const upd = await dbApi.getProjects()
            if (Array.isArray(upd)) setProjects(upd)
            // Hiển thị skill gợi ý từ AI nếu có
            if (res.suggestedSkills?.length > 0) setSuggested(res.suggestedSkills)
            else setModal(false)
            setForm({ name: '', description: '', start_date: '', end_date: '' })
        }
        setSaving(false)
    }

    const STATUS = {
        'In Progress': { tag: 'tag-teal', label: 'Active' },
        'Planning': { tag: 'tag-blue', label: 'Planning' },
        'Completed': { tag: 'tag-slate', label: 'Done' },
    }

    return (
        <EENLayout activeKey="projects">
            <div className="page-inner fade-up">

                {/* Hero + actions */}
                <div className="flex-between" style={{ marginBottom: 20, alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="page-title">Projects</h1>
                        <p className="page-subtitle" style={{ marginTop: 8 }}>
                            Architecture-focused enterprise workflows. Manage your specialized project lifecycle from discovery to delivery.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                        <button className="btn btn-secondary" style={{ gap: 6 }}>
                            <span className="ms ms-sm">filter_list</span> Filter
                        </button>
                        <button className="btn btn-primary" onClick={() => setModal(true)}>
                            New Proposal <span className="ms ms-sm">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.1fr', gap: 16, marginBottom: 40 }}>
                    {[
                        { label: 'Active Mandates', value: projects.filter(p => p.status === 'In Progress').length || 12, sub: '+2 this month', subColor: '#16a34a', icon: 'trending_up' },
                        { label: 'Awaiting Approval', value: '04', bar: 33 },
                        { label: 'Open Opportunities', value: filtered.length || 28, sub: 'Matching your expertise', subColor: T.onSurfaceVariant },
                    ].map((s, i) => (
                        <div key={i} className="card" style={{ padding: 24 }}>
                            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700, color: T.outline, marginBottom: 8 }}>{s.label}</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 34, fontWeight: 800, color: T.primary, marginBottom: 10 }}>{s.value}</div>
                            {s.sub && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: s.subColor, fontWeight: 600 }}>
                                {s.icon && <span className="ms ms-sm" style={{ color: s.subColor }}>{s.icon}</span>}{s.sub}
                            </div>}
                            {s.bar !== undefined && <div className="progress-track"><div className="progress-fill" style={{ width: `${s.bar}%`, background: T.tertiaryFixedDim }} /></div>}
                        </div>
                    ))}
                    {/* Next milestone — dark */}
                    <div className="card-dark" style={{ padding: 24 }}>
                        <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Next Milestone</p>
                        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                            {projects[0]?.name?.split(' ').slice(0, 3).join(' ') || 'Quantum Bio-Logic'}
                        </div>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 16 }}>Phase 2 Delivery · 18 Oct</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span className="ms ms-fill ms-sm" style={{ color: T.primaryFixed }}>schedule</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>In 2 days</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative', marginBottom: 24, maxWidth: 360 }}>
                    <span className="ms" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 16 }}>search</span>
                    <input className="input-field" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
                </div>

                {/* Projects sections */}
                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ margin: '0 auto 12px' }} /><p>Loading projects...</p></div>
                ) : (
                    <>
                        {/* ── My Projects ── */}
                        <div style={{ marginBottom: 36 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>person</span>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>My Projects</h2>
                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.primary, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {filteredMine.length}
                                </span>
                            </div>

                            {filteredMine.length === 0 ? (
                                <div style={{ border: `2px dashed ${T.outlineVariant}60`, borderRadius: 16, padding: '40px 24px', textAlign: 'center', color: T.outline }}>
                                    <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 48, display: 'block', marginBottom: 12 }}>assignment</span>
                                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{search ? 'No projects match your search' : 'No projects created yet'}</p>
                                    {!search && <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => setModal(true)}>Create First Project</button>}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 16 }}>
                                    {filteredMine.map((p, i) => {
                                        const st = STATUS[p.status] || STATUS['Planning']
                                        const isLarge = i === 0
                                        return (
                                            <div key={p.projectID} className="card card-hover"
                                                onClick={() => navigate(`/expert/projects/${p.projectID}`)}
                                                style={{ gridColumn: isLarge ? 'span 8' : 'span 4', cursor: 'pointer', position: 'relative' }}>
                                                <span className={`tag ${st.tag}`} style={{ position: 'absolute', top: 20, right: 20 }}>{p.status || 'Planning'}</span>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginTop: 8 }}>
                                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span className="ms ms-fill" style={{ fontSize: 22, color: T.primary }}>assignment</span>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline }}>{p.projectID}</span>
                                                            <span className="tag tag-teal" style={{ fontSize: 9 }}>Owner</span>
                                                        </div>
                                                        <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: isLarge ? 20 : 15, fontWeight: 700, color: T.primary, marginBottom: 8 }}>{p.name}</h3>
                                                        <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.5, marginBottom: 12 }}>{p.description}</p>
                                                        <div style={{ display: 'flex', gap: 20 }}>
                                                            {p.start_date && <div><p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 2 }}>Start</p><p style={{ fontSize: 12, fontWeight: 600 }}>{p.start_date}</p></div>}
                                                            {p.end_date && <div><p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, marginBottom: 2 }}>End</p><p style={{ fontSize: 12, fontWeight: 600 }}>{p.end_date}</p></div>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ── Other Projects ── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.outline }}>group</span>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Other Projects</h2>
                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.surfaceContainerHighest, color: T.onSurfaceVariant, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {filteredOther.length}
                                </span>
                            </div>

                            {filteredOther.length === 0 ? (
                                <div style={{ padding: '32px 24px', textAlign: 'center', color: T.outline, background: T.surfaceContainerLow, borderRadius: 16 }}>
                                    <p style={{ fontSize: 13 }}>{search ? 'No projects match your search.' : 'No other projects in the network yet.'}</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 16 }}>
                                    {filteredOther.map((p, i) => {
                                        const st = STATUS[p.status] || STATUS['Planning']
                                        return (
                                            <div key={p.projectID} className="card card-hover"
                                                onClick={() => navigate(`/expert/projects/${p.projectID}`)}
                                                style={{ gridColumn: 'span 4', cursor: 'pointer', position: 'relative' }}>
                                                <span className={`tag ${st.tag}`} style={{ position: 'absolute', top: 20, right: 20 }}>{p.status || 'Planning'}</span>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginTop: 8 }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 12, background: T.surfaceContainerLow, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span className="ms ms-fill" style={{ fontSize: 20, color: T.outline }}>assignment</span>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, color: T.outline, marginBottom: 4 }}>{p.createBy}</p>
                                                        <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 15, fontWeight: 700, color: T.primary, marginBottom: 6 }}>{p.name}</h3>
                                                        <p style={{ fontSize: 12, color: T.onSurfaceVariant, lineHeight: 1.5 }}>{p.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Create modal */}
            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <form className="modal" onSubmit={handleCreate}>
                        <div className="modal-title">New Project Proposal</div>
                        {[
                            { k: 'name', l: 'Project Name', p: 'e.g. Cloud Migration Advisory' },
                        ].map(f => (
                            <div key={f.k} className="input-group">
                                <label className="input-label">{f.l}</label>
                                <input className="input-field" required placeholder={f.p} value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} />
                            </div>
                        ))}
                        <div className="input-group">
                            <label className="input-label">Description</label>
                            <textarea className="input-field" required rows={3} style={{ resize: 'none' }} placeholder="Describe project scope..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[['start_date', 'Start Date'], ['end_date', 'End Date']].map(([k, l]) => (
                                <div key={k} className="input-group">
                                    <label className="input-label">{l}</label>
                                    <input className="input-field" type="date" required value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
                                </div>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setModal(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                                {saving
                                    ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Analyzing with AI...</>
                                    : <>Create Proposal <span className="ms ms-sm">arrow_forward</span></>
                                }
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* AI Skill Suggestion Modal */}
            {suggested.length > 0 && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="ms ms-fill" style={{ color: '#0369a1', fontSize: 20 }}>auto_awesome</span>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 16 }}>AI Skill Suggestions</div>
                                <div style={{ fontSize: 12, color: T.outline }}>Based on your project description</div>
                            </div>
                        </div>
                        <p style={{ fontSize: 13, color: T.onSurfaceVariant, marginBottom: 14 }}>
                            The AI matched these skills from your profile to this project:
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                            {suggested.map(s => (
                                <span key={s} style={{ padding: '6px 14px', borderRadius: 999, background: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 600 }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => { setSuggested([]); setModal(false) }}>
                                <span className="ms ms-sm">check</span> Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </EENLayout>
    )
}
