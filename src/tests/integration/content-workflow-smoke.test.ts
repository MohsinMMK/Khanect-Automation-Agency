import { describe, expect, it, vi } from 'vitest';
import { runContentWorkflow } from '../../../scripts/run-content-workflow';

describe('content workflow smoke (stubbed)', () => {
  it('publishes a matching feed item through fetch/generate/publish stubs', async () => {
    const fetchRSS = vi.fn().mockResolvedValue([
      {
        title: 'Agent automation for support teams',
        contentSnippet: 'Workflow improvements for small teams',
        link: 'https://example.com/post-1',
      },
    ]);
    const generateBlogPost = vi.fn().mockResolvedValue({
      title: 'Generated Automation Post',
      content: '# Heading\nGenerated body',
    });
    const generateSocialPost = vi.fn().mockResolvedValue({
      linkedin: 'LinkedIn copy',
      twitter: 'Twitter copy',
    });
    const publishToSupabase = vi.fn().mockResolvedValue({
      status: 'success',
      slug: 'generated-automation-post',
    });
    const sleep = vi.fn().mockResolvedValue(undefined);
    const logger = {
      log: vi.fn(),
      error: vi.fn(),
    };

    const result = await runContentWorkflow({
      rssFeeds: ['https://feed.example.com'],
      keywords: ['agent'],
      maxNewPosts: 2,
      pauseMs: 0,
      dependencies: {
        fetchRSS,
        generateBlogPost,
        generateSocialPost,
        publishToSupabase,
        sleep,
        logger,
      },
    });

    expect(result.publishedCount).toBe(1);
    expect(fetchRSS).toHaveBeenCalledWith('https://feed.example.com');
    expect(generateBlogPost).toHaveBeenCalledWith(
      'Agent automation for support teams',
      'Workflow improvements for small teams',
      'https://example.com/post-1'
    );
    expect(publishToSupabase).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Generated Automation Post',
        source_url: 'https://example.com/post-1',
        is_published: true,
      })
    );
  });

  it('continues safely when generation returns null and skips non-matching items', async () => {
    const fetchRSS = vi.fn().mockResolvedValue([
      {
        title: 'Completely unrelated topic',
        contentSnippet: 'No matching keywords',
        link: 'https://example.com/unrelated',
      },
      {
        title: 'Workflow automation update',
        contentSnippet: 'automation details',
        link: 'https://example.com/matching',
      },
    ]);
    const generateBlogPost = vi.fn().mockResolvedValue(null);
    const generateSocialPost = vi.fn().mockResolvedValue({});
    const publishToSupabase = vi.fn();
    const logger = {
      log: vi.fn(),
      error: vi.fn(),
    };

    const result = await runContentWorkflow({
      rssFeeds: ['https://feed.example.com'],
      keywords: ['automation'],
      maxNewPosts: 2,
      pauseMs: 0,
      dependencies: {
        fetchRSS,
        generateBlogPost,
        generateSocialPost,
        publishToSupabase,
        sleep: vi.fn().mockResolvedValue(undefined),
        logger,
      },
    });

    expect(result.publishedCount).toBe(0);
    expect(generateBlogPost).toHaveBeenCalledTimes(1);
    expect(generateSocialPost).not.toHaveBeenCalled();
    expect(publishToSupabase).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith('Failed to generate blog post');
  });
});
