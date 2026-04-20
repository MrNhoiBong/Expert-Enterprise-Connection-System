import { useState, useEffect, useRef } from 'react'
import FoundationLayout from '../../components/FoundationLayout'
import { dbApi, bizApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

export default function FoundationProfile() {
    const { profile, setProfile } = useAuth()
    const fileInputRef = useRef(null)

    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState(() => ({
        name: profile?.name || '',
        email: profile?.email || '',
    }))
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')

    useEffect(() => {
        if (profile) {
            if (!form.name) setForm({ name: profile.name || '', email: profile.email || '' })
            if (profile.avatarUrl) setAvatarUrl(profile.avatarUrl)
        }
    }, [profile?.avatarUrl, profile?.name]) // eslint-disable-line

    function flash(msg) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

    function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) { setUploadError('Please select an image file.'); return }
        if (file.size > 5 * 1024 * 1024) { setUploadError('Image must be smaller than 5 MB.'); return }
        setUploadError('')
        setAvatarFile(file)
        if (avatarPreview) URL.revokeObjectURL(avatarPreview)
        setAvatarPreview(URL.createObjectURL(file))
    }

    async function handleUploadAvatar() {
        if (!avatarFile) return
        setUploading(true); setUploadError('')
        try {
            const formData = new FormData()
            formData.append('file', avatarFile)
            const res = await bizApi.uploadImage(formData)
            if (!res?.url) throw new Error(res?.detail || 'Upload failed.')
            const url = res.url
            setAvatarUrl(url)
            setAvatarPreview(null); setAvatarFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            await dbApi.updateProfile({ avatarUrl: url })
            const fresh = await dbApi.getProfile()
            if (fresh && !fresh.detail && typeof setProfile === 'function') setProfile(fresh)
            flash('Profile photo updated!')
        } catch (err) { setUploadError(err.message) }
        finally { setUploading(false) }
    }

    function cancelPreview() {
        if (avatarPreview) URL.revokeObjectURL(avatarPreview)
        setAvatarPreview(null); setAvatarFile(null); setUploadError('')
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    async function handleSave(e) {
        e.preventDefault(); setSaving(true)
        const res = await dbApi.updateProfile(form)
        if (res?.message) { flash('Profile updated!'); setEditing(false) }
        setSaving(false)
    }

    const name = profile?.name || 'Foundation'
    const initials = name.substring(0, 2).toUpperCase()

    const LIAISONS = [
        { name: 'Marcus Thorne', role: 'Chief Foundation Officer' },
        { name: 'Elena Vance', role: 'Strategic Communications' },
    ]
    const IMPACT = [
        { value: '$142.8M', label: 'Total Grants Disbursed' },
        { value: '1,240+', label: 'Active Research Experts' },
        { value: '4.9/5.0', label: 'Network Rating' },
    ]
    const BADGES = [
        { icon: 'security', label: 'Regulatory Compliance', sub: 'Last verified Oct 2023', ok: true },
        { icon: 'analytics', label: 'Impact Audited', sub: 'Gold Transparency Rating', ok: true },
        { icon: 'language', label: 'Global Outreach', sub: 'Active in 42 Countries', ok: true },
    ]

    return (
        <FoundationLayout activeKey="profile">
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div className="page-inner fade-up">

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: T.tertiary, marginBottom: 8 }}>Institutional Identity</p>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Foundation Profile</h1>
                    <p style={{ fontSize: 15, color: T.onSurfaceVariant, marginTop: 8, maxWidth: 520 }}>Manage your institutional presence, mission directives, and regulatory credentials.</p>
                </div>

                {/* Hero Avatar */}
                <section style={{ marginBottom: 36, display: 'flex', alignItems: 'flex-end', gap: 32 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: 110, height: 110, borderRadius: 20, overflow: 'hidden', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 800, color: 'white', boxShadow: '0 12px 32px rgba(0,52,111,0.18)' }}>
                            {(avatarPreview || avatarUrl)
                                ? <img src={avatarPreview || avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => { setAvatarUrl(null); setAvatarPreview(null) }} />
                                : initials}
                            {editing && (
                                <div onClick={() => fileInputRef.current?.click()}
                                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, opacity: 0, transition: 'opacity 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                    <span className="ms ms-fill" style={{ color: 'white', fontSize: 24 }}>photo_camera</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textTransform: 'uppercase' }}>Change</span>
                                </div>
                            )}
                        </div>
                        <div style={{ position: 'absolute', bottom: -6, right: -6, background: T.tertiaryFixed, padding: 7, borderRadius: 9, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <span className="ms ms-fill" style={{ color: T.primary, fontSize: 16 }}>verified</span>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                    </div>

                    <div style={{ flex: 1, paddingBottom: 4 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span className="tag tag-blue">Foundation</span>
                            <span className="tag tag-teal">Tier 1 Institutional</span>
                            <span className="tag tag-green">Non-Profit · Verified Partner</span>
                        </div>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 28, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em', marginBottom: 4 }}>{name}</h2>
                        <p style={{ fontSize: 13, color: T.onSurfaceVariant }}>Established 1994 · Brussels, Belgium · {profile?.FoundID}</p>
                        {avatarPreview && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                                <button onClick={handleUploadAvatar} disabled={uploading}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: T.primary, color: 'white', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                                    {uploading
                                        ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Uploading...</>
                                        : <><span className="ms ms-sm">cloud_upload</span> Save Photo</>}
                                </button>
                                <button onClick={cancelPreview} style={{ padding: '7px 12px', background: 'none', border: `1px solid ${T.outlineVariant}`, borderRadius: 8, fontSize: 12, cursor: 'pointer', color: T.onSurfaceVariant, fontFamily: 'Inter,sans-serif' }}>Cancel</button>
                                <span style={{ fontSize: 11, color: T.outline }}>{avatarFile?.name}</span>
                            </div>
                        )}
                        {uploadError && <p style={{ fontSize: 12, color: T.error, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><span className="ms ms-sm">error</span>{uploadError}</p>}
                    </div>

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

                        {/* Identity Form */}
                        <div className="card" style={{ padding: 32 }}>
                            <div className="flex-between" style={{ marginBottom: 24 }}>
                                <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Institutional Details</h3>
                            </div>
                            {success && <div style={{ background: '#d1fae5', borderRadius: 8, padding: '10px 16px', color: '#065f46', fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="ms ms-sm">check_circle</span>{success}
                            </div>}

                            {editing && (
                                <div style={{ padding: '16px 18px', background: T.surfaceContainerLow, borderRadius: 12, marginBottom: 20 }}>
                                    <label className="input-label" style={{ marginBottom: 10, display: 'block' }}>Profile Photo</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 10, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white', overflow: 'hidden', flexShrink: 0 }}>
                                            {(avatarPreview || avatarUrl) ? <img src={avatarPreview || avatarUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                                        </div>
                                        <div>
                                            <button type="button" className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
                                                <span className="ms ms-sm">photo_camera</span> {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                                            </button>
                                            <p style={{ fontSize: 11, color: T.outline, marginTop: 4 }}>JPG, PNG, WebP · Max 5 MB</p>
                                            {avatarPreview && (
                                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                                    <button type="button" disabled={uploading} onClick={handleUploadAvatar}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: T.primary, color: 'white', border: 'none', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                                                        {uploading ? 'Saving...' : <><span className="ms ms-sm">cloud_upload</span> Save</>}
                                                    </button>
                                                    <button type="button" onClick={cancelPreview} style={{ padding: '6px 10px', background: 'none', border: `1px solid ${T.outlineVariant}`, borderRadius: 7, fontSize: 11, cursor: 'pointer', color: T.onSurfaceVariant, fontFamily: 'Inter,sans-serif' }}>Cancel</button>
                                                </div>
                                            )}
                                            {uploadError && <p style={{ fontSize: 11, color: T.error, marginTop: 4 }}>{uploadError}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSave}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                    <div>
                                        <label className="input-label">Full Name / Foundation Name</label>
                                        <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={!editing} placeholder="Foundation Name" />
                                    </div>
                                    <div>
                                        <label className="input-label">Contact Email</label>
                                        <input className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={!editing} placeholder="director@foundation.org" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Legal Registered Name</label>
                                    <input className="input-field" disabled defaultValue="EEN Foundation Global Research A.I.S.B.L." />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Corporate Mission Statement</label>
                                    <textarea className="input-field" rows={3} style={{ resize: 'none' }} disabled={!editing}
                                        defaultValue="To accelerate the global transition towards sustainable architectural excellence by fostering a network of elite specialists and providing transparent fund allocation." />
                                </div>
                                {editing && (
                                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                                        <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes →'}</button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Foundation Liaisons */}
                        <div className="card" style={{ padding: 28 }}>
                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Foundation Liaisons</h3>
                            {LIAISONS.map((l, i) => (
                                <div key={i} className="flex-between" style={{ padding: '12px 0', borderBottom: i < LIAISONS.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700 }}>
                                            {l.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13 }}>{l.name}</div>
                                            <div style={{ fontSize: 11, color: T.outline }}>{l.role}</div>
                                        </div>
                                    </div>
                                    <button className="btn btn-ghost" style={{ fontSize: 11 }}>Contact</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Col */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Impact Stats */}
                        <div className="card-dark" style={{ borderRadius: 16, padding: 28 }}>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(215,226,255,0.5)', marginBottom: 20 }}>Foundation Impact</p>
                            {IMPACT.map((s, i) => (
                                <div key={i} style={{ marginBottom: i < IMPACT.length - 1 ? 18 : 0, paddingBottom: i < IMPACT.length - 1 ? 18 : 0, borderBottom: i < IMPACT.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                                    <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 26, fontWeight: 800, color: 'white' }}>{s.value}</div>
                                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Verification Badges */}
                        <div className="card" style={{ padding: 24 }}>
                            <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>Verification Badges</h4>
                            {BADGES.map((b, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < BADGES.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                    <span className="ms ms-fill ms-sm" style={{ color: b.ok ? T.primary : T.outline }}>{b.icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700 }}>{b.label}</div>
                                        <div style={{ fontSize: 10, color: T.outline }}>{b.sub}</div>
                                    </div>
                                    {b.ok && <span className="ms ms-fill ms-sm" style={{ color: '#16a34a' }}>check_circle</span>}
                                </div>
                            ))}
                            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 14, fontSize: 12 }}>
                                Request Recertification
                            </button>
                        </div>

                        {/* Foundation ID */}
                        <div className="card" style={{ padding: 20 }}>
                            {[
                                { icon: 'badge', label: 'Foundation ID', value: profile?.FoundID || 'FND001' },
                                { icon: 'location_on', label: 'Location', value: 'Brussels, Belgium' },
                                { icon: 'calendar_today', label: 'Established', value: '1994' },
                            ].map((r, i, arr) => (
                                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none' }}>
                                    <span className="ms ms-sm" style={{ color: T.outline }}>{r.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 10, color: T.outline }}>{r.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600 }}>{r.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </FoundationLayout>
    )
}
