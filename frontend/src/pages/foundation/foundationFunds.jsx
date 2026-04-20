import { useState, useEffect } from 'react'
import FoundationLayout from '../../components/FoundationLayout'
import { dbApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

const fmt = n => {
    const num = Number(n)
    if (!num) return '—'
    return num >= 1000000 ? `$${(num / 1000000).toFixed(1)}M` : `$${(num / 1000).toFixed(0)}K`
}
const STATUS_CLS = { Active: 'tag-green', active: 'tag-green', Draft: 'tag-amber', draft: 'tag-amber', Archived: 'tag-slate' }
const ICONS = ['rocket_launch', 'nature_people', 'favorite', 'analytics', 'account_balance', 'science', 'public', 'bolt']

function FundCard({ f, isMine }) {
    const icon = ICONS[Math.abs(f.fund_name?.charCodeAt(0) || 0) % ICONS.length]
    const color = isMine ? T.primary : '#0369a1'
    const status = f.status || 'Active'
    return (
        <div className="card" style={{ padding: 24, position: 'relative' }}>
            {isMine && (
                <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, fontWeight: 700, background: T.primaryFixed, color: T.primary, padding: '3px 8px', borderRadius: 999 }}>
                    MY FUND
                </span>
            )}
            <div className="flex-between" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="ms ms-fill ms-sm" style={{ color }}>{icon}</span>
                    </div>
                    <span className={`tag ${STATUS_CLS[status] || 'tag-slate'}`} style={{ fontSize: 10 }}>{status}</span>
                </div>
                {f.size > 0 && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 800, color }}>{fmt(f.size)}</div>
                        <div style={{ fontSize: 10, color: T.outline }}>Fund Size</div>
                    </div>
                )}
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: T.onSurface, marginBottom: 5 }}>{f.fundName || f.fund_name || f.name}</h3>
            <p style={{ fontSize: 12, color: T.onSurfaceVariant, lineHeight: 1.6, marginBottom: 12 }}>{f.description || 'Strategic fund managed through the EEN network.'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${T.outlineVariant}25`, alignItems: 'center' }}>
                <div>
                    <div style={{ fontSize: 10, color: T.outline }}>Manager</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{f.founder || f.manager || '—'}</div>
                </div>
                <div style={{ fontSize: 11, color: T.outline, fontFamily: 'monospace' }}>{f.fundID || f.FoundID || ''}</div>
            </div>
        </div>
    )
}

export default function FoundationFunds() {
    const { profile } = useAuth()
    const myId = profile?.FoundID || ''
    const [funds, setFunds] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ fund_name: '', founder: '' })
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')

    useEffect(() => {
        dbApi.getFunds().then(d => {
            if (Array.isArray(d)) setFunds(d)
        }).finally(() => setLoading(false))
    }, [])

    const myFunds = funds.filter(f => f.FoundID === myId || f.createdBy === myId)
    const otherFunds = funds.filter(f => f.FoundID !== myId && f.createdBy !== myId)

    async function handleCreate(e) {
        e.preventDefault(); setSaving(true)
        const res = await dbApi.createFund({ ...form, FoundID: myId })
        if (res) {
            setSuccess('Fund created successfully!')
            setTimeout(() => setSuccess(''), 3000)
            setShowCreate(false)
            setForm({ fund_name: '', founder: '' })
            const d = await dbApi.getFunds()
            if (Array.isArray(d)) setFunds(d)
        }
        setSaving(false)
    }

    return (
        <FoundationLayout activeKey="funds">
            <div className="page-inner fade-up">

                {/* Header */}
                <div className="flex-between" style={{ marginBottom: 32 }}>
                    <div>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: T.tertiary, marginBottom: 8 }}>Institutional Vehicle</p>
                        <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 38, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Foundation Management</h1>
                        <p style={{ fontSize: 14, color: T.onSurfaceVariant, marginTop: 6, maxWidth: 500 }}>Oversee strategic distribution of EEN's capital and launch new fund initiatives.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                        <span className="ms ms-sm">add</span> Create New Fund
                    </button>
                </div>

                {/* Success toast */}
                {success && (
                    <div style={{ background: '#d1fae5', borderRadius: 10, padding: '12px 18px', color: '#065f46', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="ms ms-sm">check_circle</span>{success}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: T.outline }}>Loading funds...</div>
                ) : (
                    <>
                        {/* ── Section 1: My Funds ── */}
                        <div style={{ marginBottom: 36 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>account_balance</span>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>My Funds</h2>
                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.primary, color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {myFunds.length}
                                </span>
                            </div>

                            {myFunds.length === 0 ? (
                                <div style={{ border: `2px dashed ${T.outlineVariant}60`, borderRadius: 16, padding: '40px 24px', textAlign: 'center', color: T.outline }}>
                                    <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 48, display: 'block', marginBottom: 12 }}>account_balance</span>
                                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No funds created yet</p>
                                    <p style={{ fontSize: 13, marginBottom: 16 }}>Create your first fund to start managing capital allocation.</p>
                                    <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
                                        <span className="ms ms-sm">add</span> Create New Fund
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {myFunds.map((f, i) => <FundCard key={f.fundID || i} f={f} isMine={true} />)}
                                </div>
                            )}
                        </div>

                        {/* ── Section 2: Other Funds ── */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.outline }}>public</span>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 18, fontWeight: 700 }}>All Network Funds</h2>
                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: T.surfaceContainerHighest, color: T.onSurfaceVariant, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {otherFunds.length}
                                </span>
                            </div>

                            {otherFunds.length === 0 ? (
                                <div style={{ padding: '32px 24px', textAlign: 'center', color: T.outline, background: T.surfaceContainerLow, borderRadius: 16 }}>
                                    <p style={{ fontSize: 13 }}>No other funds in the network yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {otherFunds.map((f, i) => <FundCard key={f.fundID || i} f={f} isMine={false} />)}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Create Fund Modal */}
                {showCreate && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
                        <form className="modal" onSubmit={handleCreate}>
                            <div className="modal-title">Create New Fund</div>
                            <div className="input-group">
                                <label className="input-label">Fund Name</label>
                                <input className="input-field" required
                                    value={form.fund_name}
                                    onChange={e => setForm({ ...form, fund_name: e.target.value })}
                                    placeholder="e.g. Vanguard Emerging Tech II" />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Founder / Manager</label>
                                <input className="input-field" required
                                    value={form.founder}
                                    onChange={e => setForm({ ...form, founder: e.target.value })}
                                    placeholder="e.g. Dr. Helena Vance" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                                    {saving ? 'Creating...' : <>Create Fund <span className="ms ms-sm">arrow_forward</span></>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </FoundationLayout>
    )
}
