import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import KhanectBoltIcon from './icons/KhanectBoltIcon';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleNavigate = (view: ViewState) => {
      onNavigate(view);
      setIsMobileMenuOpen(false);
  };

  const handleLandingClick = () => {
      if (currentView === ViewState.LANDING) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
          onNavigate(ViewState.LANDING);
      }
      setIsMobileMenuOpen(false);
  };

  const handleContactClick = () => {
    if (currentView === ViewState.LANDING) {
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else {
        onNavigate(ViewState.LANDING);
        // Allow brief time for view transition before scrolling
        setTimeout(() => {
             document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav 
        className={`fixed top-0 w-full z-50 px-6 transition-all duration-300 ${
            isScrolled && !isMobileMenuOpen
                ? 'py-4 bg-white/80 dark:bg-black/70 backdrop-blur-md border-b border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none' 
                : 'py-6 bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <button 
          onClick={handleLandingClick}
          className="flex items-center gap-3 group focus:outline-none z-50 relative"
        >
          <div className="w-8 h-8 bg-black dark:bg-white rounded-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
             <KhanectBoltIcon
               size={18}
               fillClassName="fill-white dark:fill-black"
               strokeClassName="stroke-white dark:stroke-black"
             />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Khanect</span>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 md:gap-8">
          <div className="flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400">
            <button
              onClick={handleLandingClick}
              className={`hover:text-black dark:hover:text-white transition-colors ${currentView === ViewState.LANDING ? 'text-black dark:text-white' : ''}`}
            >
              Get Started
            </button>
            <button
              onClick={() => onNavigate(ViewState.PRICING)}
              className={`hover:text-black dark:hover:text-white transition-colors ${currentView === ViewState.PRICING ? 'text-black dark:text-white' : ''}`}
            >
              Pricing
            </button>
             <button
              onClick={() => onNavigate(ViewState.PORTAL)}
              className={`hover:text-black dark:hover:text-white transition-colors ${currentView === ViewState.PORTAL ? 'text-black dark:text-white' : ''}`}
            >
              Client Portal
            </button>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-200"
                aria-label="Toggle Theme"
             >
                {theme === 'dark' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
             </button>

             <button 
                onClick={handleContactClick}
                className="bg-brand-lime hover:bg-brand-limeHover text-black text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg shadow-brand-lime/20"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Contact Us</span>
            </button>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-4">
            <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all duration-200 z-50 relative"
            >
                {theme === 'dark' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
            </button>

            <button 
                className="z-50 relative text-gray-900 dark:text-white p-2 focus:outline-none hover:text-brand-lime transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                {isMobileMenuOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                )}
            </button>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl z-40 transition-transform duration-300 md:hidden flex flex-col items-center justify-center space-y-8 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!isMobileMenuOpen}
      >
            <button
              onClick={handleLandingClick}
              className={`text-3xl font-medium transition-all hover:scale-105 ${currentView === ViewState.LANDING ? 'text-black dark:text-white' : 'text-gray-500 hover:text-brand-lime'}`}
            >
              Get Started
            </button>
            <button
              onClick={() => handleNavigate(ViewState.PRICING)}
              className={`text-3xl font-medium transition-all hover:scale-105 ${currentView === ViewState.PRICING ? 'text-black dark:text-white' : 'text-gray-500 hover:text-brand-lime'}`}
            >
              Pricing
            </button>
             <button
              onClick={() => handleNavigate(ViewState.PORTAL)}
              className={`text-3xl font-medium transition-all hover:scale-105 ${currentView === ViewState.PORTAL ? 'text-black dark:text-white' : 'text-gray-500 hover:text-brand-lime'}`}
            >
              Client Portal
            </button>
            <button
              onClick={handleContactClick}
              className="text-3xl font-medium text-gray-500 hover:text-brand-lime transition-all hover:scale-105"
            >
              Contact Us
            </button>
            
            <div className="w-12 h-1 bg-gray-200 dark:bg-white/10 rounded-full my-4"></div>

             <button 
                onClick={() => handleNavigate(ViewState.DEMO)}
                className="bg-brand-lime hover:bg-brand-limeHover text-black text-xl font-bold px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 mt-4 hover:shadow-[0_0_20px_rgba(211,243,107,0.4)]"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Try Demo</span>
            </button>
      </div>
    </nav>
  );
};

export default Navbar;