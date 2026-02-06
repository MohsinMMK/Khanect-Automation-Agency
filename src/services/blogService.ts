import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

type BlogRecord = BlogPost & {
  read_time?: string;
  cover_image?: string;
  created_at?: string;
};

function mapPostRecord(post: BlogRecord): BlogPost {
  const createdAt = post.created_at || new Date().toISOString();
  return {
    ...post,
    date: new Date(createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    readTime: post.read_time,
    coverImage: post.cover_image,
  };
}

function getRecencyScore(post: BlogPost): number {
  if (!post.created_at) return 0;
  const timestamp = Date.parse(post.created_at);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getTagOverlapScore(postTags: string[] = [], targetTags: string[] = []): number {
  if (!postTags.length || !targetTags.length) return 0;
  const target = new Set(targetTags.map((tag) => tag.toLowerCase()));
  return postTags.reduce((score, tag) => score + (target.has(tag.toLowerCase()) ? 1 : 0), 0);
}

export const blogService = {
  async getLatestPosts(limit = 10): Promise<BlogPost[]> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching posts:', error);
      return [];
    }

    return (data || []).map((post) => mapPostRecord(post));
  },

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    return mapPostRecord(data);
  },

  async getRelatedPosts(currentSlug: string, tags: string[], limit = 3): Promise<BlogPost[]> {
    const queryLimit = Math.max(limit * 3, limit);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('is_published', true)
      .neq('slug', currentSlug)
      .order('created_at', { ascending: false })
      .limit(queryLimit);

    if (error) {
      console.error('Error fetching related posts:', error);
      return [];
    }

    const mappedPosts = (data || []).map((post) => mapPostRecord(post));

    return mappedPosts
      .sort((a, b) => {
        const tagDelta = getTagOverlapScore(b.tags, tags) - getTagOverlapScore(a.tags, tags);
        if (tagDelta !== 0) return tagDelta;
        return getRecencyScore(b) - getRecencyScore(a);
      })
      .slice(0, limit);
  },
};
