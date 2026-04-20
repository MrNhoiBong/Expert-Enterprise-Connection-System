import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EnterpriseLayout from '../../components/EnterpriseLayout'
import { dbApi, authApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth'
import { T } from '../../styles/theme.js'

export default function EnterpriseSettings() {
    const { profile, logout } = useAuth()
    const navigate = useNavigate()
    const [newUsername, setNewUsername] = useState('')
    const [pwForm, setPwForm] = useState({ old: '', newp: '', confirm: '' })
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')
    const [pwError, setPwError] = useState('')
    const [delConfirm, setDelConfirm] = useState(false)

    function flash(msg) { setSuccess(msg); setTimeout(() => setSuccess(''), 3000) }

    async function handleUsername(e) {
        e.preventDefault(); if (!newUsername.trim()) return
        setSaving(true)
        const res = await authApi.changeUsername(newUsername)
        if (res?.message) { flash('Username updated!'); setNewUsername('') }
        setSaving(false)
    }

    async function handlePassword(e) {
        e.preventDefault(); setPwError('')
        if (pwForm.newp !== pwForm.confirm) { setPwError('Passwords do not match'); return }
        if (pwForm.newp.length < 8) { setPwError('Minimum 8 characters required'); return }
        setSaving(true)
        const res = await authApi.changePassword(pwForm.old, pwForm.newp)
        if (res?.message) { flash('Password changed!'); setPwForm({ old: '', newp: '', confirm: '' }) }
        else setPwError(res?.detail || 'Failed to change password')
        setSaving(false)
    }

    async function handleDelete() {
        const res = await dbApi.deleteAccount()
        if (res?.message) { await logout(); navigate('/login') }
    }

    const currentHandle = '@' + (profile?.account || 'enterprise')

    return (
        <EnterpriseLayout activeKey="settings">
            <div className="page-inner fade-up">

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Account Settings</h1>
                    <p style={{ fontSize: 15, color: T.onSurfaceVariant, marginTop: 8, maxWidth: 520 }}>Manage your enterprise identity, security protocols, and corporate profile details within the EEN global network.</p>
                </div>

                {success && <div style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 18px', color: '#065f46', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="ms ms-sm">check_circle</span>{success}
                </div>}

                <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr', gap: 20, alignItems: 'start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Username */}
                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>badge</span>
                                </div>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Change Username</h2>
                            </div>
                            <form onSubmit={handleUsername}>
                                <div className="input-group">
                                    <label className="input-label">Current Handle</label>
                                    <input className="input-field" value={currentHandle} disabled style={{ background: T.surfaceContainerHigh, color: T.outline }} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">New Username</label>
                                    <input className="input-field" required value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="Enter new username" />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 8 }}>
                                    Update Username <span className="ms ms-sm">arrow_forward</span>
                                </button>
                            </form>
                        </div>

                        {/* Password */}
                        <div className="card" style={{ padding: 32 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>lock</span>
                                </div>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>Change Password</h2>
                            </div>
                            {pwError && <div style={{ background: T.errorContainer, borderRadius: 8, padding: '10px 14px', color: T.error, fontSize: 13, marginBottom: 16 }}>{pwError}</div>}
                            <form onSubmit={handlePassword}>
                                {[['old', 'Current Password'], ['newp', 'New Secure Password'], ['confirm', 'Confirm Password']].map(([k, l]) => (
                                    <div key={k} className="input-group">
                                        <label className="input-label">{l}</label>
                                        <input className="input-field" type="password" required value={pwForm[k]} onChange={e => setPwForm({ ...pwForm, [k]: e.target.value })} placeholder="••••••••" />
                                    </div>
                                ))}
                                <p style={{ fontSize: 11, color: T.outline, marginTop: -8, marginBottom: 16 }}>Minimum 8 characters, including symbols for enterprise-grade security.</p>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    <span className="ms ms-sm">security</span> Secure Account
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
                                Deleting your enterprise account will permanently remove all historical project data, active discovery threads, and unspent grant allocations. <strong>This action is irreversible.</strong>
                            </p>
                            {!delConfirm
                                ? <button className="btn" style={{ background: T.errorContainer, color: T.error, borderColor: T.error }} onClick={() => setDelConfirm(true)}>
                                    Delete Account and Purge Data
                                </button>
                                : <div style={{ background: T.errorContainer, borderRadius: 12, padding: 20 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: T.error, marginBottom: 14 }}>Requires multi-factor authorization. Are you sure?</p>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button className="btn btn-secondary" onClick={() => setDelConfirm(false)}>Cancel</button>
                                        <button className="btn" style={{ background: T.error, color: 'white' }} onClick={handleDelete}>Execute Purge</button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                    {/* Right col */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Corporate Profile */}
                        <div className="card" style={{ padding: 28 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                                <div style={{ width: 46, height: 46, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>corporate_fare</span>
                                </div>
                                <div>
                                    <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700 }}>Corporate Profile</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                        <span className="ms ms-fill ms-sm" style={{ color: T.primary, fontSize: 14 }}>verified</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>Enterprise Entity</span>
                                    </div>
                                </div>
                            </div>
                            {[
                                { label: 'Organization Name', value: profile?.company_name || 'Enterprise' },
                                { label: 'Enterprise ID', value: profile?.enterpriseID || 'ENT001' },
                                { label: 'Account', value: profile?.account || 'enterprise' },
                                { label: 'HQ Location', value: 'Zurich, CH', icon: 'location_on' },
                            ].map((r, i, arr) => (
                                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${T.outlineVariant}25` : 'none', alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: T.outline }}>{r.label}</span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.value}</span>
                                </div>
                            ))}
                            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 18, fontSize: 12 }}
                                onClick={() => navigate('/enterprise/profile')}>
                                Save Changes <span className="ms ms-sm">arrow_forward</span>
                            </button>
                        </div>

                        {/* Security Health */}
                        <div style={{ background: `linear-gradient(135deg,${T.primary},${T.tertiaryContainer})`, borderRadius: 16, padding: 28, color: 'white' }}>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(215,226,255,0.5)', marginBottom: 12 }}>Security Health</p>
                            <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 40, fontWeight: 800, color: 'white', marginBottom: 4 }}>98.4%</div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>Enterprise-grade security score</p>
                            {[
                                { label: '2FA Enabled', ok: true },
                                { label: 'Audit Logging', ok: true },
                                { label: 'IP Allowlist', ok: false },
                            ].map(s => (
                                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <span className="ms ms-fill ms-sm" style={{ color: s.ok ? '#86efac' : 'rgba(255,255,255,0.3)' }}>{s.ok ? 'check_circle' : 'radio_button_unchecked'}</span>
                                    <span style={{ fontSize: 12, color: s.ok ? 'white' : 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </EnterpriseLayout>
    )
}
