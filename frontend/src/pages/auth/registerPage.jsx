import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../../api/Api.js'

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
`

/* Design tokens */
const T = {
    primary: '#00346f',
    primaryContainer: '#004a99',
    primaryFixed: '#d7e2ff',
    secondaryContainer: '#cbe7f5',
    onSecondaryContainer: '#4e6874',
    tertiaryContainer: '#005365',
    onTertiaryContainer: '#00cdf7',
    tertiaryFixed: '#b4ebff',
    onTertiaryFixed: '#001f27',
    surface: '#f8f9fb',
    surfaceContainerLow: '#f2f4f6',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerHighest: '#e0e3e5',
    onSurface: '#191c1e',
    onSurfaceVariant: '#424751',
    outline: '#737783',
    outlineVariant: '#c2c6d3',
    tertiary: '#003b48',
}

const css = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .msym {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    font-size: 20px; line-height: 1;
    display: inline-block; user-select: none; vertical-align: middle;
  }
  .msym-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  /* ─── REGISTER PAGE ─────────────────────────────────────── */
  .reg-root {
    font-family: 'Inter', sans-serif;
    background: ${T.surface};
    color: ${T.onSurface};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  /* ── Navbar (minimal — transactional) ── */
  .nav {
    width: 100%;
    position: fixed;
    top: 0; z-index: 50;
    background: rgba(248,249,251,0.80);
    backdrop-filter: blur(20px);
  }
  .nav-inner {
    max-width: 1400px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    padding: 22px 32px;
  }
  .nav-brand-wrap {
    display: flex; align-items: center; gap: 10px;
  }
  .nav-brand {
    font-family: 'Manrope', sans-serif;
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.03em; color: #1e3a5f;
  }
  .nav-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: ${T.onSurfaceVariant};
  }

  /* ── Background blobs (animated on mousemove via JS) ── */
  .bg-blob {
    position: absolute; border-radius: 50%;
    pointer-events: none; z-index: 0;
    will-change: transform;
  }
  .bg-blob-1 {
    top: 10%; left: 5%;
    width: 640px; height: 640px;
    background: rgba(203,231,245,0.20);
    filter: blur(100px);
  }
  .bg-blob-2 {
    bottom: 5%; right: 0;
    width: 560px; height: 560px;
    background: rgba(60,215,255,0.10);
    filter: blur(120px);
  }

  /* ── Main ── */
  .reg-main {
    flex: 1;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    padding-top: 80px;
  }
  .content-grid {
    max-width: 1100px;
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
    position: relative; z-index: 10;
    padding: 48px 24px;
    align-items: center;
  }

  /* ── Left branding side ── */
  .brand-side {
    padding-right: 64px;
    animation: fadeInUp 0.7s 0.1s both;
  }
  .brand-tag {
    display: inline-flex;
    align-items: center;
    padding: 5px 14px;
    border-radius: 999px;
    background: ${T.secondaryContainer};
    color: ${T.onSecondaryContainer};
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .brand-title {
    font-family: 'Manrope', sans-serif;
    font-size: 48px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.02em;
    color: ${T.primary};
    margin-bottom: 20px;
  }
  .brand-title-accent { color: ${T.tertiary}; }
  .brand-desc {
    font-size: 16px;
    color: ${T.onSurfaceVariant};
    line-height: 1.7;
    max-width: 400px;
    margin-bottom: 40px;
  }
  .brand-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .brand-stat-num {
    font-family: 'Manrope', sans-serif;
    font-size: 32px; font-weight: 700;
    color: ${T.primary}; margin-bottom: 4px;
  }
  .brand-stat-label {
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.12em;
    color: ${T.onSurfaceVariant};
  }

  /* ── Glass card (register form) ── */
  .glass-card {
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(25,28,30,0.06);
    border: 1px solid rgba(194,198,211,0.20);
    padding: 40px 44px;
    animation: fadeInUp 0.7s 0.2s both;
  }
  .card-heading { margin-bottom: 32px; }
  .card-title {
    font-family: 'Manrope', sans-serif;
    font-size: 24px; font-weight: 700;
    color: ${T.onSurface}; margin-bottom: 6px;
  }
  .card-sub { font-size: 13px; color: ${T.onSurfaceVariant}; }

  /* ── Fields ── */
  .field { margin-bottom: 18px; }
  .field-label {
    display: block;
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: ${T.onSurfaceVariant};
    margin-bottom: 7px; margin-left: 2px;
    font-family: 'Inter', sans-serif;
  }
  .input-wrap { position: relative; }
  .input-icon {
    position: absolute; left: 14px; top: 50%;
    transform: translateY(-50%);
    color: ${T.outline}; display: flex; align-items: center;
    pointer-events: none; transition: color 0.25s, transform 0.25s;
  }
  .input-wrap:focus-within .input-icon {
    color: ${T.primary}; transform: translateY(-50%) scale(1.1);
  }
  .field input {
    width: 100%;
    padding: 15px 16px 15px 48px;
    background: ${T.surfaceContainerHighest};
    border: none; border-radius: 12px;
    font-size: 14px; font-family: 'Inter', sans-serif;
    color: ${T.onSurface}; outline: none;
    transition: all 0.25s; box-sizing: border-box;
  }
  .field input::placeholder { color: rgba(115,119,131,0.55); }
  .field input:focus {
    box-shadow: 0 0 0 2px ${T.primary};
    background: ${T.surfaceContainerLowest};
  }
  .field input:hover:not(:focus) { background: #d8dadc; }

  /* ── CTA buttons ── */
  .btn-register {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #00346f, #004a99);
    color: white; border: none; border-radius: 12px;
    font-family: 'Manrope', sans-serif;
    font-size: 15px; font-weight: 700;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(0,52,111,0.22);
    margin-bottom: 24px;
  }
  .btn-register:hover {
    transform: scale(1.01);
    box-shadow: 0 8px 24px rgba(0,52,111,0.28);
  }
  .btn-register:active { transform: scale(0.99); }
  .btn-register:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .divider {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px;
  }
  .divider::before, .divider::after {
    content: ''; flex: 1;
    height: 1px; background: rgba(194,198,211,0.30);
  }
  .divider span {
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.14em;
    color: ${T.outline};
    white-space: nowrap;
  }

  .btn-login-link {
    display: flex; align-items: center; justify-content: center; gap: 4px;
    background: none; border: none; cursor: pointer;
    color: ${T.primary}; font-size: 13px; font-weight: 700;
    font-family: 'Inter', sans-serif;
    text-decoration: none; transition: color 0.2s;
    width: 100%;
  }
  .btn-login-link .arrow { transition: transform 0.25s; }
  .btn-login-link:hover { color: #002d5e; }
  .btn-login-link:hover .arrow { transform: translateX(4px); }

  /* ── Error / success ── */
  .error-msg {
    background: #ffdad6; border-radius: 8px;
    padding: 10px 14px; color: #93000a;
    font-size: 13px; margin-bottom: 14px;
  }
  .success-msg {
    background: #d7f5e4; border-radius: 8px;
    padding: 10px 14px; color: #1d6a2e;
    font-size: 13px; margin-bottom: 14px; text-align: center;
  }

  /* ── Spinner ── */
  .spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: white; border-radius: 50%;
    animation: spin 0.55s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ─── SELECT ROLE PAGE ──────────────────────────────────── */
  .role-root {
    font-family: 'Inter', sans-serif;
    background: ${T.surface};
    color: ${T.onSurface};
    min-height: 100vh;
    display: flex; flex-direction: column;
    -webkit-font-smoothing: antialiased;
  }

  .role-nav {
    width: 100%; position: sticky; top: 0; z-index: 50;
    background: rgba(248,249,251,0.82);
    backdrop-filter: blur(20px);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }
  .role-nav-inner {
    max-width: 1400px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 32px;
  }
  .role-nav-left { display: flex; align-items: center; gap: 32px; }
  .role-nav-brand {
    font-family: 'Manrope', sans-serif;
    font-size: 22px; font-weight: 800;
    letter-spacing: -0.03em; color: #1e3a5f;
  }
  .role-nav-links { display: flex; gap: 20px; }
  .role-nav-links a {
    font-family: 'Manrope', sans-serif;
    font-size: 13px; font-weight: 600;
    color: #475569; text-decoration: none;
    letter-spacing: -0.01em; transition: color 0.2s;
  }
  .role-nav-links a:hover { color: ${T.primary}; }
  .role-nav-right { display: flex; gap: 4px; }
  .icon-btn {
    width: 38px; height: 38px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; cursor: pointer;
    color: #64748b; transition: background 0.2s;
  }
  .icon-btn:hover { background: rgba(203,213,225,0.50); }

  .role-main {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 48px 24px 40px;
    max-width: 1100px; margin: 0 auto; width: 100%;
  }

  /* Header */
  .role-header {
    text-align: center;
    margin-bottom: 56px;
  }
  .role-main-title {
    font-family: 'Manrope', sans-serif;
    font-size: 56px; font-weight: 800;
    letter-spacing: -0.03em;
    color: ${T.primary};
    margin-bottom: 16px;
    animation: slideUp 0.5s 0.05s both;
  }
  .role-sub {
    font-size: 17px;
    color: ${T.onSurfaceVariant};
    max-width: 560px; margin: 0 auto; line-height: 1.65;
    animation: slideUp 0.5s 0.15s both;
  }

  /* Role cards grid */
  .roles-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    width: 100%;
    margin-bottom: 56px;
  }

  .role-card {
    position: relative;
    display: flex; flex-direction: column; text-align: left;
    padding: 40px;
    background: ${T.surfaceContainerLowest};
    border-radius: 16px;
    border: 1px solid transparent;
    cursor: pointer;
    outline: none;
    transition: transform 0.45s ease-out, box-shadow 0.45s ease-out, border-color 0.3s, background 0.3s;
    overflow: hidden;
  }
  .role-card:hover {
    transform: translateY(-16px);
    background: ${T.surfaceContainerLowest};
    box-shadow: 0 40px 80px rgba(25,28,30,0.08);
    border-color: rgba(194,198,211,0.30);
  }
  .role-card.enterprise {
    border-color: rgba(0,52,111,0.05);
  }
  .role-card.enterprise:hover {
    box-shadow: 0 40px 80px rgba(0,52,111,0.12);
    border-color: rgba(0,52,111,0.20);
  }

  /* glow orb per card */
  .card-orb {
    position: absolute; right: -16px; bottom: -16px;
    width: 96px; height: 96px;
    border-radius: 50%; filter: blur(32px);
    pointer-events: none; transition: opacity 0.4s;
    opacity: 0;
  }
  .role-card:hover .card-orb { opacity: 1; }

  .role-icon-wrap {
    width: 64px; height: 64px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 28px;
    transition: transform 0.45s, background 0.3s;
  }
  .role-card:hover .role-icon-wrap {
    transform: scale(1.10);
  }
  /* Expert icon */
  .icon-expert { background: ${T.primaryContainer}; }
  .role-card:hover .icon-expert { background: ${T.primary}; }
  .icon-expert .msym { color: rgba(155,189,255,0.9); }
  .role-card:hover .icon-expert .msym { color: white; }

  /* Enterprise icon */
  .icon-enterprise { background: ${T.secondaryContainer}; }
  .role-card:hover .icon-enterprise { background: #48626e; }
  .icon-enterprise .msym { color: ${T.onSecondaryContainer}; }
  .role-card:hover .icon-enterprise .msym { color: white; }

  /* Foundation icon */
  .icon-foundation { background: ${T.tertiaryContainer}; }
  .role-card:hover .icon-foundation { background: ${T.tertiary}; }
  .icon-foundation .msym { color: ${T.onTertiaryContainer}; }
  .role-card:hover .icon-foundation .msym { color: white; }

  .role-card-title {
    font-family: 'Manrope', sans-serif;
    font-size: 22px; font-weight: 700;
    color: ${T.primary};
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .pulse-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: ${T.primary};
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.9); }
  }

  .role-card-desc {
    font-size: 14px; color: ${T.onSurfaceVariant};
    line-height: 1.65; flex: 1; margin-bottom: 24px;
  }

  .role-cta {
    display: flex; align-items: center;
    color: ${T.primary}; font-weight: 700; font-size: 14px;
    gap: 6px; transition: gap 0.3s;
    background: none; border: none; padding: 0; cursor: pointer;
    font-family: 'Inter', sans-serif;
  }
  .role-card:hover .role-cta { gap: 10px; }
  .role-cta .arrow { transition: transform 0.3s; }
  .role-card:hover .role-cta .arrow { transform: translateX(4px); }

  /* Staggered animations */
  .role-card:nth-child(1) { animation: slideUp 0.55s 0.10s both; }
  .role-card:nth-child(2) { animation: slideUp 0.55s 0.20s both; }
  .role-card:nth-child(3) { animation: slideUp 0.55s 0.30s both; }

  /* ── Network status banner ── */
  .network-banner {
    width: 100%;
    display: flex; align-items: center; gap: 48px;
    padding: 40px 48px;
    background: ${T.surfaceContainerLow};
    border-radius: 20px;
    position: relative; overflow: hidden;
    animation: slideUp 0.55s 0.40s both;
  }
  .banner-orb {
    position: absolute; top: -48px; right: -48px;
    width: 192px; height: 192px; border-radius: 50%;
    background: rgba(0,52,111,0.05); filter: blur(40px);
    pointer-events: none;
  }
  .banner-left { flex: 1; position: relative; z-index: 1; }
  .banner-tag {
    display: inline-block;
    padding: 4px 12px; border-radius: 999px;
    background: ${T.tertiaryFixed};
    color: ${T.onTertiaryFixed};
    font-size: 10px; font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.14em;
    margin-bottom: 14px;
  }
  .banner-title {
    font-family: 'Manrope', sans-serif;
    font-size: 28px; font-weight: 700;
    color: ${T.primary}; margin-bottom: 12px;
  }
  .banner-desc {
    font-size: 14px; color: ${T.onSurfaceVariant}; line-height: 1.6;
  }
  .banner-right {
    flex-shrink: 0; width: 320px;
    border-radius: 12px; overflow: hidden;
    background: ${T.surfaceContainerHighest};
    height: 180px;
    display: flex; align-items: center; justify-content: center;
  }
  .banner-globe {
    font-size: 64px; opacity: 0.3;
  }

  /* ── Footer ── */
  .footer {
    border-top: 1px solid #e2e8f0;
    background: #f8f9fb;
  }
  .footer-inner {
    max-width: 1400px; margin: 0 auto;
    display: flex; justify-content: space-between; align-items: center;
    padding: 28px 48px; flex-wrap: wrap; gap: 12px;
  }
  .footer-brand {
    font-family: 'Manrope', sans-serif;
    font-size: 17px; font-weight: 800;
    letter-spacing: -0.02em; color: #1e3a5f;
  }
  .footer-copy { font-size: 12px; color: #64748b; }
  .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
  .footer-links a {
    font-size: 13px; color: #64748b;
    text-decoration: none; transition: color 0.2s;
  }
  .footer-links a:hover { color: #2563eb; }

  /* ── Shared animations ── */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

/* ── Role data ─────────────────────────────────────────────── */
const ROLES = [
    {
        value: 'expert',
        iconClass: 'icon-expert',
        icon: 'psychology',
        title: 'Expert',
        desc: 'Offer your specialized skills and consult for top enterprises. Access premium projects and build your professional legacy.',
        cta: 'Enter Expert Portal',
        orbBg: 'rgba(0,74,153,0.05)',
        cardClass: '',
    },
    {
        value: 'enterprise',
        iconClass: 'icon-enterprise',
        icon: 'corporate_fare',
        title: 'Enterprise',
        pulse: true,
        desc: 'Find the best experts to scale your business operations. Deploy agile teams and solve complex organizational challenges.',
        cta: 'Enter Corporate Suite',
        orbBg: 'rgba(203,231,245,0.10)',
        cardClass: 'enterprise',
    },
    {
        value: 'foundation',
        iconClass: 'icon-foundation',
        icon: 'account_balance',
        title: 'Foundation',
        desc: 'The core infrastructure supporting network growth and standards. Manage governance, ethics, and ecosystem protocols.',
        cta: 'Manage Foundation',
        orbBg: 'rgba(0,83,101,0.10)',
        cardClass: '',
    },
]

function pwStrength(pw) {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
}
const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['', '#ba1a1a', '#b45309', '#1d6a2e', '#1d6a2e']

/* ════════════════════════════════════════════════════════════
   REGISTER PAGE  (step=1 → credentials, step=2 → role)
   ════════════════════════════════════════════════════════════ */
export default function RegisterPage() {
    const navigate = useNavigate()

    // step 1 = fill credentials, step 2 = pick role
    const [step, setStep] = useState(1)
    const [form, setForm] = useState({ account: '', password: '', confirm_password: '', email: '' })
    const [role, setRole] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [done, setDone] = useState(false)

    const strength = pwStrength(form.password)

    /* step 1 → step 2 */
    function handleNext(e) {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
        setStep(2)
    }

    /* final submit after role picked */
    async function handleRegister(selectedRole) {
        setError(''); setLoading(true)
        try {
            const res = await authApi.register({ ...form, role: selectedRole })
            if (res?.detail) throw new Error(res.detail)

            // auto-login
            const loginRes = await authApi.login(form.account, form.password)
            if (loginRes?.detail) throw new Error(loginRes.detail)

            setDone(true)
            setTimeout(() => {
                const r = loginRes.role
                navigate(r === 'expert' ? '/expert' : r === 'enterprise' ? '/enterprise' : r === 'foundation' ? '/foundation' : '/')
            }, 900)
        } catch (err) {
            setError(err.message || 'Registration failed.')
            setStep(1)   // go back so user can fix
        } finally {
            setLoading(false)
        }
    }

    /* ── STEP 1 — credentials form ─────────────────────────── */
    if (step === 1) return (
        <div className="reg-root">
            <style>{css}</style>

            {/* Navbar */}
            <header className="nav">
                <div className="nav-inner">
                    <div className="nav-brand-wrap">
                        <span className="msym msym-fill" style={{ fontSize: 28, color: '#00346f' }}>hub</span>
                        <span className="nav-brand">EEN</span>
                    </div>
                    <span className="nav-label">Enterprise Expert Network</span>
                </div>
            </header>

            {/* Main */}
            <main className="reg-main">
                <div id="blob1" className="bg-blob bg-blob-1" />
                <div id="blob2" className="bg-blob bg-blob-2" />

                <div className="content-grid">
                    {/* Left branding */}
                    <div className="brand-side">
                        <span className="brand-tag">Connectivity · Expertise · Growth</span>
                        <h2 className="brand-title">
                            Join the Global<br />
                            <span className="brand-title-accent">Knowledge Atrium.</span>
                        </h2>
                        <p className="brand-desc">
                            Access a structured architectural network of elite enterprise consultants.
                            Build your professional identity within a glass-walled ecosystem of innovation.
                        </p>
                        <div className="brand-stats">
                            <div>
                                <div className="brand-stat-num">2.4k+</div>
                                <div className="brand-stat-label">Active Experts</div>
                            </div>
                            <div>
                                <div className="brand-stat-num">150+</div>
                                <div className="brand-stat-label">Enterprise Roles</div>
                            </div>
                        </div>
                    </div>

                    {/* Right — glass card */}
                    <div className="glass-card">
                        <div className="card-heading">
                            <h3 className="card-title">Create Account</h3>
                            <p className="card-sub">Fill in your professional details to get started.</p>
                        </div>

                        {error && <div className="error-msg">{error}</div>}

                        <form onSubmit={handleNext}>
                            {/* Username */}
                            <div className="field">
                                <label className="field-label">Username</label>
                                <div className="input-wrap">
                                    <span className="input-icon msym">person</span>
                                    <input
                                        type="text" required placeholder="j.doe_expert"
                                        autoFocus
                                        value={form.account}
                                        onChange={e => setForm({ ...form, account: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="field">
                                <label className="field-label">Password</label>
                                <div className="input-wrap">
                                    <span className="input-icon msym">lock</span>
                                    <input
                                        type="password" required placeholder="••••••••"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                                {form.password && (
                                    <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? STRENGTH_COLOR[strength] : '#c2c6d3', transition: 'background 0.2s' }} />
                                        ))}
                                        <span style={{ fontSize: 10, color: STRENGTH_COLOR[strength], fontWeight: 700, marginLeft: 6, whiteSpace: 'nowrap' }}>{STRENGTH_LABEL[strength]}</span>
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div className="field">
                                <label className="field-label">Confirm Password</label>
                                <div className="input-wrap">
                                    <span className="input-icon msym">verified_user</span>
                                    <input
                                        type="password" required placeholder="••••••••"
                                        value={form.confirm_password}
                                        onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Email optional */}
                            <div className="field">
                                <label className="field-label">
                                    Email <span style={{ color: '#94a3b8', fontSize: 9, letterSpacing: 0, textTransform: 'none' }}>(optional)</span>
                                </label>
                                <div className="input-wrap">
                                    <span className="input-icon msym">mail</span>
                                    <input
                                        type="email" placeholder="you@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 24 }} />

                            <button type="submit" className="btn-register">
                                Continue — Select Your Role
                                <span className="msym" style={{ fontSize: 18 }}>arrow_forward</span>
                            </button>
                        </form>

                        <div className="divider"><span>Already a member?</span></div>

                        <button className="btn-login-link" onClick={() => navigate('/login')}>
                            Login to your account
                            <span className="msym arrow" style={{ fontSize: 16 }}>arrow_forward</span>
                        </button>
                    </div>
                </div>
            </main>

            <footer className="footer">
                <div className="footer-inner">
                    <span className="footer-brand">EEN</span>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Support</a>
                        <a href="#">Global Network</a>
                    </div>
                    <p className="footer-copy">© 2024 Enterprise Expert Network. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )

    /* ── STEP 2 — Select Role ──────────────────────────────── */
    return (
        <div className="role-root">
            <style>{css}</style>

            {/* Navbar */}
            <nav className="role-nav">
                <div className="role-nav-inner">
                    <div className="role-nav-left">
                        <span className="role-nav-brand">EEN</span>
                        <div className="role-nav-links">
                            <a href="#">Network</a>
                            <a href="#">Experts</a>
                            <a href="#">Roles</a>
                            <a href="#">About</a>
                        </div>
                    </div>
                    <div className="role-nav-right">
                        <button className="icon-btn"><span className="msym">notifications</span></button>
                        <button className="icon-btn"><span className="msym">account_circle</span></button>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <div className="role-main">

                    {/* Header */}
                    <div className="role-header">
                        <h1 className="role-main-title">Select Your Role</h1>
                        <p className="role-sub">
                            Choose the interface that matches your objective within the Enterprise Expert Network.
                            You can switch between roles later in your profile settings.
                        </p>
                    </div>

                    {error && <div className="error-msg" style={{ maxWidth: 900, width: '100%', marginBottom: 20 }}>{error}</div>}
                    {done && <div className="success-msg" style={{ maxWidth: 900, width: '100%', marginBottom: 20 }}>✓ Account created! Redirecting...</div>}

                    {/* Role cards */}
                    <div className="roles-grid">
                        {ROLES.map(r => (
                            <button
                                key={r.value}
                                className={`role-card ${r.cardClass}`}
                                onClick={() => !loading && handleRegister(r.value)}
                                disabled={loading}
                            >
                                {/* glow orb */}
                                <div className="card-orb" style={{ background: r.orbBg }} />

                                {/* icon */}
                                <div className={`role-icon-wrap ${r.iconClass}`}>
                                    <span className="msym msym-fill" style={{ fontSize: 28 }}>{r.icon}</span>
                                </div>

                                {/* title */}
                                <h2 className="role-card-title">
                                    {r.title}
                                    {r.pulse && <span className="pulse-dot" />}
                                </h2>

                                {/* desc */}
                                <p className="role-card-desc">{r.desc}</p>

                                {/* CTA */}
                                <span className="role-cta">
                                    {loading ? 'Creating account...' : r.cta}
                                    <span className="msym arrow" style={{ fontSize: 16 }}>arrow_forward</span>
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Network banner */}
                    <div className="network-banner">
                        <div className="banner-orb" />
                        <div className="banner-left">
                            <span className="banner-tag">Network Status</span>
                            <h3 className="banner-title">Bridging Global Talent with Enterprise Vision</h3>
                            <p className="banner-desc">
                                Your selection dictates the tools and dashboards available.
                                EEN ensures a seamless transition between roles for multi-tenant contributors.
                            </p>
                        </div>
                        <div className="banner-right">
                            <span className="msym" style={{ fontSize: 64, color: '#c2c6d3' }}>public</span>
                        </div>
                    </div>

                </div>
            </main>

            <footer className="footer">
                <div className="footer-inner">
                    <div>
                        <span className="footer-brand">EEN</span>
                        <span style={{ marginLeft: 16, fontSize: 12, color: '#64748b' }}>© 2024 Enterprise Expert Network. All rights reserved.</span>
                    </div>
                    <div className="footer-links">
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                        <a href="#">Contact Support</a>
                        <a href="#">Global Network</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
