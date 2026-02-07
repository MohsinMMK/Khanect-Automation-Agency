import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import EmailCapture from './EmailCapture';
import SEO from './SEO';
import { BlogCard } from './ui/blog-card';
import { BlogCtaPanel } from './ui/blog-cta-panel';
import { BlogShell } from './ui/blog-shell';
import { blogService } from '../services/blogService';
import { BlogPost } from '../types';
import { cn } from '@/lib/utils';

type SortMode = 'newest' | 'relevant';

function getPostTimestamp(post: BlogPost): number {
  if (!post.created_at) return 0;
  const timestamp = Date.parse(post.created_at);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getRelevanceScore(post: BlogPost, query: string): number {
  if (!query) return 0;
  const title = post.title.toLowerCase();
  const excerpt = post.excerpt.toLowerCase();
  const tags = (post.tags || []).map((tag) => tag.toLowerCase());

  let score = 0;
  if (title.includes(query)) score += 6;
  if (excerpt.includes(query)) score += 3;
  if (tags.some((tag) => tag.includes(query))) score += 4;
  return score;
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError(null);
        const data = await blogService.getLatestPosts();
        setPosts(data);
      } catch (err) {
        console.error('Failed to load blog posts', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags || []))).sort((a, b) => a.localeCompare(b)),
    [posts]
  );

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPosts = useMemo(() => {
    const next = posts.filter((post) => {
      const matchesTag = selectedTag ? (post.tags || []).includes(selectedTag) : true;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        post.title.toLowerCase().includes(normalizedSearch) ||
        post.excerpt.toLowerCase().includes(normalizedSearch) ||
        (post.tags || []).some((tag) => tag.toLowerCase().includes(normalizedSearch));
      return matchesTag && matchesSearch;
    });

    return next.sort((a, b) => {
      if (sortMode === 'relevant' && normalizedSearch) {
        const relevanceDelta = getRelevanceScore(b, normalizedSearch) - getRelevanceScore(a, normalizedSearch);
        if (relevanceDelta !== 0) return relevanceDelta;
      }
      return getPostTimestamp(b) - getPostTimestamp(a);
    });
  }, [posts, selectedTag, normalizedSearch, sortMode]);

  const featuredPost = filteredPosts[0] || null;
  const remainingPosts = filteredPosts.slice(1);

  return (
    <>
      <SEO
        title="Insights & Strategy | Khanect AI Blog"
        description="Expert insights on AI automation, agency growth algorithms, and the future of work. Read our latest articles."
        canonical="https://khanect.com/blog"
      />

      <BlogShell>
        <div className="relative z-10 pt-24 pb-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col px-6">
            <header className="mb-8 border-b border-white/10 pb-8">
              <p className="text-xs uppercase tracking-[0.12em] text-brand-lime/80">Khanect Blog</p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
                Insights on automation, growth, and AI operations
              </h1>
              <p className="mt-3 max-w-3xl text-sm text-gray-300 sm:text-base">
                Practical notes from building systems that turn traffic into qualified pipeline.
              </p>
            </header>

            <section className="blog-surface mb-10 rounded-2xl border p-4 md:p-5" aria-label="Filters">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-white/15 bg-black/20 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
                    aria-label="Search blog posts"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label htmlFor="blog-sort" className="inline-flex items-center gap-2 text-gray-300">
                    <SlidersHorizontal className="h-4 w-4" />
                    Sort
                  </label>
                  <select
                    id="blog-sort"
                    value={sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="rounded-md border border-white/15 bg-black/30 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-lime/50"
                  >
                    <option value="newest">Newest</option>
                    <option value="relevant">Most relevant</option>
                  </select>
                  <div aria-live="polite" className="ml-1 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                    {filteredPosts.length} result{filteredPosts.length === 1 ? '' : 's'}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] transition-colors',
                    selectedTag === null
                      ? 'border border-brand-lime/40 bg-brand-lime/15 text-brand-lime'
                      : 'border border-white/10 bg-white/5 text-gray-300 hover:border-brand-lime/35 hover:text-brand-lime'
                  )}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-[0.08em] transition-colors',
                      tag === selectedTag
                        ? 'border border-brand-lime/40 bg-brand-lime/15 text-brand-lime'
                        : 'border border-white/10 bg-white/5 text-gray-300 hover:border-brand-lime/35 hover:text-brand-lime'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[...Array(6)].map((_, index) => (
                  <div key={`loading-${index}`} className="blog-card-minimal animate-pulse rounded-2xl border p-5" aria-hidden="true">
                    <div className="mb-4 h-36 rounded-xl bg-white/5" />
                    <div className="mb-2 h-5 rounded bg-white/10" />
                    <div className="mb-2 h-5 w-4/5 rounded bg-white/10" />
                    <div className="h-4 w-2/3 rounded bg-white/5" />
                  </div>
                ))}
                <div className="col-span-full flex justify-center py-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-lime" />
                </div>
              </div>
            ) : error ? (
              <div role="alert" className="blog-surface rounded-2xl border p-10 text-center text-red-300">
                {error}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="blog-surface rounded-2xl border px-6 py-16 text-center md:px-10">
                <h2 className="text-lg font-semibold text-white sm:text-xl md:text-2xl">No matching articles</h2>
                <p className="mt-3 text-gray-300">No articles found matching your search.</p>
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTag(null);
                      setSortMode('newest');
                    }}
                    className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-brand-lime/40 hover:text-brand-lime"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                {featuredPost && (
                  <section aria-label="Featured story" className="mb-8">
                    <BlogCard post={featuredPost} variant="featured" />
                  </section>
                )}

                {remainingPosts.length > 0 && (
                  <section className="blog-section-separator pt-8">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {remainingPosts.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            <section id="blog-lead-capture" className="mt-14">
              <BlogCtaPanel
                eyebrow="Newsletter"
                title="Get new playbooks once a week"
                description="One concise email with practical automation tactics and execution notes."
                primary={{ label: 'Book audit', href: '/contact' }}
              >
                <div id="blog-lead-capture-form">
                  <EmailCapture source="blog_index_footer" className="!bg-transparent !border-white/10" />
                </div>
              </BlogCtaPanel>
            </section>
          </div>
        </div>
      </BlogShell>
    </>
  );
}
