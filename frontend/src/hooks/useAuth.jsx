import { useState, useEffect, createContext, useContext } from 'react'
import { authApi, dbApi } from '../api/Api'

const AuthContext = createContext(null)

// ✅ Đưa ra ngoài hook để không bị hoisting issue
function detectRole(p) {
    if (p.expertID) return 'expert'
    if (p.enterpriseID) return 'enterprise'
    if (p.FoundID) return 'foundation'
    return 'unknown'
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dbApi.getProfile()
            .then(p => {
                // p = null nếu 401 (chưa đăng nhập) — không làm gì, ở lại login
                if (p && !p.detail) {
                    setProfile(p)
                    setUser({ role: detectRole(p), userId: p.expertID || p.enterpriseID || p.FoundID })
                }
                // Nếu null hoặc có detail (lỗi) → user = null → ProtectedRoute redirect về login
            })
            .catch(() => { })   // network error — cũng chỉ giữ user = null
            .finally(() => setLoading(false))
    }, [])

    async function login(account, password) {
        const res = await authApi.login(account, password)
        if (res?.detail || res?.success === false) throw new Error(res.detail || res.message)
        setUser({ role: res.role, userId: res.userId })
        const p = await dbApi.getProfile()
        if (p && !p.detail) setProfile(p)
        return res
    }

    async function logout() {
        await authApi.logout()
        setUser(null)
        setProfile(null)
    }

    return (
        <AuthContext.Provider value={{ user, profile, setProfile, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}