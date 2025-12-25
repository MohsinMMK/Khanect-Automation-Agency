import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Pricing from './components/Pricing';
import AiConsultant from './components/AiConsultant';
import ClientPortal from './components/ClientPortal';
import KhanectBoltIcon from './components/icons/KhanectBoltIcon';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LANDING);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset scroll position when view changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated before scrolling
    requestAnimationFrame(() => {
      if (currentView === ViewState.LANDING || currentView === ViewState.PORTAL || currentView === ViewState.PRICING) {
        window.scrollTo(0, 0);
      }
    });
  }, [currentView]);

  // Prevent body scroll when AI assistant is open (mobile experience)
  useEffect(() => {
    if (currentView === ViewState.DEMO) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [currentView]);

  return (
    <div className="min-h-screen font-sans selection:bg-brand-lime/25 selection:text-gray-900 dark:selection:text-brand-lime dark:text-white transition-colors duration-300 relative">
      <div className="spotlight-glow"></div>

      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main>
        {/* Always render Landing Page unless we are in Portal or Pricing. This allows DEMO widget to float over Landing Page. */}
        {(currentView === ViewState.LANDING || currentView === ViewState.DEMO) && (
          <LandingPage onNavigate={setCurrentView} />
        )}

        {currentView === ViewState.PRICING && (
          <Pricing onNavigate={setCurrentView} />
        )}

        {currentView === ViewState.PORTAL && (
          <ClientPortal />
        )}
      </main>

      {/* Scroll To Top Button */}
      <button
          onClick={scrollToTop}
          className={`fixed z-40 w-11 h-11 rounded-full bg-white dark:bg-white/[0.08] text-gray-600 dark:text-gray-400 border border-black/[0.06] dark:border-white/[0.06] shadow-soft backdrop-blur-xl transition-all duration-300 ease-out hover:text-gray-900 dark:hover:text-white hover:border-black/[0.1] dark:hover:border-white/[0.1] focus:outline-none flex items-center justify-center ${
              showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          } ${currentView === ViewState.LANDING || currentView === ViewState.PRICING ? 'bottom-24 right-8' : currentView === ViewState.DEMO ? 'bottom-6 left-6' : 'bottom-6 right-6'}`}
          aria-label="Scroll to top"
      >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
      </button>

      {/* Floating Action Button - Only visible on Landing and Pricing Views (Hidden when chat is open) */}
      {(currentView === ViewState.LANDING || currentView === ViewState.PRICING) && (
        <button
          onClick={() => setCurrentView(ViewState.DEMO)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gray-950 hover:bg-black border border-white/[0.08] hover:border-brand-lime/40 text-brand-lime rounded-full shadow-soft-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 group animate-fade-in-up hover:shadow-glow-lime"
          aria-label="Chat with AI"
        >
          <div className="absolute inset-0 rounded-full bg-brand-lime animate-ping opacity-15"></div>
          <KhanectBoltIcon size={24} className="relative z-10" />
        </button>
      )}

      {/* Floating Chat Widget for DEMO */}
      {currentView === ViewState.DEMO && (
          <div
             className="fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-120px)] shadow-soft-lg rounded-3xl overflow-hidden animate-fade-in-up border border-black/[0.06] dark:border-white/[0.06]"
          >
             <AiConsultant onNavigate={() => setCurrentView(ViewState.LANDING)} />
          </div>
      )}

      <footer className="border-t border-black/[0.06] dark:border-white/[0.06] py-10 text-center bg-white/60 dark:bg-gray-950/80 backdrop-blur-xl mt-auto transition-colors duration-300">
        <p className="text-gray-500 dark:text-gray-500 text-sm">&copy; 2025 Khanect Ai. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
