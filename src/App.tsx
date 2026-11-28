import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';

const SellPage = lazy(() => import('./pages/SellPage'));

const ScrollManager: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const isAppScreen = pathname.startsWith('/sell') || pathname.startsWith('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center bg-[#F6F8FB]">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2095D3]" />
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sell" element={<SellPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </Suspense>
      </div>
      {!isAppScreen && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
