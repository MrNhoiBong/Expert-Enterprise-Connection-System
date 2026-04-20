import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FoundationLayout from '../../components/FoundationLayout'
import { dbApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

function fmtDate(d) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return d }
}

function fileMeta(name = '') {
    const ext = name.split('.').pop().toLowerCase()
    if (['pdf'].includes(ext)) return { icon: 'picture_as_pdf', color: '#ba1a1a', bg: '#ffdad6' }
    if (['xlsx', 'xls', 'csv'].includes(ext)) return { icon: 'table_chart', color: '#065f46', bg: '#d1fae5' }
    if (['docx', 'doc'].includes(ext)) return { icon: 'description', color: '#1e3a8a', bg: '#dbeafe' }
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return { icon: 'image', color: '#7c3aed', bg: '#ede9fe' }
    return { icon: 'insert_drive_file', color: '#64748b', bg: '#f1f5f9' }
}

export default function FoundationProjectDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('details')

    useEffect(() => {
        dbApi.getProject(id).then(d => {
            if (d && !d.detail) setData(d)
        }).finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <FoundationLayout activeKey="projects">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: T.outline }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${T.outlineVariant}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Loading project...
            </div>
        </FoundationLayout>
    )

    if (!data) return (
        <FoundationLayout activeKey="projects">
            <div className="page-inner">
                <div className="empty-state"><span className="ms ms-xl">work_off</span><p>Project not found.</p></div>
            </div>
        </FoundationLayout>
    )

    const { project = {}, documents = [], experts = [], enterprises = [] } = data

    const STATUS_MAP = {
        'In Progress': { tag: 'tag-green', dot: '#16a34a' },
        'Planning': { tag: 'tag-amber', dot: '#d97706' },
        'Completed': { tag: 'tag-slate', dot: '#64748b' },
    }
    const st = STATUS_MAP[project.status] || STATUS_MAP['Planning']

    const TABS = [
        { key: 'details', icon: 'info', label: 'Details' },
        { key: 'files', icon: 'folder', label: `Files (${documents.length})` },
        { key: 'members', icon: 'group', label: `Members (${experts.length + enterprises.length})` },
    ]

    return (
        <FoundationLayout activeKey="projects">
            <div className="page-inner fade-up">

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.outline, fontSize: 13, fontFamily: 'Inter,sans-serif', padding: '4px 0', marginBottom: 24 }}>
                    <span className="ms ms-sm">arrow_back</span> Back to Projects
                </button>

                {/* Hero */}
                <div className="card" style={{ padding: 28, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="ms ms-fill" style={{ color: T.primary, fontSize: 26 }}>assignment</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                                <span className={`tag ${st.tag}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                                    {project.status || 'Planning'}
                                </span>
                                <span style={{ fontSize: 11, color: T.outline, fontFamily: 'monospace', fontWeight: 600 }}>{project.projectID}</span>
                            </div>
                            <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 26, fontWeight: 800, color: T.primary, marginBottom: 6 }}>{project.name}</h1>
                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.7, maxWidth: 600 }}>{project.description || '—'}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: T.outline }}>Created by</div>
                            <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{project.createBy}</div>
                            <div style={{ fontSize: 10, color: T.outline, marginTop: 4 }}>Timeline</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{fmtDate(project.start_date)} – {fmtDate(project.end_date)}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `2px solid ${T.outlineVariant}30`, marginBottom: 20 }}>
                    {TABS.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif', fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? T.primary : T.onSurfaceVariant, borderBottom: tab === t.key ? `2px solid ${T.primary}` : '2px solid transparent', marginBottom: -2, transition: 'all 0.15s' }}>
                            <span className="ms ms-sm">{t.icon}</span>{t.label}
                        </button>
                    ))}
                </div>

                {/* ── DETAILS TAB ── */}
                {tab === 'details' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
                        <div className="card" style={{ padding: 28 }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Project Information</h3>
                            {[
                                ['Project ID', project.projectID],
                                ['Status', project.status || 'Planning'],
                                ['Created by', project.createBy],
                                ['Start Date', fmtDate(project.start_date)],
                                ['End Date', fmtDate(project.end_date)],
                                ['Description', project.description || '—'],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', padding: '12px 0', borderBottom: `1px solid ${T.outlineVariant}25`, gap: 20 }}>
                                    <span style={{ fontSize: 12, color: T.outline, width: 120, flexShrink: 0 }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.5, fontFamily: label === 'Project ID' ? 'monospace' : 'inherit' }}>{val}</span>
                                </div>
                            ))}

                            {/* Suggested Skills */}
                            {Array.isArray(project.suggestedSkills) && project.suggestedSkills.length > 0 && (
                                <div style={{ padding: '16px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <span className="ms ms-fill ms-sm" style={{ color: '#0369a1' }}>auto_awesome</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Recommended Skills</span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {project.suggestedSkills.map(s => (
                                            <span key={s} style={{ padding: '6px 14px', borderRadius: 999, background: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 600 }}>{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {/* Stats */}
                            <div className="card" style={{ padding: 24 }}>
                                <h4 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Summary</h4>
                                {[
                                    ['Total Files', documents.length],
                                    ['Team Size', experts.length + enterprises.length],
                                    ['Experts', experts.length],
                                    ['Enterprises', enterprises.length],
                                ].map(([l, v], i, arr) => (
                                    <div key={l} className="flex-between" style={{ padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none' }}>
                                        <span style={{ fontSize: 12, color: T.outline }}>{l}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="card-dark" style={{ borderRadius: 14, padding: 24, textAlign: 'center' }}>
                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(215,226,255,0.5)', marginBottom: 12 }}>Team</p>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 44, fontWeight: 800, color: 'white' }}>{experts.length + enterprises.length}</div>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{experts.length} experts · {enterprises.length} enterprises</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── FILES TAB ── */}
                {tab === 'files' && (
                    <div className="card" style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 120px 140px', padding: '10px 16px', background: T.surfaceContainerLow, borderBottom: `1px solid ${T.outlineVariant}30` }}>
                            {['Name', 'Project', 'Date'].map((h, i) => (
                                <span key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.outline }}>{h}</span>
                            ))}
                        </div>
                        {documents.length === 0 ? (
                            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                                <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 48, display: 'block', marginBottom: 12 }}>folder_open</span>
                                <p style={{ color: T.outline, fontSize: 14 }}>No files uploaded yet.</p>
                            </div>
                        ) : documents.map((doc, i) => {
                            const meta = fileMeta(doc.name)
                            return (
                                <div key={doc.docID || i} style={{ display: 'grid', gridTemplateColumns: '2fr 120px 140px', padding: '12px 16px', borderBottom: i < documents.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none', alignItems: 'center', background: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="ms ms-fill ms-sm" style={{ color: meta.color, fontSize: 16 }}>{meta.icon}</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.name || 'Unnamed'}</div>
                                            {doc.docID && <div style={{ fontSize: 10, color: T.outline, fontFamily: 'monospace' }}>{doc.docID}</div>}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: T.outline, fontFamily: 'monospace' }}>{doc.contain || id}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 12, color: T.outline }}>{fmtDate(doc.CreateDate)}</span>
                                        {doc.URL && doc.URL !== '#' && (
                                            <a href={doc.URL} target="_blank" rel="noreferrer"
                                                style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: T.surfaceContainerLow, color: T.outline, textDecoration: 'none' }}>
                                                <span className="ms ms-sm">download</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* ── MEMBERS TAB ── */}
                {tab === 'members' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ms ms-sm" style={{ color: T.primary }}>engineering</span>Experts ({experts.length})
                            </h3>
                            {!experts.length
                                ? <div style={{ textAlign: 'center', padding: 24, color: T.outline, fontSize: 13 }}>No experts joined yet.</div>
                                : experts.map((e, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < experts.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                            {(e.name || e.expertID || 'EX').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{e.name || e.expertID}</div>
                                            <div style={{ fontSize: 11, color: T.outline }}>{e.role || 'Expert'}</div>
                                        </div>
                                        {e.expertID === project.createBy && <span className="tag tag-teal" style={{ fontSize: 10 }}>Owner</span>}
                                    </div>
                                ))
                            }
                        </div>
                        <div className="card" style={{ padding: 24 }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ms ms-sm" style={{ color: T.primary }}>corporate_fare</span>Enterprises ({enterprises.length})
                            </h3>
                            {!enterprises.length
                                ? <div style={{ textAlign: 'center', padding: 24, color: T.outline, fontSize: 13 }}>No enterprises joined yet.</div>
                                : enterprises.map((ent, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < enterprises.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 10, background: T.tertiaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span className="ms ms-sm" style={{ color: T.primary }}>corporate_fare</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{ent.company_name || ent.enterpriseID}</div>
                                            <div style={{ fontSize: 11, color: T.outline }}>{ent.role || 'Enterprise Partner'}</div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}
            </div>
        </FoundationLayout>
    )
}
