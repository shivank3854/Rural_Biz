import { useState } from 'react';
import { useI18n } from '../components/I18nProvider.jsx';
import { api } from '../lib/api.js';

function ToggleRow({ yes, no, onYes, onNo }) {
  return (
    <div className="toggle-row">
      <div className={'toggle-card' + (yes ? ' selected' : '')} data-val="Yes" onClick={onYes}>
        <span className="emoji">🟢</span><span>Yes</span>
      </div>
      <div className={'toggle-card' + (no ? ' selected' : '')} data-val="No" onClick={onNo}>
        <span className="emoji">🚫</span><span>No</span>
      </div>
    </div>
  );
}

export default function SchemeTab() {
  const { tr } = useI18n();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [cat, setCat] = useState('General');
  const [stage, setStage] = useState('New / not started');
  const [area, setArea] = useState('Rural');
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState(false);
  const [artisan, setArtisan] = useState(false);
  const [busy, setBusy] = useState(false);
  const [matches, setMatches] = useState(null);
  const [err, setErr] = useState('');

  const match = async () => {
    const profile = {
      age: Number(age) || 0,
      gender,
      category: cat,
      stage,
      area,
      amount: Number(amount) || 0,
      vendor: vendor ? 'Yes' : 'No',
      artisan: artisan ? 'Yes' : 'No',
    };
    setErr('');
    setBusy(true);
    try {
      const d = await api.matchSchemes(profile);
      setMatches(d.matches);
    } catch (e) {
      setErr('Server not reachable — start `npm start` and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="tab-panel" id="tab-scheme">
      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>{tr('schemeCardTitle')}</h2>
        <div className="row">
          <div><label>{tr('ageLabel')}</label><input type="number" placeholder="e.g. 32" value={age} onChange={(e) => setAge(e.target.value)} /></div>
          <div>
            <label>{tr('genderLabel')}</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div>
            <label>{tr('categoryLabel')}</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)}>
              <option>General</option><option>OBC</option><option>SC</option><option>ST</option><option>Minority</option>
            </select>
          </div>
          <div>
            <label>{tr('stageLabel')}</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option>New / not started</option><option>Running &lt; 1 year</option><option>Running 1–3 years</option><option>Running 3+ years</option>
            </select>
          </div>
        </div>
        <label>{tr('areaLabel')}</label>
        <select value={area} onChange={(e) => setArea(e.target.value)}>
          <option>Rural</option><option>Urban</option>
        </select>
        <label>{tr('amountLabel')}</label>
        <input type="number" value={amount} placeholder={tr('amountPlaceholder')} onChange={(e) => setAmount(e.target.value)} />

        <label>{tr('vendorLabel')}</label>
        <ToggleRow yes={vendor} no={!vendor} onYes={() => setVendor(true)} onNo={() => setVendor(false)} />

        <label>{tr('artisanLabel')}</label>
        <ToggleRow yes={artisan} no={!artisan} onYes={() => setArtisan(true)} onNo={() => setArtisan(false)} />

        <button className="btn-primary" id="match-btn" disabled={busy} onClick={match}>
          {busy ? '…' : tr('matchBtn')}
        </button>
        {err && <p className="why" style={{ color: 'var(--bad)' }}>{err}</p>}
      </div>

      <div id="scheme-results">
        {matches !== null && matches.length === 0 && (
          <div className="card empty">No close matches found. Try adjusting the amount or stage, or visit your nearest Common Service Centre (CSC).</div>
        )}
        {matches && matches.map((s, i) => (
          <div className="scheme" key={i}>
            <span className="badge">Eligible</span>
            <h3>{s.name}</h3>
            <p style={{ color: '#8a8a8a', fontSize: '0.8rem' }}>{s.body}</p>
            <p>{s.desc}</p>
            <p className="why">Why you match: {s.reason}</p>
            <ul>{s.docs.map((d, j) => <li key={j}>{d}</li>)}</ul>
          </div>
        ))}
      </div>
    </section>
  );
}