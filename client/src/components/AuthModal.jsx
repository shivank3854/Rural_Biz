import { useState } from 'react';
import { useI18n } from '../components/I18nProvider.jsx';
import { useAuth } from '../components/AuthProvider.jsx';

const CODE_TO_KEY = {
  auth_bad_creds: 'authErrCred',
  auth_exists: 'authErrExists',
  auth_name_required: 'authErrName',
  auth_short_pass: 'authPassShort',
  auth_invalid_email: 'authErrEmail',
};

export default function AuthModal({ show, mode, onMode, onClose }) {
  const { tr } = useI18n();
  const { login, signup, guest } = useAuth();
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup(name, identifier, '', password);
      } else {
        await login(identifier, password);
      }
      onClose();
    } catch (e) {
      setError(e.code && CODE_TO_KEY[e.code] ? tr(CODE_TO_KEY[e.code])
        : (e.code === 'network_unavailable' ? 'Server not reachable — start `npm start` and try again.' : 'Something went wrong.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" id="auth-modal" hidden={!show} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" aria-label="Close" onClick={onClose}>✕</button>
        <h2>{mode === 'login' ? tr('authLoginTitle') : tr('authSignupTitle')}</h2>
        <div className="auth-tabs">
          <button className={'auth-tab' + (mode === 'login' ? ' active' : '')} onClick={() => onMode('login')}>{tr('login')}</button>
          <button className={'auth-tab' + (mode === 'signup' ? ' active' : '')} onClick={() => onMode('signup')}>{tr('signup')}</button>
        </div>
        <div style={{ display: mode === 'signup' ? 'block' : 'none' }}>
          <label>{tr('authName')}</label>
          <input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <label>{tr('authEmail')}</label>
        <input type="text" autoComplete="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
        <label>{tr('authPassword')}</label>
        <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
        <p className="auth-error">{error}</p>
        <button className="btn-primary auth-submit" disabled={busy} onClick={submit}>
          {busy ? '…' : (mode === 'login' ? tr('login') : tr('signup'))}
        </button>
        <button className="auth-guest" onClick={() => { guest(); onClose(); }}>{tr('authGuest')}</button>
      </div>
    </div>
  );
}