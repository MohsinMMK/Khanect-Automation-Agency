import React, { useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Pricing from './components/Pricing';
import ClientPortal from './components/ClientPortal';
import Footer from './components/Footer';
import ServiceDetailPage from './components/ServiceDetailPage';
import DottedSurfaceDemo from './components/DottedSurfaceDemo';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import AiAssistantCard from './components/ui/ai-assistant-card';
import KhanectBoltIcon from './components/icons/KhanectBoltIcon';
import { useTheme } from './contexts/ThemeContext';
import { ViewState } from './types';
import { useScrolled } from './hooks/useScrolled';
import { useBodyOverflow } from './hooks/useBodyOverflow';
import { useCanonicalUrl } from './hooks/useCanonicalUrl';
import { Toaster } from '@/components/ui/sonner';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const showScrollTop = useScrolled(500);
  const [chatOpen, setChatOpen] = useState(false);

  // Lock body scroll when chat is open
  useBodyOverflow(chatOpen);

  // Update canonical URL on route change for SEO
  useCanonicalUrl();

  // Derive currentView from location for Navbar compatibility
  const getCurrentView = (): ViewState => {
    const path = location.pathname;
    if (path === '/pricing') return ViewState.PRICING;
    if (path === '/portal') return ViewState.PORTAL;
    return ViewState.LANDING;
  };

  const currentView = getCurrentView();

  const toggleTheme = () => {
    // Cycle through: light -> dark -> dusk -> light
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('dusk');
    } else {
      setTheme('light');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: ViewState) => {
    switch (view) {
      case ViewState.PRICING:
        navigate('/pricing');
        break;
      case ViewState.PORTAL:
        navigate('/portal');
        break;
      case ViewState.LANDING:
      default:
        navigate('/');
        break;
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-lime/25 selection:text-gray-900 dark:selection:text-brand-lime dark:text-white transition-colors duration-300 relative flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-lime focus:text-black focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <ScrollToTop />
      <div className="spotlight-glow"></div>

      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main id="main-content" className="flex-grow" tabIndex={-1}>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
            <Route path="/pricing" element={<Pricing onNavigate={handleNavigate} />} />
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/services/:slug" element={<ServiceDetailPage />} />
            <Route path="/industries/:slug" element={<ServiceDetailPage />} />
            <Route path="/demo/dotted-surface" element={<DottedSurfaceDemo />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {/* Scroll To Top Button */}
      <button
          onClick={scrollToTop}
          className={`fixed z-40 w-11 h-11 rounded-full bg-white dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 border border-black/[0.06] dark:border-white/[0.06] shadow-soft backdrop-blur-xl transition-all duration-300 ease-out hover:text-gray-900 dark:hover:text-white hover:border-black/[0.1] dark:hover:border-white/[0.1] focus:outline-none flex items-center justify-center ${
              chatOpen ? 'bottom-6 left-6' : 'bottom-24 right-8'
          } ${
              showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
          aria-label="Scroll to top"
      >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
      </button>

      {/* Floating Action Button - Chat Trigger */}
      {!chatOpen && (location.pathname === '/' || location.pathname === '/pricing') && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gray-950 hover:bg-black border border-white/[0.08] hover:border-brand-lime/40 text-brand-lime rounded-full shadow-soft-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 group animate-fade-in-up hover:shadow-glow-lime"
          aria-label="Chat with AI"
        >
          <div className="absolute inset-0 rounded-full bg-brand-lime animate-ping opacity-15"></div>
          <KhanectBoltIcon size={24} className="relative z-10" />
        </button>
      )}

      {/* Floating Chat Widget */}
      {chatOpen && (
        <>
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setChatOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-120px)] shadow-soft-xl rounded-2xl animate-fade-in-up overflow-hidden">
            <AiAssistantCard onClose={() => setChatOpen(false)} />
          </div>
        </>
      )}

      <Footer />
      <Toaster />
    </div>
  );
};

export default App;
