import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

/* ─── Fonts + Material Symbols ─────────────────────────────── */
const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
`

/* ─── Design Tokens (from Tailwind config in HTML) ─────────── */
const T = {
    primary: '#00346f',
    primaryContainer: '#004a99',
    primaryFixed: '#d7e2ff',
    surface: '#f8f9fb',
    surfaceContainer: '#eceef0',
    surfaceContainerHigh: '#e6e8ea',
    surfaceContainerHighest: '#e0e3e5',
    surfaceContainerLowest: '#ffffff',
    secondaryContainer: '#cbe7f5',
    tertiaryFixed: '#b4ebff',
    tertiaryFixedDim: '#3cd7ff',
    onSurface: '#191c1e',
    onSurfaceVariant: '#424751',
    outline: '#737783',
    outlineVariant: '#c2c6d3',
}

const css = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .msym {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 20px;
    line-height: 1;
    display: inline-block;
    user-select: none;
    vertical-align: middle;
  }

  .login-root {
    font-family: 'Inter', sans-serif;
    background: ${T.surface};
    color: ${T.onSurface};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Navbar ── */
  .nav {
    width: 100%;
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(248,249,251,0.80);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .nav-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 32px;
  }
  .nav-brand {
    font-family: 'Manrope', sans-serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #1e3a5f;
  }
  .nav-links {
    display: flex;
    gap: 24px;
  }
  .nav-links a {
    font-family: 'Manrope', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
    letter-spacing: -0.01em;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: ${T.primary}; }
  .nav-signup {
    font-size: 13px;
    font-weight: 700;
    color: ${T.primary};
    background: none;
    border: none;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: color 0.2s;
    letter-spacing: 0;
  }
  .nav-signup:hover { color: #002d5e; }

  /* ── Main ── */
  .main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }

  /* bg blobs */
  .blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }
  .blob-1 {
    top: -10%; right: -5%;
    width: 40%; height: 60%;
    background: rgba(203,231,245,0.20);
    filter: blur(120px);
  }
  .blob-2 {
    bottom: -10%; left: -5%;
    width: 30%; height: 50%;
    background: rgba(180,235,255,0.10);
    filter: blur(100px);
  }

  /* ── Card grid ── */
  .card-grid {
    max-width: 1100px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    box-shadow: 0 20px 40px rgba(25,28,30,0.06);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
    z-index: 1;
    animation: slideUpFade 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes slideUpFade {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Hero panel (left) ── */
  .hero {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px;
    background: linear-gradient(135deg, #00346f 0%, #004a99 100%);
    color: white;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='%23fff' fill-opacity='.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
  }
  .hero-top { position: relative; z-index: 1; }
  .hero-title {
    font-family: 'Manrope', sans-serif;
    font-size: 44px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 20px;
  }
  .hero-desc {
    font-size: 17px;
    color: rgba(215,226,255,0.88);
    line-height: 1.65;
    max-width: 380px;
  }
  .hero-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  .stat-box {
    padding: 20px 24px;
    background: rgba(255,255,255,0.10);
    backdrop-filter: blur(12px);
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
    transition: transform 0.4s;
  }
  .stat-box:hover { transform: scale(1.02); }
  .stat-num {
    display: block;
    font-family: 'Manrope', sans-serif;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .stat-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(215,226,255,0.70);
  }

  /* ── Form panel (right) ── */
  .form-panel {
    background: ${T.surfaceContainerLowest};
    padding: 56px 64px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .form-heading { margin-bottom: 36px; }
  .form-title {
    font-family: 'Manrope', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: ${T.primary};
    margin-bottom: 6px;
  }
  .form-sub {
    font-size: 14px;
    color: ${T.onSurfaceVariant};
  }

  /* ── Input field ── */
  .field { margin-bottom: 20px; }
  .field-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .field-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: ${T.onSurfaceVariant};
    font-family: 'Inter', sans-serif;
  }
  .field-link {
    font-size: 11px;
    font-weight: 700;
    color: ${T.primary};
    text-decoration: none;
    transition: opacity 0.2s;
  }
  .field-link:hover { opacity: 0.75; text-decoration: underline; }

  .input-wrap {
    position: relative;
  }
  .input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${T.outline};
    display: flex;
    align-items: center;
    transition: color 0.25s;
    pointer-events: none;
  }
  .input-wrap:focus-within .input-icon { color: ${T.primary}; }

  .field input {
    width: 100%;
    padding: 13px 16px 13px 46px;
    background: ${T.surfaceContainerHighest};
    border: none;
    border-radius: 6px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: ${T.onSurface};
    outline: none;
    transition: all 0.25s;
    box-sizing: border-box;
  }
  .field input::placeholder { color: rgba(115,119,131,0.45); }
  .field input:focus {
    box-shadow: 0 0 0 2px ${T.primary};
    background: ${T.surfaceContainerLowest};
  }
  .field input:hover:not(:focus) { background: ${T.surfaceContainerHigh}; }

  /* ── Checkbox ── */
  .check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 24px;
    padding: 6px 0;
  }
  .check-row input[type=checkbox] {
    width: 16px;
    height: 16px;
    accent-color: ${T.primary};
    border-radius: 4px;
    cursor: pointer;
    flex-shrink: 0;
    border: 1px solid ${T.outlineVariant};
  }
  .check-row label {
    font-size: 13px;
    color: ${T.onSurfaceVariant};
    cursor: pointer;
    user-select: none;
  }

  /* ── Submit btn ── */
  .btn-submit {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #00346f, #004a99);
    color: white;
    border: none;
    border-radius: 6px;
    font-family: 'Manrope', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.25s;
    box-shadow: 0 4px 16px rgba(0,52,111,0.22);
    margin-bottom: 36px;
  }
  .btn-submit:hover {
    transform: scale(1.01);
    box-shadow: 0 0 0 4px rgba(0,52,111,0.15), 0 4px 16px rgba(0,52,111,0.22);
  }
  .btn-submit:active { transform: scale(0.99); }
  .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .btn-submit .arrow { transition: transform 0.25s; }
  .btn-submit:hover .arrow { transform: translateX(4px); }

  /* ── Register link ── */
  .register-row {
    text-align: center;
    font-size: 13px;
    color: ${T.onSurfaceVariant};
  }
  .register-row a {
    color: ${T.primary};
    font-weight: 700;
    text-decoration: none;
    margin-left: 4px;
    transition: opacity 0.2s;
  }
  .register-row a:hover { text-decoration: underline; }

  /* ── Error ── */
  .error-msg {
    background: #ffdad6;
    border-radius: 6px;
    padding: 10px 14px;
    color: #93000a;
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* ── Spinner ── */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.55s linear infinite;
    flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Footer ── */
  .footer {
    border-top: 1px solid #e2e8f0;
    background: #f8f9fb;
  }
  .footer-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 28px 48px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .footer-brand {
    font-family: 'Manrope', sans-serif;
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #1e3a5f;
  }
  .footer-links {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }
  .footer-links a {
    font-size: 13px;
    color: #64748b;
    text-decoration: none;
    transition: color 0.2s;
    font-family: 'Inter', sans-serif;
  }
  .footer-links a:hover { color: #2563eb; }
  .footer-copy {
    font-size: 12px;
    color: #64748b;
    font-family: 'Inter', sans-serif;
  }
`

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [account, setAccount] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await login(account, password)
            const r = res?.role
            if (r === 'expert') navigate('/expert')
            else if (r === 'enterprise') navigate('/enterprise')
            else if (r === 'foundation') navigate('/foundation')
            else navigate('/')
        } catch (err) {
            setError(err.message || 'Invalid username or password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-root">
            <style>{css}</style>

            {/* ── Navbar ── */}
            <header className="nav">
                <div className="nav-inner">
                    <span className="nav-brand">EEN</span>
                    <nav className="nav-links">
                        <a href="#">Network</a>
                        <a href="#">Experts</a>
                        <a href="#">About</a>
                    </nav>
                    <button className="nav-signup" onClick={() => navigate('/register')}>
                        Sign Up
                    </button>
                </div>
            </header>

            {/* ── Main ── */}
            <main className="main">
                <div className="blob blob-1" />
                <div className="blob blob-2" />

                <div className="card-grid">
                    {/* Left — Hero */}
                    <div className="hero">
                        <div className="hero-top">
                            <h1 className="hero-title">
                                Access the Global<br />Expert Network.
                            </h1>
                            <p className="hero-desc">
                                Securely connect with industry leaders and innovative corporate
                                talent through the Enterprise Expert Network.
                            </p>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-box">
                                <span className="stat-num">12k+</span>
                                <span className="stat-label">Certified Experts</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-num">98%</span>
                                <span className="stat-label">Success Rate</span>
                            </div>
                        </div>
                    </div>

                    {/* Right — Form */}
                    <div className="form-panel">
                        <div className="form-heading">
                            <h2 className="form-title">Welcome Back</h2>
                            <p className="form-sub">
                                Please enter your credentials to access your dashboard.
                            </p>
                        </div>

                        {error && <div className="error-msg">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            {/* Username */}
                            <div className="field">
                                <label className="field-label">Username</label>
                                <div className="input-wrap">
                                    <span className="input-icon msym">account_circle</span>
                                    <input
                                        type="text"
                                        placeholder="j.doe@enterprise.com"
                                        value={account}
                                        onChange={e => setAccount(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="field">
                                <div className="field-header">
                                    <label className="field-label">Password</label>
                                    <a href="#" className="field-link">Forgot Password?</a>
                                </div>
                                <div className="input-wrap">
                                    <span className="input-icon msym">lock</span>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Remember */}
                            <div className="check-row">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={remember}
                                    onChange={e => setRemember(e.target.checked)}
                                />
                                <label htmlFor="remember">
                                    Remember this device for 30 days
                                </label>
                            </div>

                            {/* Submit */}
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? (
                                    <><div className="spinner" /> Signing in...</>
                                ) : (
                                    <>Sign In <span className="msym arrow">arrow_forward</span></>
                                )}
                            </button>
                        </form>

                        <div className="register-row">
                            New to the network?
                            <a href="/register">Register for an account</a>
                        </div>
                    </div>
                </div>
            </main>

            {/* ── Footer ── */}
            <footer className="footer">
                <div className="footer-inner">
                    <span className="footer-brand">EEN</span>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Support</a>
                        <a href="#">Global Network</a>
                    </div>
                    <p className="footer-copy">
                        © 2024 Enterprise Expert Network. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}
