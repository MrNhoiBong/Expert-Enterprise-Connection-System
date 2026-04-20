import { useState, useEffect, useRef } from 'react'
import EnterpriseLayout from '../../components/EnterpriseLayout'
import { dbApi, bizApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

export default function EnterpriseProfile() {
    const { profile, setProfile } = useAuth()
    const fileInputRef = useRef(null)

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState(() => ({
        company_name: profile?.company_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
    }))
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')

    // Sync form & avatar khi profile load xong từ API
    useEffect(() => {
        if (profile) {
            if (!form.company_name) {
                setForm({
                    company_name: profile.company_name || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                })
            }
            if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl)
        }
    }, [profile?.avatarUrl, profile?.company_name]) // eslint-disable-line

    function flash(msg) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

    /* ── Chọn file ── */
    function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) { setUploadError('Please select an image file (JPG, PNG, GIF, WebP).'); return }
        if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be smaller than 5 MB.'); return }
        setUploadError('')
        setAvatarFile(file)
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
            const res = await bizApi.uploadImage(formData)
            if (!res?.url) throw new Error(res?.detail || res?.message || 'Upload failed — no URL returned.')
            const url = res.url
            setAvatarUrl(url)
            setAvatarPreview(null)
            setAvatarFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            await dbApi.updateProfile({ avatarUrl: url })
            const freshProfile = await dbApi.getProfile()
            if (freshProfile && !freshProfile.detail && typeof setProfile === 'function') setProfile(freshProfile)
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

    /* ── Lưu thông tin ── */
    async function handleSave(e) {
        e.preventDefault(); setSaving(true)
        const res = await dbApi.updateProfile(form)
        if (res?.message) { flash('Profile updated!'); setEditing(false) }
        setSaving(false)
    }

    const name = profile?.company_name || 'Enterprise'
    const initials = name.substring(0, 2).toUpperCase()

    const ENGAGEMENTS = [
        { title: 'Supply Chain Audit', experts: 24, phase: 'Phase 2', status: 'tag-green' },
        { title: 'AI Integration Roadmap', experts: 12, phase: 'Kickoff', status: 'tag-amber' },
        { title: 'Legal Compliance Review', experts: 5, phase: 'Finalizing', status: 'tag-blue' },
    ]

    return (
        <EnterpriseLayout activeKey="profile">
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div className="page-inner fade-up">

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Enterprise Profile</h1>
                    <p style={{ fontSize: 15, color: T.onSurfaceVariant, marginTop: 8, maxWidth: 520 }}>Manage your global corporate identity, operational footprint, and network health metrics.</p>
                </div>

                {/* Hero Avatar Section */}
                <section style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', gap: 32 }}>

                    {/* Avatar block */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 120, height: 120, borderRadius: 20, overflow: 'hidden', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 800, color: 'white', boxShadow: '0 12px 32px rgba(0,52,111,0.18)', position: 'relative' }}>
                            {(avatarPreview || avatarUrl)
                                ? <img src={avatarPreview || avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => { setAvatarUrl(null); setAvatarPreview(null) }} />
                                : initials
                            }
                            {/* Hover overlay — chỉ khi editing */}
                            {editing && (
                                <div onClick={() => fileInputRef.current?.click()}
                                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, opacity: 0, transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                    <span className="ms ms-fill" style={{ color: 'white', fontSize: 26 }}>photo_camera</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Change</span>
                                </div>
                            )}
                        </div>
                        {/* Verified badge */}
                        <div style={{ position: 'absolute', bottom: -6, right: -6, background: T.tertiaryFixed, padding: 8, borderRadius: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <span className="ms ms-fill" style={{ color: T.primary, fontSize: 18 }}>verified</span>
                        </div>
                        {/* Hidden file input */}
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>

                    {/* Name + meta */}
                    <div style={{ flex: 1, paddingBottom: 6 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span className="tag tag-blue">Enterprise</span>
                            <span className="tag tag-teal">Verified Entity</span>
                        </div>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 32, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em', marginBottom: 4 }}>{name}</h2>
                        <p style={{ fontSize: 14, color: T.onSurfaceVariant }}>{profile?.enterpriseID} · {profile?.email || 'Global Enterprise'}</p>

                        {/* Upload preview actions */}
                        {avatarPreview && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                                <button onClick={handleUploadAvatar} disabled={uploading}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: T.primary, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                                    {uploading
                                        ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Uploading...</>
                                        : <><span className="ms ms-sm">cloud_upload</span> Save Photo</>
                                    }
                                </button>
                                <button onClick={cancelPreview}
                                    style={{ padding: '8px 12px', background: 'none', border: `1px solid ${T.outlineVariant}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: T.onSurfaceVariant, fontFamily: 'Inter,sans-serif' }}>
                                    Cancel
                                </button>
                                <span style={{ fontSize: 11, color: T.outline }}>{avatarFile?.name} ({(avatarFile?.size / 1024).toFixed(0)} KB)</span>
                            </div>
                        )}
                        {uploadError && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.error, fontSize: 12, marginTop: 8 }}>
                                <span className="ms ms-sm">error</span>{uploadError}
                            </div>
                        )}
                    </div>

                    {/* Edit / View toggle */}
                    <div style={{ display: 'flex', background: T.surfaceContainer, borderRadius: 999, padding: 4, flexShrink: 0, alignSelf: 'flex-start' }}>
                        {['view', 'edit'].map(m => (
                            <button key={m} onClick={() => setEditing(m === 'edit')}
                                style={{ padding: '7px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 700, textTransform: 'capitalize', transition: 'all 0.2s', background: (editing ? m === 'edit' : m === 'view') ? 'white' : 'transparent', color: (editing ? m === 'edit' : m === 'view') ? T.primary : T.outline, boxShadow: (editing ? m === 'edit' : m === 'view') ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                                {m === 'view' ? 'View' : 'Edit'}
                            </button>
                        ))}
                    </div>
                </section>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Corporate Identity Card */}
                        <div className="card" style={{ padding: 32 }}>
                            <div className="flex-between" style={{ marginBottom: 24 }}>
                                <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Corporate Identity</h3>
                            </div>

                            {success && <div style={{ background: '#d1fae5', borderRadius: 8, padding: '10px 16px', color: '#065f46', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ms ms-sm">check_circle</span>{success}
                            </div>}

                            {/* Photo upload in edit mode */}
                            {editing && (
                                <div style={{ padding: '16px 18px', background: T.surfaceContainerLow, borderRadius: 12, marginBottom: 20 }}>
                                    <label className="input-label" style={{ marginBottom: 12, display: 'block' }}>Company Logo / Profile Photo</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ width: 56, height: 56, borderRadius: 12, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                                            {(avatarPreview || avatarUrl)
                                                ? <img src={avatarPreview || avatarUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => { setAvatarUrl(null); setAvatarPreview(null) }} />
                                                : initials
                                            }
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
                                                <span className="ms ms-sm">photo_camera</span>
                                                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                                            </button>
                                            <p style={{ fontSize: 11, color: T.outline, marginTop: 5 }}>JPG, PNG, GIF or WebP · Max 5 MB</p>
                                            {avatarPreview && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                                    <button type="button" disabled={uploading} onClick={handleUploadAvatar}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', background: T.primary, color: 'white', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                                                        {uploading
                                                            ? <><div style={{ width: 11, height: 11, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Saving...</>
                                                            : <><span className="ms ms-sm">cloud_upload</span> Save to MinIO</>
                                                        }
                                                    </button>
                                                    <button type="button" onClick={cancelPreview}
                                                        style={{ padding: '6px 10px', background: 'none', border: `1px solid ${T.outlineVariant}`, borderRadius: 7, fontSize: 11, cursor: 'pointer', color: T.onSurfaceVariant, fontFamily: 'Inter,sans-serif' }}>
                                                        Cancel
                                                    </button>
                                                    <span style={{ fontSize: 10, color: T.outline }}>{avatarFile?.name}</span>
                                                </div>
                                            )}
                                            {uploadError && <p style={{ fontSize: 11, color: T.error, marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 }}><span className="ms ms-sm">error</span>{uploadError}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                    {[['company_name', 'Organization Name'], ['email', 'Primary Contact Email']].map(([k, l]) => (
                                        <div key={k}>
                                            <label className="input-label">{l}</label>
                                            <input className="input-field" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} disabled={!editing} placeholder={l} />
                                        </div>
                                    ))}
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Phone</label>
                                    <input className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} disabled={!editing} placeholder="+1 555 000 0000" style={{ maxWidth: 260 }} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Corporate Mission Statement</label>
                                    <textarea className="input-field" rows={3} style={{ resize: 'none' }} disabled={!editing} defaultValue="The EEN mission is to facilitate high-stakes knowledge exchange between global industry leaders and vetted institutional experts." />
                                </div>
                                {editing && (
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes →'}</button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Active Engagements */}
                        <div className="card" style={{ padding: 28 }}>
                            <div className="flex-between" style={{ marginBottom: 20 }}>
                                <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700 }}>Active Engagements</h3>
                                <button className="btn btn-ghost" style={{ fontSize: 12 }}>View Project Center <span className="ms ms-sm">arrow_forward</span></button>
                            </div>
                            {ENGAGEMENTS.map((eng, i) => (
                                <div key={i} className="flex-between" style={{ padding: '13px 0', borderBottom: i < ENGAGEMENTS.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 9, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span className="ms ms-sm" style={{ color: T.primary }}>work</span>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{eng.title}</div>
                                            <div style={{ fontSize: 11, color: T.outline }}>{eng.experts} Experts · {eng.phase}</div>
                                        </div>
                                    </div>
                                    <span className={`tag ${eng.status}`}>{eng.phase}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right col */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Network Health */}
                        <div className="card-dark" style={{ borderRadius: 16, padding: 28, textAlign: 'center' }}>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(215,226,255,0.5)', marginBottom: 16 }}>Network Health Score</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 52, fontWeight: 800, color: 'white', lineHeight: 1 }}>98.4<span style={{ fontSize: 22 }}>%</span></div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 8, marginBottom: 20 }}>Top 2% of sector</p>
                            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                                {[['1.2h', 'Expert Response'], ['42', 'Active Engagements']].map(([v, l]) => (
                                    <div key={l} style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: 'white', fontFamily: 'Manrope,sans-serif' }}>{v}</div>
                                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>{l}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Verification Badge */}
                        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
                            <div style={{ width: 56, height: 56, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                <span className="ms ms-fill" style={{ color: T.primary, fontSize: 28 }}>verified_user</span>
                            </div>
                            <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Institutional Tier IV Badge</h4>
                            <p style={{ fontSize: 11, color: T.outline, marginBottom: 12 }}>Displayed on all discovery portals and grant applications.</p>
                            <p style={{ fontSize: 10, color: T.outline }}>Last audit: Sep 2023</p>
                            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 14, fontSize: 12 }}>Request Change</button>
                        </div>

                        {/* Info */}
                        <div className="card" style={{ padding: 20 }}>
                            {[
                                { icon: 'domain', label: 'Industry', value: 'Aerospace Global Logistics' },
                                { icon: 'location_on', label: 'HQ Location', value: 'Zurich, CH' },
                                { icon: 'badge', label: 'Enterprise ID', value: profile?.enterpriseID || 'ENT001' },
                            ].map((r, i, arr) => (
                                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                    <span className="ms ms-sm" style={{ color: T.outline }}>{r.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 10, color: T.outline }}>{r.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </EnterpriseLayout>
    )
}
