import { useState, useEffect, useMemo } from 'react'
import EENLayout from '../../components/Layout'
import { dbApi, bizApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

const SKILLS_FILTER = ['All', 'Cloud', 'Architecture', 'Security', 'Data Science', 'Regulatory', 'Energy']

export default function ExpertExperts() {
    const [experts, setExperts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [skill, setSkill] = useState('All')
    const [contact, setContact] = useState(null)
    const [msg, setMsg] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(new Set())

    useEffect(() => {
        dbApi.getExperts().then(d => { if (Array.isArray(d)) setExperts(d) }).finally(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        let list = experts
        if (skill !== 'All') list = list.filter(e => Array.isArray(e.skills) && e.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())))
        if (search) list = list.filter(e => (e.name || '').toLowerCase().includes(search.toLowerCase()))
        return list
    }, [experts, search, skill])

    async function handleSend(e) {
        e.preventDefault(); setSending(true)
        const res = await bizApi.contactExpert(contact.expertID, msg)
        if (res) { setSent(prev => new Set([...prev, contact.expertID])); setContact(null); setMsg('') }
        setSending(false)
    }

    const RATINGS = [4.9, 5.0, 4.8, 4.7, 4.9, 4.6]

    return (
        <EENLayout activeKey="discovery">
            <div className="page-inner fade-up">

                {/* Hero */}
                <div className="flex-between" style={{ marginBottom: 32, alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="page-title">Expert Network</h1>
                        <p className="page-subtitle" style={{ marginTop: 8 }}>
                            Browse and connect with verified enterprise experts across all specializations.
                        </p>
                    </div>
                    <div style={{ fontSize: 13, color: T.outline, fontWeight: 500 }}>
                        {filtered.length} expert{filtered.length !== 1 ? 's' : ''} found
                    </div>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                    {SKILLS_FILTER.map(f => (
                        <button key={f} onClick={() => setSkill(f)} style={{
                            padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                            fontFamily: 'Manrope,sans-serif', fontSize: 11, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s',
                            background: skill === f ? T.primary : T.surfaceContainerLowest,
                            color: skill === f ? 'white' : T.onSurfaceVariant,
                            boxShadow: skill === f ? '0 4px 12px rgba(0,52,111,0.18)' : '0 1px 2px rgba(0,0,0,0.05)',
                        }}>
                            {f}
                        </button>
                    ))}
                    <div style={{ marginLeft: 'auto', position: 'relative', width: 220 }}>
                        <span className="ms" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 16 }}>search</span>
                        <input className="input-field" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                    </div>
                </div>

                {/* Featured banner */}
                <div style={{ background: `linear-gradient(135deg, ${T.primary} 0%, ${T.primaryContainer} 100%)`, borderRadius: 20, padding: '32px 40px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', filter: 'blur(40px)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(215,226,255,0.7)', display: 'block', marginBottom: 8 }}>New Network Opportunity</span>
                        <h2 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>Strategic Advisory Council</h2>
                        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', maxWidth: 480, lineHeight: 1.6 }}>
                            Join our invitation-only advisory council to connect directly with C-suite executives from Europe's top 50 industrial firms.
                        </p>
                    </div>
                    <button style={{ background: 'white', color: T.primary, border: 'none', borderRadius: 999, padding: '11px 24px', fontFamily: 'Manrope,sans-serif', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', cursor: 'pointer', flexShrink: 0, position: 'relative', zIndex: 1, transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                        Apply for Membership
                    </button>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
                        {(filtered.length > 0 ? filtered : [
                            { expertID: 'EXP001', name: 'Dr. Sarah Jenkins', profileSummary: 'Specialized in global logistics and automated warehousing for pharmaceutical giants.', skills: ['Logistics', 'AI Systems'], rating: 4.9, top: true },
                            { expertID: 'EXP002', name: 'Marcello Rivera', profileSummary: 'Helping Fortune 500 companies navigate complex trade laws and environmental regulations.', skills: ['Policy', 'Trade Law'], rating: 5.0 },
                            { expertID: 'EXP003', name: 'Chen Wei', profileSummary: 'Expert in renewable energy integration and smart-grid infrastructure development.', skills: ['Renewables', 'Smart Grid'], rating: 4.8 },
                            { expertID: 'EXP004', name: 'Viktor Kalu', profileSummary: 'Leading digital transformation initiatives across manufacturing and logistics sectors.', skills: ['Digital Transformation', 'Industry 4.0'], rating: 4.7 },
                            { expertID: 'EXP005', name: 'James Starling', profileSummary: 'Fintech regulatory specialist with 20 years of banking sector compliance experience.', skills: ['FinTech', 'Compliance'], rating: 4.9 },
                            { expertID: 'EXP006', name: 'Dr. Aisha Osman', profileSummary: 'AI ethics and governance framework specialist for enterprise AI deployments.', skills: ['AI Ethics', 'Governance'], rating: 4.6 },
                        ]).map((e, i) => {
                            const name = e.name || ''
                            const initials = name.substring(0, 2).toUpperCase()
                            const isSent = sent.has(e.expertID)
                            const rating = e.rating || RATINGS[i % RATINGS.length]

                            return (
                                <div key={e.expertID} className="card card-hover fade-up" style={{ animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column', padding: 28, position: 'relative' }}>
                                    {e.top && <span className="tag tag-teal" style={{ position: 'absolute', top: 14, right: 14 }}>Top Rated</span>}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
                                        <div>
                                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 14, color: T.primary, marginBottom: 2 }}>{name}</h3>
                                            <p style={{ fontSize: 11, color: T.outline }}>{Array.isArray(e.skills) ? e.skills[0] : 'Expert'}</p>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.55, flex: 1, marginBottom: 14 }}>{e.profileSummary}</p>

                                    {Array.isArray(e.skills) && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                                            {e.skills.slice(0, 3).map(s => <span key={s} className="tag tag-slate">{s}</span>)}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${T.outlineVariant}25`, paddingTop: 14 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <span className="ms ms-fill ms-sm" style={{ color: '#f59e0b' }}>star</span>
                                            <span style={{ fontWeight: 700, fontSize: 13, color: T.primary }}>{rating}</span>
                                        </div>
                                        <button onClick={() => !isSent && setContact(e)} style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            background: 'none', border: 'none', cursor: isSent ? 'default' : 'pointer',
                                            color: isSent ? '#16a34a' : T.primary,
                                            fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 12,
                                        }}>
                                            {isSent ? '✓ Connected' : 'View Profile'}
                                            {!isSent && <span className="ms ms-sm">arrow_forward</span>}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {contact && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setContact(null)}>
                    <form className="modal" onSubmit={handleSend}>
                        <div className="modal-title">Connect with {contact.name}</div>
                        <div className="input-group">
                            <label className="input-label">Message</label>
                            <textarea className="input-field" required rows={4} style={{ resize: 'none' }} placeholder="Introduce yourself and describe your collaboration interest..." value={msg} onChange={e => setMsg(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setContact(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={sending}>
                                {sending ? 'Sending...' : 'Send Request'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </EENLayout>
    )
}
