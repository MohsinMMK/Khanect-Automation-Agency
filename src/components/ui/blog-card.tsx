import { Clock3, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BlogPost } from '@/types';
import { cn } from '@/lib/utils';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

function PostTagPills({ tags, maxTags }: { tags: string[]; maxTags: number }) {
  const visibleTags = tags.slice(0, maxTags);
  return (
    <div className="flex flex-wrap gap-2">
      {visibleTags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-brand-lime/25 bg-brand-lime/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-brand-lime"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

export function BlogCard({ post, variant = 'default', className }: BlogCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const coverImage = post.coverImage || '/placeholder-blog.jpg';
  const showImage = variant !== 'compact';

  if (variant === 'compact') {
    return (
      <article className={cn('blog-editorial-card rounded-2xl p-4', className)}>
        <Link
          to={`/blog/${post.slug}`}
          className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
        >
          <PostTagPills tags={post.tags || []} maxTags={2} />
          <h3 className="mt-3 text-sm font-semibold leading-tight text-white transition-colors hover:text-brand-lime sm:text-base">
            {post.title}
          </h3>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{post.readTime || '5 min read'}</span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cn('blog-editorial-card group overflow-hidden rounded-3xl', className)}
    >
      <Link
        to={`/blog/${post.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950"
      >
        {showImage && (
          <div
            className={cn(
              'relative overflow-hidden',
              variant === 'featured' ? 'aspect-[16/8] md:aspect-[21/9]' : 'aspect-[16/9]'
            )}
          >
            <img
              src={coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              loading={variant === 'featured' ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-gray-950/20 to-transparent" />
            {variant === 'featured' && (
              <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-brand-lime/40 bg-gray-950/75 px-3 py-1 text-xs font-medium text-brand-lime backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Story
              </span>
            )}
          </div>
        )}
        <div className={cn('p-6 md:p-7', variant === 'featured' && 'md:p-8')}>
          <PostTagPills tags={post.tags || []} maxTags={variant === 'featured' ? 3 : 2} />
          <h2
            className={cn(
              'mt-4 font-semibold leading-tight text-white transition-colors group-hover:text-brand-lime',
              variant === 'featured' ? 'text-lg sm:text-xl md:text-2xl' : 'text-base sm:text-lg md:text-xl'
            )}
          >
            {post.title}
          </h2>
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-300 sm:text-sm md:text-base">{post.excerpt}</p>
          <div className="mt-5 flex items-center justify-between text-sm text-gray-400">
            <span>{post.date || 'Latest'}</span>
            <span>{post.readTime || '5 min read'}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
