import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BlogPost from '../../components/BlogPost';
import { blogService } from '../../services/blogService';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock('../../services/blogService', () => ({
  blogService: {
    getPostBySlug: vi.fn(),
  },
}));

vi.mock('../../components/EmailCapture', () => ({
  default: () => <div data-testid="email-capture">Email Capture</div>,
}));

vi.mock('../../components/SEO', () => ({
  default: () => <div data-testid="seo">SEO Component</div>,
}));

function renderWithRoute(path = '/blog/test-post') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('BlogPost Markdown Rendering', () => {
  it('renders safe markdown links and formatting', async () => {
    (blogService.getPostBySlug as any).mockResolvedValue({
      slug: 'test-post',
      title: 'Test Post',
      excerpt: 'Summary',
      content:
        '# Heading\nThis has **bold** text and a [safe link](https://example.com).\n- First item',
      tags: ['AI'],
      created_at: '2026-02-01T00:00:00Z',
      readTime: '5 min read',
      author: 'Khanect Team',
      coverImage: '/cover.jpg',
    });

    renderWithRoute('/blog/test-post');

    await waitFor(() => {
      expect(screen.getByText('Heading')).toBeInTheDocument();
    });

    expect(screen.getByText('bold')).toBeInTheDocument();
    const safeLink = screen.getByRole('link', { name: 'safe link' });
    expect(safeLink).toHaveAttribute('href', 'https://example.com');
  });

  it('does not render unsafe javascript links as anchors', async () => {
    (blogService.getPostBySlug as any).mockResolvedValue({
      slug: 'unsafe-post',
      title: 'Unsafe Post',
      excerpt: 'Summary',
      content: 'Attempt [click me](javascript:alert(1)) now.',
      tags: ['AI'],
      created_at: '2026-02-01T00:00:00Z',
      readTime: '5 min read',
      author: 'Khanect Team',
      coverImage: '/cover.jpg',
    });

    renderWithRoute('/blog/unsafe-post');

    await waitFor(() => {
      expect(screen.getByText('Unsafe Post')).toBeInTheDocument();
    });

    expect(screen.queryByRole('link', { name: 'click me' })).not.toBeInTheDocument();
    expect(
      screen.getByText(/Attempt \[click me\]\(javascript:alert\(1\)\) now\./)
    ).toBeInTheDocument();
  });

  it('shows fallback message for malformed non-string content', async () => {
    (blogService.getPostBySlug as any).mockResolvedValue({
      slug: 'bad-post',
      title: 'Bad Post',
      excerpt: 'Summary',
      content: null,
      tags: ['AI'],
      created_at: '2026-02-01T00:00:00Z',
      readTime: '5 min read',
      author: 'Khanect Team',
      coverImage: '/cover.jpg',
    });

    renderWithRoute('/blog/bad-post');

    await waitFor(() => {
      expect(screen.getByText('Content unavailable.')).toBeInTheDocument();
    });
  });

  it('renders not-found state when post does not exist', async () => {
    (blogService.getPostBySlug as any).mockResolvedValue(null);

    renderWithRoute('/blog/missing-post');

    await waitFor(() => {
      expect(screen.getByText('Post Not Found')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Back to Blog' })).toBeInTheDocument();
  });

  it('renders error state when post loading throws', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (blogService.getPostBySlug as any).mockRejectedValue(new Error('network'));

    renderWithRoute('/blog/error-post');

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Post')).toBeInTheDocument();
      expect(screen.getByText('Unable to load post. Please try again later.')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalled();
  });
});
