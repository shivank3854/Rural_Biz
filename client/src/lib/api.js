const TOKEN_KEY = 'rb_token_v1';

export const tokenGet = () => {
  try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
};
export const tokenSet = (t) => {
  try { localStorage.setItem(TOKEN_KEY, t); } catch (e) { void e; }
};
export const tokenClear = () => {
  try { localStorage.removeItem(TOKEN_KEY); } catch (e) { void e; }
};

async function req(method, url, body, authed = false) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (authed) {
    const token = tokenGet();
    if (token) headers.Authorization = 'Bearer ' + token;
  }
  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch (err) {
    const e = new Error('network_unavailable');
    e.code = 'network_unavailable';
    throw e;
  }
  let data = null;
  try { data = await res.json(); } catch (e) { void e; }
  if (!res.ok) {
    const e = new Error((data && data.error) || res.status);
    e.code = (data && data.error) || 'http_' + res.status;
    e.status = res.status;
    throw e;
  }
  return data;
}

export const api = {
  serverUp: typeof window !== 'undefined' && !!window.fetch,

  signup: (name, email, phone, password) =>
    req('POST', '/api/auth/signup', { name, email: email || undefined, phone: phone || undefined, password }),

  login: (identifier, password) =>
    req('POST', '/api/auth/login', { identifier, password }),

  me: () => req('GET', '/api/auth/me', undefined, true),

  logout: () => req('POST', '/api/auth/logout', {}, true),

  feasibility: (bizId, location, capital) =>
    req('POST', '/api/feasibility', { bizId, location, capital }),

  matchSchemes: (profile) =>
    req('POST', '/api/schemes/match', { ...profile }),

  chat: (message, context) =>
    req('POST', '/api/chat', { message, context }),

  ledgerGet: () => req('GET', '/api/ledger/report', undefined, true),

  ledgerPut: (rows) => req('PUT', '/api/ledger/report', { rows }, true),

  ledgerCompute: (rows) => req('POST', '/api/ledger/compute', { rows }),

  newsletter: (email) => req('POST', '/api/newsletter', { email }),

  health: () => req('GET', '/api/health'),
};