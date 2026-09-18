import { useEffect, useState } from 'react';
import { I18nProvider } from './components/I18nProvider.jsx';
import Landing from './pages/Landing.jsx';
import Workspace from './pages/Workspace.jsx';

function currentView() {
  return window.location.hash === '#/app' ? 'app' : 'landing';
}

export default function App() {
  const [view, setView] = useState(currentView);

  useEffect(() => {
    const sync = () => setView(currentView());
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return (
    <I18nProvider>
      {view === 'app' ? <Workspace /> : <Landing />}
    </I18nProvider>
  );
}