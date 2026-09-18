import { useState } from 'react';
import { useI18n } from '../components/I18nProvider.jsx';
import { api } from '../lib/api.js';
import { BIZ_TYPES } from '../lib/biz.js';
import { startListening, speak } from '../lib/speech.js';

const num = (n) => Number(n || 0).toLocaleString('en-IN');

function VoiceButton({ onResult }) {
  const [listening, setListening] = useState(false);
  const [unsupported, setUnsupported] = useState(false);
  return (
    <button
      type="button"
      className={'mic-btn' + (listening ? ' listening' : '')}
      title="Speak"
      onClick={() => {
        if (unsupported) return;
        const rec = startListening(onResult, () => setListening(false));
        if (!rec) { setUnsupported(true); return; }
        setListening(true);
        rec.start();
      }}
    >🎤</button>
  );
}

export default function FeasTab({ onFeas }) {
  const { lang, tr } = useI18n();
  const [bizId, setBizId] = useState('veg_cart');
  const [loc, setLoc] = useState('');
  const [capital, setCapital] = useState('');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState(null);

  const run = async () => {
    setErr('');
    setRunning(true);
    try {
      const res = await api.feasibility(bizId, loc, Number(capital) || 0);
      setResult(res);
      setDone(true);
      onFeas(res);
    } catch (e) {
      setErr(e.code === 'network_unavailable'
        ? 'Server not reachable — start `npm start` on your machine, or reload.'
        : 'Something went wrong. Please try again.');
    } finally {
      setRunning(false);
    }
  };

  const listenReport = () => {
    if (!result) return;
    const biz = result.biz;
    const summary = `${biz[lang] || biz.en}. ${tr('creditRiskLabel')}: ${result.creditRisk}. ${result.steps.join('. ')}`;
    speak(summary, lang);
  };

  const verdictBg = result
    ? result.feasScore >= 60 ? 'var(--primary)' : result.feasScore >= 40 ? 'var(--accent)' : 'var(--bad)'
    : 'var(--primary)';

  return (
    <section className="tab-panel active" id="tab-feas">
      <div className="journey">
        <div className="step active">{tr('step1')}</div>
        <div className={'step' + (done ? ' active' : '')} id="j2">{tr('step2')}</div>
        <div className={'step' + (done ? ' active' : '')} id="j3">{tr('step3')}</div>
        <div className={'step' + (done ? ' active' : '')} id="j4">{tr('step4')}</div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>{tr('feasCardTitle')}</h2>

        <label>{tr('bizTypeLabel')}</label>
        <div className="card-grid">
          {BIZ_TYPES.map((b) => (
            <div
              key={b.id}
              className={'pick-card' + (b.id === bizId ? ' selected' : '')}
              onClick={() => setBizId(b.id)}
            >
              <span className="emoji">{b.emoji}</span>{b[lang] || b.en}
            </div>
          ))}
        </div>

        <label>{tr('locationLabel')}</label>
        <div className="field-with-mic">
          <input id="f-loc" value={loc} onChange={(e) => setLoc(e.target.value)}
            placeholder={tr('locationPlaceholder')} />
          <VoiceButton onResult={(t) => setLoc((v) => (v ? v + ' ' + t : t))} />
        </div>

        <label>{tr('capitalLabel')}</label>
        <input type="number" value={capital} onChange={(e) => setCapital(e.target.value)}
          placeholder={tr('capitalPlaceholder')} />

        <button className="btn-primary" id="f-run" disabled={running} onClick={run}>
          {running ? '…' : tr('generateBtn')}
        </button>
        {err && <p className="why" style={{ color: 'var(--bad)' }}>{err}</p>}
      </div>

      <div className="card" style={{ display: result ? 'block' : 'none' }}>
        {result && (
          <>
            <div className="feas-header">
              <div>
                <h3 style={{ fontSize: '1rem' }}>
                  {(result.biz[lang] || result.biz.en)} — {result.loc}
                </h3>
                <p className="note">{tr('illustrativeNote')}</p>
              </div>
              <span className="feas-badge" style={{ background: verdictBg }}>{tr(result.verdictKey)}</span>
            </div>

            <div className="feas-score-ring" id="score-ring" style={{ '--pct': result.feasScore }}>
              <div className="feas-score-inner">
                <div className="n">{result.feasScore}</div>
                <div className="d">/ 100</div>
              </div>
            </div>

            <div className="metric-row"><span>{tr('demandLabel')}</span><span className={'v ' + result.biz.demand}>{result.biz.demand}</span></div>
            <div className="metric-row"><span>{tr('competitionLabel')}</span><span className={'v ' + result.biz.competition}>{result.biz.competition}</span></div>
            <div className="metric-row"><span>{tr('creditRiskLabel')}</span><span className={'v ' + result.creditRisk}>{result.creditRisk}</span></div>

            <hr className="divider" />
            <h3 style={{ fontSize: '0.92rem' }}>{tr('financeHeading')}</h3>
            <div className="finance-flow">
              <div className="flow-node"><div className="lab">{tr('projectCostLabel')}</div><div className="val">₹{num(result.biz.projectCost)}</div></div>
              <div className="flow-node"><div className="lab">{tr('workingCapitalLabel')}</div><div className="val">₹{num(result.workingCapital)}</div></div>
              <div className="flow-node"><div className="lab">{tr('loanLabel')}</div><div className="val">₹{num(result.workingCapital)}</div></div>
            </div>
            <div className="metric-row"><span>{tr('schemeLabel')}</span><span className="v good">{result.schemeName}</span></div>
            <div className="metric-row"><span>{tr('emiLabel')}</span><span className="v">{result.workingCapital > 0 ? '~₹' + Math.round(result.emi).toLocaleString('en-IN') + '/mo' : '—'}</span></div>

            <hr className="divider" />
            <h3 style={{ fontSize: '0.92rem' }}>{tr('nextStepsHeading')}</h3>
            <ul className="steps-list">
              {result.steps.map((s, i) => (
                <li key={i}><span className="num">{i + 1}</span><span>{s}</span></li>
              ))}
            </ul>
            <button className="listen-btn" style={{ marginTop: '10px' }} onClick={listenReport}>
              🔊 <span>{tr('listenBtn')}</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
}