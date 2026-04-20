import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import EENLayout from '../../components/Layout'
import { dbApi, bizApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

export default function ExpertPublicProfile({ type = 'expert' }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [contact, setContact] = useState(false)
    const [msg, setMsg] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const isExpert = type === 'expert'

    useEffect(() => {
        const fn = isExpert ? dbApi.getExpert(id) : dbApi.getEnterprise(id)
        fn.then(d => { if (d && !d.detail) setData(d) }).finally(() => setLoading(false))
    }, [id, isExpert])

    async function handleContact(e) {
        e.preventDefault(); setSending(true)
        const res = isExpert
            ? await bizApi.contactExpert(id, msg)
            : await bizApi.contactEnterprise(id, msg)
        if (res) { setSent(true); setContact(false); setMsg('') }
        setSending(false)
    }

    if (loading) return (
        <EENLayout activeKey="discovery">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 12, color: T.outline }}>
                <div style={{ width: 20, height: 20, border: `2px solid ${T.outlineVariant}`, borderTopColor: T.primary, borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Loading profile...
            </div>
        </EENLayout>
    )

    if (!data) return (
        <EENLayout activeKey="discovery">
            <div className="page-inner">
                <div className="empty-state"><span className="ms ms-xl">person_off</span><p>Profile not found.</p></div>
            </div>
        </EENLayout>
    )

    const name = data.name || data.company_name || ''
    const initials = name.substring(0, 2).toUpperCase()
    const skills = Array.isArray(data.skills) ? data.skills : []

    return (
        <EENLayout activeKey="discovery">
            <div className="page-inner fade-up" style={{ maxWidth: 900 }}>

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.outline, fontSize: 13, fontFamily: 'Inter,sans-serif', padding: '4px 0', marginBottom: 28 }}>
                    <span className="ms ms-sm">arrow_back</span> Back
                </button>

                {/* Hero card */}
                <div className="card" style={{ padding: 36, marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>

                        {/* Avatar */}
                        <div style={{ width: 88, height: 88, borderRadius: isExpert ? '50%' : 16, background: data.avatarUrl ? 'transparent' : T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,52,111,0.18)' }}>
                            {data.avatarUrl
                                ? <img src={data.avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.style.display = 'none'} />
                                : initials
                            }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 28, fontWeight: 800, color: T.primary, letterSpacing: '-0.01em' }}>{name}</h1>
                                <span className={`tag ${isExpert ? 'tag-teal' : 'tag-blue'}`}>{isExpert ? 'Expert' : 'Enterprise'}</span>
                            </div>
                            <p style={{ fontSize: 14, color: T.outline, marginBottom: 12 }}>
                                {isExpert ? `${data.expertID} · ${data.experience || 0} years experience` : `${data.enterpriseID} · ${data.phone || ''}`}
                            </p>
                            <p style={{ fontSize: 14, color: T.onSurfaceVariant, lineHeight: 1.7, maxWidth: 560 }}>
                                {data.profileSummary || data.description || 'No bio provided.'}
                            </p>
                        </div>

                        {/* Contact button */}
                        <div style={{ flexShrink: 0 }}>
                            {sent ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
                                    <span className="ms ms-sm">check_circle</span> Message Sent
                                </div>
                            ) : (
                                <button className="btn btn-primary" onClick={() => setContact(true)}>
                                    <span className="ms ms-sm">mail</span> Contact
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isExpert ? '2fr 1fr' : '1fr 1fr', gap: 20 }}>

                    {/* Skills / Details */}
                    <div className="card" style={{ padding: 28 }}>
                        <h3 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 17, fontWeight: 700, marginBottom: 20 }}>
                            {isExpert ? 'Skills & Expertise' : 'Company Details'}
                        </h3>
                        {isExpert ? (
                            skills.length > 0 ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {skills.map(s => (
                                        <span key={s} style={{ padding: '7px 14px', borderRadius: 999, background: T.primaryFixed, color: T.primary, fontSize: 12, fontWeight: 600 }}>{s}</span>
                                    ))}
                                </div>
                            ) : <p style={{ color: T.outline, fontSize: 13 }}>No skills listed.</p>
                        ) : (
                            <div>
                                {[
                                    ['Company', data.company_name || '—'],
                                    ['Email', data.email || '—'],
                                    ['Phone', data.phone || '—'],
                                ].map(([l, v]) => (
                                    <div key={l} style={{ display: 'flex', padding: '10px 0', borderBottom: `1px solid ${T.outlineVariant}25`, gap: 20 }}>
                                        <span style={{ fontSize: 12, color: T.outline, width: 100, flexShrink: 0 }}>{l}</span>
                                        <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {isExpert && (
                            <div className="card-dark" style={{ borderRadius: 16, padding: 24, textAlign: 'center' }}>
                                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(215,226,255,0.5)', marginBottom: 12 }}>Performance</p>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 44, fontWeight: 800, color: 'white' }}>4.9</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 3, margin: '8px 0' }}>
                                    {[1, 2, 3, 4, 5].map(i => <span key={i} className="ms ms-fill ms-sm" style={{ color: '#fbbf24', fontSize: 14 }}>star</span>)}
                                </div>
                                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{data.experience || 0} years experience</p>
                            </div>
                        )}
                        <div className="card" style={{ padding: 20 }}>
                            {[
                                isExpert
                                    ? { icon: 'badge', label: 'Expert ID', value: data.expertID }
                                    : { icon: 'badge', label: 'Enterprise', value: data.enterpriseID },
                                { icon: 'email', label: 'Email', value: data.email || '—' },
                            ].map(r => (
                                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${T.outlineVariant}25` }}>
                                    <span className="ms ms-sm" style={{ color: T.outline }}>{r.icon}</span>
                                    <div>
                                        <div style={{ fontSize: 10, color: T.outline }}>{r.label}</div>
                                        <div style={{ fontSize: 13, fontWeight: 600, fontFamily: r.label.includes('ID') ? 'monospace' : 'inherit' }}>{r.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact modal */}
            {contact && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setContact(false)}>
                    <form className="modal" onSubmit={handleContact}>
                        <div className="modal-title">Contact {name}</div>
                        <div className="input-group">
                            <label className="input-label">Message</label>
                            <textarea className="input-field" required rows={4} style={{ resize: 'none' }}
                                placeholder="Introduce yourself and your inquiry..." value={msg} onChange={e => setMsg(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setContact(false)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={sending}>
                                {sending ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </EENLayout>
    )
}
