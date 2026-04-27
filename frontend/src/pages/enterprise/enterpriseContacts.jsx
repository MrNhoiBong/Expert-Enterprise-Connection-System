import { useState, useEffect, useRef } from 'react'
import EnterpriseLayout from '../../components/EnterpriseLayout'
import { dbApi, bizApi } from '../../api/Api.js'
import { useAuth } from '../../hooks/useAuth.jsx'
import { T } from '../../styles/theme.js'

function fmtTime(iso) {
    if (!iso) return ''
    try {
        const d = new Date(iso)
        const now = new Date()
        const diff = (now - d) / 1000
        if (diff < 60) return 'Just now'
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
        if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } catch { return '' }
}

export default function EnterpriseContacts() {
    const { profile } = useAuth()
    const myId = profile?.enterpriseID || profile?.expertID || profile?.FoundID
    const bottomRef = useRef(null)
    const activeRef = useRef(null)

    const [contacts, setContacts] = useState([])
    const [active, setActive] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [tab, setTab] = useState('chats')

    useEffect(() => { activeRef.current = active }, [active])

    // Load contacts + poll 5s
    useEffect(() => {
        let mounted = true
        function fetchC() {
            bizApi.getContacts().then(d => {
                if (mounted && Array.isArray(d)) setContacts(d)
            }).finally(() => { if (mounted) setLoading(false) })
        }
        fetchC()
        const t = setInterval(fetchC, 5000)
        return () => { mounted = false; clearInterval(t) }
    }, [])

    // Load messages khi đổi active
    useEffect(() => {
        if (!active) return
        bizApi.getMessages(active).then(d => {
            if (Array.isArray(d)) setMessages(d)
        })
    }, [active])

    // Poll messages 2s
    useEffect(() => {
        if (!active) return
        let mounted = true
        const t = setInterval(() => {
            bizApi.getMessages(activeRef.current).then(d => {
                if (!mounted || !Array.isArray(d)) return
                setMessages(prev => {
                    if (d.length !== prev.length) return d
                    const lastNew = d[d.length - 1]?.msgID
                    const lastOld = prev[prev.length - 1]?.msgID
                    return lastNew !== lastOld ? d : prev
                })
            })
        }, 2000)
        return () => { mounted = false; clearInterval(t) }
    }, [active])

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Enrich contacts with peer name
    useEffect(() => {
        if (!contacts.length || !myId) return
        contacts.forEach(async c => {
            const peerId = c.senderID === myId ? c.receiverID : c.senderID
            const peerType = c.senderID === myId ? c.receiverType : c.senderRole
            if (c.receiverName || c.senderName) return
            try {
                let peer
                if (peerType === 'expert') peer = await dbApi.getExpert(peerId)
                else if (peerType === 'enterprise') peer = await dbApi.getEnterprise(peerId)
                if (!peer || peer.detail) return
                const name = peer.name || peer.company_name || peerId
                setContacts(prev => prev.map(x => {
                    if (x.contactID !== c.contactID) return x
                    return c.senderID === myId ? { ...x, receiverName: name } : { ...x, senderName: name }
                }))
            } catch { }
        })
    }, [contacts.length, myId]) // eslint-disable-line

    const accepted = contacts.filter(c => c.status === 'accepted')
    const pending = contacts.filter(c => c.status === 'pending' && c.receiverID === myId)
    const sent = contacts.filter(c => c.status === 'pending' && c.senderID === myId)

    function getPeerName(c) {
        return c.senderID === myId ? c.receiverName || c.receiverID : c.senderName || c.senderID
    }
    function getPeerInitials(c) { return getPeerName(c).substring(0, 2).toUpperCase() }

    const activeContact = contacts.find(c => c.contactID === active)

    async function handleAccept(contactId) {
        await bizApi.acceptContact(contactId)
        setContacts(prev => prev.map(c => c.contactID === contactId ? { ...c, status: 'accepted' } : c))
    }
    async function handleReject(contactId) {
        await bizApi.rejectContact(contactId)
        setContacts(prev => prev.map(c => c.contactID === contactId ? { ...c, status: 'rejected' } : c))
    }
    async function handleSend(e) {
        e.preventDefault()
        if (!input.trim() || !active) return
        setSending(true)
        const res = await bizApi.sendMessage(active, input.trim())
        if (res?.msgID) { setMessages(prev => [...prev, res]); setInput('') }
        setSending(false)
    }

    return (
        <EnterpriseLayout activeKey="contacts">
            <style>{`
        .msg-scroll::-webkit-scrollbar{width:4px}
        .msg-scroll::-webkit-scrollbar-thumb{background:${T.outlineVariant};border-radius:2px}
        .contact-row:hover{background:${T.surfaceContainerLow}!important}
      `}</style>
            <div style={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden', margin: '-32px -32px 0', fontFamily: 'Inter,sans-serif' }}>

                {/* ── Left panel ── */}
                <aside style={{ width: 300, background: T.surfaceContainerLow, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.outlineVariant}30`, flexShrink: 0 }}>
                    <div style={{ padding: '24px 20px 0' }}>
                        <div className="flex-between" style={{ marginBottom: 16 }}>
                            <h2 style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 19 }}>Contacts</h2>
                            {pending.length > 0 && (
                                <span style={{ width: 20, height: 20, borderRadius: '50%', background: T.error, color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pending.length}</span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${T.outlineVariant}30` }}>
                            {[['chats', `Chats (${accepted.length})`], ['requests', `Requests${pending.length ? ` (${pending.length})` : ''}`]].map(([key, label]) => (
                                <button key={key} onClick={() => setTab(key)}
                                    style={{ flex: 1, padding: '8px 4px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: tab === key ? 700 : 500, color: tab === key ? T.primary : T.outline, borderBottom: tab === key ? `2px solid ${T.primary}` : '2px solid transparent', marginBottom: -1, transition: 'all 0.15s' }}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="msg-scroll" style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>

                        {tab === 'chats' && (
                            loading
                                ? <div style={{ textAlign: 'center', padding: 20, color: T.outline, fontSize: 12 }}>Loading...</div>
                                : accepted.length === 0
                                    ? <div style={{ textAlign: 'center', padding: 32, color: T.outline }}>
                                        <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 40, display: 'block', marginBottom: 8 }}>group_off</span>
                                        <p style={{ fontSize: 13 }}>No contacts yet.</p>
                                        <p style={{ fontSize: 11, marginTop: 4 }}>Go to Discovery to connect with experts.</p>
                                    </div>
                                    : accepted.map(c => {
                                        const name = getPeerName(c)
                                        const isActive = active === c.contactID
                                        return (
                                            <div key={c.contactID} className="contact-row"
                                                onClick={() => setActive(c.contactID)}
                                                style={{ padding: '12px 10px', borderRadius: 10, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', background: isActive ? T.primaryFixed : 'transparent', marginBottom: 2, transition: 'background 0.1s' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                                    {name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{name}</div>
                                                    <div style={{ fontSize: 11, color: T.outline, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.message || 'Connected'}</div>
                                                </div>
                                                <div style={{ fontSize: 10, color: T.outline, flexShrink: 0 }}>{fmtTime(c.createdAt)}</div>
                                            </div>
                                        )
                                    })
                        )}

                        {tab === 'requests' && (
                            <div style={{ paddingTop: 8 }}>
                                {pending.length > 0 && (
                                    <>
                                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, padding: '4px 10px', marginBottom: 6 }}>
                                            Incoming ({pending.length})
                                        </p>
                                        {pending.map(c => (
                                            <div key={c.contactID} style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 10, border: `1px solid ${T.outlineVariant}30` }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                                                        {(c.senderName || c.senderID).substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: 13 }}>{c.senderName || c.senderID}</div>
                                                        <div style={{ fontSize: 10, color: T.outline }}>{fmtTime(c.createdAt)}</div>
                                                    </div>
                                                </div>
                                                {c.message && (
                                                    <p style={{ fontSize: 12, color: T.onSurfaceVariant, background: T.surfaceContainerLow, borderRadius: 8, padding: '8px 12px', marginBottom: 10, lineHeight: 1.5 }}>
                                                        "{c.message}"
                                                    </p>
                                                )}
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
                                                        onClick={() => handleAccept(c.contactID)}>
                                                        <span className="ms ms-sm">check</span> Accept
                                                    </button>
                                                    <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 12, background: T.errorContainer, color: T.error, border: 'none', cursor: 'pointer', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Inter,sans-serif', fontWeight: 600 }}
                                                        onClick={() => handleReject(c.contactID)}>
                                                        <span className="ms ms-sm">close</span> Decline
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                                {sent.length > 0 && (
                                    <>
                                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.outline, padding: '4px 10px', marginBottom: 6, marginTop: 8 }}>
                                            Sent ({sent.length})
                                        </p>
                                        {sent.map(c => (
                                            <div key={c.contactID} style={{ background: T.surfaceContainerLow, borderRadius: 10, padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 34, height: 34, borderRadius: '50%', background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.primary, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                                    {(c.receiverName || c.receiverID).substring(0, 2).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.receiverName || c.receiverID}</div>
                                                    <div style={{ fontSize: 11, color: T.outline }}>Pending response</div>
                                                </div>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706', flexShrink: 0 }} />
                                            </div>
                                        ))}
                                    </>
                                )}
                                {pending.length === 0 && sent.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: 32, color: T.outline }}>
                                        <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 40, display: 'block', marginBottom: 8 }}>inbox</span>
                                        <p style={{ fontSize: 13 }}>No pending requests.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

                {/* ── Chat area ── */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                    {!active ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: T.outline, gap: 12 }}>
                            <span className="ms ms-xl" style={{ color: T.outlineVariant, fontSize: 56 }}>chat</span>
                            <p style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 18, color: T.onSurfaceVariant }}>Select a contact to chat</p>
                            <p style={{ fontSize: 13 }}>Your accepted connections will appear here.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.outlineVariant}25`, display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 14, fontWeight: 700 }}>
                                    {activeContact ? getPeerInitials(activeContact) : '?'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15 }}>{activeContact ? getPeerName(activeContact) : '—'}</div>
                                    <div style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                                        Connected
                                    </div>
                                </div>
                            </div>

                            <div className="msg-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {messages.length === 0 && (
                                    <div style={{ textAlign: 'center', color: T.outline, fontSize: 13, marginTop: 40 }}>No messages yet. Say hello!</div>
                                )}
                                {messages.map((m, i) => {
                                    const isMe = m.fromID === myId
                                    return (
                                        <div key={m.msgID || i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: 8 }}>
                                            {!isMe && (
                                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0, alignSelf: 'flex-end' }}>
                                                    {activeContact ? getPeerInitials(activeContact) : '?'}
                                                </div>
                                            )}
                                            <div style={{ maxWidth: '65%' }}>
                                                <div style={{ background: isMe ? T.primary : T.surfaceContainerLow, color: isMe ? 'white' : T.onSurface, padding: '11px 16px', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', fontSize: 13, lineHeight: 1.6, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                                    {m.text}
                                                </div>
                                                <div style={{ fontSize: 10, color: T.outline, marginTop: 3, textAlign: isMe ? 'right' : 'left' }}>{fmtTime(m.createdAt)}</div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={bottomRef} />
                            </div>

                            <form onSubmit={handleSend} style={{ padding: '14px 20px', borderTop: `1px solid ${T.outlineVariant}25`, display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                                <input value={input} onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    style={{ flex: 1, background: T.surfaceContainerLow, border: 'none', borderRadius: 12, padding: '11px 16px', fontSize: 13, outline: 'none', fontFamily: 'Inter,sans-serif' }} />
                                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }} disabled={sending || !input.trim()}>
                                    <span className="ms ms-sm">send</span>
                                </button>
                            </form>
                        </>
                    )}
                </main>
            </div>
        </EnterpriseLayout>
    )
}
