'use strict';

/* Shared business data + compute engines for the RuralBiz AI backend */

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'bn', label: 'বাংলা' },
];

const LANG_NAMES = { en: 'English', hi: 'Hindi', mr: 'Marathi', ta: 'Tamil', bn: 'Bengali' };

const BIZ_TYPES = [
  { id: 'veg_cart', emoji: '🥬', en: 'Vegetable cart', hi: 'सब्ज़ी ठेला', mr: 'भाजी गाडा', ta: 'காய்கறி வண்டி', bn: 'সবজি ঠেলা', demand: 'High', competition: 'Medium', projectCost: 18000, vendor: true, artisan: false },
  { id: 'kirana', emoji: '🏪', en: 'Kirana store', hi: 'किराना दुकान', mr: 'किराणा दुकान', ta: 'மளிகைக் கடை', bn: 'মুদি দোকান', demand: 'High', competition: 'High', projectCost: 120000, vendor: false, artisan: false },
  { id: 'dairy', emoji: '🥛', en: 'Dairy supply', hi: 'डेयरी', mr: 'दुग्ध व्यवसाय', ta: 'பால் விநியோகம்', bn: 'দুগ্ধ সরবরাহ', demand: 'Medium', competition: 'Medium', projectCost: 60000, vendor: false, artisan: false },
  { id: 'tailor', emoji: '🧵', en: 'Tailoring', hi: 'सिलाई', mr: 'शिवणकाम', ta: 'தையல்', bn: 'দর্জি', demand: 'Medium', competition: 'Medium', projectCost: 35000, vendor: false, artisan: false },
  { id: 'food_stall', emoji: '🍲', en: 'Food stall', hi: 'खाने का ठेला', mr: 'खाद्य स्टॉल', ta: 'உணவு கடை', bn: 'খাবারের দোকান', demand: 'High', competition: 'High', projectCost: 40000, vendor: true, artisan: false },
  { id: 'handicraft', emoji: '🧶', en: 'Handicraft', hi: 'हस्तशिल्प', mr: 'हस्तकला', ta: 'கைவினை', bn: 'হস্তশিল্প', demand: 'Medium', competition: 'Low', projectCost: 25000, vendor: false, artisan: true },
  { id: 'poultry', emoji: '🐔', en: 'Poultry', hi: 'मुर्गी पालन', mr: 'कुक्कुटपालन', ta: 'கோழி வளர்ப்பு', bn: 'হাঁস-মুরগি', demand: 'Medium', competition: 'Low', projectCost: 80000, vendor: false, artisan: false },
  { id: 'other', emoji: '✨', en: 'Other', hi: 'अन्य', mr: 'इतर', ta: 'மற்றவை', bn: 'অন্যান্য', demand: 'Medium', competition: 'Medium', projectCost: 50000, vendor: false, artisan: false },
];

const SCHEMES = [
  { name: 'PM Employment Generation Programme (PMEGP)', body: 'Ministry of MSME / KVIC',
    desc: 'Subsidy-linked bank loan for setting up new micro-enterprises.',
    check: (p) => p.stage === 'New / not started' && p.age >= 18 && p.amount <= 5000000,
    reason: (p) => `Starting a new enterprise needing ₹${Number(p.amount || 0).toLocaleString('en-IN')} fits PMEGP's project cost limits.`,
    docs: ['Aadhaar & address proof', 'Project report / cost estimate', 'Caste certificate (if SC/ST/OBC)', 'Educational certificate (if applicable)'] },
  { name: 'PM Mudra Yojana — Shishu', body: 'Any scheduled bank / NBFC-MFI',
    desc: 'Collateral-free loans up to ₹50,000 for very small or starting businesses.',
    check: (p) => p.amount <= 50000,
    reason: (p) => `Your requirement of ₹${Number(p.amount || 0).toLocaleString('en-IN')} fits the Shishu slab (up to ₹50,000), needing no collateral.`,
    docs: ['Aadhaar & PAN', 'Business address proof', 'Simple business plan', 'Bank statement (if available)'] },
  { name: 'PM Mudra Yojana — Kishor', body: 'Any scheduled bank / NBFC-MFI',
    desc: 'Collateral-free loans from ₹50,000 to ₹5 lakh for growing businesses.',
    check: (p) => p.amount > 50000 && p.amount <= 500000,
    reason: (p) => `Your requirement of ₹${Number(p.amount || 0).toLocaleString('en-IN')} falls in the Kishor slab (₹50,000–₹5 lakh).`,
    docs: ['Aadhaar & PAN', 'Business address proof', '1–2 years of basic financial records', 'Bank statement'] },
  { name: 'Stand-Up India', body: 'Scheduled Commercial Banks',
    desc: 'Loans between ₹10 lakh and ₹1 crore for SC/ST and women entrepreneurs starting a new greenfield enterprise.',
    check: (p) => (p.category === 'SC' || p.category === 'ST' || p.gender === 'Female') && p.stage === 'New / not started' && p.amount >= 1000000,
    reason: (p) => `As a ${p.category} / ${p.gender} entrepreneur starting a new venture needing ₹${Number(p.amount || 0).toLocaleString('en-IN')}, you meet the core eligibility.`,
    docs: ['Aadhaar, PAN, caste certificate (if applicable)', 'Detailed project report', 'Proof this is your first greenfield venture', 'Bank account details'] },
  { name: 'PM SVANidhi', body: 'Ministry of Housing & Urban Affairs',
    desc: 'Working capital loans for street vendors, starting at ₹10,000.',
    check: (p) => p.vendor === 'Yes',
    reason: () => `You identified as a street vendor — exactly who this scheme is designed for.`,
    docs: ['Certificate of Vending / vendor ID', 'Aadhaar', 'Bank account'] },
  { name: 'PM Vishwakarma', body: 'Ministry of MSME',
    desc: 'Support for traditional artisans — toolkit incentive, collateral-free loans, skill training.',
    check: (p) => p.artisan === 'Yes',
    reason: () => `You practice a traditional trade/craft — the target group for this scheme.`,
    docs: ['Aadhaar', 'Proof of traditional trade', 'Bank account'] },
  { name: 'Mahila Udyam Nidhi Scheme', body: 'SIDBI',
    desc: 'Soft loans for women setting up small-scale ventures.',
    check: (p) => p.gender === 'Female' && p.amount <= 1000000,
    reason: (p) => `As a woman entrepreneur needing ₹${Number(p.amount || 0).toLocaleString('en-IN')}, you fall within this scheme's range.`,
    docs: ['Aadhaar & PAN', 'Business plan', 'Proof of ownership share'] },
  { name: 'NABARD Rural Enterprise Support', body: 'NABARD (via regional rural / cooperative banks)',
    desc: 'Refinance-backed loans for rural non-farm micro-enterprises, often bundled with SHG linkage.',
    check: (p) => p.area === 'Rural',
    reason: () => `Your business is rural-based — NABARD's core focus segment.`,
    docs: ['Aadhaar', 'SHG membership (if any)', 'Basic business details'] },
];

const LEVEL_SCORE = { High: 85, Medium: 60, Low: 35 };

function emiCalc(principal, annualRatePct, months) {
  if (principal <= 0) return 0;
  const r = annualRatePct / 1200;
  if (r === 0) return principal / months;
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}

function computeFeasibility(bizId, location, capital) {
  const biz = BIZ_TYPES.find((b) => b.id === bizId) || BIZ_TYPES[0];
  const loc = (location && String(location).trim()) || 'your area';
  const cap = Number(capital) || 0;

  const workingCapital = Math.max(0, biz.projectCost - cap);
  const demandScore = LEVEL_SCORE[biz.demand];
  const compScore = 100 - LEVEL_SCORE[biz.competition];
  const ratio = cap > 0 ? workingCapital / (cap + biz.projectCost) : 0.9;

  let creditRisk, riskScore;
  if (ratio < 0.3) { creditRisk = 'Low'; riskScore = 85; }
  else if (ratio < 0.65) { creditRisk = 'Medium'; riskScore = 60; }
  else { creditRisk = 'High'; riskScore = 35; }

  const feasScore = Math.round((demandScore * 0.4) + (compScore * 0.3) + (riskScore * 0.3));

  const schemeProfile = {
    age: 30, gender: 'Male', category: 'General', stage: 'New / not started', area: 'Rural',
    amount: workingCapital || 10000, vendor: biz.vendor ? 'Yes' : 'No', artisan: biz.artisan ? 'Yes' : 'No',
  };
  const matched = SCHEMES.find((s) => s.check(schemeProfile)) || SCHEMES.find((s) => s.name.includes('Mudra'));
  const annualRate = matched.name.includes('SVANidhi') ? 7 : 10;
  const emi = emiCalc(workingCapital, annualRate, 12);

  const steps = [];
  if (workingCapital > 0) steps.push(`Apply for ${matched.name}`);
  steps.push('Start daily sales logging in the Ledger');
  if (biz.competition === 'High') steps.push("Track 2-3 nearby competitors' prices weekly");
  else steps.push('Restock ahead of local demand peaks (market days, festivals)');
  steps.push('Ask the Advisor for a week-1 pricing plan');

  const verdictKey = feasScore >= 60 ? 'recommended' : (feasScore >= 40 ? 'caution' : 'highRisk');

  return {
    biz, loc, cap, workingCapital, demandScore, compScore, creditRisk, riskScore,
    feasScore, schemeName: matched.name, annualRate, emi, steps, verdictKey,
  };
}

function matchSchemes(profile) {
  const p = profile || {};
  return SCHEMES.filter((s) => s.check(p)).map((s) => ({
    name: s.name, body: s.body, desc: s.desc, reason: s.reason(p), docs: s.docs,
  }));
}

function computeLedgerSummary(rows) {
  let revenue = 0;
  let cost = 0;
  (rows || []).forEach((r) => {
    revenue += Number(r && r.sales) || 0;
    cost += Number(r && r.cost) || 0;
  });
  const profit = revenue - cost;
  const margin = revenue > 0 ? (profit / revenue * 100) : 0;
  const monthlyEstimate = profit * 30;

  let score = 0;
  if (margin > 25) score += 40; else if (margin > 10) score += 25; else if (margin > 0) score += 10;
  if (revenue > 0) score += 20;
  if ((rows || []).length >= 3) score += 15;
  if (profit > 0) score += 25;
  score = Math.min(100, score);

  let verdict;
  if (score >= 70) verdict = 'Strong — a consistent, positive margin. Most loan officers would see this as bankable.';
  else if (score >= 40) verdict = 'Moderate — add 2-3 more weeks of entries to strengthen your application.';
  else verdict = 'Early stage — keep logging daily entries.';

  return { revenue, cost, profit, margin, monthlyEstimate, score, verdict };
}

module.exports = {
  LANGS, LANG_NAMES, BIZ_TYPES, SCHEMES, LEVEL_SCORE,
  emiCalc, computeFeasibility, matchSchemes, computeLedgerSummary,
};