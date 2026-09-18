import { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from '../components/AuthProvider.jsx';
import { useI18n } from '../components/I18nProvider.jsx';
import { LANGS } from '../lib/i18n.js';
import FeasTab from '../components/FeasTab.jsx';
import AdvisorTab from '../components/AdvisorTab.jsx';
import SchemeTab from '../components/SchemeTab.jsx';
import LedgerTab from '../components/LedgerTab.jsx';
import AuthModal from '../components/AuthModal.jsx';
import '../styles/style.css';

const TABS = [
  { id: 'tab-feas', key: 'navFeasibility', icon: '🎯' },
  { id: 'tab-advice', key: 'navAdvisor', icon: '💬' },
  { id: 'tab-scheme', key: 'navSchemes', icon: '📋' },
  { id: 'tab-ledger', key: 'navLedger', icon: '📒' },
];

function WorkspaceShell() {
  const { lang, setLang, tr } = useI18n();
  const { user, logout } = useAuth();
  const innerRef = useRef(null);
  const appRef = useRef(null);
  const [tab, setTab] = useState('tab-feas');
  const [feas, setFeas] = useState(null);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const fitToWindow = () => {
      const inner = innerRef.current, app = appRef.current;
      if (!inner || !app) return;
      const w = app.offsetWidth, h = app.offsetHeight;
      const scale = Math.min(window.innerWidth / Math.max(w, 1), window.innerHeight / Math.max(h, 1), 1);
      inner.style.width = w + 'px';
      inner.style.height = h + 'px';
      inner.style.transform = 'scale(' + scale + ')';
    };
    const raf = () => requestAnimationFrame(fitToWindow);
    window.addEventListener('resize', fitToWindow, { passive: true });
    window.addEventListener('orientationchange', fitToWindow);
    let observer = null;
    if (window.MutationObserver && appRef.current) {
      observer = new MutationObserver(fitToWindow);
      observer.observe(appRef.current, { childList: true, subtree: true, attributes: true });
    }
    raf();
    return () => {
      window.removeEventListener('resize', fitToWindow);
      window.removeEventListener('orientationchange', fitToWindow);
      if (observer) observer.disconnect();
    };
  }, []);

  const openAuth = (mode) => { setAuthMode(mode); setAuthOpen(true); };

  return (
    <div className="fit">
      <div className="fit-inner" ref={innerRef}>
        <div className="app" ref={appRef}>
          <header>
            <div className="brand-row">
              <a className="home-link" href="#/" title="Back to home">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </a>
              <div className="brand-mark">RB</div>
              <div className="brand-text">
                <h1>RuralBiz AI</h1>
                <p>Hyper-Local Business &amp; Finance Assistant</p>
              </div>
            </div>
            <div className="header-right">
              {user ? (
                <div className="user-chip">
                  <span className="user-avatar">{(user.name || 'G')[0].toUpperCase()}</span>
                  <span className="user-name">{user.name}</span>
                  <button className="auth-logout" title="Log out" onClick={() => logout()} aria-label="Log out">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  </button>
                </div>
              ) : (
                <div id="auth-loggedout">
                  <button className="auth-btn" onClick={() => openAuth('login')}>{tr('login')}</button>
                  <button className="auth-btn solid" onClick={() => openAuth('signup')}>{tr('signup')}</button>
                </div>
              )}
            </div>
          </header>

          <div className="tagline-bar">{tr('tagline')}</div>

          <div className="lang-bar">
            {LANGS.map((l) => (
              <button key={l.code} className={'lang-btn' + (l.code === lang ? ' active' : '')}
                onClick={() => setLang(l.code)}>{l.label}</button>
            ))}
          </div>

          <main>
            {tab === 'tab-feas' && <FeasTab onFeas={setFeas} />}
            {tab === 'tab-advice' && <AdvisorTab feas={feas} ledgerSummary={ledgerSummary} />}
            {tab === 'tab-scheme' && <SchemeTab />}
            {tab === 'tab-ledger' && <LedgerTab feasible={feas} onSummary={setLedgerSummary} />}
          </main>

          <nav className="tabs">
            {TABS.map((t) => (
              <button key={t.id} className={'tab-btn' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
                <span className="icon">{t.icon}</span><span>{tr(t.key)}</span>
              </button>
            ))}
          </nav>

          <AuthModal show={authOpen} mode={authMode} onMode={setAuthMode} onClose={() => setAuthOpen(false)} />
        </div>
      </div>
    </div>
  );
}

export default function Workspace() {
  return (
    <AuthProvider>
      <WorkspaceShell />
    </AuthProvider>
  );
}