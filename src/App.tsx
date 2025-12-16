import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AiConsultant from './components/AiConsultant';
import ClientPortal from './components/ClientPortal';
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

  // Reset scroll position when view changes to Portal
  useEffect(() => {
    if (currentView === ViewState.PORTAL) {
       window.scrollTo(0, 0);
    }
  }, [currentView]);

  return (
    <div className="min-h-screen font-sans selection:bg-brand-lime/30 selection:text-black dark:selection:text-brand-lime dark:text-white transition-colors duration-300 relative">
      <div className="spotlight-glow"></div>
      
      <Navbar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main>
        {/* Always render Landing Page unless we are in Portal. This allows DEMO widget to float over Landing Page. */}
        {(currentView === ViewState.LANDING || currentView === ViewState.DEMO) && (
          <LandingPage onNavigate={setCurrentView} />
        )}

        {currentView === ViewState.PORTAL && (
          <ClientPortal />
        )}
      </main>

      {/* Scroll To Top Button */}
      <button
          onClick={scrollToTop}
          className={`fixed z-40 w-12 h-12 rounded-full bg-white dark:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg backdrop-blur-md transition-all duration-500 ease-fluid transform hover:scale-110 hover:bg-gray-50 dark:hover:bg-white/20 focus:outline-none flex items-center justify-center ${
              showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          } ${currentView === ViewState.LANDING ? 'bottom-24 right-8' : currentView === ViewState.DEMO ? 'bottom-6 left-6' : 'bottom-6 right-6'}`}
          aria-label="Scroll to top"
      >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
      </button>

      {/* Floating Action Button - Only visible on Landing View (Hidden when chat is open) */}
      {currentView === ViewState.LANDING && (
        <button 
          onClick={() => setCurrentView(ViewState.DEMO)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#0F0F11] hover:bg-black border border-white/10 hover:border-brand-lime/50 text-brand-lime rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group animate-fade-in-up hover:shadow-[0_0_30px_rgba(211,243,107,0.3)]"
          aria-label="Chat with AI"
        >
          <div className="absolute inset-0 rounded-full bg-brand-lime animate-ping opacity-20"></div>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
               <path d="M12 2C8.13 2 5 5.13 5 9C5 11.38 6.19 13.47 8 14.74V17C8 17.55 8.45 18 9 18H15C15.55 18 16 17.55 16 17V14.74C17.81 13.47 19 11.38 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 8.17 10.17 7.5 11 7.5V6C9.34 6 8 7.34 8 9C8 11.21 9.79 13 12 13C14.21 13 16 11.21 16 9C16 7.34 14.66 6 13 6V7.5C13.83 7.5 14.5 8.17 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
          </svg>
        </button>
      )}

      {/* Floating Chat Widget for DEMO */}
      {currentView === ViewState.DEMO && (
          <div 
             className="fixed bottom-6 right-6 z-[100] w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-120px)] shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up ring-1 ring-black/5 dark:ring-white/10"
          >
             <AiConsultant onNavigate={() => setCurrentView(ViewState.LANDING)} />
          </div>
      )}

      <footer className="border-t border-gray-200 dark:border-white/10 py-8 text-center bg-white/50 dark:bg-black/50 backdrop-blur-sm mt-auto transition-colors duration-300">
        <p className="text-gray-500 dark:text-gray-600 text-sm">&copy; 2025 Khanect Ai. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;