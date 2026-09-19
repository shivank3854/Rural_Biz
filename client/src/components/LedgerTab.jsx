import { useEffect, useState } from 'react';
import { useI18n } from '../components/I18nProvider.jsx';
import { useAuth } from '../components/AuthProvider.jsx';
import { api } from '../lib/api.js';

const num = (n) => Number(n || 0).toLocaleString('en-IN');

function emptyRow() { return { item: '', sales: '', cost: '' }; }

export default function LedgerTab({ feasible, onSummary }) {
  const { tr } = useI18n();
  const { user } = useAuth();

  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState(tr('ledgerScanNote'));
  const [ocrText, setOcrText] = useState('');
  const [showOcrText, setShowOcrText] = useState(false);
  const [draft, setDraft] = useState('');
  const [showDraft, setShowDraft] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!user) return;
    api.ledgerGet().then((d) => {
      if (cancelled || !d.rows || !d.rows.length) return;
      setRows(d.rows.map((r) => ({ item: r.item, sales: r.sales, cost: r.cost })));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [user]);

  const update = (i, key, val) => {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [key]: val } : r)));
  };

  const collect = () => rows.map((r) => ({
    item: r.item.trim(),
    sales: Number(r.sales) || 0,
    cost: Number(r.cost) || 0,
  }));

  const calc = async () => {
    setErr('');
    setBusy(true);
    const data = collect();
    try {
      const s = await api.ledgerCompute(data);
      setSummary(s);
      onSummary(s);
      if (user) api.ledgerPut(data).catch(() => {});
    } catch (e) {
      setErr('Server not reachable — start `npm start` and try again.');
    } finally {
      setBusy(false);
    }
  };

  const scan = async (file) => {
    if (!file) return;
    setOcrStatus('Reading image… this can take 10-20 seconds.');
    if (!window.Tesseract) {
      setOcrStatus('OCR engine still loading — select the file again in a few seconds.');
      return;
    }
    try {
      const { data: { text } } = await window.Tesseract.recognize(file, 'eng');
      setOcrText(text.trim());
      setShowOcrText(true);
      setOcrStatus('Done. Check the text below, correct if needed, then copy numbers into the entries table.');
    } catch (e) {
      setOcrStatus('Could not read this image clearly. Try a sharper photo, or enter values manually below.');
    }
  };

  const genDraft = () => {
    if (!summary) return;
    const f = feasible;
    const bizType = f ? (f.biz.en || 'Rural micro-business') : 'Rural micro-business';
    const bizLoc = f ? f.loc : '[location]';
    const text = `LOAN APPLICATION SUPPORTING SUMMARY — RuralBiz AI
Draft for review, not a final legal document

Business type: ${bizType}
Location: ${bizLoc}

Financial snapshot (based on submitted entries):
- Total recorded revenue: Rs. ${num(summary.revenue)}
- Total recorded cost: Rs. ${num(summary.cost)}
- Net profit: Rs. ${num(summary.profit)}
- Profit margin: ${summary.margin.toFixed(1)}%
- Estimated monthly profit (extrapolated): Rs. ${num(summary.monthlyEstimate)}
- RuralBiz AI loan-readiness score: ${summary.score}/100
${f ? `- Recommended scheme: ${f.schemeName}\n- Working capital needed: Rs. ${num(f.workingCapital)}` : ''}

Purpose of loan: [fill in]
Requested amount: [fill in]

Attach Aadhaar, PAN, and bank statements (last 6 months if available). Visit your nearest bank branch or Common Service Centre to finalize the formal application.`;
    setDraft(text);
    setShowDraft(true);
  };

  return (
    <section className="tab-panel active" id="tab-ledger">
      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>{tr('ledgerScanTitle')}</h2>
        <input type="file" id="ledger-image" accept="image/*" onChange={(e) => scan(e.target.files[0])} />
        <p className="note" id="ocr-status">{ocrStatus}</p>
        <div style={{ display: showOcrText ? 'block' : 'none' }}>
          <label>Recognized text (edit if needed)</label>
          <textarea id="ocr-text" rows="4" value={ocrText} onChange={(e) => setOcrText(e.target.value)}></textarea>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem' }}>{tr('ledgerEntriesTitle')}</h2>
        <table id="ledger-table">
          <thead>
            <tr><th>{tr('itemCol')}</th><th>{tr('salesCol')}</th><th>{tr('costCol')}</th><th></th></tr>
          </thead>
          <tbody id="ledger-body">
            {rows.map((r, i) => (
              <tr key={i}>
                <td><input className="l-item" value={r.item} placeholder="e.g. Rice, Milk"
                  onChange={(e) => update(i, 'item', e.target.value)} /></td>
                <td><input className="l-sales" type="number" value={r.sales} placeholder="0"
                  onChange={(e) => update(i, 'sales', e.target.value)} /></td>
                <td><input className="l-cost" type="number" value={r.cost} placeholder="0"
                  onChange={(e) => update(i, 'cost', e.target.value)} /></td>
                <td><button className="del-row" onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-secondary" onClick={() => setRows((rs) => [...rs, emptyRow()])}>
          {tr('addEntryBtn')}
        </button>
        <button className="btn-primary" disabled={busy} onClick={calc}>
          {busy ? '…' : tr('calcBtn')}
        </button>
        {err && <p className="why" style={{ color: 'var(--bad)' }}>{err}</p>}
      </div>

      <div className="card" style={{ display: summary ? 'block' : 'none' }}>
        {summary && (
          <>
            <h2 style={{ fontSize: '1.05rem' }}>{tr('summaryTitle')}</h2>
            <div className="stat-grid">
              <div className="stat"><div className="num">₹{num(summary.revenue)}</div><div className="lab">{tr('totalRevenueLabel')}</div></div>
              <div className="stat"><div className="num">₹{num(summary.profit)}</div><div className="lab">{tr('netProfitLabel')}</div></div>
              <div className="stat"><div className="num">{summary.margin.toFixed(1)}%</div><div className="lab">{tr('profitMarginLabel')}</div></div>
              <div className="stat"><div className="num">₹{num(summary.monthlyEstimate)}</div><div className="lab">{tr('estMonthlyLabel')}</div></div>
            </div>
            <hr className="divider" />
            <h3 style={{ fontSize: '0.95rem' }}>{tr('loanReadinessTitle')}</h3>
            <div className="score-bar"><div className="score-fill" style={{ width: summary.score + '%' }}></div></div>
            <p className="why">Score: {summary.score}/100 — {summary.verdict}</p>
            <button className="btn-secondary" onClick={genDraft}>{tr('draftBtn')}</button>
            <div style={{ display: showDraft ? 'block' : 'none', marginTop: '10px' }}>
              <label>Draft summary (copy or download)</label>
              <textarea id="draft-text" rows="10" readOnly value={draft}></textarea>
            </div>
          </>
        )}
      </div>
    </section>
  );
}