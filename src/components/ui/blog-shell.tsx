import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BlogShellProps {
  children: ReactNode;
  className?: string;
}

export function BlogShell({ children, className }: BlogShellProps) {
  return (
    <div className={cn('relative min-h-screen overflow-hidden bg-gray-950 text-white', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.18),transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-24 h-[28rem] w-[28rem] rounded-full bg-brand-lime/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-44 bottom-0 h-[30rem] w-[30rem] rounded-full bg-brand-cyan/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0)_18%,rgba(0,0,0,0.35)_100%)]"
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
