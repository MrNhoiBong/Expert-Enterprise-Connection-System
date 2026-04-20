/* ═══════════════════════════════════════════════════════════
   EEN  ·  Midnight Glass Design System
   Tokens extracted from DESIGN.md + HTML screens
   ══════════════════════════════════════════════════════════ */

export const T = {
    /* Surface hierarchy (no-line rule) */
    surface: '#f8f9fb',
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f2f4f6',
    surfaceContainer: '#eceef0',
    surfaceContainerHigh: '#e6e8ea',
    surfaceContainerHighest: '#e0e3e5',

    /* Brand */
    primary: '#00346f',
    primaryContainer: '#004a99',
    primaryFixed: '#d7e2ff',
    primaryFixedDim: '#abc7ff',
    onPrimary: '#ffffff',

    /* Secondary */
    secondary: '#48626e',
    secondaryContainer: '#cbe7f5',
    onSecondaryContainer: '#4e6874',

    /* Tertiary */
    tertiary: '#003b48',
    tertiaryContainer: '#005365',
    tertiaryFixed: '#b4ebff',
    tertiaryFixedDim: '#3cd7ff',
    onTertiaryContainer: '#00cdf7',

    /* Text */
    onSurface: '#191c1e',
    onSurfaceVariant: '#424751',
    outline: '#737783',
    outlineVariant: '#c2c6d3',

    /* Error */
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',
}

/* ── Google Fonts ─────────────────────────────────────── */
export const FONTS_URL = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
`

/* ── Material Symbols helper ──────────────────────────── */
export const MSYM_CSS = `
.ms {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: 20px; line-height: 1;
  display: inline-block; user-select: none; vertical-align: middle;
}
.ms-fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.ms-sm   { font-size: 16px; }
.ms-lg   { font-size: 24px; }
.ms-xl   { font-size: 32px; }
`

/* ── Shared page layout CSS ───────────────────────────── */
export const LAYOUT_CSS = `
${FONTS_URL}
${MSYM_CSS}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Inter', sans-serif;
  background: ${T.surface};
  color: ${T.onSurface};
  -webkit-font-smoothing: antialiased;
}

/* ── Sidebar ─────────────────────────────────────────── */
.sidebar {
  position: fixed; left: 0; top: 0;
  width: 210px; height: 100vh;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex; flex-direction: column;
  padding: 20px 12px;
  z-index: 100;
  border-right: 1px solid rgba(0,52,111,0.06);
}
.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 0 8px 18px; margin-bottom: 8px;
  border-bottom: 1px solid rgba(0,52,111,0.06);
}
.sidebar-brand-icon {
  width: 36px; height: 36px; border-radius: 8px;
  background: ${T.primary};
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.sidebar-brand-name {
  font-family: 'Manrope', sans-serif;
  font-size: 16px; font-weight: 800;
  color: ${T.primary}; line-height: 1.1;
}
.sidebar-brand-sub {
  font-size: 8px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.12em;
  color: ${T.outline}; line-height: 1;
}
.sidebar-nav {
  flex: 1; display: flex; flex-direction: column;
  gap: 2px; overflow-y: auto;
}
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 10px; border-radius: 8px;
  cursor: pointer; text-decoration: none;
  background: none; border: none; width: 100%;
  text-align: left; font-family: 'Manrope', sans-serif;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  color: ${T.onSurfaceVariant};
  transition: all 0.2s;
}
.nav-item:hover { background: ${T.surfaceContainerLow}; color: ${T.primary}; }
.nav-item.active {
  background: ${T.surfaceContainerLow};
  color: ${T.primary};
}
.nav-item .ms { color: inherit; }

.sidebar-footer { padding-top: 8px; border-top: 1px solid rgba(0,52,111,0.06); }
.sidebar-user {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 8px; border-radius: 8px;
  cursor: default;
}
.user-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: ${T.primary};
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: white; flex-shrink: 0;
}
.user-name { font-size: 12px; font-weight: 700; color: ${T.onSurface}; }
.user-role { font-size: 10px; color: ${T.outline}; }

/* ── Top bar ─────────────────────────────────────────── */
.topbar {
  position: fixed; top: 0; left: 210px; right: 0;
  height: 64px; z-index: 90;
  background: rgba(248,249,251,0.82);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid rgba(0,52,111,0.06);
}
.topbar-search {
  position: relative; width: 200px;
}
.topbar-search .ms {
  position: absolute; left: 10px; top: 50%;
  transform: translateY(-50%); color: ${T.outline};
  font-size: 16px; pointer-events: none;
}
.topbar-search input {
  width: 100%; padding: 8px 12px 8px 34px;
  background: ${T.surfaceContainer}; border: none;
  border-radius: 8px; font-size: 13px;
  font-family: 'Inter', sans-serif; color: ${T.onSurface};
  outline: none; transition: all 0.2s;
}
.topbar-search input:focus { box-shadow: 0 0 0 2px rgba(0,52,111,0.15); }
.topbar-search input::placeholder { color: ${T.outline}; }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-icon-btn {
  position: relative; width: 36px; height: 36px;
  border-radius: 50%; border: none; background: none;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: ${T.onSurfaceVariant}; transition: background 0.15s;
}
.topbar-icon-btn:hover { background: ${T.surfaceContainerLow}; }
.notif-dot {
  position: absolute; top: 6px; right: 6px;
  width: 7px; height: 7px; border-radius: 50%;
  background: ${T.error}; border: 2px solid ${T.surface};
}
.topbar-divider { width: 1px; height: 28px; background: ${T.outlineVariant}; opacity: 0.5; }
.topbar-user {
  display: flex; align-items: center; gap: 8px; cursor: default;
}
.topbar-user-info { text-align: right; }
.topbar-user-name { font-size: 13px; font-weight: 700; color: ${T.primary}; }
.topbar-user-role { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${T.outline}; }

/* ── Page shell ──────────────────────────────────────── */
.page-shell {
  background: ${T.surface};
  min-height: 100vh;
}
.page-content {
  margin-left: 210px;
  padding-top: 64px;
}
.page-inner {
  padding: 40px 40px 80px;
  max-width: 1200px;
}

/* ── Page hero ───────────────────────────────────────── */
.page-hero { margin-bottom: 40px; }
.page-title {
  font-family: 'Manrope', sans-serif;
  font-size: 48px; font-weight: 800;
  letter-spacing: -0.03em; color: ${T.primary};
  line-height: 1.05; margin-bottom: 10px;
}
.page-subtitle {
  font-size: 16px; color: ${T.onSurfaceVariant};
  max-width: 600px; line-height: 1.6;
}

/* ── Cards ───────────────────────────────────────────── */
.card {
  background: ${T.surfaceContainerLowest};
  border-radius: 16px; padding: 32px;
  transition: transform 0.45s ease-out, box-shadow 0.45s ease-out;
}
.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: 0 40px 80px rgba(25,28,30,0.08);
}
.card-sm  { padding: 20px 24px; border-radius: 12px; }
.card-lg  { padding: 40px; border-radius: 20px; }
.card-dark {
  background: ${T.primary}; color: white;
  border-radius: 16px; padding: 32px;
}

/* ── Tags / badges ───────────────────────────────────── */
.tag {
  display: inline-block;
  padding: 3px 10px; border-radius: 4px;
  font-size: 10px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.12em;
  font-family: 'Inter', sans-serif;
}
.tag-teal  { background: ${T.tertiaryFixed}; color: ${T.tertiary}; }
.tag-blue  { background: ${T.primaryFixed};  color: ${T.primary}; }
.tag-slate { background: ${T.surfaceContainerHigh}; color: ${T.onSurfaceVariant}; }
.tag-green { background: #d1fae5; color: #065f46; }
.tag-amber { background: #fef3c7; color: #92400e; }
.tag-red   { background: ${T.errorContainer}; color: ${T.onErrorContainer}; }

/* ── Buttons ─────────────────────────────────────────── */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px; border-radius: 8px;
  font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 700;
  cursor: pointer; border: none; transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary {
  background: ${T.primary}; color: white;
  box-shadow: 0 4px 12px rgba(0,52,111,0.20);
}
.btn-primary:hover { background: ${T.primaryContainer}; box-shadow: 0 6px 20px rgba(0,52,111,0.28); }
.btn-secondary {
  background: ${T.surfaceContainerLowest}; color: ${T.primary};
  border: 1px solid ${T.outlineVariant};
}
.btn-secondary:hover { background: ${T.surfaceContainerLow}; }
.btn-ghost {
  background: transparent; color: ${T.primary};
  padding: 0;
}
.btn-ghost:hover { opacity: 0.7; }
.btn .ms { transition: transform 0.25s; }
.btn:hover .ms { transform: translateX(3px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Inputs ──────────────────────────────────────────── */
.input-field {
  width: 100%; padding: 12px 14px;
  background: ${T.surfaceContainerHighest}; border: none;
  border-radius: 8px; font-size: 13px;
  font-family: 'Inter', sans-serif; color: ${T.onSurface};
  outline: none; transition: all 0.2s; box-sizing: border-box;
}
.input-field:focus { box-shadow: 0 0 0 2px ${T.primary}; background: ${T.surfaceContainerLowest}; }
.input-field::placeholder { color: rgba(115,119,131,0.5); }
.input-field:disabled { opacity: 0.6; cursor: not-allowed; }
.input-label {
  display: block; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.14em;
  color: ${T.onSurfaceVariant}; margin-bottom: 6px;
  font-family: 'Inter', sans-serif;
}
.input-group { margin-bottom: 16px; }

/* ── Progress bar ────────────────────────────────────── */
.progress-track {
  height: 5px; background: ${T.surfaceContainerHigh};
  border-radius: 3px; overflow: hidden;
}
.progress-fill {
  height: 100%; background: ${T.primary}; border-radius: 3px;
  transition: width 0.5s ease;
}

/* ── Animations ──────────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.fade-up { animation: fadeUp 0.5s ease-out both; }
.fade-up-1 { animation-delay: 0.05s; }
.fade-up-2 { animation-delay: 0.10s; }
.fade-up-3 { animation-delay: 0.15s; }
.fade-up-4 { animation-delay: 0.20s; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(0,52,111,0.15);
  border-top-color: ${T.primary}; border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ── Modal ───────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(25,28,30,0.50);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 24px 20px;
  overflow-y: auto;
}
.modal {
  background: ${T.surfaceContainerLowest};
  border-radius: 20px; padding: 36px;
  width: 100%; max-width: 520px;
  box-shadow: 0 32px 64px rgba(0,52,111,0.14);
  animation: fadeUp 0.3s ease-out;
  flex-shrink: 0;
}
.modal-title {
  font-family: 'Manrope', sans-serif;
  font-size: 22px; font-weight: 700;
  color: ${T.primary}; margin-bottom: 24px;
}
.modal-actions { display: flex; gap: 12px; margin-top: 24px; }
.btn-cancel {
  flex: 1; padding: 12px; background: transparent;
  border: 1px solid ${T.outlineVariant}; border-radius: 8px;
  cursor: pointer; font-size: 13px; font-weight: 600;
  font-family: 'Inter', sans-serif; color: ${T.onSurfaceVariant};
  transition: background 0.15s;
}
.btn-cancel:hover { background: ${T.surfaceContainerLow}; }

/* ── Misc utils ──────────────────────────────────────── */
.divider { height: 1px; background: rgba(0,52,111,0.06); margin: 20px 0; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; }
.flex-row { display: flex; align-items: center; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.empty-state { text-align: center; padding: 60px 0; color: ${T.outline}; }
.empty-state .ms { font-size: 48px; display: block; margin-bottom: 12px; opacity: 0.4; }
.empty-state p { font-size: 15px; color: ${T.onSurfaceVariant}; margin-bottom: 16px; }
`