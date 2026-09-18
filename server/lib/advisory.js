'use strict';

/*
 * RuralBiz AI — local advisory engine.
 * Fully self-contained (no external AI API). It shapes each answer around
 * the user's own feasibility report + ledger numbers, so replies stay
 * hyper-local and specific to their business.
 */

const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');

function detectIntent(q) {
  const has = (words) => words.some((w) => q.includes(w));

  if (has(['price', 'pricing', 'rate', 'sell at', 'cost price', 'bhav', 'dam', 'charge'])) {
    return 'pricing';
  }
  if (has(['stock', 'inventory', 'reorder', 'supply', 'restock', 'buying', 'kharid'])) {
    return 'stock';
  }
  if (has(['compet', 'rival', 'other shop', 'dushman', 'market place', 'marketplace'])) {
    return 'competition';
  }
  if (has(['loan', 'fund', 'finance', 'mudra', 'scheme', 'subsidy', 'capital', 'paisa', 'money ', 'rupee', 'bank'])) {
    return 'loan';
  }
  if (has(['demand', 'customer', 'sell more', 'who buys', 'people buy', 'buyers'])) {
    return 'demand';
  }
  if (has(['festival', 'season', 'fest', 'mela', 'holi', 'diwali', 'rainy', 'mausam', 'tyohar'])) {
    return 'season';
  }
  if (has(['ledger', 'profit', 'margin', 'book', 'expense', 'loss', 'record'])) {
    return 'ledger';
  }
  if (has(['grow', 'expand', 'scale', 'bigger', 'second shop', 'delivery', 'diversify', 'new product'])) {
    return 'growth';
  }
  if (has(['hi', 'hello', 'hey', 'namaste', 'salaam', 'good morning', 'good evening', 'shukriya', 'thanks', 'thank you'])) {
    return 'greeting';
  }
  return 'general';
}

function buildAdvisoryReply(intent, ctx) {
  const biz = ctx.bizName || 'your business';
  const loc = ctx.bizLoc || 'your area';
  const parts = [];

  if (intent === 'greeting') {
    parts.push(`Namaste! I'm RuralBiz AI, your hyper-local advisor for ${loc}.`);
    if (ctx.feasScore && ctx.schemeName) {
      parts.push(`Your ${biz} scored ${ctx.feasScore}/100 for feasibility, and ${ctx.schemeName} is the loan scheme you match.`);
    } else {
      parts.push(`Tell me about how ${biz} is doing here — pricing, stock, competition or loans — and I'll give you a practical next step.`);
    }
    return parts.join(' ');
  }

  if (intent === 'pricing') {
    parts.push(`For ${biz} around ${loc}, price for the daily market, not the festival crowd.`);
    if (ctx.margin !== null && ctx.margin !== undefined) {
      parts.push(`Your current margin is ${ctx.margin.toFixed(1)}% on recorded entries — keep every sale above the line where margin stays positive.`);
    }
    parts.push('Offer a small early-bird discount before 9 AM and keep a 3-5% premium on festival days.'),
    parts.push('Compare with 2-3 nearby shops weekly so you stay within 5% of the local range.');
    return parts.join(' ');
  }

  if (intent === 'stock') {
    parts.push(`For a ${biz} in ${loc}, keep 4-7 days of fast-moving stock and avoid over-stocking perishables.`);
    parts.push('Log Ledger entries for 2 weeks — the items that sell out fastest are your reorder priority.');
    if (ctx.workingCapital) parts.push(`Reorder using your working capital budget of ${inr(ctx.workingCapital)} — buy 1-2 days before the local market day.`);
    else parts.push('Buy 1-2 days before the local market day, when prices are lowest.');
    return parts.join(' ');
  }

  if (intent === 'competition') {
    parts.push(`Scope out who sells the same thing within a ${loc} radius and note their visible price boards.`);
    parts.push('Differentiate on service — a fair-price promise, correct weights, or a "fresh daily" sign — before slicing prices.');
    parts.push('If someone undercuts you by over 10%, check their source cost before copying; you can usually win on trust and freshness instead.');
    return parts.join(' ');
  }

  if (intent === 'loan') {
    parts.push(`For ${biz} in ${loc}, start with a MUDRA Shishu/Kishor loan (collateral-free) or PMEGP for a new venture.`);
    if (ctx.schemeName) parts.push(`Based on your profile, ${ctx.schemeName} is the best first match — your scheme tab lists the document checklist.`);
    if (ctx.workingCapital) parts.push(`You need about ${inr(ctx.workingCapital)} in working capital; walk into the bank with that number plus your Ledger entries — proof beats promises.`);
    else parts.push('Walk into the bank with 6 months of Ledger entries — proof beats promises.');
    return parts.join(' ');
  }

  if (intent === 'demand') {
    parts.push(`In ${loc}, a ${biz} usually peaks around market days, festival weeks and monsoon evenings (when people shop closer to home).`);
    parts.push('Ask your 5 best customers one question: "What do you wish I sold that you have to go to town for?" — that gap is your next product.');
    if (ctx.revenue) parts.push(`Your recorded revenue is ${inr(ctx.revenue)} — track it weekly and you will see the season clearly.`);
    return parts.join(' ');
  }

  if (intent === 'season') {
    parts.push(`Around festivals in ${loc}, shift your ${biz} mix 20-30% toward gifting-sized packs and premium items — that is where margin hides.`);
    parts.push('Restock carefully 3-4 days ahead of the peak, but never on credit commitments you cannot cover.');
    parts.push('A sold-out shelf beats a stuck stockpile every time.');
    return parts.join(' ');
  }

  if (intent === 'ledger') {
    parts.push(`Your latest Ledger snapshot: revenue ${inr(ctx.revenue)}, profit ${inr(ctx.profit)}, margin ${ctx.margin == null ? 'n/a' : ctx.margin.toFixed(1) + '%'}.`);
    if (ctx.loanScore) parts.push(`Loan-readiness score is ${ctx.loanScore}/100 — ${ctx.loanScore >= 70 ? 'lenders should take you seriously' : 'keep logging daily entries to push it past 70'}.`);
    parts.push('Log every entry every day; 2-3 weeks of clean numbers changes how a bank sees you.');
    return parts.join(' ');
  }

  if (intent === 'growth') {
    parts.push(`Growth for ${biz} in ${loc} usually comes from 3 levers: better timing (market days), a second product line, and home delivery to 3-4 nearby hamlets.`);
    if (ctx.margin && ctx.margin > 20) parts.push(`With a ${ctx.margin.toFixed(1)}% margin, reinvest a fixed ₹500—${inr(Math.max(1000, Math.round(ctx.revenue * 0.1)))} from each good week into stock, not spending.`);
    parts.push('Pick one lever, run it for 2 weeks, and compare against your Ledger before adding another.');
    return parts.join(' ');
  }

  // general
  parts.push(`Here is a practical next step for your ${biz} in ${loc}: verify one assumption this week — the item you sell cheapest and the item that earns you the most.`);
  parts.push('Check both prices against 2-3 local shops, then adjust. Ask me about pricing, stock, competition, or a loan scheme to go deeper.');
  if (ctx.feasScore) parts.push(`And with a feasibility score of ${ctx.feasScore}/100, your next move is already funded either way — just start the daily Ledger.`);
  return parts.join(' ');
}

module.exports = {
  detectIntent,
  buildAdvisoryReply,
};