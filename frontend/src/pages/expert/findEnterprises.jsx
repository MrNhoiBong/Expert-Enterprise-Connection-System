import { useState, useEffect, useMemo } from 'react'
import EENLayout from '../../components/Layout'
import { dbApi, bizApi } from '../../api/Api.js'
import { T } from '../../styles/theme.js'

const SECTORS = ['All', 'Technology', 'Manufacturing', 'Energy', 'Healthcare', 'Finance', 'Public Sector']

export default function ExpertEnterprises() {
    const [enterprises, setEnterprises] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [sector, setSector] = useState('All')
    const [contact, setContact] = useState(null)
    const [msg, setMsg] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(new Set())

    useEffect(() => {
        dbApi.getEnterprises().then(d => { if (Array.isArray(d)) setEnterprises(d) }).finally(() => setLoading(false))
    }, [])

    const filtered = useMemo(() => {
        let list = enterprises
        if (search) list = list.filter(e => (e.company_name || e.name || '').toLowerCase().includes(search.toLowerCase()))
        return list
    }, [enterprises, search])

    async function handleSend(e) {
        e.preventDefault(); setSending(true)
        const res = await bizApi.contactEnterprise(contact.enterpriseID, msg)
        if (res) { setSent(prev => new Set([...prev, contact.enterpriseID])); setContact(null); setMsg('') }
        setSending(false)
    }

    /* fallback mock data */
    const MOCK = [
        { enterpriseID: 'ENT001', company_name: 'Quantum Dynamics', sector: 'Technology', desc: 'Leading enterprise partner focusing on next-gen semiconductor manufacturing in the EU region.', projects: 14, tier: 'Tier 1 Partner' },
        { enterpriseID: 'ENT002', company_name: 'Vanguard Pharmaceutics', sector: 'Healthcare', desc: 'Global pharmaceutical giant managing therapeutic distribution networks across 28 countries.', projects: 8, tier: 'Strategic Partner' },
        { enterpriseID: 'ENT003', company_name: 'Nordic Energy Grid', sector: 'Energy', desc: 'Decentralised energy corridor optimization using smart grid technology across the Nordic region.', projects: 5, tier: 'Tier 2 Partner' },
        { enterpriseID: 'ENT004', company_name: 'Metropolis Council', sector: 'Public Sector', desc: 'Urban infrastructure and 2030 sustainability catalyst projects across European metropolitan areas.', projects: 11, tier: 'Gov Partner' },
        { enterpriseID: 'ENT005', company_name: 'CyberGuard SA', sector: 'Technology', desc: 'Enterprise cybersecurity and compliance advisory services for financial institutions worldwide.', projects: 6, tier: 'Tier 1 Partner' },
        { enterpriseID: 'ENT006', company_name: 'Nexus Infrastructure', sector: 'Manufacturing', desc: 'Legacy modernization and API-first architecture for industrial manufacturing conglomerates.', projects: 9, tier: 'Strategic Partner' },
    ]

    const displayList = filtered.length > 0 ? filtered : MOCK

    const TIER_STYLE = {
        'Tier 1 Partner': { bg: T.tertiaryFixed, color: T.tertiary },
        'Strategic Partner': { bg: T.primaryFixed, color: T.primary },
        'Tier 2 Partner': { bg: T.surfaceContainerHigh, color: T.onSurfaceVariant },
        'Gov Partner': { bg: '#fef3c7', color: '#92400e' },
    }

    return (
        <EENLayout activeKey="discovery">
            <div className="page-inner fade-up">

                {/* Hero */}
                <div className="flex-between" style={{ marginBottom: 32, alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="page-title">Enterprise Partners</h1>
                        <p className="page-subtitle" style={{ marginTop: 8 }}>
                            Connect with leading enterprises seeking specialized expertise for complex projects.
                        </p>
                    </div>
                    <span style={{ fontSize: 13, color: T.outline, fontWeight: 500 }}>{displayList.length} partner{displayList.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Sector pills + search */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
                    {SECTORS.map(s => (
                        <button key={s} onClick={() => setSector(s)} style={{
                            padding: '7px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                            fontFamily: 'Manrope,sans-serif', fontSize: 11, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'all 0.2s',
                            background: sector === s ? T.primary : T.surfaceContainerLowest,
                            color: sector === s ? 'white' : T.onSurfaceVariant,
                            boxShadow: sector === s ? '0 4px 12px rgba(0,52,111,0.18)' : '0 1px 2px rgba(0,0,0,0.05)',
                        }}>
                            {s}
                        </button>
                    ))}
                    <div style={{ marginLeft: 'auto', position: 'relative', width: 220 }}>
                        <span className="ms" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.outline, fontSize: 16 }}>search</span>
                        <input className="input-field" placeholder="Search enterprises..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                    </div>
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 36 }}>
                    {[
                        { label: 'Total Partners', value: displayList.length, icon: 'corporate_fare', bg: T.primaryFixed },
                        { label: 'Tier 1', value: displayList.filter(e => (e.tier || '').includes('Tier 1')).length || 2, icon: 'workspace_premium', bg: T.tertiaryFixed },
                        { label: 'Active Projects', value: displayList.reduce((a, e) => a + (e.projects || 0), 0) || 53, icon: 'assignment', bg: T.secondaryContainer },
                        { label: 'Avg. Projects', value: Math.round(displayList.reduce((a, e) => a + (e.projects || 8), 0) / (displayList.length || 1)), icon: 'analytics', bg: T.surfaceContainerHigh },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 20 }}>
                            <div style={{ width: 42, height: 42, borderRadius: '50%', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>{s.icon}</span>
                            </div>
                            <div>
                                <div style={{ fontFamily: 'Manrope,sans-serif', fontSize: 26, fontWeight: 800, color: T.primary }}>{s.value}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.outline }}>{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enterprises grid */}
                {loading ? (
                    <div className="empty-state"><div className="spinner" style={{ margin: '0 auto' }} /></div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
                        {displayList.map((ent, i) => {
                            const name = ent.company_name || ent.name || ''
                            const initials = name.substring(0, 2).toUpperCase()
                            const id = ent.enterpriseID
                            const isSent = sent.has(id)
                            const tier = ent.tier || 'Strategic Partner'
                            const tierStyle = TIER_STYLE[tier] || TIER_STYLE['Strategic Partner']

                            return (
                                <div key={id || i} className="card card-hover fade-up" style={{ animationDelay: `${i * 0.06}s`, display: 'flex', flexDirection: 'column', padding: 28, ...(i === 0 ? { borderTop: `3px solid ${T.primary}` } : {}) }}>
                                    <div style={{ marginBottom: 18 }}>
                                        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                                            <span className="ms ms-fill" style={{ fontSize: 24, color: T.primary }}>corporate_fare</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 16, color: T.primary, marginBottom: 3 }}>{name}</h3>
                                                <p style={{ fontSize: 12, color: T.outline }}>{ent.sector || 'Research & Development'}</p>
                                            </div>
                                            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', background: tierStyle.bg, color: tierStyle.color, padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                                                {tier}
                                            </span>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: 13, color: T.onSurfaceVariant, lineHeight: 1.6, flex: 1, marginBottom: 16 }}>{ent.desc || ent.profileSummary}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${T.outlineVariant}25`, paddingTop: 14 }}>
                                        <span style={{ fontSize: 12, fontWeight: 600, color: T.outline }}>
                                            {ent.projects || Math.floor(Math.random() * 12) + 3} Active Projects
                                        </span>
                                        <button onClick={() => !isSent && setContact(ent)} style={{
                                            display: 'flex', alignItems: 'center', gap: 4,
                                            background: 'none', border: 'none', cursor: isSent ? 'default' : 'pointer',
                                            color: isSent ? '#16a34a' : T.primary,
                                            fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 12,
                                        }}>
                                            {isSent ? '✓ Connected' : 'Portal'}
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
                        <div className="modal-title">Contact {contact.company_name || contact.name}</div>
                        <div className="input-group">
                            <label className="input-label">Message</label>
                            <textarea className="input-field" required rows={4} style={{ resize: 'none' }} placeholder="Describe your area of expertise and how you can add value to their projects..." value={msg} onChange={e => setMsg(e.target.value)} />
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn-cancel" onClick={() => setContact(null)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={sending}>
                                {sending ? 'Sending...' : 'Send Inquiry'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </EENLayout>
    )
}
