import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EENLayout from '../../components/Layout'
import { dbApi, bizApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

const EXT_META = {
    pdf: { icon: 'picture_as_pdf', color: '#ba1a1a', bg: '#fef2f2' },
    docx: { icon: 'description', color: T.primary, bg: '#eff3ff' },
    doc: { icon: 'description', color: T.primary, bg: '#eff3ff' },
    xlsx: { icon: 'table_chart', color: '#065f46', bg: '#f0fdf4' },
    xls: { icon: 'table_chart', color: '#065f46', bg: '#f0fdf4' },
    png: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff' },
    jpg: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff' },
    jpeg: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff' },
    gif: { icon: 'image', color: '#7c3aed', bg: '#f5f3ff' },
    zip: { icon: 'folder_zip', color: '#6b7280', bg: '#f9fafb' },
    mp4: { icon: 'videocam', color: '#d97706', bg: '#fffbeb' },
}
function fileMeta(name = '') {
    const ext = (name.split('.').pop() || '').toLowerCase()
    return EXT_META[ext] || { icon: 'draft', color: T.outline, bg: T.surfaceContainerLow }
}
function fmtDate(d) {
    if (!d) return '—'
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return d }
}

export function ExpertFiles() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { profile } = useAuth()
    const fileInputRef = useRef(null)
    const projectId = id

    const [project, setProject] = useState(null)
    const [docs, setDocs] = useState([])
    const [experts, setExperts] = useState([])
    const [enterprises, setEnterprises] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState(null)
    const [tab, setTab] = useState('files')
    const [uploading, setUploading] = useState(false)
    const [uploadSucc, setUploadSucc] = useState('')
    const [uploadErr, setUploadErr] = useState('')
    const [deleting, setDeleting] = useState(null)
    const [showInvite, setShowInvite] = useState(false)
    const [invSearch, setInvSearch] = useState('')
    const [invResults, setInvResults] = useState([])
    const [invType, setInvType] = useState('expert')
    const [invSelUser, setInvSelUser] = useState(null)
    const [invRole, setInvRole] = useState('Member')
    const [invMsg, setInvMsg] = useState('')
    const [inviting, setInviting] = useState(false)
    const [invSuccess, setInvSuccess] = useState('')
    // Call Fund
    const [showCallFund, setShowCallFund] = useState(false)
    const [funds, setFunds] = useState([])
    const [selFund, setSelFund] = useState(null)
    const [calling, setCalling] = useState(false)
    const [callSuccess, setCallSuccess] = useState('')

    useEffect(() => {
        dbApi.getProject(projectId)
            .then(d => {
                if (d && !d.detail) {
                    setProject(d.project)
                    setDocs(d.documents || [])
                    setExperts(d.experts || [])
                    setEnterprises(d.enterprises || [])
                }
            })
            .finally(() => setLoading(false))
    }, [projectId])

    const filteredDocs = docs.filter(d => !search || (d.name || '').toLowerCase().includes(search.toLowerCase()))
    const myId = profile?.expertID || ''
    const isOwner = project && myId === project?.createBy
    // Tất cả expert member (owner + invited expert) đều upload/delete được
    const canUpload = isOwner || experts.some(e => (e.expertID || e) === myId)

    async function handleFileUpload(e) {
        const file = e.target.files?.[0]; if (!file) return
        setUploading(true); setUploadErr(''); setUploadSucc('')
        try {
            const fd = new FormData()
            fd.append('file', file)
            const res = await bizApi.uploadDocument(fd, projectId)
            if (!res?.url) throw new Error(res?.detail || 'Upload failed')
            // Backend đã lưu metadata trong /files/upload — không cần gọi createFileMeta nữa
            const fresh = await dbApi.getProject(projectId)
            if (fresh && !fresh.detail) setDocs(fresh.documents || [])
            setUploadSucc(`"${file.name}" uploaded.`)
            setTimeout(() => setUploadSucc(''), 3000)
        } catch (err) { setUploadErr(err.message) }
        finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '' }
    }

    async function handleDelete(doc) {
        if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return
        setDeleting(doc.docID)
        try {
            const res = await dbApi.deleteFile(doc.docID)
            if (res?.message) {
                setDocs(prev => prev.filter(d => d.docID !== doc.docID))
                if (selected?.docID === doc.docID) setSelected(null)
            }
        } catch (err) { alert('Delete failed: ' + err.message) }
        finally { setDeleting(null) }
    }

    // ── Invite search ──
    useEffect(() => {
        if (!invSearch.trim()) { setInvResults([]); return }
        const t = setTimeout(async () => {
            const res = invType === 'expert'
                ? await dbApi.getExperts(invSearch)
                : await dbApi.getEnterprises(invSearch)
            if (Array.isArray(res)) setInvResults(res.slice(0, 8))
        }, 300)
        return () => clearTimeout(t)
    }, [invSearch, invType])

    async function handleInvite(e) {
        e.preventDefault()
        if (!invSelUser) return
        setInviting(true)
        const userId = invSelUser.expertID || invSelUser.enterpriseID
        const res = await bizApi.invite(projectId, { user_id: userId, role: invRole, message: invMsg })
        if (res?.invitationID) {
            setInvSuccess(`Invitation sent to ${invSelUser.name || invSelUser.company_name}!`)
            setInvSelUser(null); setInvSearch(''); setInvMsg(''); setInvResults([])
            setTimeout(() => { setInvSuccess(''); setShowInvite(false) }, 2000)
        }
        setInviting(false)
    }

    async function openCallFund() {
        setShowCallFund(true); setSelFund(null); setCallSuccess('')
        const d = await dbApi.getFunds()
        if (Array.isArray(d)) setFunds(d)
    }

    async function handleCallFund(e) {
        e.preventDefault()
        if (!selFund) return
        setCalling(true)
        const res = await dbApi.fundRequest(projectId, { found_id: selFund.FoundID })
        if (res) {
            setCallSuccess(`Fund request sent to "${selFund.fundName}"!`)
            setTimeout(() => { setCallSuccess(''); setShowCallFund(false) }, 2500)
        }
        setCalling(false)
    }

    if (loading) return (
        <EENLayout activeKey="projects">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: T.outline }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${T.outlineVariant}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Loading project...
            </div>
        </EENLayout>
    )

    if (!project) return (
        <EENLayout activeKey="projects">
            <div className="page-inner"><div className="empty-state"><span className="ms ms-xl">folder_off</span><p>Project not found.</p></div></div>
        </EENLayout>
    )

    const STATUS_CLS = { 'In Progress': 'tag-green', 'Planning': 'tag-amber', 'Completed': 'tag-slate' }

    return (
        <EENLayout activeKey="projects">
            <style>{`.file-row:hover{background:${T.surfaceContainerLow}!important}.mem-row:hover{background:${T.surfaceContainerLow}!important}`}</style>
            <div className="page-inner fade-up" style={{ maxWidth: 1100 }}>

                {/* Back */}
                <button onClick={() => navigate('/expert/projects')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.outline, fontSize: 13, fontFamily: 'Inter,sans-serif', padding: '4px 0', marginBottom: 20 }}>
                    <span className="ms ms-sm">arrow_back</span> Back to Projects
                </button>

                {/* Project header */}
                <div className="flex-between" style={{ alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 14, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="ms ms-fill" style={{ color: T.primary, fontSize: 28 }}>folder_special</span>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 26, fontWeight: 800, color: T.primary, letterSpacing: '-0.01em' }}>{project.name}</h1>
                                <span className={`tag ${STATUS_CLS[project.status] || 'tag-amber'}`}>{project.status || 'Planning'}</span>
                                {isOwner && <span className="tag tag-teal" style={{ fontSize: 10 }}>Owner</span>}
                            </div>
                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, maxWidth: 560, lineHeight: 1.6 }}>{project.description || 'No description.'}</p>
                            <div style={{ display: 'flex', gap: 18, marginTop: 10, flexWrap: 'wrap' }}>
                                {[['badge', project.projectID], ['person', project.createBy], ['calendar_today', `${project.start_date || '?'} → ${project.end_date || '?'}`], ['group', `${experts.length} experts`], ['folder', `${docs.length} files`]].map(([icon, val]) => (
                                    <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <span className="ms ms-sm" style={{ color: T.outline, fontSize: 14 }}>{icon}</span>
                                        <span style={{ fontSize: 12, color: T.outline }}>{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {canUpload && (
                        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
                            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {uploading
                                    ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Uploading...</>
                                    : <><span className="ms ms-sm">upload</span> Upload File</>
                                }
                            </button>
                            {isOwner && (
                                <button className="btn btn-secondary" onClick={openCallFund} style={{ fontSize: 12 }}>
                                    <span className="ms ms-sm">account_balance</span> Call Fund
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Alerts */}
                {uploadSucc && <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 16px', color: '#065f46', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><span className="ms ms-sm">check_circle</span>{uploadSucc}</div>}
                {uploadErr && <div style={{ background: T.errorContainer, borderRadius: 10, padding: '10px 16px', color: T.error, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><span className="ms ms-sm">error</span>{uploadErr}</div>}

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `2px solid ${T.outlineVariant}30`, marginBottom: 20 }}>
                    {[
                        { key: 'files', icon: 'folder', label: `Files (${docs.length})` },
                        { key: 'members', icon: 'group', label: `Members (${experts.length + enterprises.length})` },
                        { key: 'info', icon: 'info', label: 'Details' },
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif', fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? T.primary : T.onSurfaceVariant, borderBottom: tab === t.key ? `2px solid ${T.primary}` : '2px solid transparent', marginBottom: -2, transition: 'all 0.15s' }}>
                            <span className="ms ms-sm">{t.icon}</span>{t.label}
                        </button>
                    ))}
                </div>

                {/* ── FILES TAB ── */}
                {tab === 'files' && (
                    <div>
                        <div className="flex-between" style={{ marginBottom: 16 }}>
                            <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
                                <span className="ms" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 16 }}>search</span>
                                <input value={search} onChange={e => setSearch(e.target.value)}
                                    style={{ width: '100%', background: T.surfaceContainerLow, border: 'none', borderRadius: 10, padding: '9px 14px 9px 36px', fontSize: 13, outline: 'none' }}
                                    placeholder="Search files..." />
                            </div>
                            <span style={{ fontSize: 12, color: T.outline }}>{filteredDocs.length} file{filteredDocs.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div style={{ border: `1px solid ${T.outlineVariant}40`, borderRadius: 12, overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 120px 140px 80px', padding: '10px 16px', background: T.surfaceContainerLow, borderBottom: `1px solid ${T.outlineVariant}30` }}>
                                {['Name', 'Project', 'Date', ''].map((h, i) => (
                                    <span key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.outline, textAlign: i === 3 ? 'center' : 'left' }}>{h}</span>
                                ))}
                            </div>

                            {filteredDocs.length === 0 ? (
                                <div style={{ padding: '48px 24px', textAlign: 'center', background: 'white' }}>
                                    <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 48, display: 'block', marginBottom: 12 }}>folder_open</span>
                                    <p style={{ color: T.outline, fontSize: 14 }}>{search ? 'No files match.' : 'No files yet.'}</p>
                                    {!search && canUpload && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => fileInputRef.current?.click()}><span className="ms ms-sm">upload</span> Upload First File</button>}
                                </div>
                            ) : filteredDocs.map((doc, i) => {
                                const meta = fileMeta(doc.name)
                                const isSel = selected?.docID === doc.docID
                                return (
                                    <div key={doc.docID || i}>
                                        <div className="file-row"
                                            style={{ display: 'grid', gridTemplateColumns: '2fr 120px 140px 80px', padding: '12px 16px', borderBottom: !isSel && i < filteredDocs.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none', cursor: 'pointer', background: isSel ? T.primaryFixed + '80' : 'white', transition: 'background 0.1s', alignItems: 'center' }}
                                            onClick={() => setSelected(isSel ? null : doc)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span className="ms ms-fill ms-sm" style={{ color: meta.color, fontSize: 16 }}>{meta.icon}</span>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{doc.name || 'Unnamed'}</div>
                                                    {doc.docID && <div style={{ fontSize: 10, color: T.outline, fontFamily: 'monospace' }}>{doc.docID}</div>}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: 12, color: T.outline, fontFamily: 'monospace' }}>{doc.contain || doc.projectID || projectId}</div>
                                            <div style={{ fontSize: 12, color: T.outline }}>{fmtDate(doc.CreateDate || doc.created_at)}</div>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }} onClick={e => e.stopPropagation()}>
                                                {doc.URL && doc.URL !== '#' && (
                                                    <a href={doc.URL} target="_blank" rel="noreferrer"
                                                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: T.surfaceContainerLow, color: T.outline, textDecoration: 'none' }}>
                                                        <span className="ms ms-sm">download</span>
                                                    </a>
                                                )}
                                                {canUpload && (
                                                    <button onClick={() => handleDelete(doc)} disabled={deleting === doc.docID}
                                                        style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: T.errorContainer, color: T.error, border: 'none', cursor: 'pointer' }}
                                                        title="Delete file">
                                                        <span className="ms ms-sm">{deleting === doc.docID ? 'hourglass_empty' : 'delete'}</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {/* Inline detail panel */}
                                        {isSel && (
                                            <div style={{ background: T.primaryFixed + '30', borderBottom: i < filteredDocs.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none' }}>
                                                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span className="ms ms-fill" style={{ color: meta.color, fontSize: 22 }}>{meta.icon}</span>
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{doc.name}</div>
                                                        <div style={{ fontSize: 12, color: T.outline }}>
                                                            {doc.size || '—'} · {(doc.name || '').split('.').pop().toUpperCase()} ·
                                                            Project <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{doc.contain || projectId}</span>
                                                        </div>
                                                    </div>
                                                    {doc.URL && doc.URL !== '#' && (
                                                        <a href={doc.URL} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: 12, textDecoration: 'none' }}>
                                                            <span className="ms ms-sm">download</span> Download
                                                        </a>
                                                    )}
                                                    {canUpload && (
                                                        <button onClick={() => handleDelete(doc)} disabled={deleting === doc.docID}
                                                            className="btn" style={{ fontSize: 12, background: T.errorContainer, color: T.error, border: 'none' }}>
                                                            <span className="ms ms-sm">delete</span>
                                                            {deleting === doc.docID ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    )}
                                                    <button onClick={() => setSelected(null)} className="btn btn-secondary" style={{ fontSize: 12 }}>
                                                        <span className="ms ms-sm">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* ── MEMBERS TAB ── */}
                {tab === 'members' && (
                    <div>
                        {/* Invite button — only owner */}
                        {isOwner && (
                            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => setShowInvite(true)}>
                                    <span className="ms ms-sm">person_add</span> Invite Member
                                </button>
                            </div>
                        )}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div className="card" style={{ padding: 24 }}>
                                <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="ms ms-sm" style={{ color: T.primary }}>engineering</span>Experts ({experts.length})
                                </h3>
                                {!experts.length
                                    ? <div style={{ textAlign: 'center', padding: 24, color: T.outline, fontSize: 13 }}>No experts joined yet.</div>
                                    : experts.map((e, i) => (
                                        <div key={i} className="mem-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, transition: 'background 0.15s' }}>
                                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
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
                                        <div key={i} className="mem-row" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, transition: 'background 0.15s' }}>
                                            <div style={{ width: 38, height: 38, borderRadius: 10, background: T.tertiaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="ms ms-sm" style={{ color: T.primary }}>corporate_fare</span>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: 13 }}>{ent.company_name || ent.enterpriseID}</div>
                                                <div style={{ fontSize: 11, color: T.outline }}>{ent.role || 'Enterprise Partner'}</div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                )}

                {/* ── INFO TAB ── */}
                {tab === 'info' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
                        <div className="card" style={{ padding: 28 }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Project Details</h3>
                            {[
                                ['Project ID', project.projectID],
                                ['Status', project.status || 'Planning'],
                                ['Created by', project.createBy],
                                ['Start Date', fmtDate(project.start_date)],
                                ['End Date', fmtDate(project.end_date)],
                                ['Description', project.description || '—'],
                            ].map(([label, val], i, arr) => (
                                <div key={label} style={{ display: 'flex', padding: '12px 0', borderBottom: `1px solid ${T.outlineVariant}25`, gap: 20 }}>
                                    <span style={{ fontSize: 12, color: T.outline, width: 120, flexShrink: 0 }}>{label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, flex: 1, lineHeight: 1.5, fontFamily: label === 'Project ID' ? 'monospace' : 'inherit' }}>{val}</span>
                                </div>
                            ))}

                            {/* ── Recommended Skills từ AI ── */}
                            {Array.isArray(project.suggestedSkills) && project.suggestedSkills.length > 0 && (
                                <div style={{ padding: '16px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span className="ms ms-fill ms-sm" style={{ color: '#0369a1' }}>auto_awesome</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            AI Recommended Skills
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {project.suggestedSkills.map(skill => (
                                            <button
                                                key={skill}
                                                onClick={() => navigate(`/expert/discovery?skill=${encodeURIComponent(skill)}`)}
                                                title={`Find experts with "${skill}"`}
                                                style={{ padding: '7px 14px', borderRadius: 999, border: '1.5px solid #bae6fd', background: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}
                                                onMouseEnter={e => { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.color = 'white' }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.color = '#0369a1' }}>
                                                <span className="ms ms-sm" style={{ fontSize: 13 }}>search</span>
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ fontSize: 11, color: T.outline, marginTop: 10 }}>
                                        Click a skill to find matching experts in Discovery
                                    </p>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="card" style={{ padding: 24 }}>
                                <h4 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>File Summary</h4>
                                {[
                                    ['Total Files', docs.length],
                                    ['PDFs', docs.filter(d => d.name?.endsWith('.pdf')).length],
                                    ['Spreadsheets', docs.filter(d => ['xlsx', 'xls'].some(e => d.name?.endsWith(e))).length],
                                    ['Documents', docs.filter(d => ['docx', 'doc'].some(e => d.name?.endsWith(e))).length],
                                    ['Images', docs.filter(d => ['png', 'jpg', 'jpeg', 'gif'].some(e => d.name?.endsWith(e))).length],
                                ].map((s, i, arr) => (
                                    <div key={s[0]} className="flex-between" style={{ padding: '9px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none' }}>
                                        <span style={{ fontSize: 12, color: T.outline }}>{s[0]}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{s[1]}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="card-dark" style={{ borderRadius: 14, padding: 24 }}>
                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(215,226,255,0.5)', marginBottom: 12 }}>Team</p>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 36, fontWeight: 800, color: 'white' }}>{experts.length + enterprises.length}</div>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{experts.length} experts · {enterprises.length} enterprises</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Invite Modal ── */}
            {showInvite && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
                    onClick={e => e.target === e.currentTarget && setShowInvite(false)}>
                    <form className="card" style={{ width: 520, padding: 32, maxHeight: '85vh', overflowY: 'auto' }} onSubmit={handleInvite}>
                        <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Invite Member</h3>
                        <p style={{ fontSize: 13, color: T.outline, marginBottom: 24 }}>Search and invite experts or enterprises to join <strong>{project?.name}</strong></p>

                        {invSuccess && (
                            <div style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 16px', color: '#065f46', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ms ms-sm">check_circle</span>{invSuccess}
                            </div>
                        )}

                        {/* Type toggle */}
                        <div style={{ display: 'flex', background: T.surfaceContainerLow, borderRadius: 10, padding: 4, marginBottom: 20 }}>
                            {[['expert', 'Expert'], ['enterprise', 'Enterprise']].map(([val, label]) => (
                                <button key={val} type="button" onClick={() => { setInvType(val); setInvSearch(''); setInvResults([]); setInvSelUser(null) }}
                                    style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 13, fontWeight: invType === val ? 700 : 500, background: invType === val ? 'white' : 'transparent', color: invType === val ? T.primary : T.outline, boxShadow: invType === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="input-group">
                            <label className="input-label">Search by name or skill</label>
                            <div style={{ position: 'relative' }}>
                                <span className="ms" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 16 }}>search</span>
                                <input className="input-field" style={{ paddingLeft: 38 }}
                                    placeholder={invType === 'expert' ? 'e.g. John Miller, Java, Cloud...' : 'e.g. Global Dynamics...'}
                                    value={invSearch} onChange={e => { setInvSearch(e.target.value); setInvSelUser(null) }} />
                            </div>
                        </div>

                        {/* Search results */}
                        {invResults.length > 0 && !invSelUser && (
                            <div style={{ border: `1px solid ${T.outlineVariant}40`, borderRadius: 10, overflow: 'hidden', marginBottom: 16, marginTop: -8 }}>
                                {invResults.map((item, i) => {
                                    const uid = item.expertID || item.enterpriseID
                                    const name = item.name || item.company_name || uid
                                    const sub = invType === 'expert' ? (Array.isArray(item.skills) ? item.skills.slice(0, 2).join(', ') : '') : (item.phone || '')
                                    return (
                                        <div key={uid} onClick={() => { setInvSelUser(item); setInvSearch(name) }}
                                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', cursor: 'pointer', borderBottom: i < invResults.length - 1 ? `1px solid ${T.outlineVariant}20` : 'none', background: 'white', transition: 'background 0.1s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = T.primaryFixed}
                                            onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                                            <div style={{ width: 34, height: 34, borderRadius: invType === 'expert' ? '50%' : 8, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                                {name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                                                <div style={{ fontSize: 11, color: T.outline }}>{uid}{sub ? ` · ${sub}` : ''}</div>
                                            </div>
                                            {invSelUser?.expertID === uid || invSelUser?.enterpriseID === uid
                                                ? <span className="ms ms-sm" style={{ color: '#16a34a', marginLeft: 'auto' }}>check_circle</span>
                                                : null
                                            }
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Selected user badge */}
                        {invSelUser && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: T.primaryFixed, borderRadius: 10, marginBottom: 16, marginTop: -8 }}>
                                <div style={{ width: 32, height: 32, borderRadius: invType === 'expert' ? '50%' : 8, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                    {(invSelUser.name || invSelUser.company_name || '').substring(0, 2).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{invSelUser.name || invSelUser.company_name}</div>
                                    <div style={{ fontSize: 11, color: T.primary }}>{invSelUser.expertID || invSelUser.enterpriseID}</div>
                                </div>
                                <button type="button" onClick={() => { setInvSelUser(null); setInvSearch('') }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.outline }}>
                                    <span className="ms ms-sm">close</span>
                                </button>
                            </div>
                        )}

                        {/* Role */}
                        <div className="input-group">
                            <label className="input-label">Role in Project</label>
                            <input className="input-field" value={invRole} onChange={e => setInvRole(e.target.value)} placeholder="e.g. Developer, Reviewer, Advisor..." />
                        </div>

                        {/* Message */}
                        <div className="input-group">
                            <label className="input-label">Message (optional)</label>
                            <textarea className="input-field" rows={3} style={{ resize: 'none' }} value={invMsg} onChange={e => setInvMsg(e.target.value)} placeholder="Add a personal note to your invitation..." />
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                            <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={!invSelUser || inviting}>
                                {inviting ? 'Sending...' : <><span className="ms ms-sm">send</span> Send Invitation</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {/* ── Call Fund Modal ── */}
            {showCallFund && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCallFund(false)}>
                    <form className="modal" onSubmit={handleCallFund}>
                        <div className="modal-title">Call Fund</div>
                        <p style={{ fontSize: 13, color: T.onSurfaceVariant, marginBottom: 20, marginTop: -12 }}>
                            Request funding from a Foundation for <strong>{project?.name}</strong>
                        </p>

                        {callSuccess && (
                            <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 14px', color: '#065f46', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ms ms-sm">check_circle</span>{callSuccess}
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">Select Foundation Fund</label>
                            {funds.length === 0 ? (
                                <div style={{ padding: '16px', textAlign: 'center', color: T.outline, fontSize: 13, background: T.surfaceContainerLow, borderRadius: 10 }}>
                                    Loading funds...
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                                    {funds.map((f, i) => (
                                        <div key={f.FoundID || i}
                                            onClick={() => setSelFund(f)}
                                            style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${selFund?.FoundID === f.FoundID ? T.primary : T.outlineVariant + '40'}`, background: selFund?.FoundID === f.FoundID ? T.primaryFixed : 'white', transition: 'all 0.15s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>account_balance</span>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{f.fundName || f.fund_name}</div>
                                                    <div style={{ fontSize: 11, color: T.outline }}>{f.FoundID} · {f.founder || '—'}</div>
                                                </div>
                                                {selFund?.FoundID === f.FoundID && <span className="ms ms-sm" style={{ color: T.primary }}>check_circle</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setShowCallFund(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={calling || !selFund}>
                                {calling ? 'Sending...' : <><span className="ms ms-sm">send</span> Send Fund Request</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </EENLayout>
    )
}

