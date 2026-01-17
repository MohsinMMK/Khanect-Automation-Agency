
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Blog from '../../components/Blog';
import { blogService } from '../../services/blogService';
import { cleanup } from '@testing-library/react';

// Cleanup
afterEach(() => {
    cleanup();
});

// Mock blogService
vi.mock('../../services/blogService', () => ({
  blogService: {
    getLatestPosts: vi.fn(),
  },
}));

// Mock EmailCapture
vi.mock('../../components/EmailCapture', () => ({
  default: () => <div data-testid="email-capture">Email Capture</div>,
}));

// Mock SEO
vi.mock('../../components/SEO', () => ({
  default: () => <div data-testid="seo">SEO Component</div>,
}));

describe('Blog Component Integration', () => {
  const mockPosts = [
    {
      slug: 'test-post-1',
      title: 'Test Post 1',
      excerpt: 'This is a test post excerpt.',
      content: 'Full content here',
      date: '2023-10-01',
      author: 'Test Author',
      readTime: '5 min read',
      tags: ['AI', 'Automation'],
      coverImage: '/test-image.jpg',
      created_at: '2023-10-01T00:00:00Z',
    },
    {
      slug: 'test-post-2',
      title: 'Test Post 2',
      excerpt: 'Another test post.',
      content: 'More content',
      date: '2023-10-02',
      author: 'Test Author',
      readTime: '3 min read',
      tags: ['Strategy'],
      coverImage: '/test-image-2.jpg',
      created_at: '2023-10-02T00:00:00Z',
    },
  ];

  it('renders loading state initially', () => {
    (blogService.getLatestPosts as any).mockReturnValue(new Promise(() => {})); 
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('renders blog posts after loading', async () => {
    (blogService.getLatestPosts as any).mockResolvedValue(mockPosts);
    
    render(
      <MemoryRouter>
        <Blog />
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('filters posts by search term', async () => {
    (blogService.getLatestPosts as any).mockResolvedValue(mockPosts);

    render(
        <MemoryRouter>
            <Blog />
        </MemoryRouter>
    );

    await waitFor(() => screen.getByText('Test Post 1'));

    const searchInput = screen.getByPlaceholderText('Search articles...');
    // Use fireEvent for simplicity
    fireEvent.change(searchInput, { target: { value: 'Another' } });

    await waitFor(() => {
        expect(screen.queryByText('Test Post 1')).not.toBeInTheDocument();
        expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it.skip('filters posts by tag', async () => {
    (blogService.getLatestPosts as any).mockResolvedValue(mockPosts);

    render(
        <MemoryRouter>
            <Blog />
        </MemoryRouter>
    );

    // Wait for tags to load (derived from posts)
    await waitFor(() => expect(screen.getByText('AI')).toBeInTheDocument());

    const aiTagButton = screen.getByRole('button', { name: 'AI' });
    fireEvent.click(aiTagButton);

    await waitFor(() => {
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.queryByText('Test Post 2')).not.toBeInTheDocument();
    });
  });
});
