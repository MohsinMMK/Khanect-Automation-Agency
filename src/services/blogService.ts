
import { supabase } from '../lib/supabase';
import { BlogPost } from '../types';

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

    return data.map(post => ({
      ...post,
      // Map DB fields to Interface
      date: new Date(post.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      readTime: post.read_time,
      coverImage: post.cover_image,
    }));
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

    return {
      ...data,
      date: new Date(data.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      readTime: data.read_time,
      coverImage: data.cover_image,
    };
  }
};
