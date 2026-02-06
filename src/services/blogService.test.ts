import { beforeEach, describe, expect, it, vi } from 'vitest';
import { blogService } from './blogService';
import { supabase } from '../lib/supabase';

const queryBuilder = {
  select: vi.fn(),
  eq: vi.fn(),
  neq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  single: vi.fn(),
};

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => queryBuilder),
  },
}));

describe('blogService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryBuilder.select.mockReturnValue(queryBuilder);
    queryBuilder.eq.mockReturnValue(queryBuilder);
    queryBuilder.neq.mockReturnValue(queryBuilder);
    queryBuilder.order.mockReturnValue(queryBuilder);
    queryBuilder.limit.mockReset();
    queryBuilder.single.mockReset();
  });

  it('maps latest posts from DB fields to UI fields', async () => {
    const createdAt = '2026-02-04T12:00:00Z';
    queryBuilder.limit.mockResolvedValue({
      data: [
        {
          id: '1',
          slug: 'mapped-post',
          title: 'Mapped',
          excerpt: 'excerpt',
          content: 'content',
          tags: ['AI'],
          created_at: createdAt,
          read_time: '4 min read',
          cover_image: 'https://example.com/cover.jpg',
          is_published: true,
        },
      ],
      error: null,
    });

    const result = await blogService.getLatestPosts(5);

    expect(supabase.from).toHaveBeenCalledWith('posts');
    expect(queryBuilder.eq).toHaveBeenCalledWith('is_published', true);
    expect(queryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(queryBuilder.limit).toHaveBeenCalledWith(5);
    expect(result[0].readTime).toBe('4 min read');
    expect(result[0].coverImage).toBe('https://example.com/cover.jpg');
    expect(result[0].date).toBe(
      new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  });

  it('returns empty array when latest posts query fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    queryBuilder.limit.mockResolvedValue({
      data: null,
      error: { message: 'query failed' },
    });

    const result = await blogService.getLatestPosts();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('maps single post DB fields to UI fields', async () => {
    const createdAt = '2026-02-05T09:30:00Z';
    queryBuilder.single.mockResolvedValue({
      data: {
        id: '2',
        slug: 'single-post',
        title: 'Single',
        excerpt: 'excerpt',
        content: 'content',
        tags: ['Automation'],
        created_at: createdAt,
        read_time: '6 min read',
        cover_image: 'https://example.com/single.jpg',
        is_published: true,
      },
      error: null,
    });

    const result = await blogService.getPostBySlug('single-post');

    expect(supabase.from).toHaveBeenCalledWith('posts');
    expect(queryBuilder.eq).toHaveBeenCalledWith('slug', 'single-post');
    expect(queryBuilder.single).toHaveBeenCalled();
    expect(result?.readTime).toBe('6 min read');
    expect(result?.coverImage).toBe('https://example.com/single.jpg');
    expect(result?.date).toBe(
      new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  });

  it('returns null when single post query fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    queryBuilder.single.mockResolvedValue({
      data: null,
      error: { message: 'not found' },
    });

    const result = await blogService.getPostBySlug('missing');

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('returns related posts sorted by tag overlap and recency', async () => {
    queryBuilder.limit.mockResolvedValue({
      data: [
        {
          id: 'a',
          slug: 'recency-post',
          title: 'Recent',
          excerpt: 'excerpt',
          content: 'content',
          tags: ['AI'],
          created_at: '2026-02-06T12:00:00Z',
          read_time: '5 min read',
          cover_image: 'https://example.com/a.jpg',
          is_published: true,
        },
        {
          id: 'b',
          slug: 'tag-match-post',
          title: 'Tag Match',
          excerpt: 'excerpt',
          content: 'content',
          tags: ['Automation', 'AI'],
          created_at: '2026-02-05T09:00:00Z',
          read_time: '6 min read',
          cover_image: 'https://example.com/b.jpg',
          is_published: true,
        },
      ],
      error: null,
    });

    const result = await blogService.getRelatedPosts('current-post', ['Automation'], 2);

    expect(queryBuilder.eq).toHaveBeenCalledWith('is_published', true);
    expect(queryBuilder.neq).toHaveBeenCalledWith('slug', 'current-post');
    expect(queryBuilder.limit).toHaveBeenCalledWith(6);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('tag-match-post');
  });

  it('returns empty array when related posts query fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    queryBuilder.limit.mockResolvedValue({
      data: null,
      error: { message: 'related query failed' },
    });

    const result = await blogService.getRelatedPosts('current-post', ['AI']);

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
