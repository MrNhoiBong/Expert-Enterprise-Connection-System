import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FoundationLayout from '../../components/FoundationLayout'
import { dbApi, authApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

export default function FoundationSettings() {
    const { profile, logout } = useAuth()
    const navigate = useNavigate()

    const [profileForm, setProfileForm] = useState({ name: profile?.name || '', title: '', bio: 'Managing director for the EEN Global Philanthropy wing, specializing in sustainable infrastructure networks.' })
    const [newUsername, setNewUsername] = useState('')
    const [pwForm, setPwForm] = useState({ old: '', newp: '', confirm: '' })
    const [saving, setSaving] = useState('')
    const [success, setSuccess] = useState('')
    const [pwError, setPwError] = useState('')
    const [delConfirm, setDelConfirm] = useState(false)

    function flash(msg) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

    async function handleProfile(e) {
        e.preventDefault(); setSaving('profile')
        const res = await dbApi.updateProfile({ name: profileForm.name })
        if (res?.message) flash('Profile updated!')
        setSaving('')
    }

    async function handleUsername(e) {
        e.preventDefault(); if (!newUsername.trim()) return
        setSaving('user')
        const res = await authApi.changeUsername(newUsername)
        if (res?.message) { flash('Username updated!'); setNewUsername('') }
        setSaving('')
    }

    async function handlePassword(e) {
        e.preventDefault(); setPwError('')
        if (pwForm.newp !== pwForm.confirm) { setPwError('Passwords do not match'); return }
        if (pwForm.newp.length < 12) { setPwError('Minimum 12 characters required'); return }
        setSaving('pw')
        const res = await authApi.changePassword(pwForm.old, pwForm.newp)
        if (res?.message) { flash('Password changed!'); setPwForm({ old: '', newp: '', confirm: '' }) }
        else setPwError(res?.detail || 'Failed to change password')
        setSaving('')
    }

    async function handleDelete() {
        const res = await dbApi.deleteAccount()
        if (res?.message) { await logout(); navigate('/login') }
    }

    const currentHandle = '@' + (profile?.account || 'foundation_admin')
    const memberSince = 'September 2023'

    return (
        <FoundationLayout activeKey="settings">
            <div className="page-inner fade-up">

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Account Settings</h1>
                    <p style={{ fontSize: 15, color: T.onSurfaceVariant, marginTop: 8, maxWidth: 520 }}>Manage your foundation credentials, security protocols, and organizational profile details.</p>
                </div>

                {success && <div style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 18px', color: '#065f46', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="ms ms-sm">check_circle</span>{success}
                </div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Edit Profile */}
                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>person</span>
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Edit Profile</h2>
                                    <p style={{ fontSize: 12, color: T.outline }}>Publicly visible representative info.</p>
                                </div>
                            </div>
                            <form onSubmit={handleProfile}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                                    <div>
                                        <label className="input-label">Full Name</label>
                                        <input className="input-field" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="Dr. Helena Vance" />
                                    </div>
                                    <div>
                                        <label className="input-label">Job Title</label>
                                        <input className="input-field" value={profileForm.title} onChange={e => setProfileForm({ ...profileForm, title: e.target.value })} placeholder="Foundation Director" />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Bio</label>
                                    <textarea className="input-field" rows={3} style={{ resize: 'none' }} value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={saving === 'profile'} style={{ marginTop: 8 }}>
                                    {saving === 'profile' ? 'Saving...' : <>Update Profile <span className="ms ms-sm">arrow_forward</span></>}
                                </button>
                            </form>
                        </div>

                        {/* Change Username */}
                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>id_card</span>
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Change Username</h2>
                                    <p style={{ fontSize: 12, color: T.outline }}>Unique handle for platform interactions.</p>
                                </div>
                            </div>
                            <form onSubmit={handleUsername}>
                                <div className="input-group">
                                    <label className="input-label">Current Handle</label>
                                    <input className="input-field" value={currentHandle} disabled style={{ background: T.surfaceContainerHigh, color: T.outline }} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">New Handle</label>
                                    <input className="input-field" required value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="new_username" />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={saving === 'user'}>
                                    {saving === 'user' ? 'Saving...' : <>Save Username <span className="ms ms-sm">arrow_right_alt</span></>}
                                </button>
                            </form>
                        </div>

                        {/* Danger Zone */}
                        <div style={{ border: `2px solid ${T.errorContainer}`, borderRadius: 16, padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.errorContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill ms-sm" style={{ color: T.error }}>warning</span>
                                </div>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, color: T.error }}>Danger Zone</h2>
                            </div>
                            <p style={{ fontSize: 13, color: T.onSurfaceVariant, marginBottom: 20, lineHeight: 1.6 }}>
                                Permanently remove your account and all associated foundation records. This action is <strong>irreversible</strong> and will revoke all access to EEN Foundation modules.
                            </p>
                            {!delConfirm
                                ? <button className="btn" style={{ background: T.errorContainer, color: T.error, borderColor: T.error }} onClick={() => setDelConfirm(true)}>
                                    Permanently Delete Account
                                </button>
                                : <div style={{ background: T.errorContainer, borderRadius: 12, padding: 20 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: T.error, marginBottom: 14 }}>Are you absolutely sure?</p>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button className="btn btn-secondary" onClick={() => setDelConfirm(false)}>Cancel</button>
                                        <button className="btn" style={{ background: T.error, color: 'white' }} onClick={handleDelete}>Confirm Delete</button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Change Password */}
                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>lock</span>
                                </div>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Change Password</h2>
                            </div>
                            {pwError && <div style={{ background: T.errorContainer, borderRadius: 8, padding: '10px 14px', color: T.error, fontSize: 13, marginBottom: 16 }}>{pwError}</div>}
                            <form onSubmit={handlePassword}>
                                {[['old', 'Current Password'], ['newp', 'New Password'], ['confirm', 'Confirm Password']].map(([k, l]) => (
                                    <div key={k} className="input-group">
                                        <label className="input-label">{l}</label>
                                        <input className="input-field" type="password" required value={pwForm[k]} onChange={e => setPwForm({ ...pwForm, [k]: e.target.value })} placeholder="••••••••" />
                                    </div>
                                ))}
                                <p style={{ fontSize: 11, color: T.outline, marginBottom: 16 }}>Minimum 12 characters including uppercase, numbers, and special symbols.</p>
                                <button type="submit" className="btn btn-primary" disabled={saving === 'pw'}>
                                    <span className="ms ms-sm">security</span>
                                    {saving === 'pw' ? 'Updating...' : 'Update Security Credentials'}
                                </button>
                            </form>
                        </div>

                        {/* Security + Account Info */}
                        <div style={{ background: `linear-gradient(135deg,${T.primary},${T.tertiaryContainer})`, borderRadius: 16, padding: 28, color: 'white' }}>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(215,226,255,0.5)', marginBottom: 14 }}>Security Protocols</p>
                            {[
                                { label: '2FA Enabled', ok: true },
                                { label: 'Audit Logging', ok: true },
                                { label: 'IP Allowlist', ok: false },
                                { label: 'SSO Integration', ok: true },
                            ].map(s => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span className="ms ms-fill ms-sm" style={{ color: s.ok ? '#86efac' : 'rgba(255,255,255,0.25)' }}>{s.ok ? 'check_circle' : 'radio_button_unchecked'}</span>
                                    <span style={{ fontSize: 12, color: s.ok ? 'white' : 'rgba(255,255,255,0.4)' }}>{s.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="card" style={{ padding: 20 }}>
                            {[
                                { label: 'Member Since', value: memberSince },
                                { label: 'Last Security Upd.', value: '14 days ago' },
                                { label: 'Foundation ID', value: profile?.FoundID || 'FND001' },
                            ].map((r, i, arr) => (
                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: T.outline }}>{r.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.value}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                                {['Privacy Policy', 'Support Desk'].map(l => (
                                    <button key={l} className="btn btn-ghost" style={{ fontSize: 11, padding: '6px 12px' }}>{l}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FoundationLayout>
    )
}
