import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EENLayout from '../../components/Layout'
import { authApi, dbApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

export default function ExpertSettings() {
    const { profile, logout } = useAuth()
    const navigate = useNavigate()

    const [profileForm, setProfileForm] = useState(() => ({
        name: profile?.name || '',
        title: '',
        profileSummary: profile?.profileSummary || '',
    }))
    const [username, setUsername] = useState('')
    const [pwForm, setPwForm] = useState({ old: '', new: '', confirm: '' })
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingUser, setSavingUser] = useState(false)
    const [savingPw, setSavingPw] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [showDelete, setShowDelete] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [deleting, setDeleting] = useState(false)

    function flash(msg, isErr = false) {
        if (isErr) setError(msg); else setSuccess(msg)
        setTimeout(() => { setSuccess(''); setError('') }, 3000)
    }

    async function handleSaveProfile(e) {
        e.preventDefault(); setSavingProfile(true)
        const res = await dbApi.updateProfile(profileForm)
        if (res?.message) flash('Profile updated successfully!')
        else flash(res?.detail || 'Update failed.', true)
        setSavingProfile(false)
    }

    async function handleChangeUsername(e) {
        e.preventDefault(); setSavingUser(true)
        const res = await authApi.changeUsername(username)
        if (res?.message) { flash('Username updated!'); setUsername('') }
        else flash(res?.detail || 'Failed to update username.', true)
        setSavingUser(false)
    }

    async function handleChangePw(e) {
        e.preventDefault()
        if (pwForm.new !== pwForm.confirm) { flash('Passwords do not match.', true); return }
        if (pwForm.new.length < 6) { flash('Minimum 6 characters.', true); return }
        setSavingPw(true)
        const res = await authApi.changePassword(pwForm.old, pwForm.new)
        if (res?.message) { flash('Password changed!'); setPwForm({ old: '', new: '', confirm: '' }) }
        else flash(res?.detail || 'Incorrect current password.', true)
        setSavingPw(false)
    }

    async function handleDeleteAccount() {
        if (confirmText !== profile?.account) return
        setDeleting(true)
        const res = await dbApi.deleteAccount()
        if (res?.message) { await logout(); navigate('/login') }
        setDeleting(false)
    }

    /* ── shared styles ── */
    const sectionCard = {
        background: T.surfaceContainerLowest,
        borderRadius: 14, padding: 32,
        boxShadow: '0 1px 3px rgba(25,28,30,0.04)',
    }
    const inp = { width: '100%', padding: '12px 14px', background: T.surfaceContainerHighest, border: 'none', borderRadius: 8, fontSize: 13, fontFamily: 'Inter,sans-serif', color: T.onSurface, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }
    const lbl = { display: 'block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.outline, marginBottom: 6, fontFamily: 'Inter,sans-serif' }
    const grp = { marginBottom: 16 }

    return (
        <EENLayout activeKey="settings">
            <div className="page-inner fade-up">

                {/* Hero */}
                <section style={{ marginBottom: 40 }}>
                    <h1 className="page-title" style={{ fontSize: 40 }}>Account Settings</h1>
                    <p className="page-subtitle" style={{ marginTop: 8 }}>
                        Manage your expert identity, security protocols, and system access.
                        Changes made here impact your visibility across the EEN network.
                    </p>
                </section>

                {/* Flash messages */}
                {success && (
                    <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 16px', color: '#065f46', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="ms ms-sm ms-fill" style={{ color: '#065f46' }}>check_circle</span>{success}
                    </div>
                )}
                {error && (
                    <div style={{ background: T.errorContainer, borderRadius: 10, padding: '10px 16px', color: T.onErrorContainer, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="ms ms-sm" style={{ color: T.onErrorContainer }}>warning</span>{error}
                    </div>
                )}

                {/* ── Row 1 — Edit Profile + Username ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, marginBottom: 20 }}>

                    {/* Edit Profile */}
                    <section style={sectionCard}>
                        <div className="flex-between" style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>badge</span>
                                </div>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700 }}>Edit Profile</h2>
                            </div>
                            <span className="tag tag-teal">System Verified</span>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                <div style={grp}>
                                    <label style={lbl}>Full Name</label>
                                    <input style={inp} type="text" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder={profile?.name || 'Dr. Helena Vance'} />
                                </div>
                                <div style={grp}>
                                    <label style={lbl}>Professional Title</label>
                                    <input style={inp} type="text" value={profileForm.title} onChange={e => setProfileForm({ ...profileForm, title: e.target.value })} placeholder="Principal Expert - Quantum Computing" />
                                </div>
                            </div>
                            <div style={grp}>
                                <label style={lbl}>Executive Bio</label>
                                <textarea style={{ ...inp, height: 100, resize: 'none' }}
                                    value={profileForm.profileSummary}
                                    onChange={e => setProfileForm({ ...profileForm, profileSummary: e.target.value })}
                                    placeholder="Principal researcher with 15+ years experience..."
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={savingProfile}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.primary, fontWeight: 700, fontSize: 14, fontFamily: 'Inter,sans-serif' }}>
                                    {savingProfile ? 'Saving...' : 'Save Changes'}
                                    {!savingProfile && <span className="ms ms-sm">arrow_forward</span>}
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Username */}
                    <section style={{ ...sectionCard, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.secondaryContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-sm" style={{ color: T.primary }}>alternate_email</span>
                                </div>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700 }}>Username</h2>
                            </div>
                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.6, marginBottom: 20 }}>
                                Your username is used for internal mentions and audit logs.
                            </p>
                            <div style={grp}>
                                <label style={lbl}>Current Handle</label>
                                <div style={{ ...inp, color: T.onSurfaceVariant, cursor: 'default', fontFamily: 'monospace' }}>
                                    @{profile?.account || 'username'}
                                </div>
                            </div>
                            <div style={grp}>
                                <label style={lbl}>New Handle</label>
                                <input style={inp} placeholder="Enter new username" value={username} onChange={e => setUsername(e.target.value)} />
                            </div>
                        </div>
                        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
                            onClick={handleChangeUsername} disabled={savingUser || !username.trim()}>
                            {savingUser ? 'Updating...' : 'Update Username'}
                        </button>
                    </section>
                </div>

                {/* ── Row 2 — Security + Security Health + Danger Zone ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

                    {/* Change Password */}
                    <section style={sectionCard}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="ms ms-sm" style={{ color: T.primary }}>lock</span>
                            </div>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700 }}>Security</h2>
                        </div>
                        <form onSubmit={handleChangePw}>
                            {[
                                { k: 'old', l: 'Current Password' },
                                { k: 'new', l: 'New Password' },
                                { k: 'confirm', l: 'Confirm New Password' },
                            ].map(f => (
                                <div key={f.k} style={grp}>
                                    <label style={lbl}>{f.l}</label>
                                    <input style={inp} type="password" required placeholder="••••••••"
                                        value={pwForm[f.k]} onChange={e => setPwForm({ ...pwForm, [f.k]: e.target.value })} />
                                </div>
                            ))}
                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} disabled={savingPw}>
                                {savingPw ? 'Rotating...' : 'Rotate Password'}
                            </button>
                        </form>
                    </section>

                    {/* Security Health */}
                    <section style={sectionCard}>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Security Health</h2>
                        {[
                            { label: 'Multi-Factor Auth', status: 'ACTIVE', sub: 'Verified via Authenticator', statusColor: '#065f46', statusBg: '#d1fae5' },
                            { label: 'Current Session', status: 'SECURE', sub: 'London, GB · MacOS', statusColor: T.primary, statusBg: T.primaryFixed },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '14px 0', borderBottom: i < 1 ? `1px solid ${T.outlineVariant}30` : 'none' }}>
                                <div className="flex-between" style={{ marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</span>
                                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: 4, background: item.statusBg, color: item.statusColor }}>{item.status}</span>
                                </div>
                                <p style={{ fontSize: 12, color: T.onSurfaceVariant }}>{item.sub}</p>
                            </div>
                        ))}
                        <div style={{ background: T.surfaceContainerLow, borderRadius: 10, padding: '14px 16px', marginTop: 16 }}>
                            <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.outline, marginBottom: 6 }}>Last Password Rotation</p>
                            <p style={{ fontSize: 13, fontWeight: 600, color: T.onSurface }}>14 days ago (Sept 12, 2023)</p>
                        </div>
                    </section>

                    {/* Danger Zone */}
                    <section style={{ ...sectionCard, border: `1px solid ${T.errorContainer}`, background: '#fffafa' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.errorContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="ms ms-sm ms-fill" style={{ color: T.error }}>warning</span>
                            </div>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 20, fontWeight: 700, color: T.error }}>Danger Zone</h2>
                        </div>
                        <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.6, marginBottom: 20 }}>
                            Deleting your account is permanent. This will remove all project history, credentials, and network access. There is no recovery process.
                        </p>

                        {!showDelete ? (
                            <button
                                onClick={() => setShowDelete(true)}
                                style={{ width: '100%', padding: '11px', background: 'transparent', border: `1.5px solid ${T.error}`, color: T.error, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = T.errorContainer }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                                Delete Expert Account
                            </button>
                        ) : (
                            <div>
                                <p style={{ fontSize: 12, color: T.onSurfaceVariant, marginBottom: 10 }}>
                                    Type <strong style={{ fontFamily: 'monospace', color: T.error }}>{profile?.account}</strong> to confirm:
                                </p>
                                <input style={{ ...inp, marginBottom: 10, border: `1px solid ${T.error}40`, background: T.errorContainer + '40' }}
                                    placeholder={profile?.account}
                                    value={confirmText}
                                    onChange={e => setConfirmText(e.target.value)}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${T.outlineVariant}`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter,sans-serif' }}
                                        onClick={() => { setShowDelete(false); setConfirmText('') }}>
                                        Cancel
                                    </button>
                                    <button
                                        style={{ flex: 1, padding: '10px', background: confirmText === profile?.account ? T.error : T.errorContainer, color: confirmText === profile?.account ? 'white' : T.onErrorContainer, border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'Inter,sans-serif', transition: 'all 0.2s' }}
                                        onClick={handleDeleteAccount}
                                        disabled={confirmText !== profile?.account || deleting}>
                                        {deleting ? 'Deleting...' : 'Confirm Delete'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Footer */}
                <footer style={{ marginTop: 60, paddingTop: 20, borderTop: `1px solid ${T.outlineVariant}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 12, color: T.outline }}>© 2024 Enterprise Expert Network. All rights reserved. Encryption: AES-256-GCM.</p>
                    <div style={{ display: 'flex', gap: 24 }}>
                        {['Compliance', 'Privacy Policy', 'System Status'].map(l => (
                            <a key={l} href="#" style={{ fontSize: 12, color: T.primary, fontWeight: 600, textDecoration: 'none' }}>{l}</a>
                        ))}
                    </div>
                </footer>
            </div>
        </EENLayout>
    )
}
