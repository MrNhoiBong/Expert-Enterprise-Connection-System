import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { LAYOUT_CSS, T } from '../styles/theme.js'

const NAV_ITEMS = [
    { key: 'dashboard', icon: 'dashboard', label: 'Dashboard', path: '/enterprise' },
    { key: 'projects', icon: 'work', label: 'Projects', path: '/enterprise/projects' },
    { key: 'discovery', icon: 'explore', label: 'Discovery', path: '/enterprise/discovery' },
    { key: 'grants', icon: 'monetization_on', label: 'Grants', path: '/enterprise/grants' },
    { key: 'profile', icon: 'account_circle', label: 'Profile', path: '/enterprise/profile' },
    { key: 'contacts', icon: 'group', label: 'Contacts', path: '/enterprise/contacts' },
]

export default function EnterpriseLayout({ children, activeKey }) {
    const navigate = useNavigate()
    const location = useLocation()
    const { profile, logout } = useAuth()

    const current = activeKey || (() => {
        for (const item of NAV_ITEMS) {
            if (item.path === location.pathname) return item.key
            if (item.path !== '/enterprise' && location.pathname.startsWith(item.path)) return item.key
        }
        return 'dashboard'
    })()

    const name = profile?.company_name || profile?.name || 'Enterprise'
    const initials = name.substring(0, 2).toUpperCase()
    const userId = profile?.enterpriseID || ''
    const avatarUrl = profile?.avatarUrl || null

    async function handleLogout() { await logout(); navigate('/login') }

    const AvatarEl = ({ size = 36, fontSize = 13 }) => (
        <div className="user-avatar" style={{ width: size, height: size, fontSize, overflow: 'hidden', flexShrink: 0 }}>
            {avatarUrl
                ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none' }} />
                : initials
            }
        </div>
    )

    return (
        <div className="page-shell">
            <style>{LAYOUT_CSS}</style>

            {/* ── Sidebar ── */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <span className="ms ms-fill ms-sm" style={{ color: 'white' }}>corporate_fare</span>
                    </div>
                    <div>
                        <div className="sidebar-brand-name">EEN Portal</div>
                        <div className="sidebar-brand-sub">Enterprise Expert Network</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.key}
                            className={`nav-item${current === item.key ? ' active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="ms ms-sm">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        className={`nav-item${current === 'settings' ? ' active' : ''}`}
                        onClick={() => navigate('/enterprise/settings')}
                    >
                        <span className="ms ms-sm">settings</span>
                        Account Settings
                    </button>
                </div>
            </aside>

            {/* ── Top bar ── */}
            <header className="topbar">
                <div className="topbar-right">
                    <button className="topbar-icon-btn">
                        <span className="ms">notifications</span>
                        <span className="notif-dot" />
                    </button>
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
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 14px', borderRadius: 8, border: 'none',
                            background: T.errorContainer, color: T.error,
                            cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                            fontSize: 12, fontWeight: 700, transition: 'all 0.2s', marginLeft: 8,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = T.error + '22'}
                        onMouseLeave={e => e.currentTarget.style.background = T.errorContainer}
                    >
                        <span className="ms ms-sm">logout</span>
                        Logout
                    </button>
                </div>
            </header>

            {/* ── Page content ── */}
            <div className="page-content">
                {children}
            </div>
        </div>
    )
}
