import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PortalSidebar } from './PortalSidebar';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

/**
 * Layout wrapper for all portal pages.
 * Provides sidebar navigation and main content area.
 */
export function PortalLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F11]">
      {/* Sidebar */}
      <PortalSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64',
          isMobile && 'ml-0'
        )}
      >
        {/* Mobile header */}
        {isMobile && (
          <header className="sticky top-0 z-20 h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-white/[0.06] flex items-center px-4 lg:hidden">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </button>
            <div className="flex items-center gap-2 ml-3">
              <img src="/logo-teal.png" alt="Khanect" className="h-7 w-7" />
              <span className="font-logo text-base tracking-wide text-gray-900 dark:text-white">
                KHANECT
              </span>
            </div>
          </header>
        )}

        {/* Page content */}
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <Toaster />
    </div>
  );
}
