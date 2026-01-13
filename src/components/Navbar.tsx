import React, { useState, useCallback } from 'react';
import { ViewState } from '../types';
import { useScrolled } from '../hooks/useScrolled';
import { useBodyOverflow } from '../hooks/useBodyOverflow';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  theme: 'light' | 'dark' | 'oak';
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, theme, toggleTheme }) => {
  const isScrolled = useScrolled(20);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useBodyOverflow(isMobileMenuOpen);

  // Focus trap for mobile menu with ESC key support
  const mobileMenuRef = useFocusTrap<HTMLDivElement>(
    isMobileMenuOpen,
    () => setIsMobileMenuOpen(false)
  );

  // Parameterized navigation handler
  const handleNavigation = useCallback((targetView: ViewState, scrollTarget?: string) => {
    if (currentView === targetView) {
      if (scrollTarget) {
        document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      onNavigate(targetView);
      if (scrollTarget) {
        setTimeout(() => {
          document.getElementById(scrollTarget)?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    }
    setIsMobileMenuOpen(false);
  }, [currentView, onNavigate]);

  const handleLandingClick = () => handleNavigation(ViewState.LANDING);
  const handlePricingClick = () => handleNavigation(ViewState.PRICING);
  const handlePortalClick = () => handleNavigation(ViewState.PORTAL);
  const handleContactClick = () => handleNavigation(ViewState.LANDING, 'contact');

  const handleNavigate = (view: ViewState) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
        className={`fixed top-0 w-full z-50 px-6 transition-all duration-300 ${
            isScrolled && !isMobileMenuOpen
                ? 'py-0 bg-white/80 dark:bg-gray-950/80 navbar-scrolled backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.06]'
                : 'py-0 bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo Area */}
        <button
          onClick={handleLandingClick}
          className="flex items-center gap-0 group focus:outline-none z-50 relative"
        >
          <img 
            src="/logo-full.png" 
            alt="Khanect" 
            className="h-40 -mt-8 -mb-10 -ml-10 object-contain transition-transform duration-180 group-hover:scale-105"
          />
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={handleLandingClick}
              className={`nav-link transition-colors duration-180 ${
                currentView === ViewState.LANDING
                  ? 'nav-link-active text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Get Started
            </button>
            <button
              onClick={handlePricingClick}
              className={`nav-link transition-colors duration-180 ${
                currentView === ViewState.PRICING
                  ? 'nav-link-active text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Pricing
            </button>
             <button
              onClick={handlePortalClick}
              className={`nav-link transition-colors duration-180 ${
                currentView === ViewState.PORTAL
                  ? 'nav-link-active text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Client Portal
            </button>
          </div>

          <div className="flex items-center gap-3">
             <button
                onClick={toggleTheme}
                className="theme-toggle-btn p-2.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/[0.1] transition-all duration-180"
                aria-label="Toggle Theme"
             >
                {theme === 'dark' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : theme === 'oak' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
             </button>

             <button
                onClick={handleContactClick}
                className="btn-primary text-sm px-4 py-2"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Contact</span>
            </button>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
            <button
                onClick={toggleTheme}
                className="theme-toggle-btn p-2.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-180 z-50 relative"
                aria-label="Toggle Theme"
            >
                {theme === 'dark' ? (
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                ) : theme === 'oak' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
            </button>

            <button
                className="mobile-menu-toggle z-50 relative text-gray-900 dark:text-white p-2 focus:outline-none hover:text-brand-lime transition-colors duration-180"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                {isMobileMenuOpen ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                )}
            </button>
        </div>

      </div>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`mobile-menu-overlay fixed inset-0 bg-white/98 dark:bg-gray-950/98 backdrop-blur-2xl z-40 transition-all duration-300 ease-out md:hidden ${
          isMobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{
          clipPath: isMobileMenuOpen ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-6 px-6">
            <button
              onClick={handleLandingClick}
              className={`text-2xl font-medium transition-all duration-300 ${
                currentView === ViewState.LANDING
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 hover:text-brand-lime'
              } ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
              style={{ transitionDelay: isMobileMenuOpen ? '80ms' : '0ms' }}
            >
              Get Started
            </button>
            <button
              onClick={handlePricingClick}
              className={`text-2xl font-medium transition-all duration-300 ${
                currentView === ViewState.PRICING
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 hover:text-brand-lime'
              } ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
              style={{ transitionDelay: isMobileMenuOpen ? '160ms' : '0ms' }}
            >
              Pricing
            </button>
             <button
              onClick={handlePortalClick}
              className={`text-2xl font-medium transition-all duration-300 ${
                currentView === ViewState.PORTAL
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 hover:text-brand-lime'
              } ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
              style={{ transitionDelay: isMobileMenuOpen ? '240ms' : '0ms' }}
            >
              Client Portal
            </button>
            <button
              onClick={handleContactClick}
              className={`text-2xl font-medium text-gray-400 hover:text-brand-lime transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? '320ms' : '0ms' }}
            >
              Contact Us
            </button>

            <div
              className={`w-10 h-px bg-gray-200 dark:bg-white/[0.08] my-4 transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
              }`}
              style={{ transitionDelay: isMobileMenuOpen ? '400ms' : '0ms' }}
            />

             <button
                onClick={() => handleNavigate(ViewState.DEMO)}
                className={`btn-primary text-lg px-8 py-3.5 mt-4 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? '480ms' : '0ms' }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                <span>Try Demo</span>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
