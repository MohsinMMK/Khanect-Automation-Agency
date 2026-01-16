import { useState, useCallback } from 'react';
import { ViewState } from '../types';
import { useScrolled } from '../hooks/useScrolled';
import { useBodyOverflow } from '../hooks/useBodyOverflow';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onMobileMenuChange?: (isOpen: boolean) => void;
}

function Navbar({ currentView, onNavigate, onMobileMenuChange }: NavbarProps) {
  const isScrolled = useScrolled(20);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Notify parent when mobile menu state changes
  const updateMobileMenuState = (isOpen: boolean) => {
    setIsMobileMenuOpen(isOpen);
    onMobileMenuChange?.(isOpen);
  };

  // Lock body scroll when mobile menu is open
  useBodyOverflow(isMobileMenuOpen);

  // Focus trap for mobile menu with ESC key support
  const mobileMenuRef = useFocusTrap<HTMLDivElement>(
    isMobileMenuOpen,
    () => updateMobileMenuState(false)
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
    updateMobileMenuState(false);
  }, [currentView, onNavigate]);

  const handleLandingClick = () => handleNavigation(ViewState.LANDING);
  const handlePricingClick = () => handleNavigation(ViewState.PRICING);
  const handlePortalClick = () => handleNavigation(ViewState.PORTAL);
  const handleContactClick = () => handleNavigation(ViewState.CONTACT);

  const handleNavigate = (view: ViewState) => {
    onNavigate(view);
    updateMobileMenuState(false);
  };

  return (
    <nav
        className={`fixed top-0 w-full z-50 px-6 transition-all duration-300 ${
            isScrolled
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
            className="h-40 -mt-6 -mb-10 -ml-10 object-contain transition-transform duration-180 group-hover:scale-105"
          />
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
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
                onClick={handleContactClick}
                className="inline-flex items-center gap-2 text-sm font-medium py-2 text-[#14B8A6] hover:text-[#0D9488] transition-colors duration-180"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                <span>Contact</span>
            </button>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex md:hidden items-center gap-2" style={{ zIndex: 100000, position: 'relative' }}>
            <button
                onClick={handleContactClick}
                className="p-2.5 text-brand-lime hover:text-brand-lime/80 transition-colors"
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </button>
            <button
                className="mobile-menu-toggle text-gray-900 dark:text-white p-2 focus:outline-none hover:text-brand-lime transition-colors duration-180"
                onClick={() => updateMobileMenuState(!isMobileMenuOpen)}
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
        className={`md:hidden transition-opacity duration-300 ease-out ${
          isMobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'var(--background, #030712)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col items-center space-y-6 px-6">
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
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
