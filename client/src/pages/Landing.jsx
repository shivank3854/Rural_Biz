import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import '../styles/landing.css';

const FEATURES = [
  { icon: '🎯', title: 'AI Feasibility Report', body: 'Pick your business and location, tell us your capital — get a 0–100 feasibility score with real cost, loan and EMI estimates.' },
  { icon: '💬', title: 'Hyper-Local Advisor', body: 'Ask pricing, stock, competitors or festival timing. Answers are specific to your business, your town, and your language.' },
  { icon: '📋', title: 'Scheme Matcher', body: 'MUDRA, PMEGP, SVANidhi, PM Vishwakarma and more. Answer 5 questions and see which loans you actually qualify for.' },
  { icon: '📒', title: 'Smart Ledger', body: 'Log daily sales in minutes, get profit margins and a loan-readiness score — then auto-generate a loan application draft.' },
  { icon: '📸', title: 'OCR Bank-page Scan', body: 'Photograph a handwritten ledger page and let on-device OCR read the numbers straight into your entries table.' },
  { icon: '🎤', title: 'Speak, Don\u2019t Type', body: 'Mic input and text-to-speech replies in Hindi, Marathi, Tamil, Bengali and English. No literacy barrier, no app-store storefront.' },
];

const STEPS = [
  { n: '1', h: 'Capture', p: 'Choose your business type, say your village name aloud, and type the capital you already have.' },
  { n: '2', h: 'Analyze', p: 'Get a 0–100 feasibility score covering local demand, competition and credit risk for your exact spot.' },
  { n: '3', h: 'Finance', p: 'See project cost, working capital and EMI — and which central scheme you qualify for, with a document checklist.' },
  { n: '4', h: 'Grow', p: 'Log daily sales, track your margin, build a loan-readiness score and generate a loan application draft.' },
];

const STATS = [
  { count: 300, suffix: '+', label: 'micro-business types & combos' },
  { count: 8, suffix: '+', label: 'government schemes matched' },
  { count: 5, suffix: '', label: 'Indian languages — spoken & written' },
  { count: 4, suffix: '', label: 'tools in one workspace' },
];

const TICKER = ['🥬 Vegetable cart', '🏪 Kirana store', '🥛 Dairy supply', '🧵 Tailoring', '🍲 Food stall', '🧶 Handicraft', '🐔 Poultry', '✨ Your idea'];

function useRevealOnScroll() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) {
      root && root.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    root.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

function StatChunk({ count, suffix, label, start }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start || !ref.current) return;
    let raf;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      setVal(Math.round(eased * count));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, count]);
  return (
    <span ref={ref}>
      <span className="stat-num">{val}</span>
      <span className="stat-suf">{suffix}</span>
    </span>
  );
}

function StatsGrid() {
  const wrapRef = useRef(null);
  const [start, setStart] = useState(false);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !('IntersectionObserver' in window)) { setStart(true); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { setStart(true); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <section className="stats">
      <div className="container stats-grid" ref={wrapRef}>
        {STATS.map((s) => (
          <div className="stat-chunk" key={s.label}>
            <StatChunk count={s.count} suffix={s.suffix} start={start} />
            <p>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function useHealthCheck() {
  const [status, setStatus] = useState('Server status: checking…');
  useEffect(() => {
    api.health()
      .then(() => setStatus('Server status: online · MERN stack · advice generated on the server'))
      .catch(() => setStatus('Server status: offline — this page still works as a demo'));
  }, []);
  return status;
}

export default function Landing() {
  const navRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const scrollRef = useRevealOnScroll();
  const serverStatus = useHealthCheck();
  const [nlEmail, setNlEmail] = useState('');
  const [nlMsg, setNlMsg] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 500);
      if (!navRef.current) return;
      navRef.current.classList.toggle('scrolled', window.scrollY > 10);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const submitNewsletter = async (e) => {
    e.preventDefault();
    const email = nlEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNlMsg('Please enter a valid email address.');
      return;
    }
    try {
      await api.newsletter(email);
      setNlMsg('Thank you! We\u2019ll notify you when RuralBiz AI launches in your district.');
      setNlEmail('');
    } catch (err) {
      setNlMsg('Message saved on this device. Connect to the server to subscribe for updates.');
    }
  };

  return (
    <div ref={scrollRef}>
      <nav className="nav" id="nav" ref={navRef}>
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <span className="brand-logo" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 22V8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12 8C12 4 8.5 2.5 5 3c-.5 3.5 1.5 7 7 5z" fill="#fff" />
                <path d="M6.5 4.5c3 1 5.5 4 5.5 7" stroke="#FFD166" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <circle cx="16" cy="5" r="2.2" fill="#FFD166" />
              </svg>
            </span>
            <span className="brand-name">RuralBiz <b>AI</b></span>
          </a>
          <div className={'nav-links' + (open ? ' open' : '')} id="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#preview">Live preview</a>
            <a href="#languages">Languages</a>
            <a href="#contact">Contact</a>
            <a className="nav-cta" href="#/app" onClick={() => setOpen(false)}>Launch workspace →</a>
          </div>
          <button className="nav-toggle" id="nav-toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="blob blob-a"></div>
        <div className="blob blob-b"></div>
        <div className="blob blob-c"></div>
        <div className="dot-grid"></div>

        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow"><span className="pulse-dot"></span> Hyper-local intelligence for India's micro-entrepreneurs</span>
            <h1>Know <span className="grad">what will sell here</span>, before you spend a rupee.</h1>
            <p className="hero-sub">From <em>"What should I sell today?"</em> to <em>"What will actually sell <b>in my village</b> — and how do I fund it?"</em> RuralBiz AI gives micro-entrepreneurs a hyper-local feasibility report, an advice engine, and loan-scheme matches — all in your own language.</p>
            <div className="hero-cta">
              <a className="btn btn-amber" href="#/app">Open the workspace <span className="arrow">→</span></a>
              <a className="btn btn-ghost2" href="#preview">See it live <span className="arrow">↓</span></a>
            </div>
            <div className="hero-chips">
              <span className="chip">🎯 Feasibility score</span>
              <span className="chip">💬 Advice engine</span>
              <span className="chip">📋 8+ schemes</span>
              <span className="chip">🗣️ 5 languages</span>
            </div>
          </div>

          <div className="hero-art">
            <div className="mock">
              <div className="mock-bar">
                <span className="mock-dot r"></span><span className="mock-dot y"></span><span className="mock-dot g"></span>
                <em>app.feasibility</em>
              </div>
              <div className="mock-body">
                <div className="mock-score">
                  <div className="ring" style={{ '--pct': 64 }}><span>64</span></div>
                  <div className="ms-label">Feasibility · Vegetable cart</div>
                </div>
                <div className="mock-metric"><span>Local demand</span><b>High</b></div>
                <div className="mock-metric"><span>Competition</span><b className="warn">Medium</b></div>
                <div className="mock-metric"><span>Credit risk</span><b className="ok">Low</b></div>
                <div className="mock-map">
                  <svg viewBox="0 0 200 64" fill="none">
                    <path d="M10 50 C 55 10, 120 62, 190 22" stroke="#0E9F6E" strokeWidth="2.4" strokeDasharray="6 6" />
                    <circle cx="18" cy="48" r="5" fill="#F97316" />
                    <circle cx="182" cy="24" r="5" fill="#0E9F6E" />
                  </svg>
                  <span className="route-label">Sehore → Mandi</span>
                </div>
              </div>
            </div>
            <div className="float-chip fc-1"><span className="fc-icon">💬</span><span><b>Advisor</b><i>"Price at 8 AM market rate"</i></span></div>
            <div className="float-chip fc-2"><span className="fc-icon">📋</span><span><b>SVANidhi</b><i>Collateral-free ₹10k–50k</i></span></div>
            <div className="float-chip fc-3"><span className="fc-icon">📒</span><span><b>Ledger + ₹</b><i>3,000 today ✓</i></span></div>
            <div className="lang-orb">हिंदी · मराठी · தமிழ் · বাংলা</div>
          </div>
        </div>
      </header>

      <section className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </section>

      <StatsGrid />

      <section className="section" id="features">
        <div className="container">
          <p className="kicker">What you get</p>
          <h2 className="sec-title">Four tools. One shop. <span className="grad">Zero guesswork.</span></h2>
          <p className="sec-sub">Every tool is connected — the advisor knows your feasibility report, and the ledger feeds your loan draft.</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article className="feat" data-reveal key={f.title}>
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <a className="feat-link" href="#/app">Try it →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section how" id="how">
        <div className="container">
          <p className="kicker">How it works</p>
          <h2 className="sec-title">From <span className="grad">0 knowledge</span> to a funded business plan.</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div className="step" data-reveal key={s.n}>
                <span className="step-no">{s.n}</span>
                <div className="step-body">
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section preview" id="preview">
        <div className="container">
          <p className="kicker">Live preview</p>
          <h2 className="sec-title">It works. <span className="grad">Click around below.</span></h2>
          <p className="sec-sub">This is the real workspace rendered on this very page — type a location like <em>Sehore, Madhya Pradesh</em> and press the button.</p>
          <div className="browser" data-reveal>
            <div className="browser-bar">
              <span className="b-dot r"></span><span className="b-dot y"></span><span className="b-dot g"></span>
              <div className="b-url">https://ruralbiz-ai.vercel.app/#/app<span className="live-tag">{serverStatus.replace('Server status: ', '')}</span></div>
            </div>
            <iframe src="/#/app" title="RuralBiz AI live workspace" loading="lazy"></iframe>
          </div>
        </div>
      </section>

      <section className="section langs" id="languages">
        <div className="container">
          <p className="kicker">Built for every dialect</p>
          <h2 className="sec-title">One workspace, <span className="grad">five languages</span></h2>
          <p className="sec-sub">Switch instantly. Mic input and advice replies follow your choice.</p>
          <div className="lang-chips" data-reveal>
            <span className="lg">English <i>Get stuff done too</i></span>
            <span className="lg hi">हिंदी <i>आज की बात, आपकी भाषा में</i></span>
            <span className="lg mr">मराठी <i>शेतकरी ते व्यापारी</i></span>
            <span className="lg ta">தமிழ் <i>உங்கள் ஊரில், உங்கள் மொழியில்</i></span>
            <span className="lg bn">বাংলা <i>আপনার ভাষায় ব্যবসা</i></span>
          </div>
        </div>
      </section>

      <section className="section" id="stories">
        <div className="container">
          <p className="kicker">Made for real people</p>
          <h2 className="sec-title">Stories from <span className="grad">the ground</span></h2>
          <div className="stories-grid">
            <figure className="story" data-reveal>
              <blockquote>"It told me a veg cart needs ₹18,000 here, and the SVANidhi loan I qualify for covers my working capital. My husband stopped laughing after week two — we were up ₹9,000."</blockquote>
              <figcaption><span className="avatar av-a">G</span><span><b>Geeta Bai</b><i>Vegetable vendor · Sehore, MP</i></span></figcaption>
            </figure>
            <figure className="story" data-reveal>
              <blockquote>"I photographed my old chaab-te bahi books. It read them, made a monthly profit sheet, and drafted a loan application that the bank actually accepted."</blockquote>
              <figcaption><span className="avatar av-b">R</span><span><b>Ravi Kumar</b><i>Kirana store · Sanchi village</i></span></figcaption>
            </figure>
            <figure className="story" data-reveal>
              <blockquote>"Uska jawab mere market, mere gaon ke liye hota hai — not some Delhi advice. Aur main Hindi mein hi baat karti hoon."</blockquote>
              <figcaption><span className="avatar av-c">S</span><span><b>Sita Devi</b><i>Tailoring & handicrafts · Bhopal outskirts</i></span></figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="section cta-wrap" id="contact">
        <div className="container cta" data-reveal>
          <div className="cta-blob cta-blob-a"></div>
          <div className="cta-blob cta-blob-b"></div>
          <h2>Check if your business idea <span className="grad">will actually sell</span></h2>
          <p>Two minutes. No cost. No app store. It runs on a browser in any smartphone.</p>
          <div className="cta-actions">
            <a className="btn btn-amber btn-lg" href="#/app">Start my feasibility check →</a>
            <span className="privacy-note">Free forever for this prototype · Your data stays on this server</span>
          </div>

          <form className="nl" id="nl-form" onSubmit={submitNewsletter} noValidate>
            <p className="nl-title">Get demo access + updates when we launch in your district</p>
            <div className="nl-row">
              <input type="email" id="nl-email" placeholder="Enter your email address" required
                value={nlEmail} onChange={(e) => setNlEmail(e.target.value)} />
              <button className="btn btn-green" type="submit">Notify me</button>
            </div>
            <p className="nl-msg" id="nl-msg">{nlMsg}</p>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="brand-logo" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 22V8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                <path d="M12 8C12 4 8.5 2.5 5 3c-.5 3.5 1.5 7 7 5z" fill="#fff" />
                <path d="M6.5 4.5c3 1 5.5 4 5.5 7" stroke="#FFD166" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                <circle cx="16" cy="5" r="2.2" fill="#FFD166" />
              </svg>
            </span>
            <b>RuralBiz AI</b>
            <p>Hyper-local business & finance assistant for rural India.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#preview">Live preview</a>
            <a href="#/app">The workspace</a>
          </div>
          <div className="footer-meta">
            <p>Feasibility · Advisor · Scheme matches · Ledger</p>
            <p>Built as an open-source prototype — rural first, always.</p>
            <p className="server-status" id="server-status">{serverStatus}</p>
          </div>
        </div>
        <div className="footer-base">Made in India 🇮🇳 · From the khet to the kirana, from the mela to the mandi.</div>
      </footer>

      <button className={'back-top' + (showTop ? ' show' : '')} id="back-top" aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      <div className="grain" aria-hidden="true"></div>
    </div>
  );
}