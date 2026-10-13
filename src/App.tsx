import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider, useToast } from './context/ToastContext';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import OfflineBanner from './components/layout/OfflineBanner';
import Toast from './components/ui/Toast';
import Weather from './pages/Weather/Weather';
import Search from './pages/Search/Search';
import Saved from './pages/Saved/Saved';
import Alerts from './pages/Alerts/Alerts';
import Settings from './pages/Settings/Settings';

const HAS_ALERTS = true;

function ToastViewport() {
  const { toasts } = useToast();
  return (
    <div className="toast-viewport">
      {toasts.map(t => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}

export default function App() {
  const [isSaved, setIsSaved] = useState(true);

  return (
    <ThemeProvider>
      <SettingsProvider>
        <ToastProvider>
          <Shell isSaved={isSaved} setIsSaved={setIsSaved} />
        </ToastProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

function Shell({
  isSaved,
  setIsSaved,
}: {
  isSaved: boolean;
  setIsSaved: (saved: boolean) => void;
}) {
  return (
    <div className="app-shell">
      <Header hasAlerts={HAS_ALERTS} />
      <OfflineBanner />
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={<Weather isSaved={isSaved} setIsSaved={setIsSaved} />}
          />
          <Route path="/search" element={<Search />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
      <BottomNav hasAlerts={HAS_ALERTS} />
      <ToastViewport />
    </div>
  );
}