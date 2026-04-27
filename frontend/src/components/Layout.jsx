import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { LAYOUT_CSS, T } from '../styles/theme.js'
import { bizApi } from '../api/Api.js'

const NAV_ITEMS = [
    { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/expert' },
    { key: 'projects', icon: 'assignment', label: 'Projects', path: '/expert/projects' },
    { key: 'discovery', icon: 'explore', label: 'Discovery', path: '/expert/discovery' },
    { key: 'profile', icon: 'person', label: 'Profile', path: '/expert/profile' },
    { key: 'contacts', icon: 'group', label: 'Contacts', path: '/expert/contacts' },
]

export default function EENLayout({ children, activeKey }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { profile, logout } = useAuth()
    const bellRef = useRef(null)

    const [invitations, setInvitations] = useState([])
    const [showNotif, setShowNotif] = useState(false)
    const [actioning, setActioning] = useState(null)

    const current = activeKey || (() => {
        for (const item of NAV_ITEMS) {
            if (item.path === location.pathname) return item.key
            if (item.path !== '/expert' && location.pathname.startsWith(item.path)) return item.key
        }
        return 'dashboard'
    })()

    const name = profile?.name || profile?.company_name || 'User'
    const initials = name.substring(0, 2).toUpperCase()
    const userId = profile?.expertID || profile?.enterpriseID || profile?.FoundID || ''
    const avatarUrl = profile?.avatarUrl || null

    // Pending invitations (được mời — invitedUser === myId)
    const pending = invitations.filter(inv => inv.status === 'pending' && inv.invitedUser === userId)

    // Poll invitations mỗi 5s (giảm từ 10s để nhận nhanh hơn)
    useEffect(() => {
        if (!userId) return
        let mounted = true
        function fetchInv() {
            bizApi.getInvitations().then(d => {
                if (mounted && Array.isArray(d)) {
                    setInvitations(d)
                    const myPending = d.filter(inv => inv.status === 'pending' && inv.invitedUser === userId)
                    console.log('[Notif] userId:', userId, '| total:', d.length, '| pending for me:', myPending.length, '| invitedUsers:', d.map(i => i.invitedUser))
                }
            })
        }
        fetchInv()
        const t = setInterval(fetchInv, 5000)
        return () => { mounted = false; clearInterval(t) }
    }, [userId])

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        function handleClick(e) {
            if (bellRef.current && !bellRef.current.contains(e.target)) setShowNotif(false)
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    async function handleAccept(inv) {
        setActioning(inv.invitationID)
        const res = await bizApi.acceptInvitation(inv.invitationID)
        if (res) setInvitations(prev => prev.map(i => i.invitationID === inv.invitationID ? { ...i, status: 'accepted' } : i))
        setActioning(null)
    }

    async function handleReject(inv) {
        setActioning(inv.invitationID)
        const res = await bizApi.rejectInvitation(inv.invitationID)
        if (res) setInvitations(prev => prev.map(i => i.invitationID === inv.invitationID ? { ...i, status: 'rejected' } : i))
        setActioning(null)
    }

    const AvatarEl = ({ size = 36, fontSize = 13 }) => (
        <div className="user-avatar" style={{ width: size, height: size, fontSize, overflow: 'hidden', flexShrink: 0 }}>
            {avatarUrl
                ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                : initials}
        </div>
    )

    async function handleLogout() { await logout(); navigate('/login') }

    return (
        <div className="page-shell">
            <style>{LAYOUT_CSS + `
        .notif-dropdown { position:absolute; top:calc(100% + 8px); right:0; width:360px; background:white; border-radius:16px; box-shadow:0 8px 32px rgba(0,52,111,0.15); border:1px solid ${T.outlineVariant}40; z-index:999; overflow:hidden; }
        .notif-item { padding:16px 18px; border-bottom:1px solid ${T.outlineVariant}20; }
        .notif-item:last-child { border-bottom:none; }
      `}</style>

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <span className="ms ms-fill ms-sm" style={{ color: 'white' }}>terminal</span>
                    </div>
                    <div>
                        <div className="sidebar-brand-name">EEN Portal</div>
                        <div className="sidebar-brand-sub">Enterprise Expert Network</div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <button key={item.key} className={`nav-item${current === item.key ? ' active' : ''}`} onClick={() => navigate(item.path)}>
                            <span className="ms ms-sm">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className={`nav-item${current === 'settings' ? ' active' : ''}`} onClick={() => navigate('/expert/settings')}>
                        <span className="ms ms-sm">settings</span>
                        Account Settings
                    </button>
                </div>
            </aside>

            {/* ── Top bar ── */}
            <header className="topbar">
                <div className="topbar-right">

                    {/* ── Bell with dropdown ── */}
                    <div ref={bellRef} style={{ position: 'relative' }}>
                        <button className="topbar-icon-btn" onClick={() => setShowNotif(v => !v)}>
                            <span className="ms">notifications</span>
                            {pending.length > 0 && (
                                <span style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: T.error, color: 'white', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                                    {pending.length}
                                </span>
                            )}
                        </button>

                        {showNotif && (
                            <div className="notif-dropdown">
                                {/* Header */}
                                <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${T.outlineVariant}20` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span style={{ fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: 15 }}>Notifications</span>
                                        {pending.length > 0 && (
                                            <span style={{ padding: '2px 8px', borderRadius: 999, background: T.errorContainer, color: T.error, fontSize: 10, fontWeight: 700 }}>
                                                {pending.length} pending
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Invitation list */}
                                <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                                    {invitations.length === 0 ? (
                                        <div style={{ padding: '32px 18px', textAlign: 'center', color: T.outline, fontSize: 13 }}>
                                            No notifications yet.
                                        </div>
                                    ) : invitations.map(inv => (
                                        <div key={inv.invitationID} className="notif-item">
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.primaryFixed, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span className="ms ms-fill ms-sm" style={{ color: T.primary }}>assignment</span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                                                        {inv.invitedUser === userId
                                                            ? <>Project invitation from <strong>{inv.invitedBy}</strong></>
                                                            : <>You invited <strong>{inv.invitedUser}</strong></>
                                                        }
                                                    </p>
                                                    <p style={{ fontSize: 11, color: T.outline, marginBottom: inv.status === 'pending' && inv.invitedUser === userId ? 10 : 0 }}>
                                                        {inv.projectID} · {inv.role} · {inv.status}
                                                    </p>
                                                    {inv.message && <p style={{ fontSize: 12, color: T.onSurfaceVariant, fontStyle: 'italic', marginBottom: 8 }}>"{inv.message}"</p>}

                                                    {/* Accept / Reject buttons — only for pending invitations addressed to me */}
                                                    {inv.status === 'pending' && inv.invitedUser === userId && (
                                                        <div style={{ display: 'flex', gap: 8 }}>
                                                            <button className="btn btn-primary" style={{ fontSize: 11, padding: '6px 12px' }}
                                                                disabled={actioning === inv.invitationID}
                                                                onClick={() => handleAccept(inv)}>
                                                                <span className="ms ms-sm">check</span>
                                                                {actioning === inv.invitationID ? '...' : 'Accept'}
                                                            </button>
                                                            <button className="btn" style={{ fontSize: 11, padding: '6px 12px', background: T.errorContainer, color: T.error, border: 'none' }}
                                                                disabled={actioning === inv.invitationID}
                                                                onClick={() => handleReject(inv)}>
                                                                <span className="ms ms-sm">close</span> Decline
                                                            </button>
                                                        </div>
                                                    )}

                                                    {inv.status === 'accepted' && (
                                                        <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span className="ms ms-sm">check_circle</span> Accepted
                                                        </span>
                                                    )}
                                                    {inv.status === 'rejected' && (
                                                        <span style={{ fontSize: 11, color: T.error, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span className="ms ms-sm">cancel</span> Declined
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="topbar-icon-btn">
                        <span className="ms">help_outline</span>
                    </button>
                    <div className="topbar-divider" />
                    <div className="topbar-user">
                        <div className="topbar-user-info">
                            <div className="topbar-user-name">{name}</div>
                            <div className="topbar-user-role">{userId}</div>
                        </div>
                        <AvatarEl size={36} fontSize={13} />
                    </div>
                    <button onClick={handleLogout}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: T.errorContainer, color: T.error, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontSize: 12, fontWeight: 700, transition: 'all 0.2s', marginLeft: 8 }}
                        onMouseEnter={e => e.currentTarget.style.background = T.error + '22'}
                        onMouseLeave={e => e.currentTarget.style.background = T.errorContainer}>
                        <span className="ms ms-sm">logout</span>Logout
                    </button>
                </div>
            </header>

            <div className="page-content">{children}</div>
        </div>
    )
}
