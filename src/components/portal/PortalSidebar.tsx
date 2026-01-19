import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/portal',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Leads',
    href: '/portal/leads',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Activity',
    href: '/portal/activity',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/portal/settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
];

interface PortalSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function PortalSidebar({ isCollapsed = false, onToggle }: PortalSidebarProps) {
  const location = useLocation();
  const { client, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-white/[0.06] transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/[0.06]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img src="/logo-teal.png" alt="Khanect" className="h-8 w-8" />
            <span className="font-logo text-lg tracking-wide text-gray-900 dark:text-white">
              KHANECT
            </span>
          </div>
        )}
        {isCollapsed && (
          <img src="/logo-teal.png" alt="Khanect" className="h-8 w-8 mx-auto" />
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'p-1.5 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors',
              isCollapsed && 'mx-auto mt-2'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn('transition-transform', isCollapsed && 'rotate-180')}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/portal'}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive(item.href)
                ? 'bg-brand-lime/10 text-brand-lime'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5',
              isCollapsed && 'justify-center px-2'
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <span className={cn(isActive(item.href) && 'text-brand-lime')}>
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer - User Info & Logout */}
      <div className="p-3 border-t border-gray-200 dark:border-white/[0.06]">
        {!isCollapsed && client && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {client.full_name || client.business_name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {client.business_name}
            </p>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200',
            isCollapsed && 'justify-center px-2'
          )}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" x2="9" y1="12" y2="12" />
          </svg>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
