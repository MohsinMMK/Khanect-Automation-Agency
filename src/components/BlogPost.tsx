import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Clock, Share2, Tag } from 'lucide-react';
import EmailCapture from './EmailCapture';
import SEO from './SEO';
import Navbar from './Navbar';
import Footer from './Footer';
import { blogService } from '../services/blogService';
import { BlogPost as BlogPostType } from '../types';
import { useStructuredData } from '../hooks/useStructuredData';
import {
  combineSchemas,
  generateArticleSchema,
  generateOrganizationSchema,
} from '../utils/structuredData';

// Use same background as LandingPage
const BackgroundGradient = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-lime/10 rounded-full blur-[100px] opacity-20" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[100px] opacity-20" />
  </div>
);

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

// Helper to render simple markdown content without HTML injection.
const SimpleMarkdown = ({ content }: { content: string }) => {
  if (typeof content !== 'string' || content.trim() === '') {
    return (
      <p className="text-gray-300 leading-relaxed mb-6 text-lg">
        Content unavailable.
      </p>
    );
  }

  try {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    let currentList: React.ReactNode[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';

    const flushList = (keyPrefix: number) => {
      if (!inList || currentList.length === 0) return;

      const sharedClass = 'pl-6 mb-6 space-y-2 text-gray-300';
      elements.push(
        listType === 'ol' ? (
          <ol key={`list-${keyPrefix}`} className={`list-decimal ${sharedClass}`}>
            {[...currentList]}
          </ol>
        ) : (
          <ul key={`list-${keyPrefix}`} className={`list-disc ${sharedClass}`}>
            {[...currentList]}
          </ul>
        )
      );

      currentList = [];
      inList = false;
      listType = 'ul';
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList(index);
        return;
      }

      if (trimmed.startsWith('# ')) {
        flushList(index);
        elements.push(
          <h1 key={index} className="text-3xl md:text-4xl font-bold text-white mt-12 mb-6">
            {renderInlineMarkdown(trimmed.substring(2), `h1-${index}`)}
          </h1>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushList(index);
        elements.push(
          <h2 key={index} className="text-2xl md:text-3xl font-semibold text-white mt-10 mb-5">
            {renderInlineMarkdown(trimmed.substring(3), `h2-${index}`)}
          </h2>
        );
        return;
      }

      if (trimmed.startsWith('### ')) {
        flushList(index);
        elements.push(
          <h3 key={index} className="text-xl font-semibold text-brand-lime mt-8 mb-4">
            {renderInlineMarkdown(trimmed.substring(4), `h3-${index}`)}
          </h3>
        );
        return;
      }

      const unorderedMatch = /^[-*]\s+(.+)/.exec(trimmed);
      const orderedMatch = /^\d+\.\s+(.+)/.exec(trimmed);
      if (unorderedMatch || orderedMatch) {
        const nextListType: 'ul' | 'ol' = orderedMatch ? 'ol' : 'ul';
        if (!inList) {
          inList = true;
          listType = nextListType;
        } else if (listType !== nextListType) {
          flushList(index);
          inList = true;
          listType = nextListType;
        }

        const listContent = (orderedMatch?.[1] ?? unorderedMatch?.[1] ?? '').trim();
        currentList.push(
          <li key={`li-${index}`}>
            {renderInlineMarkdown(listContent, `li-${index}`)}
          </li>
        );
        return;
      }

      flushList(index);
      elements.push(
        <p key={index} className="text-gray-300 leading-relaxed mb-6 text-lg">
          {renderInlineMarkdown(trimmed, `p-${index}`)}
        </p>
      );
    });

    flushList(lines.length);
    return <div className="markdown-content">{elements}</div>;
  } catch (error) {
    console.error('Failed to render markdown content safely', error);
    return (
      <pre className="whitespace-pre-wrap break-words text-gray-300 leading-relaxed mb-6 text-lg">
        {content}
      </pre>
    );
  }
};

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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
     return <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">Loading...</div>;
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Unable to Load Post</h1>
          <p className="text-gray-400 mb-6">{loadError}</p>
          <button onClick={() => navigate('/blog')} className="text-brand-lime hover:underline">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <button onClick={() => navigate('/blog')} className="text-brand-lime hover:underline">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: shareUrl,
        });
      } catch (err) {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      // Could add toast here
    }
  };

  return (
    <>
      <SEO 
        title={`${post.title} | Khanect AI Blog`}
        description={post.excerpt}
        canonical={canonicalUrl}
        type="article"
        image={post.coverImage}
      />

      <div className="min-h-screen bg-gray-950 text-white relative">
        <BackgroundGradient />
        
        {/* Progress Bar (Optional, could add later) */}

        <div className="relative z-10 pt-24 pb-20">
          <article className="max-w-3xl mx-auto px-6">
            
            {/* Back Link */}
            <Link to="/blog" className="inline-flex items-center text-gray-400 hover:text-brand-lime mb-8 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Articles
            </Link>

            {/* Header */}
            <header className="mb-12">
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-brand-lime/10 border border-brand-lime/20 rounded-full text-brand-lime text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold leading-tight mb-6"
              >
                {post.title}
              </motion.h1>

              <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm border-b border-white/10 pb-8">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author || 'Khanect AI'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readTime || '5 min read'}</span>
                </div>
                
                <button 
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-2 хоver:text-white transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <SimpleMarkdown content={post.content} />
            </div>

            {/* Email Capture */}
            <EmailCapture className="mt-16" source="blog_post_footer" />

            {/* Footer / CTA */}
            <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Automate?</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Stop reading about efficiency and start achieving it. Book a free audit to see where AI can save you time.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center px-8 py-3 bg-brand-lime text-black font-semibold rounded-full hover:shadow-glow-lime transition-all transform hover:scale-105"
              >
                Book an Audit
              </Link>
            </div>

          </article>
        </div>
      </div>
    </>
  );
}
