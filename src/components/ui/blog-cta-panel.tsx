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
  if (link.href.startsWith('/')) {
    return (
      <Link
        to={link.href}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
          primary
            ? 'bg-brand-lime text-black hover:-translate-y-0.5 hover:shadow-glow-lime'
            : 'border border-white/15 bg-white/5 text-white hover:border-brand-lime/40 hover:text-brand-lime'
        )}
      >
        {link.label}
        {primary && <ArrowRight className="h-4 w-4" />}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
        primary
          ? 'bg-brand-lime text-black hover:-translate-y-0.5 hover:shadow-glow-lime'
          : 'border border-white/15 bg-white/5 text-white hover:border-brand-lime/40 hover:text-brand-lime'
      )}
    >
      {link.label}
      {primary && <ArrowRight className="h-4 w-4" />}
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
        'blog-surface rounded-3xl border p-6 md:p-8',
        variant === 'rail' && 'rounded-2xl p-5',
        className
      )}
      aria-label={title}
    >
      <p className="text-xs uppercase tracking-[0.12em] text-brand-lime/80">{eyebrow}</p>
      <h3 className={cn('mt-2 font-semibold text-white', variant === 'rail' ? 'text-lg' : 'text-2xl')}>{title}</h3>
      <p className={cn('mt-3 text-gray-300', variant === 'rail' ? 'text-sm leading-relaxed' : 'text-base')}>
        {description}
      </p>
      <div className={cn('mt-5 flex flex-wrap items-center gap-3', variant === 'rail' && 'mt-4')}>
        <CtaButton link={primary} primary={true} />
        {secondary && <CtaButton link={secondary} primary={false} />}
      </div>
      {children && <div className="mt-6">{children}</div>}
    </section>
  );
}
