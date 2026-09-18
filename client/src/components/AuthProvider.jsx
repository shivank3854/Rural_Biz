import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenGet, tokenSet, tokenClear } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = tokenGet();
      if (!token) { setReady(true); return; }
      try {
        const d = await api.me();
        if (!cancelled) setUser(d.user);
      } catch (e) {
        tokenClear();
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const applyAuth = (d) => {
    tokenSet(d.token);
    setUser(d.user);
  };

  const login = async (identifier, password) => {
    const d = await api.login(identifier, password);
    applyAuth(d);
    return d.user;
  };

  const signup = async (name, email, phone, password) => {
    const d = await api.signup(name, email, phone, password);
    applyAuth(d);
    return d.user;
  };

  const logout = async () => {
    try { await api.logout(); } catch (e) { void e; }
    tokenClear();
    setUser(null);
  };

  const guest = useCallback(() => {
    tokenClear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, guest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}