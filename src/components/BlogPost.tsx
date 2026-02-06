import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock3, Share2, User } from 'lucide-react';
import { toast } from 'sonner';
import EmailCapture from './EmailCapture';
import SEO from './SEO';
import { BlogCard } from './ui/blog-card';
import { BlogCtaPanel } from './ui/blog-cta-panel';
import { BlogShell } from './ui/blog-shell';
import { blogService } from '../services/blogService';
import { BlogPost as BlogPostType } from '../types';
import { useStructuredData } from '../hooks/useStructuredData';
import {
  combineSchemas,
  generateArticleSchema,
  generateOrganizationSchema,
} from '../utils/structuredData';
import { cn } from '@/lib/utils';

type TocItem = { id: string; title: string; level: 2 | 3 };
type MarkdownBlock =
  | { type: 'h1'; text: string; id?: string }
  | { type: 'h2'; text: string; id: string }
  | { type: 'h3'; text: string; id: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

function getSafeHref(rawHref: string): string | null {
  const href = rawHref.trim();
  if (!href) return null;
  if (href.startsWith('/') || href.startsWith('#')) return href;

  try {
    const parsed = new URL(href);
    return SAFE_LINK_PROTOCOLS.has(parsed.protocol) ? href : null;
  } catch {
    return null;
  }
}

function slugifyHeading(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
  return slug || 'section';
}

function renderInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const tokenPattern = /(\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const linkText = match[2];
    const rawHref = match[3];
    const boldText = match[4];

    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (linkText && rawHref) {
      const safeHref = getSafeHref(rawHref);
      if (safeHref) {
        const isExternal = /^https?:\/\//i.test(safeHref);
        nodes.push(
          <a
            key={`${keyPrefix}-link-${match.index}`}
            href={safeHref}
            className="text-brand-lime hover:underline"
            {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {linkText}
          </a>
        );
      } else {
        nodes.push(fullMatch);
      }
    } else if (boldText) {
      nodes.push(
        <strong key={`${keyPrefix}-bold-${match.index}`} className="text-white">
          {boldText}
        </strong>
      );
    } else {
      nodes.push(fullMatch);
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseMarkdownContent(content: unknown): { blocks: MarkdownBlock[]; toc: TocItem[] } {
  if (typeof content !== 'string' || content.trim() === '') {
    return {
      blocks: [{ type: 'p', text: 'Content unavailable.' }],
      toc: [],
    };
  }

  const lines = content.split('\n');
  const blocks: MarkdownBlock[] = [];
  const toc: TocItem[] = [];
  const headingCounts = new Map<string, number>();

  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (!listType || listItems.length === 0) return;
    blocks.push({ type: listType, items: [...listItems] });
    listItems = [];
    listType = null;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push({ type: 'h1', text: trimmed.slice(2).trim() });
      return;
    }

    if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
      flushList();
      const level: 2 | 3 = trimmed.startsWith('### ') ? 3 : 2;
      const title = trimmed.slice(level === 2 ? 3 : 4).trim();
      const baseId = slugifyHeading(title);
      const duplicateCount = (headingCounts.get(baseId) || 0) + 1;
      headingCounts.set(baseId, duplicateCount);
      const id = duplicateCount === 1 ? baseId : `${baseId}-${duplicateCount}`;

      if (level === 2) {
        blocks.push({ type: 'h2', text: title, id });
      } else {
        blocks.push({ type: 'h3', text: title, id });
      }
      toc.push({ id, title, level });
      return;
    }

    const unorderedMatch = /^[-*]\s+(.+)/.exec(trimmed);
    const orderedMatch = /^\d+\.\s+(.+)/.exec(trimmed);
    if (unorderedMatch || orderedMatch) {
      const nextType: 'ul' | 'ol' = orderedMatch ? 'ol' : 'ul';
      if (listType && listType !== nextType) {
        flushList();
      }
      listType = nextType;
      listItems.push((orderedMatch?.[1] || unorderedMatch?.[1] || '').trim());
      return;
    }

    flushList();
    blocks.push({ type: 'p', text: trimmed });
  });

  flushList();

  return { blocks, toc };
}

function SimpleMarkdown({ blocks, inlineCta }: { blocks: MarkdownBlock[]; inlineCta?: ReactNode }) {
  const blockIndexesForInsert = blocks
    .map((block, index) => (block.type === 'p' || block.type === 'h2' || block.type === 'h3' ? index : -1))
    .filter((index) => index >= 0);
  const insertIndex =
    blockIndexesForInsert.length > 0 ? blockIndexesForInsert[Math.floor(blockIndexesForInsert.length * 0.4)] : -1;

  const content: React.ReactNode[] = [];
  let inserted = false;

  blocks.forEach((block, index) => {
    if (!inserted && inlineCta && index === insertIndex) {
      content.push(
        <div key="inline-cta" className="my-10">
          {inlineCta}
        </div>
      );
      inserted = true;
    }

    if (block.type === 'h1') {
      content.push(
        <h1 key={`h1-${index}`} className="mb-6 mt-12 text-xl font-bold text-white sm:text-2xl md:text-3xl">
          {renderInlineMarkdown(block.text, `h1-${index}`)}
        </h1>
      );
      return;
    }

    if (block.type === 'h2') {
      content.push(
        <h2
          key={`h2-${block.id}`}
          id={block.id}
          className="scroll-mt-28 mb-5 mt-10 text-lg font-semibold text-white sm:text-xl md:text-2xl"
        >
          {renderInlineMarkdown(block.text, `h2-${index}`)}
        </h2>
      );
      return;
    }

    if (block.type === 'h3') {
      content.push(
        <h3
          key={`h3-${block.id}`}
          id={block.id}
          className="scroll-mt-28 mb-4 mt-8 text-base font-semibold text-brand-lime sm:text-lg md:text-xl"
        >
          {renderInlineMarkdown(block.text, `h3-${index}`)}
        </h3>
      );
      return;
    }

    if (block.type === 'ul' || block.type === 'ol') {
      const ListTag = block.type;
      content.push(
        <ListTag
          key={`${block.type}-${index}`}
          className={cn(
            'mb-6 space-y-2 pl-6 text-[0.95rem] leading-[1.7] text-gray-200 sm:text-base sm:leading-[1.75]',
            block.type === 'ul' ? 'list-disc' : 'list-decimal'
          )}
        >
          {block.items.map((item, itemIndex) => (
            <li key={`${block.type}-${index}-${itemIndex}`}>{renderInlineMarkdown(item, `li-${index}-${itemIndex}`)}</li>
          ))}
        </ListTag>
      );
      return;
    }

    content.push(
      <p key={`p-${index}`} className="mb-6 text-[0.95rem] leading-[1.75] text-gray-200 sm:text-base sm:leading-[1.8]">
        {renderInlineMarkdown(block.text, `p-${index}`)}
      </p>
    );
  });

  if (!inserted && inlineCta) {
    content.push(
      <div key="inline-cta-fallback" className="my-10">
        {inlineCta}
      </div>
    );
  }

  return <div className="markdown-content">{content}</div>;
}

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostType[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const data = await blogService.getPostBySlug(slug);
        setPost(data);
      } catch (error) {
        console.error('Failed to load blog post', error);
        setLoadError('Unable to load post. Please try again later.');
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (!post?.slug) {
      setRelatedPosts([]);
      return;
    }

    const fetchRelated = async () => {
      try {
        setLoadingRelated(true);
        const related = await blogService.getRelatedPosts(post.slug, post.tags || [], 3);
        setRelatedPosts(related);
      } catch (error) {
        console.error('Failed to load related posts', error);
        setRelatedPosts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelated();
  }, [post?.slug, post?.tags]);

  const parsedMarkdown = useMemo(() => parseMarkdownContent(post?.content), [post?.content]);

  useEffect(() => {
    if (!post) return;

    const updateProgress = () => {
      const article = document.getElementById('blog-article-body');
      if (!article) return;

      const rect = article.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const articleTop = scrollTop + rect.top;
      const viewportHeight = window.innerHeight;
      const totalDistance = Math.max(article.offsetHeight - viewportHeight * 0.45, 1);
      const currentDistance = scrollTop - articleTop + viewportHeight * 0.2;
      const progress = Math.min(100, Math.max(0, (currentDistance / totalDistance) * 100));
      setReadingProgress(progress);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [post?.slug]);

  useEffect(() => {
    const tocItems = parsedMarkdown.toc;
    if (!tocItems.length) {
      setActiveSectionId('');
      return;
    }

    const updateActiveHeading = () => {
      let currentId = tocItems[0].id;
      for (const item of tocItems) {
        const heading = document.getElementById(item.id);
        if (!heading) continue;
        if (heading.getBoundingClientRect().top <= 180) {
          currentId = item.id;
        } else {
          break;
        }
      }
      setActiveSectionId(currentId);
    };

    updateActiveHeading();
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    window.addEventListener('resize', updateActiveHeading);
    return () => {
      window.removeEventListener('scroll', updateActiveHeading);
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [parsedMarkdown.toc, post?.slug]);

  const canonicalUrl = `https://khanect.com${location.pathname}`;

  const structuredData = useMemo(() => {
    if (!post) return null;

    return combineSchemas(
      generateOrganizationSchema(),
      generateArticleSchema(post, location.pathname)
    );
  }, [post, location.pathname]);

  useStructuredData(structuredData, `blog-post-${slug || 'unknown'}`);

  if (loading) {
    return (
      <BlogShell>
        <div className="flex min-h-screen items-center justify-center pt-24">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-brand-lime" />
        </div>
      </BlogShell>
    );
  }

  if (loadError) {
    return (
      <BlogShell>
        <div className="flex min-h-screen items-center justify-center px-6 pt-24">
          <div className="blog-surface max-w-xl rounded-3xl border p-10 text-center">
            <h1 className="mb-4 text-4xl font-bold">Unable to Load Post</h1>
            <p className="mb-6 text-gray-300">{loadError}</p>
            <button onClick={() => navigate('/blog')} className="text-brand-lime hover:underline">
              Back to Blog
            </button>
          </div>
        </div>
      </BlogShell>
    );
  }

  if (!post) {
    return (
      <BlogShell>
        <div className="flex min-h-screen items-center justify-center px-6 pt-24">
          <div className="blog-surface max-w-xl rounded-3xl border p-10 text-center">
            <h1 className="mb-4 text-4xl font-bold">Post Not Found</h1>
            <button onClick={() => navigate('/blog')} className="text-brand-lime hover:underline">
              Back to Blog
            </button>
          </div>
        </div>
      </BlogShell>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : canonicalUrl;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shareUrl,
        });
        return;
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
      }
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Unable to copy link');
    }
  };

  const inlineCta = (
    <BlogCtaPanel
      eyebrow="Operator Shortcut"
      title="Want this strategy installed in your stack?"
      description="Get a tailored action plan and implementation sequence for your agency workflows."
      primary={{ label: 'Book audit', href: '/contact' }}
      secondary={{ label: 'Browse more', href: '/blog' }}
    />
  );

  return (
    <>
      <SEO
        title={`${post.title} | Khanect AI Blog`}
        description={post.excerpt}
        canonical={canonicalUrl}
        type="article"
        image={post.coverImage}
      />

      <BlogShell>
        <div className="fixed left-0 right-0 top-0 z-[70] h-1 bg-black/40">
          <div
            className="h-full bg-brand-lime"
            style={{
              width: `${readingProgress}%`,
              transition: prefersReducedMotion ? 'none' : 'width 120ms linear',
            }}
          />
        </div>

        <div className="relative z-10 pt-28 pb-20 md:pt-32">
          <article className="mx-auto w-full max-w-6xl px-6">
            <Link to="/blog" className="mb-8 inline-flex items-center text-gray-300 hover:text-brand-lime">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Articles
            </Link>

            <header className="blog-surface mb-8 rounded-3xl border p-6 md:p-10">
              <div className="mb-5 flex flex-wrap gap-2">
                {(post.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-brand-lime/25 bg-brand-lime/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] text-brand-lime"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <motion.h1
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="max-w-4xl text-xl font-bold leading-tight sm:text-2xl md:text-4xl lg:text-5xl"
              >
                {post.title}
              </motion.h1>

              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-gray-300 sm:text-base md:text-lg">{post.excerpt}</p>

              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6 text-xs text-gray-300 sm:text-sm">
                <div className="inline-flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{post.author || 'Khanect AI'}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Clock3 className="h-4 w-4" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
                <button
                  onClick={handleShare}
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-brand-lime/35 hover:text-brand-lime"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </header>

            {post.coverImage && (
              <div className="blog-surface mb-8 overflow-hidden rounded-3xl border">
                <img src={post.coverImage} alt={post.title} className="h-auto w-full object-cover" loading="eager" />
              </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
              <div className="space-y-8">
                <div className="blog-surface-2 rounded-3xl p-6 md:p-10">
                  <div id="blog-article-body">
                    <SimpleMarkdown blocks={parsedMarkdown.blocks} inlineCta={inlineCta} />
                  </div>
                </div>

                <BlogCtaPanel
                  eyebrow="Next Step"
                  title="Ready to turn insight into pipeline?"
                  description="Get implementation support from strategy to execution, with automation opportunities mapped for your exact funnel."
                  primary={{ label: 'Book an audit', href: '/contact' }}
                  secondary={{ label: 'Explore more', href: '/blog' }}
                >
                  <EmailCapture className="!bg-transparent !border-white/10" source="blog_post_footer" />
                </BlogCtaPanel>
              </div>

              <aside className="space-y-6 lg:blog-sticky-rail">
                {parsedMarkdown.toc.length > 0 && (
                  <>
                    <details className="blog-surface rounded-2xl border p-4 lg:hidden">
                      <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.08em] text-brand-lime">
                        On this page
                      </summary>
                      <nav className="mt-4 space-y-2">
                        {parsedMarkdown.toc.map((item) => (
                          <a
                            key={`mobile-${item.id}`}
                            href={`#${item.id}`}
                            className={cn(
                              'block rounded-lg px-2 py-1 text-sm text-gray-300 transition-colors hover:text-brand-lime',
                              item.level === 3 && 'pl-5',
                              activeSectionId === item.id && 'bg-white/5 text-brand-lime'
                            )}
                            aria-current={activeSectionId === item.id ? 'location' : undefined}
                          >
                            {item.title}
                          </a>
                        ))}
                      </nav>
                    </details>
                    <section className="blog-surface hidden rounded-2xl border p-5 lg:block" aria-label="Table of contents">
                      <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-lime">On this page</h2>
                      <nav className="mt-4 space-y-2">
                        {parsedMarkdown.toc.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className={cn(
                              'block rounded-lg px-2 py-1 text-sm text-gray-300 transition-colors hover:text-brand-lime',
                              item.level === 3 && 'pl-5',
                              activeSectionId === item.id && 'bg-white/5 text-brand-lime'
                            )}
                            aria-current={activeSectionId === item.id ? 'location' : undefined}
                          >
                            {item.title}
                          </a>
                        ))}
                      </nav>
                    </section>
                  </>
                )}

                <BlogCtaPanel
                  variant="rail"
                  eyebrow="Fast path"
                  title="Need this implemented?"
                  description="Book a strategy call and get a concrete automation plan for your current stack."
                  primary={{ label: 'Book call', href: '/contact' }}
                />

                <section className="blog-surface rounded-2xl border p-5" aria-label="Related articles">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-lime">Related articles</h2>
                  {loadingRelated ? (
                    <div className="mt-4 flex justify-center py-6">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-lime" />
                    </div>
                  ) : relatedPosts.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {relatedPosts.map((relatedPost) => (
                        <BlogCard key={relatedPost.slug} post={relatedPost} variant="compact" />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-400">No related posts available yet.</p>
                  )}
                </section>
              </aside>
            </div>
          </article>
        </div>
      </BlogShell>
    </>
  );
}
