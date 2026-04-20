import { useState, useRef, useEffect } from 'react'
import EENLayout from '../../components/Layout'
import { dbApi, authApi, bizApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

const SKILL_META = [
    { icon: 'architecture', pct: 95, label: 'Enterprise Arch', bg: T.primaryContainer },
    { icon: 'cloud_done', pct: 88, label: 'Cloud Migration', bg: T.tertiaryContainer },
    { icon: 'security', pct: 82, label: 'Cyber Governance', bg: '#48626e' },
]

const CERTS = [
    { icon: 'military_tech', bg: T.tertiaryFixed, label: 'AWS Certified Solutions Architect', sub: 'Professional Level' },
    { icon: 'workspace_premium', bg: T.primaryFixed, label: 'TOGAF® Enterprise Architecture', sub: 'Certified Practitioner' },
    { icon: 'verified_user', bg: T.secondaryContainer, label: 'CISSP - Cybersecurity', sub: 'ISC2 Member' },
]

export default function ExpertProfile() {
    const { profile, setProfile } = useAuth()
    const fileInputRef = useRef(null)

    const [mode, setMode] = useState('view')
    const [form, setForm] = useState(() => ({
        name: profile?.name || '',
        email: profile?.email || '',
        experience: profile?.experience || 0,
        profileSummary: profile?.profileSummary || '',
        skills: profile?.skills || [],
    }))
    const [saving, setSaving] = useState(false)
    const [newSkill, setNewSkill] = useState('')
    const [success, setSuccess] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')

    // Sync avatarUrl khi profile load xong từ API (profile load async)
    useEffect(() => {
        if (profile?.avatarUrl) {
            setAvatarUrl(profile.avatarUrl)
        }
    }, [profile?.avatarUrl]) // eslint-disable-line

    function flash(msg) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

    /* ── Khi user chọn ảnh ── */
    function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate
        if (!file.type.startsWith('image/')) { setUploadError('Please select an image file (JPG, PNG, GIF, WebP).'); return }
        if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be smaller than 5 MB.'); return }

        setUploadError('')
        setAvatarFile(file)
        // Preview ngay lập tức bằng object URL
        if (avatarPreview) URL.revokeObjectURL(avatarPreview)
        setAvatarPreview(URL.createObjectURL(file))
    }

    /* ── Upload lên MinIO ── */
    async function handleUploadAvatar() {
        if (!avatarFile) return
        setUploading(true); setUploadError('')
        try {
            const formData = new FormData()
            formData.append('file', avatarFile)

            // POST /api/v1/image/upload (port 8002) — không cần project_id
            // Response: { message, url, fileID, file_name, size_kb }
            const res = await bizApi.uploadImage(formData)

            if (!res?.url) {
                throw new Error(res?.detail || res?.message || 'Upload thất bại — backend không trả về url.')
            }

            const url = res.url
            setAvatarUrl(url)
            setAvatarPreview(null)
            setAvatarFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''

            // 1. Lưu avatarUrl vào MongoDB
            const saveRes = await dbApi.updateProfile({ avatarUrl: url })
            console.log('[Avatar] updateProfile response:', saveRes)

            // 2. Refresh profile từ API → cập nhật context với data mới nhất
            const freshProfile = await dbApi.getProfile()
            console.log('[Avatar] freshProfile.avatarUrl:', freshProfile?.avatarUrl)
            if (freshProfile && !freshProfile.detail) {
                if (typeof setProfile === 'function') setProfile(freshProfile)
            }

            flash('Profile photo updated!')
        } catch (err) {
            setUploadError(err.message)
        } finally {
            setUploading(false)
        }
    }

    /* ── Hủy preview ── */
    function cancelPreview() {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview)
        setAvatarPreview(null)
        setAvatarFile(null)
        setUploadError('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    async function handleSave(e) {
        e.preventDefault(); setSaving(true)
        const res = await dbApi.updateProfile(form)
        if (res?.message) { flash('Profile updated!'); setMode('view') }
        setSaving(false)
    }

    const name = profile?.name || 'Expert'
    const skills = profile?.skills || ['Enterprise Architecture', 'Cloud Migration', 'Cyber Governance']
    const initials = name.substring(0, 2).toUpperCase()

    return (
        <EENLayout activeKey="profile">
            <div className="page-inner fade-up">

                {success && (
                    <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 16px', color: '#065f46', fontSize: 13, marginBottom: 20 }}>✓ {success}</div>
                )}

                {/* Profile hero */}
                <section style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-end', gap: 32 }}>

                    {/* ── Avatar block ── */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>

                        {/* Avatar image or initials */}
                        <div style={{
                            width: 140, height: 140, borderRadius: 20, overflow: 'hidden',
                            background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 44, fontWeight: 800, color: 'white',
                            transform: 'rotate(3deg)', boxShadow: '0 16px 40px rgba(0,52,111,0.2)',
                            position: 'relative',
                        }}>
                            {(avatarPreview || avatarUrl) ? (
                                <img
                                    src={avatarPreview || avatarUrl}
                                    alt="Profile"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={() => { setAvatarUrl(null); setAvatarPreview(null) }}
                                />
                            ) : initials}

                            {/* Hover overlay — chỉ hiện khi mode = edit */}
                            {mode === 'edit' && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        position: 'absolute', inset: 0,
                                        background: 'rgba(0,0,0,0.55)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', gap: 4, opacity: 0, transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                >
                                    <span className="ms ms-fill" style={{ color: 'white', fontSize: 28 }}>photo_camera</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Change Photo</span>
                                </div>
                            )}
                        </div>

                        {/* Verified badge */}
                        <div style={{ position: 'absolute', bottom: -8, right: -8, background: T.tertiaryFixed, padding: 10, borderRadius: 12, boxShadow: '0 6px 16px rgba(0,0,0,0.1)' }}>
                            <span className="ms ms-fill ms-lg" style={{ color: T.tertiary }}>verified</span>
                        </div>

                        {/* Input file ẩn */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* ── Name / meta ── */}
                    <div style={{ flex: 1, paddingBottom: 8 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                            <span className="tag tag-teal">Platinum Tier Expert</span>
                            <span className="tag tag-blue">Top 1% Global</span>
                        </div>
                        <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 44, fontWeight: 800, color: T.primary, marginBottom: 6, letterSpacing: '-0.02em' }}>{name}</h1>
                        <p style={{ fontSize: 17, color: T.secondary || T.onSurfaceVariant, fontWeight: 500, marginBottom: 14 }}>
                            {profile?.profileSummary || 'Strategic Digital Transformation & Enterprise Architecture Specialist'}
                        </p>
                        <div style={{ display: 'flex', gap: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="ms ms-sm" style={{ color: T.primary }}>badge</span>
                                <span style={{ fontSize: 13, fontWeight: 500, color: T.onSurfaceVariant }}>{profile?.expertID}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className="ms ms-sm" style={{ color: T.primary }}>schedule</span>
                                <span style={{ fontSize: 13, fontWeight: 500, color: T.onSurfaceVariant }}>{profile?.experience || 0} years experience</span>
                            </div>
                        </div>

                        {/* ── Upload preview actions (chỉ hiện khi đã chọn file) ── */}
                        {avatarPreview && (
                            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                <button
                                    onClick={handleUploadAvatar}
                                    disabled={uploading}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: T.primary, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                                >
                                    {uploading ? (
                                        <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Uploading...</>
                                    ) : (
                                        <><span className="ms ms-sm">cloud_upload</span> Save Photo </>
                                    )}
                                </button>
                                <button onClick={cancelPreview} style={{ padding: '8px 14px', background: 'none', border: `1px solid ${T.outlineVariant}`, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', color: T.onSurfaceVariant, fontFamily: 'Inter,sans-serif' }}>
                                    Cancel
                                </button>
                                <span style={{ fontSize: 11, color: T.outline }}>
                                    {avatarFile?.name} ({(avatarFile?.size / 1024).toFixed(0)} KB)
                                </span>
                            </div>
                        )}

                        {/* Lỗi upload */}
                        {uploadError && (
                            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, color: T.error, fontSize: 12 }}>
                                <span className="ms ms-sm">error</span>{uploadError}
                            </div>
                        )}
                    </div>

                    {/* ── View / Edit toggle ── */}
                    <div style={{ display: 'flex', background: T.surfaceContainer, borderRadius: 999, padding: 4, flexShrink: 0, alignSelf: 'flex-start', marginTop: 8 }}>
                        {['view', 'edit'].map(m => (
                            <button key={m} onClick={() => setMode(m)} style={{ padding: '7px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 700, textTransform: 'capitalize', transition: 'all 0.2s', background: mode === m ? 'white' : 'transparent', color: mode === m ? T.primary : T.outline, boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                                {m === 'view' ? 'View' : 'Edit'}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Spin keyframe */}
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

                {mode === 'view' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12,1fr)', gap: 24 }}>

                        {/* Core Expertise */}
                        <div className="card" style={{ gridColumn: 'span 8' }}>
                            <div className="flex-between" style={{ marginBottom: 24 }}>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, color: T.primary }}>Core Expertise</h2>
                                <button className="btn btn-ghost" style={{ fontSize: 12 }}>
                                    See All Skills <span className="ms ms-sm">arrow_forward</span>
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                                {SKILL_META.map((sk, i) => (
                                    <div key={i} style={{ background: T.surface, padding: 20, borderRadius: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: sk.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                            <span className="ms ms-fill ms-sm" style={{ color: 'white' }}>{sk.icon}</span>
                                        </div>
                                        <h4 style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{skills[i] || sk.label}</h4>
                                        <div className="progress-track"><div className="progress-fill" style={{ width: `${sk.pct}%` }} /></div>
                                        <span style={{ fontSize: 9, fontWeight: 700, color: T.outline, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 6, display: 'block' }}>{sk.pct}% Proficiency</span>
                                    </div>
                                ))}
                            </div>
                            {/* Extra skills */}
                            <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {skills.slice(3).map(s => <span key={s} className="tag tag-slate">{s}</span>)}
                            </div>
                        </div>

                        {/* Performance Metrics — dark */}
                        <div className="card-dark" style={{ gridColumn: 'span 4', position: 'relative', overflow: 'hidden', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', filter: 'blur(32px)' }} />
                            <h3 style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>Performance Metrics</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                                <span style={{ fontFamily: 'Manrope,sans-serif', fontSize: 52, fontWeight: 800, color: 'white' }}>4.98</span>
                                <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.45)' }}>/ 5.0</span>
                            </div>
                            <div style={{ display: 'flex', gap: 3, marginBottom: 28 }}>
                                {[1, 2, 3, 4, 5].map(i => <span key={i} className="ms ms-fill ms-sm" style={{ color: T.tertiaryFixed }}>star</span>)}
                            </div>
                            <div>
                                {[['Completed Projects', '142'], ['Client Retention', '94%']].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 12 }}>
                                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{k}</span>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience timeline */}
                        <div className="card" style={{ gridColumn: 'span 7' }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, color: T.primary, marginBottom: 28 }}>Professional Experience</h3>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: 20, top: 8, bottom: 0, width: 2, background: T.surfaceContainerHigh }} />
                                {[
                                    { title: 'Senior Digital Strategy Lead', company: 'Global FinTech Solutions', period: '2020 — Present', desc: 'Pioneered multi-region cloud transition strategy for Tier 1 investment banks, achieving 30% reduction in operational latency.', active: true },
                                    { title: 'Director of Enterprise Systems', company: 'Nexus Infrastructure', period: '2015 — 2020', desc: 'Managed 45-person architectural team focused on legacy modernization and API-first business logic implementations.', active: false },
                                ].map((exp, i) => (
                                    <div key={i} style={{ position: 'relative', paddingLeft: 56, marginBottom: i < 1 ? 32 : 0 }}>
                                        <div style={{ position: 'absolute', left: 14, top: 2, width: 14, height: 14, borderRadius: '50%', background: exp.active ? T.primary : T.outlineVariant, border: '3px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 1 }} />
                                        <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: 6 }}>
                                            <div>
                                                <h4 style={{ fontWeight: 700, fontSize: 15, color: T.onSurface }}>{exp.title}</h4>
                                                <p style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>{exp.company}</p>
                                            </div>
                                            <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, background: T.surface, padding: '3px 10px', borderRadius: 4, whiteSpace: 'nowrap' }}>{exp.period}</span>
                                        </div>
                                        <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.6 }}>{exp.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certifications */}
                        <div style={{ gridColumn: 'span 5', background: T.surfaceContainerLow, borderRadius: 16, padding: 28 }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, color: T.primary, marginBottom: 20 }}>Certifications</h3>
                            {CERTS.map((c, i) => (
                                <div key={i} style={{ background: 'white', padding: '14px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                                    <div style={{ width: 42, height: 42, background: c.bg, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="ms ms-sm" style={{ color: T.primary }}>{c.icon}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 700, fontSize: 12, color: T.onSurface }}>{c.label}</p>
                                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.outline }}>{c.sub}</p>
                                    </div>
                                    <span className="ms ms-sm" style={{ color: T.outlineVariant }}>open_in_new</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 16, background: `${T.primary}08`, borderRadius: 12, padding: 14, border: `1px solid ${T.primary}12`, textAlign: 'center' }}>
                                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.primary, marginBottom: 6 }}>Upcoming Renewals</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    <span className="ms ms-sm" style={{ color: T.primary }}>event</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: T.onSurfaceVariant }}>PMP Certification (Dec 2024)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                ) : (
                    /* Edit form */
                    <div style={{ maxWidth: 720 }}>
                        <form className="card" onSubmit={handleSave}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, color: T.primary, marginBottom: 28 }}>Edit Profile</h3>

                            {/* ── Photo section ── */}
                            <div style={{ marginBottom: 24, padding: '18px 20px', background: T.surfaceContainerLow, borderRadius: 12 }}>
                                <label className="input-label" style={{ marginBottom: 14, display: 'block' }}>Profile Photo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    {/* Mini preview */}
                                    <div style={{ width: 72, height: 72, borderRadius: 14, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                                        {(avatarPreview || avatarUrl)
                                            ? <img src={avatarPreview || avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => { setAvatarUrl(null); setAvatarPreview(null) }} />
                                            : initials
                                        }
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
                                            <span className="ms ms-sm">photo_camera</span>
                                            {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                                        </button>
                                        <p style={{ fontSize: 11, color: T.outline, marginTop: 6 }}>JPG, PNG, GIF or WebP · Max 5 MB</p>
                                        {avatarPreview && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                                <button type="button" disabled={uploading} onClick={handleUploadAvatar}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', background: T.primary, color: 'white', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                                                    {uploading
                                                        ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Saving...</>
                                                        : <><span className="ms ms-sm">cloud_upload</span> Save </>
                                                    }
                                                </button>
                                                <button type="button" onClick={cancelPreview} style={{ padding: '6px 10px', background: 'none', border: `1px solid ${T.outlineVariant}`, borderRadius: 7, fontSize: 11, cursor: 'pointer', color: T.onSurfaceVariant, fontFamily: 'Inter,sans-serif' }}>
                                                    Cancel
                                                </button>
                                                <span style={{ fontSize: 10, color: T.outline }}>{avatarFile?.name}</span>
                                            </div>
                                        )}
                                        {uploadError && <p style={{ fontSize: 11, color: T.error, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><span className="ms ms-sm">error</span>{uploadError}</p>}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                {[['name', 'Full Name', 'text'], ['email', 'Email', 'email']].map(([k, l, t]) => (
                                    <div key={k}>
                                        <label className="input-label">{l}</label>
                                        <input className="input-field" type={t} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} />
                                    </div>
                                ))}
                            </div>
                            <div className="input-group">
                                <label className="input-label">Years of Experience</label>
                                <input className="input-field" type="number" min={0} max={50} value={form.experience} onChange={e => setForm({ ...form, experience: parseInt(e.target.value) || 0 })} style={{ width: 100 }} />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Profile Summary</label>
                                <textarea className="input-field" rows={3} style={{ resize: 'none' }} value={form.profileSummary} onChange={e => setForm({ ...form, profileSummary: e.target.value })} placeholder="Describe your expertise..." />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Skills</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                                    {(form.skills || []).map(s => (
                                        <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: T.primaryFixed, color: T.primary, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                                            {s}
                                            <button type="button" onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.primary, fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                                        </span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <input className="input-field" style={{ flex: 1 }} placeholder="Add skill, press Enter" value={newSkill} onChange={e => setNewSkill(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSkill.trim()) { setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] })); setNewSkill('') } } }} />
                                    <button type="button" className="btn btn-secondary" onClick={() => { if (newSkill.trim()) { setForm(f => ({ ...f, skills: [...f.skills, newSkill.trim()] })); setNewSkill('') } }}>Add</button>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setMode('view')}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : <>Save Changes <span className="ms ms-sm">arrow_forward</span></>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </EENLayout>
    )
}
