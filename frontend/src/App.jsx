import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'

// ===== Auth =====
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// ===== Expert =====
import ExpertHome from './pages/expert/expertHome'
import ExpertProjects from './pages/expert/expertProjects'
import ExpertInvitations from './pages/expert/expertInvitations'
import ExpertDocuments from './pages/expert/expertDocuments'
import ExpertExperts from './pages/expert/findExperts'
import ExpertEnterprises from './pages/expert/findEnterprises'
import ExpertPublicProfile from './pages/expert/expertPublicProfile'
import ExpertFunds from './pages/expert/expertFunds'
import ExpertProfile from './pages/expert/expertProfile'
import ExpertSettings from './pages/expert/expertSettings'
// expertContacts ← importable directly nhưng đã embed trong EENLayout sidebar
import ExpertContacts from './pages/expert/expertContacts'
// expertFiles ← named export
import { ExpertFiles } from './pages/expert/expertFiles'
// expertDiscovery ← default export
import ExpertDiscovery from './pages/expert/expertDiscovery'

// ===== Enterprise =====
import EnterpriseHome from './pages/enterprise/enterpriseHome'
import EnterpriseProjects from './pages/enterprise/enterpriseProjects'
import EnterpriseDiscovery from './pages/enterprise/enterpriseDiscovery'
import EnterpriseGrants from './pages/enterprise/enterpriseGrants'
import EnterpriseProfile from './pages/enterprise/enterpriseProfile'
import EnterpriseContacts from './pages/enterprise/enterpriseContacts'
import EnterpriseSettings from './pages/enterprise/enterpriseSettings'

// ===== Foundation =====
import FoundationHome from './pages/foundation/foundationHome'
import FoundationFunds from './pages/foundation/foundationFunds'
import FoundationRequests from './pages/foundation/foundationRequests'
import FoundationProjects from './pages/foundation/foundationProjects'
import FoundationProjectDetail from './pages/foundation/foundationProjectDetail'
import FoundationProfile from './pages/foundation/foundationProfile'
import FoundationSettings from './pages/foundation/foundationSettings'

// ─── Loading ────────────────────────────────────────────────
function Loading() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100vh', background: '#f8f9fb',
            color: '#737783', fontFamily: 'Inter, sans-serif', gap: 12,
        }}>
            <div style={{
                width: 20, height: 20,
                border: '2px solid rgba(0,52,111,0.15)',
                borderTopColor: '#00346f', borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            Loading...
        </div>
    )
}

// ─── Route guards ────────────────────────────────────────────
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return <Loading />
    if (!user) return <Navigate to="/login" replace />
    return children
}

function RoleRedirect() {
    const { user, loading } = useAuth()
    if (loading) return <Loading />
    if (!user) return <Navigate to="/login" replace />
    if (user.role === 'expert') return <Navigate to="/expert" replace />
    if (user.role === 'enterprise') return <Navigate to="/enterprise" replace />
    if (user.role === 'foundation') return <Navigate to="/foundation" replace />
    return <Navigate to="/login" replace />
}

const P = ({ children }) => <ProtectedRoute>{children}</ProtectedRoute>

// ─── Routes ──────────────────────────────────────────────────
function AppRoutes() {
    return (
        <Routes>

            {/* ── Public ── */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RoleRedirect />} />

            {/* ══════════════════════════════════════════
          EXPERT  (all 12 routes active)
      ══════════════════════════════════════════ */}
            <Route path="/expert" element={<P><ExpertHome /></P>} />
            <Route path="/expert/projects" element={<P><ExpertProjects /></P>} />
            <Route path="/expert/projects/:id" element={<P><ExpertFiles /></P>} />
            <Route path="/expert/invitations" element={<P><ExpertInvitations /></P>} />
            <Route path="/expert/documents" element={<P><ExpertDocuments /></P>} />
            <Route path="/expert/experts" element={<P><ExpertExperts /></P>} />
            <Route path="/expert/experts/:id" element={<P><ExpertPublicProfile type="expert" /></P>} />
            <Route path="/expert/enterprises" element={<P><ExpertEnterprises /></P>} />
            <Route path="/expert/enterprises/:id" element={<P><ExpertPublicProfile type="enterprise" /></P>} />
            <Route path="/expert/funds" element={<P><ExpertFunds /></P>} />
            <Route path="/expert/profile" element={<P><ExpertProfile /></P>} />
            <Route path="/expert/settings" element={<P><ExpertSettings /></P>} />
            <Route path="/expert/files" element={<P><ExpertFiles /></P>} />
            <Route path="/expert/contacts" element={<P><ExpertContacts /></P>} />
            <Route path="/expert/discovery" element={<P><ExpertDiscovery /></P>} />

            {/* ══════════════════════════════════════════
          ENTERPRISE
      ══════════════════════════════════════════ */}
            <Route path="/enterprise" element={<P><EnterpriseHome /></P>} />
            <Route path="/enterprise/projects" element={<P><EnterpriseProjects /></P>} />
            <Route path="/enterprise/discovery" element={<P><EnterpriseDiscovery /></P>} />
            <Route path="/enterprise/experts/:id" element={<P><ExpertPublicProfile type="expert" /></P>} />
            <Route path="/enterprise/enterprises/:id" element={<P><ExpertPublicProfile type="enterprise" /></P>} />
            <Route path="/enterprise/grants" element={<P><EnterpriseGrants /></P>} />
            <Route path="/enterprise/profile" element={<P><EnterpriseProfile /></P>} />
            <Route path="/enterprise/contacts" element={<P><EnterpriseContacts /></P>} />
            <Route path="/enterprise/settings" element={<P><EnterpriseSettings /></P>} />

            {/* ══════════════════════════════════════════
          FOUNDATION
      ══════════════════════════════════════════ */}
            <Route path="/foundation" element={<P><FoundationHome /></P>} />
            <Route path="/foundation/funds" element={<P><FoundationFunds /></P>} />
            <Route path="/foundation/requests" element={<P><FoundationRequests /></P>} />
            <Route path="/foundation/projects" element={<P><FoundationProjects /></P>} />
            <Route path="/foundation/projects/:id" element={<P><FoundationProjectDetail /></P>} />
            <Route path="/foundation/profile" element={<P><FoundationProfile /></P>} />
            <Route path="/foundation/settings" element={<P><FoundationSettings /></P>} />

            {/* ── Fallback ── */}
            <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
    )
}

// ─── Root ─────────────────────────────────────────────────────
export default function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
            </Router>
        </AuthProvider>
    )
}
