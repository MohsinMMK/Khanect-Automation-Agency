
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ddmbekdbwuolpsjdhgub.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SERVER ERROR: SUPABASE_SERVICE_ROLE_KEY is required to run the agent.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser();

// Reliable AI Tech Feeds
const FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/artificial-intelligence/index.xml',
  'https://openai.com/blog/rss.xml'
];

// Keywords to filter relevant content
const KEYWORDS = ['agent', 'automation', 'llm', 'gpt', 'productivity', 'enterprise', 'scale'];

async function fetchAndProcessFeeds() {
  console.log('🤖 Agent Starting: Scanning for AI News...');
  
  for (const feedUrl of FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      console.log(`\nChecking source: ${feed.title}`);

      for (const item of feed.items) {
        if (!item.title || !item.contentSnippet || !item.link) continue;

        // 1. Filter: Check if relevant
        const textToScan = (item.title + item.contentSnippet).toLowerCase();
        const isRelevant = KEYWORDS.some(k => textToScan.includes(k));

        if (!isRelevant) continue;

        // 2. Transform: Create a slug and mock "AI Synthesis" 
        // In production, you would pass 'item.content' to GPT-4 here to rewrite it.
        // For now, we wrap the RSS snippet in a nice markdown block.
        const slug = item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const generatedContent = `
# Status Update: ${item.title}

${item.contentSnippet}

> **Agent Note**: This is a trending story in the world of AI Automation.

## Why this matters for your Agency
Staying ahead of these updates is crucial. If you're looking to implement this technology, [book a demo](/contact) with us.

---
*Source: [${feed.title}](${item.link})*
        `;

        // 3. Upsert to Supabase
        const { error } = await supabase
          .from('posts')
          .upsert({
            slug: slug,
            title: item.title,
            excerpt: item.contentSnippet.substring(0, 150) + '...',
            content: generatedContent,
            source_url: item.link,
            author: 'AI Agent',
            read_time: '2 min update',
            tags: ['News', 'AI Update'],
            is_published: true,
            created_at: new Date(item.pubDate || new Date()).toISOString(),
          }, { onConflict: 'slug' });

        if (error) {
          console.error(`❌ Failed to save: ${item.title}`, error);
        } else {
          console.log(`✅ Processed: ${item.title}`);
        }
      }

    } catch (err) {
      console.error(`Error reading feed ${feedUrl}:`, err);
    }
  }
  
  console.log('\n🤖 Agent Finished with duty.');
}

fetchAndProcessFeeds();
