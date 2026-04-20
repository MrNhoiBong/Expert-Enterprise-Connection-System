import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import EENLayout from '../../components/Layout'
import { dbApi, bizApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

const FILTERS = ['All Experts', 'Strategic Consulting', 'Technology', 'Manufacturing', 'Enterprises']

export default function ExpertDiscovery() {
    const navigate = useNavigate()
    const location = useLocation()
    const [experts, setExperts] = useState([])
    const [enterprises, setEnterprises] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All Experts')
    const [search, setSearch] = useState('')
    const [contact, setContact] = useState(null)
    const [msg, setMsg] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(new Set())

    // Đọc ?skill= từ URL khi navigate từ project Details
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const skill = params.get('skill')
        if (skill) setSearch(skill)
    }, [location.search])

    // Load experts + enterprises
    useEffect(() => {
        Promise.all([dbApi.getExperts(), dbApi.getEnterprises()]).then(([e, ent]) => {
            if (Array.isArray(e)) setExperts(e)
            if (Array.isArray(ent)) setEnterprises(ent)
        }).finally(() => setLoading(false))
    }, [])

    // Filter + search
    const cards = useMemo(() => {
        let list = filter === 'Enterprises' ? enterprises : experts
        if (search.trim()) {
            const q = search.toLowerCase()
            list = list.filter(item => {
                const name = (item.name || item.company_name || '').toLowerCase()
                const skills = Array.isArray(item.skills) ? item.skills.join(' ').toLowerCase() : ''
                const summary = (item.profileSummary || '').toLowerCase()
                return name.includes(q) || skills.includes(q) || summary.includes(q)
            })
        }
        return list
    }, [experts, enterprises, filter, search])

    async function handleContact(e) {
        e.preventDefault(); setSending(true)
        const id = contact.expertID || contact.enterpriseID
        const res = contact.expertID
            ? await bizApi.contactExpert(contact.expertID, msg)
            : await bizApi.contactEnterprise(contact.enterpriseID, msg)
        if (res) { setSent(prev => new Set([...prev, id])); setContact(null); setMsg('') }
        setSending(false)
    }

    return (
        <EENLayout activeKey="discovery">
            <div style={{ paddingTop: 40, paddingLeft: 40, paddingRight: 40, paddingBottom: 80 }}>

                {/* Hero */}
                <h1 className="page-title fade-up">Discovery</h1>
                <p className="page-subtitle fade-up fade-up-1" style={{ marginBottom: 28 }}>
                    Browse our global network of elite industrial experts and enterprise partners categorized by sector and specialization.
                </p>

                {/* Search bar */}
                <div style={{ position: 'relative', maxWidth: 480, marginBottom: 28 }}>
                    <span className="ms" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 18, pointerEvents: 'none' }}>search</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, skill, or keyword..."
                        style={{ width: '100%', background: T.surfaceContainerLowest, border: `1.5px solid ${T.outlineVariant}60`, borderRadius: 12, padding: '11px 16px 11px 44px', fontSize: 14, outline: 'none', fontFamily: 'Inter,sans-serif', color: T.onSurface, transition: 'border 0.2s' }}
                        onFocus={e => e.target.style.borderColor = T.primary}
                        onBlur={e => e.target.style.borderColor = `${T.outlineVariant}60`}
                    />
                    {search && (
                        <button onClick={() => setSearch('')}
                            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.outline, padding: 4 }}>
                            <span className="ms ms-sm">close</span>
                        </button>
                    )}
                </div>

                {/* Filter pills + Sort */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
                    {FILTERS.map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{
                            padding: '8px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                            fontFamily: 'Manrope,sans-serif', fontSize: 11, fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.12em', transition: 'all 0.2s',
                            background: filter === f ? T.primary : T.surfaceContainerLowest,
                            color: filter === f ? 'white' : T.onSurfaceVariant,
                            boxShadow: filter === f ? '0 4px 12px rgba(0,52,111,0.2)' : '0 1px 3px rgba(0,0,0,0.06)',
                        }}>
                            {f}
                        </button>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: T.outline, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sort by:</span>
                        <button style={{ fontFamily: 'Manrope,sans-serif', fontSize: 12, fontWeight: 700, color: T.primary, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                            Relevance <span className="ms ms-sm">expand_more</span>
                        </button>
                    </div>
                </div>

                {/* Result count */}
                {search && (
                    <p style={{ fontSize: 13, color: T.outline, marginBottom: 20 }}>
                        {cards.length} result{cards.length !== 1 ? 's' : ''} for "<strong>{search}</strong>"
                    </p>
                )}

                {/* Cards grid */}
                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : cards.length === 0 ? (
                    <div className="empty-state">
                        <span className="ms ms-xl" style={{ color: T.outlineVariant }}>search_off</span>
                        <p>No results found{search ? ` for "${search}"` : ''}.</p>
                        {search && <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={() => setSearch('')}>Clear search</button>}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        {cards.map((item, i) => {
                            const isExpert = !!item.expertID
                            const id = item.expertID || item.enterpriseID
                            const name = item.name || item.company_name || ''
                            const initials = name.substring(0, 2).toUpperCase()
                            const alreadySent = sent.has(id)
                            const isTopRated = i === 0 && !search

                            return (
                                <div key={`${id || 'item'}-${i}`} className="card card-hover fade-up"
                                    style={{
                                        animationDelay: `${i * 0.05}s`, display: 'flex', flexDirection: 'column', position: 'relative', padding: 28,
                                        ...(i === 1 && !search ? { borderTop: `3px solid ${T.primary}` } : {})
                                    }}>

                                    {isTopRated && (
                                        <span className="tag tag-teal" style={{ position: 'absolute', top: 14, right: 14 }}>Top Rated</span>
                                    )}

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                                        {isExpert ? (
                                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white', flexShrink: 0 }}>{initials}</div>
                                        ) : (
                                            <div style={{ width: 48, height: 48, borderRadius: 10, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <span className="ms ms-fill" style={{ color: T.primary, fontSize: 22 }}>corporate_fare</span>
                                            </div>
                                        )}
                                        <div>
                                            <h3 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 15, color: T.primary, marginBottom: 2 }}>{name}</h3>
                                            <p style={{ fontSize: 11, color: T.outline }}>
                                                {isExpert ? (Array.isArray(item.skills) ? item.skills[0] : '') : item.enterpriseID}
                                            </p>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.55, flex: 1, marginBottom: 14 }}>
                                        {item.profileSummary || (isExpert ? 'Specialized expert available for enterprise consulting.' : 'Leading enterprise partner in the EEN network.')}
                                    </p>

                                    {isExpert && Array.isArray(item.skills) && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                                            {item.skills.slice(0, 3).map(s => (
                                                <span key={s} className="tag tag-slate">{s}</span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${T.outlineVariant}30`, paddingTop: 14, gap: 8 }}>
                                        {isExpert ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span className="ms ms-fill ms-sm" style={{ color: '#f59e0b' }}>star</span>
                                                <span style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>4.9</span>
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 11, color: T.outline }}>14 Active Projects</span>
                                        )}

                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {/* Contact button */}
                                            <button
                                                onClick={() => !alreadySent && setContact(item)}
                                                title="Send message"
                                                style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${T.outlineVariant}60`, background: 'none', cursor: alreadySent ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: alreadySent ? '#16a34a' : T.outline }}>
                                                <span className="ms ms-sm">{alreadySent ? 'check' : 'mail'}</span>
                                            </button>

                                            {/* View Profile button */}
                                            <button
                                                onClick={() => navigate(isExpert ? `/expert/experts/${id}` : `/expert/enterprises/${id}`)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T.primary, fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 13 }}>
                                                View Profile <span className="ms ms-sm">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Contact modal */}
            {contact && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setContact(null)}>
                    <form className="modal" onSubmit={handleContact}>
                        <div className="modal-title">Contact {contact.name || contact.company_name}</div>
                        <div className="input-group">
                            <label className="input-label">Message</label>
                            <textarea className="input-field" required rows={4} style={{ resize: 'none' }}
                                placeholder="Introduce yourself..." value={msg} onChange={e => setMsg(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setContact(null)}>Cancel</button>
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
