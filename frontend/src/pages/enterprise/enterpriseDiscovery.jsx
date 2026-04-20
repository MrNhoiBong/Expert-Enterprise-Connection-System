import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EnterpriseLayout from '../../components/EnterpriseLayout'
import { dbApi, bizApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

const TABS = ['All Talent', 'Strategic Consulting', 'Deep Tech', 'Energy Systems', 'Supply Chain']

export default function EnterpriseDiscovery() {
    const navigate = useNavigate()
    const [experts, setExperts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [skill, setSkill] = useState('')
    const [tab, setTab] = useState('All Talent')
    const [selected, setSelected] = useState(null)
    const [msg, setMsg] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(new Set())

    useEffect(() => {
        dbApi.getExperts().then(d => { if (Array.isArray(d)) setExperts(d) }).finally(() => setLoading(false))
    }, [])

    const filtered = experts.filter(e =>
        (!search || e.name?.toLowerCase().includes(search.toLowerCase())) &&
        (!skill || (Array.isArray(e.skills) && e.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))))
    )

    const allSkills = [...new Set(experts.flatMap(e => Array.isArray(e.skills) ? e.skills : []))].slice(0, 8)

    async function handleContact(e) {
        e.preventDefault(); if (!selected) return
        setSending(true)
        const res = await bizApi.contactExpert(selected.expertID, msg)
        if (res) { setSent(p => new Set([...p, selected.expertID])); setSelected(null); setMsg('') }
        setSending(false)
    }

    return (
        <EnterpriseLayout activeKey="discovery">
            <div className="page-inner fade-up">

                {/* Hero */}
                <section style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: 'Manrope,sans-serif', fontSize: 44, fontWeight: 800, color: T.primary, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                        The Architectural Atrium<br />of Talent.
                    </h1>
                    <p style={{ fontSize: 17, color: T.onSurfaceVariant, marginTop: 12, maxWidth: 560 }}>
                        Discover and connect with top-tier subject matter experts across the global professional network.
                    </p>
                </section>

                {/* Filters */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
                        <span className="ms" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 18 }}>search</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', background: T.surfaceContainerLow, border: 'none', borderRadius: 999, padding: '11px 16px 11px 40px', fontSize: 13, outline: 'none' }}
                            placeholder="Search experts, skills, or partner firms..." />
                    </div>
                    {allSkills.slice(0, 4).map(s => (
                        <button key={s} onClick={() => setSkill(skill === s ? '' : s)}
                            style={{ padding: '8px 16px', borderRadius: 999, border: `1.5px solid ${skill === s ? T.primary : T.outlineVariant}`, background: skill === s ? T.primaryFixed : 'white', color: skill === s ? T.primary : T.onSurfaceVariant, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            {s}
                        </button>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 28, borderBottom: `1px solid ${T.outlineVariant}40`, paddingBottom: 0 }}>
                    {TABS.map(t => (
                        <button key={t} onClick={() => setTab(t)}
                            style={{ padding: '8px 18px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: tab === t ? 700 : 500, fontSize: 13, color: tab === t ? T.primary : T.onSurfaceVariant, borderBottom: tab === t ? `2px solid ${T.primary}` : '2px solid transparent', marginBottom: -1 }}>
                            {t}
                        </button>
                    ))}
                </div>

                {/* Featured Partnership Banner */}
                <div style={{ background: `linear-gradient(135deg,${T.primaryFixed},${T.tertiaryFixed})`, borderRadius: 16, padding: '24px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span className="ms ms-fill" style={{ color: 'white', fontSize: 26 }}>hub</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: T.primary, marginBottom: 4 }}>Featured Partnership Opportunity</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: T.onSurface }}>Global Infrastructure Fund: Smart City Initiative</p>
                        <p style={{ fontSize: 12, color: T.onSurfaceVariant }}>Seeking 12 specialists in IoT urban sensors and civil engineering for a 24-month multi-sector project.</p>
                    </div>
                    <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', fontSize: 12 }}>Learn More</button>
                </div>

                {/* Expert Grid */}
                {loading ? <div style={{ textAlign: 'center', padding: 40, color: T.outline }}>Loading...</div>
                    : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                            {filtered.map((e, i) => (
                                <div key={i} className="card" style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                                        <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                                            {(e.name || 'EX').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                                <span className="tag tag-blue" style={{ fontSize: 9 }}>Top Expert</span>
                                            </div>
                                            <h3 style={{ fontWeight: 700, fontSize: 15, color: T.onSurface }}>{e.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                                                <span className="ms ms-fill ms-sm" style={{ color: '#f59e0b', fontSize: 13 }}>star</span>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: T.onSurfaceVariant }}>4.9 · {e.experience || 0} yrs exp</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: T.primary, fontFamily: 'Manrope,sans-serif' }}>${(280 + i * 45)}/hr</div>
                                        </div>
                                    </div>
                                    {e.profileSummary && <p style={{ fontSize: 12, color: T.onSurfaceVariant, lineHeight: 1.6, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.profileSummary}</p>}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 16 }}>
                                        {(Array.isArray(e.skills) ? e.skills : []).slice(0, 3).map(s => (
                                            <span key={s} className="tag tag-teal" style={{ fontSize: 10 }}>{s}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        {/* View Profile — navigate to profile page */}
                                        <button className="btn btn-primary"
                                            style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                                            onClick={() => navigate(`/enterprise/experts/${e.expertID}`)}>
                                            View Profile →
                                        </button>
                                        {/* Contact — open modal */}
                                        <button
                                            className={`btn ${sent.has(e.expertID) ? 'btn-secondary' : 'btn-ghost'}`}
                                            style={{ padding: '8px 12px', fontSize: 12 }}
                                            onClick={() => !sent.has(e.expertID) && setSelected(e)}
                                            disabled={sent.has(e.expertID)}
                                            title={sent.has(e.expertID) ? 'Message Sent' : 'Contact'}>
                                            <span className="ms ms-sm">{sent.has(e.expertID) ? 'check' : 'mail'}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                {/* Contact Modal */}
                {selected && (
                    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
                        <form className="modal" onSubmit={handleContact}>
                            <div className="modal-title">Contact {selected.name}</div>

                            {/* Expert info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: T.primaryFixed, borderRadius: 10, marginBottom: 16 }}>
                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                                    {selected.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 13 }}>{selected.name}</div>
                                    <div style={{ fontSize: 11, color: T.outline }}>{selected.expertID} · {Array.isArray(selected.skills) ? selected.skills[0] : ''}</div>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Message</label>
                                <textarea className="input-field" rows={4} required style={{ resize: 'none' }}
                                    placeholder="Introduce your organization and the engagement opportunity..."
                                    value={msg} onChange={e => setMsg(e.target.value)} />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setSelected(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={sending}>
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </EnterpriseLayout>
    )
}
