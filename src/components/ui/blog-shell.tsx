import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BlogShellProps {
  children: ReactNode;
  className?: string;
}

export function BlogShell({ children, className }: BlogShellProps) {
  return (
    <div className={cn('relative min-h-screen overflow-hidden bg-[#090B0D] text-white', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,rgba(20,184,166,0.06),rgba(9,11,13,0))]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
