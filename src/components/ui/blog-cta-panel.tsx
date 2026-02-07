import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CtaLink {
  label: string;
  href: string;
}

interface BlogCtaPanelProps {
  eyebrow?: string;
  title: string;
  description: string;
  primary: CtaLink;
  secondary?: CtaLink;
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'rail';
}

function CtaButton({ link, primary }: { link: CtaLink; primary: boolean }) {
  const sharedClasses = cn(
    'inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-colors',
    primary
      ? 'bg-brand-lime text-black hover:bg-teal-400'
      : 'border border-white/15 text-gray-200 hover:border-brand-lime/40 hover:text-brand-lime'
  );

  if (link.href.startsWith('/')) {
    return (
      <Link to={link.href} className={sharedClasses}>
        {link.label}
        {primary ? <ArrowRight className="h-4 w-4" /> : null}
      </Link>
    );
  }

  return (
    <a href={link.href} className={sharedClasses}>
      {link.label}
      {primary ? <ArrowRight className="h-4 w-4" /> : null}
    </a>
  );
}

export function BlogCtaPanel({
  eyebrow = 'Growth rail',
  title,
  description,
  primary,
  secondary,
  children,
  className,
  variant = 'default',
}: BlogCtaPanelProps) {
  return (
    <section
      className={cn(
        'blog-surface rounded-2xl border p-5 md:p-6',
        variant === 'rail' && 'rounded-xl p-4',
        className
      )}
      aria-label={title}
    >
      <p className="text-[11px] uppercase tracking-[0.12em] text-brand-lime/80">{eyebrow}</p>
      <h3 className={cn('mt-2 font-semibold text-white', variant === 'rail' ? 'text-base' : 'text-lg sm:text-xl')}>
        {title}
      </h3>
      <p className={cn('mt-2 text-gray-300', variant === 'rail' ? 'text-sm leading-relaxed' : 'text-sm sm:text-base')}>
        {description}
      </p>
      <div className={cn('mt-5 flex flex-wrap items-center gap-3', variant === 'rail' && 'mt-4')}>
        <CtaButton link={primary} primary={true} />
        {secondary ? <CtaButton link={secondary} primary={false} /> : null}
      </div>
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}
