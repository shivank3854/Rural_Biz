import { useRef, useState } from 'react';
import { useI18n } from '../components/I18nProvider.jsx';
import { api } from '../lib/api.js';
import { startListening, speak } from '../lib/speech.js';

function buildContext(feas, ledger) {
  return {
    bizId: feas && feas.biz ? feas.biz.id : null,
    bizName: null,
    bizLoc: feas ? feas.loc : null,
    feasScore: feas ? feas.feasScore : null,
    schemeName: feas ? feas.schemeName : null,
    workingCapital: feas ? feas.workingCapital : null,
    revenue: ledger ? ledger.revenue : 0,
    cost: ledger ? ledger.cost : 0,
    profit: ledger ? ledger.profit : 0,
    margin: ledger ? ledger.margin : null,
    loanScore: ledger ? ledger.score : null,
  };
}

export default function AdvisorTab({ feas, ledgerSummary }) {
  const { lang, tr } = useI18n();
  const logRef = useRef(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastBot, setLastBot] = useState('');

  const addMsg = (role, text, loading) => {
    setMsgs((m) => {
      const next = loading ? [...m, { role, text, loading: true }] : [...m, { role, text }];
      return next;
    });
  };

  const stripLoading = () => {
    setMsgs((m) => m.filter((x) => !x.loading));
  };

  const send = async () => {
    const q = input.trim();
    if (!q || busy) return;
    setInput('');
    addMsg('user', q);
    setBusy(true);

    try {
      const d = await api.chat(q, buildContext(feas, ledgerSummary));
      addMsg('bot', d.reply);
      setLastBot(d.reply);
    } catch (e) {
      const fallback = 'The advisory engine is not reachable right now. Start the server (npm start) and ask again.';
      addMsg('bot', fallback);
      setLastBot(fallback);
    } finally {
      stripLoading();
      setBusy(false);
      setTimeout(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      }, 30);
    }
  };

  return (
    <section className="tab-panel" id="tab-advice">
      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>{tr('advisorCardTitle')}</h2>
        <p className="note">{tr('advisorHintNote')}</p>
        <div className="chat-log" id="chat-log" ref={logRef}>
          {msgs.length === 0 && <div className="msg bot" id="chat-intro">{tr('chatIntro')}</div>}
          {msgs.map((m, i) => (
            <div key={i} className={'msg ' + m.role + (m.loading ? ' loading' : '')}>{m.text}</div>
          ))}
        </div>
        <div className="chat-input-row">
          <textarea id="chat-input" value={input} placeholder={tr('chatPlaceholder')}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
          <button type="button" className="mic-btn" title="Speak"
            onClick={() => {
              const rec = startListening((t) => setInput((v) => (v ? v + ' ' + t : t)), null);
              if (rec) rec.start();
            }}>🎤</button>
          <button className="btn-ghost" id="chat-send" disabled={busy} onClick={send}>{busy ? '…' : tr('askBtn')}</button>
        </div>
        <div className="chat-controls">
          <button className="listen-btn" id="listen-last"
            onClick={() => { if (lastBot) speak(lastBot, lang); }}>
            🔊 <span>{tr('listenBtn')}</span>
          </button>
        </div>
        <p className="note" id="advisor-footer-note">{tr('advisorFooterNote')}</p>
      </div>
    </section>
  );
}