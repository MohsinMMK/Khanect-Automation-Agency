import { Clock3 } from 'lucide-react';
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

  if (visibleTags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 text-[11px] text-gray-400">
      {visibleTags.map((tag) => (
        <span key={tag} className="rounded-full border border-white/10 px-2 py-0.5 uppercase tracking-[0.06em]">
          {tag}
        </span>
      ))}
    </div>
  );
}

export function BlogCard({ post, variant = 'default', className }: BlogCardProps) {
  const coverImage = post.coverImage || '/placeholder-blog.jpg';
  const showImage = variant !== 'compact';
  const publicationDate = post.date || (post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Latest');
  const readTime = post.readTime || '5 min read';

  if (variant === 'compact') {
    return (
      <article className={cn('blog-card-minimal rounded-xl p-4', className)}>
        <Link
          to={`/blog/${post.slug}`}
          className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090B0D]"
        >
          <PostTagPills tags={post.tags || []} maxTags={1} />
          <h3 className="mt-2 text-sm font-semibold leading-tight text-white hover:text-brand-lime sm:text-base">
            {post.title}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{readTime}</span>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className={cn('blog-card-minimal group overflow-hidden rounded-2xl', className)}>
      <Link
        to={`/blog/${post.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090B0D]"
      >
        {showImage && (
          <div
            className={cn(
              'relative overflow-hidden',
              variant === 'featured' ? 'aspect-[16/9]' : 'aspect-[16/10]'
            )}
          >
            <img
              src={coverImage}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.01]"
              loading={variant === 'featured' ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090B0D]/45 to-transparent" />
            {variant === 'featured' && (
              <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/35 px-2 py-1 text-[11px] uppercase tracking-[0.08em] text-gray-100">
                Featured
              </span>
            )}
          </div>
        )}
        <div className={cn('p-5 md:p-6', variant === 'featured' && 'md:p-7')}>
          <PostTagPills tags={post.tags || []} maxTags={variant === 'featured' ? 2 : 1} />
          <h2
            className={cn(
              'mt-3 font-semibold leading-tight text-white group-hover:text-brand-lime',
              variant === 'featured' ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
            )}
          >
            {post.title}
          </h2>
          <p
            className={cn(
              'mt-2 text-sm leading-relaxed text-gray-300',
              variant === 'featured' ? 'line-clamp-3' : 'line-clamp-2'
            )}
          >
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-gray-400">
            <span>{publicationDate}</span>
            <span>{readTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
