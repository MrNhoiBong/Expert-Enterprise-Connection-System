import { useState, useEffect } from 'react'
import FoundationLayout from '../../components/FoundationLayout'
import { dbApi, bizApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

function fmtTime(iso) {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return iso }
}

const STATUS_MAP = {
    pending: { tag: 'tag-amber', label: 'Pending', dot: '#d97706' },
    accepted: { tag: 'tag-green', label: 'Accepted', dot: '#16a34a' },
    rejected: { tag: 'tag-slate', label: 'Rejected', dot: '#64748b' },
}

export default function FoundationRequests() {
    const { profile } = useAuth()
    const myId = profile?.FoundID || ''

    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [acting, setActing] = useState(null)

    useEffect(() => {
        dbApi.getFundRequests().then(d => {
            if (Array.isArray(d)) setRequests(d)
        }).finally(() => setLoading(false))
    }, [])

    async function handleAccept(req) {
        setActing(req.requestID)
        const res = await bizApi.acceptCallFund(req.projectID)
        if (res) {
            setRequests(prev => prev.map(r => r.requestID === req.requestID ? { ...r, status: 'accepted' } : r))
        }
        setActing(null)
    }

    async function handleReject(req) {
        setActing(req.requestID)
        const res = await dbApi.rejectFundRequest(req.requestID)
        if (res) {
            setRequests(prev => prev.map(r => r.requestID === req.requestID ? { ...r, status: 'rejected' } : r))
        }
        setActing(null)
    }

    const pending = requests.filter(r => r.status === 'pending')
    const resolved = requests.filter(r => r.status !== 'pending')

    return (
        <FoundationLayout activeKey="requests">
            <div className="page-inner fade-up">

                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: T.tertiary, marginBottom: 8 }}>Fund Operations</p>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 38, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em' }}>Fund Requests</h1>
                    <p style={{ fontSize: 14, color: T.onSurfaceVariant, marginTop: 6 }}>Review and respond to fund requests from expert projects.</p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Pending', value: pending.length, icon: 'pending', bg: T.tertiaryFixed, color: '#d97706' },
                        { label: 'Accepted', value: resolved.filter(r => r.status === 'accepted').length, icon: 'check_circle', bg: '#d1fae5', color: '#16a34a' },
                        { label: 'Rejected', value: resolved.filter(r => r.status === 'rejected').length, icon: 'cancel', bg: T.surfaceContainerLow, color: T.outline },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="ms ms-fill" style={{ color: s.color, fontSize: 22 }}>{s.icon}</span>
                            </div>
                            <div>
                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: T.outline }}>{s.label}</p>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: T.outline }}>Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="empty-state">
                        <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 56, display: 'block', marginBottom: 12 }}>inbox</span>
                        <p style={{ fontSize: 15, fontWeight: 600 }}>No fund requests yet</p>
                        <p style={{ fontSize: 13, color: T.outline, marginTop: 4 }}>Expert projects will send requests to your funds here.</p>
                    </div>
                ) : (
                    <>
                        {/* Pending */}
                        {pending.length > 0 && (
                            <div style={{ marginBottom: 32 }}>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="ms ms-fill ms-sm" style={{ color: '#d97706' }}>pending</span>
                                    Pending Requests
                                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#fef3c7', color: '#d97706', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {pending.map(req => (
                                        <div key={req.requestID} className="card" style={{ padding: 24 }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 12, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>assignment</span>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                                        <h3 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 15 }}>{req.projectName || req.projectID}</h3>
                                                        <span style={{ fontSize: 10, color: T.outline, fontFamily: 'monospace' }}>{req.projectID}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 20, fontSize: 12, color: T.outline }}>
                                                        <span><strong style={{ color: T.onSurface }}>By:</strong> {req.requestBy}</span>
                                                        <span><strong style={{ color: T.onSurface }}>To:</strong> {req.foundID}</span>
                                                        <span>{fmtTime(req.createdAt)}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                                    <button className="btn btn-primary" style={{ fontSize: 12 }}
                                                        disabled={acting === req.requestID}
                                                        onClick={() => handleAccept(req)}>
                                                        <span className="ms ms-sm">check</span>
                                                        {acting === req.requestID ? '...' : 'Accept'}
                                                    </button>
                                                    <button className="btn" style={{ fontSize: 12, background: T.errorContainer, color: T.error, border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: '8px 14px', fontFamily: 'Inter,sans-serif', fontWeight: 600 }}
                                                        disabled={acting === req.requestID}
                                                        onClick={() => handleReject(req)}>
                                                        <span className="ms ms-sm">close</span> Decline
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resolved */}
                        {resolved.length > 0 && (
                            <div>
                                <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="ms ms-fill ms-sm" style={{ color: T.outline }}>history</span>
                                    History
                                </h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {resolved.map(req => {
                                        const st = STATUS_MAP[req.status] || STATUS_MAP['pending']
                                        return (
                                            <div key={req.requestID} style={{ padding: '16px 20px', background: T.surfaceContainerLow, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: st.dot, flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{req.projectName || req.projectID}</span>
                                                    <span style={{ fontSize: 12, color: T.outline, marginLeft: 10 }}>{req.requestBy} → {req.foundID}</span>
                                                </div>
                                                <span className={`tag ${st.tag}`} style={{ fontSize: 11 }}>{st.label}</span>
                                                <span style={{ fontSize: 11, color: T.outline }}>{fmtTime(req.createdAt)}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </FoundationLayout>
    )
}
