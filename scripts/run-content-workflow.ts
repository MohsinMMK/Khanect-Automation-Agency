type FeedItem = {
  title?: string | null;
  contentSnippet?: string | null;
  link?: string | null;
};

type GeneratedBlogPost = {
  title: string;
  content: string;
};

type SocialPost = {
  linkedin?: string;
  twitter?: string;
};

type PublishResult = {
  status?: string;
  slug: string;
};

type WorkflowLogger = {
  log: (message: string) => void;
  error: (message: string) => void;
};

export type WorkflowDependencies = {
  fetchRSS: (url: string) => Promise<FeedItem[]>;
  generateBlogPost: (
    title: string,
    contentSnippet: string,
    link: string
  ) => Promise<GeneratedBlogPost | null>;
  generateSocialPost: (
    postTitle: string,
    postContent: string
  ) => Promise<SocialPost | null>;
  publishToSupabase: (payload: Record<string, unknown>) => Promise<PublishResult>;
  sleep: (ms: number) => Promise<void>;
  logger: WorkflowLogger;
};

export type WorkflowOptions = {
  rssFeeds?: string[];
  keywords?: string[];
  maxNewPosts?: number;
  pauseMs?: number;
  dependencies?: Partial<WorkflowDependencies>;
};

const DEFAULT_RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'https://openai.com/blog/rss.xml',
];

const DEFAULT_KEYWORDS = ['agent', 'automation', 'llm', 'gpt', 'business', 'workflow', 'productivity'];
const DEFAULT_MAX_NEW_POSTS = 2;
const DEFAULT_PAUSE_MS = 2000;

const defaultLogger: WorkflowLogger = {
  log: (message: string) => console.log(message),
  error: (message: string) => console.error(message),
};

const defaultDependencies: WorkflowDependencies = {
  fetchRSS: async (url: string) => {
    const { fetchRSS } = await import('../execution/fetch-rss');
    return fetchRSS(url);
  },
  generateBlogPost: async (title: string, contentSnippet: string, link: string) => {
    const { generateBlogPost } = await import('../execution/generate-post');
    return generateBlogPost(title, contentSnippet, link);
  },
  generateSocialPost: async (postTitle: string, postContent: string) => {
    const { generateSocialPost } = await import('../execution/generate-post');
    return generateSocialPost(postTitle, postContent);
  },
  publishToSupabase: async (payload: Record<string, unknown>) => {
    const { publishToSupabase } = await import('../execution/publish-supabase');
    return publishToSupabase(payload);
  },
  sleep: async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  logger: defaultLogger,
};

export async function runContentWorkflow(options: WorkflowOptions = {}): Promise<{ publishedCount: number }> {
  const rssFeeds = options.rssFeeds ?? DEFAULT_RSS_FEEDS;
  const keywords = options.keywords ?? DEFAULT_KEYWORDS;
  const maxNewPosts = options.maxNewPosts ?? DEFAULT_MAX_NEW_POSTS;
  const pauseMs = options.pauseMs ?? DEFAULT_PAUSE_MS;
  const deps: WorkflowDependencies = {
    ...defaultDependencies,
    ...options.dependencies,
  };

  deps.logger.log('Starting Daily Content Workflow...');

  let newPosts = 0;

  for (const feedUrl of rssFeeds) {
    deps.logger.log(`Fetching feed: ${feedUrl}`);

    try {
      const items = await deps.fetchRSS(feedUrl);

      if (!Array.isArray(items)) {
        deps.logger.error('Invalid feed output');
        continue;
      }

      deps.logger.log(`Found ${items.length} items. Filtering...`);

      for (const item of items) {
        const lowerTitle = (item.title || '').toLowerCase();
        const lowerContent = (item.contentSnippet || '').toLowerCase();
        const matches = keywords.some((keyword) =>
          lowerTitle.includes(keyword) || lowerContent.includes(keyword)
        );

        if (!matches) continue;
        deps.logger.log(`Processing: ${item.title || '(untitled item)'}`);

        try {
          if (!item.title) {
            deps.logger.error('Skipping item with missing title');
            continue;
          }

          const blogPost = await deps.generateBlogPost(
            item.title,
            item.contentSnippet || '',
            item.link || ''
          );

          if (!blogPost) {
            deps.logger.error('Failed to generate blog post');
            continue;
          }

          const socialPost = await deps.generateSocialPost(blogPost.title, blogPost.content);
          const generatedData = {
            original_title: item.title,
            title: blogPost.title,
            content: blogPost.content,
            is_published: true,
            source_url: item.link || '',
            social: socialPost,
          };

          deps.logger.log('Publishing to Supabase...');
          const result = await deps.publishToSupabase(generatedData);
          deps.logger.log(`Published slug: ${result.slug}`);
          newPosts++;

          if (pauseMs > 0) {
            await deps.sleep(pauseMs);
          }

          if (newPosts >= maxNewPosts) break;
        } catch (error) {
          deps.logger.error(`Failed to process item: ${String(error)}`);
        }
      }

      if (newPosts >= maxNewPosts) break;
    } catch (error) {
      deps.logger.error(`Failed feed ${feedUrl}: ${String(error)}`);
    }
  }

  deps.logger.log(`Workflow complete. Published ${newPosts} new posts.`);
  return { publishedCount: newPosts };
}

if (import.meta.main) {
  runContentWorkflow().catch((error) => {
    console.error(`Workflow failed: ${String(error)}`);
    process.exit(1);
  });
}
