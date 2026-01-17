
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Clients
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ddmbekdbwuolpsjdhgub.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!supabaseServiceKey) {
  console.error('SERVER ERROR: SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

if (!openaiApiKey) {
  console.error('SERVER ERROR: OPENAI_API_KEY is required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const parser = new Parser();
const openai = new OpenAI({ apiKey: openaiApiKey });

// RSS Feeds to Scrape
const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'https://openai.com/blog/rss.xml'
];

// Keywords to filter relevant content
const KEYWORDS = ['agent', 'automation', 'llm', 'gpt', 'business', 'workflow', 'productivity'];

async function generateBlogPost(article: any) {
  const prompt = `
    You are an expert Automation Consultant for Khanect.com, a Business Automation Agency.
    
    Article Source: ${article.title}
    Source Content: ${article.contentSnippet || article.content || ''}
    link: ${article.link}
    
    Task: Rewrite this news into a professional, engaging blog post for business owners.
    
    Structure:
    1. **Catchy Title** (relevant to business efficiency).
    2. **The Scoop**: What happened? (Concise summary).
    3. **Why It Matters**: How this impacts business, ROI, or workflows.
    4. **Khanect's Take**: A brief thought on how automation plays a role here.
    
    Format: standard Markdown. Do not include H1 title in the body (I will use the generated title field).
    Tone: Professional, forward-thinking, verified.
    
    Return JSON format: { "title": "...", "content": "..." }
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant that generates JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');
    return {
      title: result.title || article.title,
      content: result.content || article.contentSnippet
    };
  } catch (error) {
    console.error(`Error generating content for ${article.title}:`, error);
    // Fallback to basic content if AI fails across the board, but for now just return null to skip
    return null;
  }
}

async function generateSocialPost(postTitle: string, postContent: string) {
  const prompt = `
    You are a Social Media Manager for Khanect.com.
    
    Blog Post Title: ${postTitle}
    Blog Post Content (excerpt): ${postContent.substring(0, 500)}...
    
    Task: Write a LinkedIn post and a Twitter/X thread starter to promote this article.
    
    Format JSON:
    {
      "linkedin": "...",
      "twitter": "..."
    }
  `;

  try {
     const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI assistant that generates JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (e) {
    console.error("Error generating social output", e);
    return null;
  }
}

async function runAgent() {
  console.log('🤖 Agent Starting...');
  let newPostsCount = 0;

  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Checking feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);

      for (const item of feed.items) {
        // 1. Filter Check
        const matchesKeyword = KEYWORDS.some(k => item.title?.toLowerCase().includes(k) || item.contentSnippet?.toLowerCase().includes(k));
        if (!matchesKeyword) continue;

        // 2. Slug & Duplication Check
        const slug = item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';
        
        // Optimize: Check if exists to avoid burning API tokens on existing posts
        const { data: existing } = await supabase.from('posts').select('id').eq('slug', slug).single();
        if (existing) {
          // console.log(`Skipping existing: ${slug}`);
          continue;
        }

        console.log(`⚡ Analyzing: ${item.title}`);

        // 3. AI Generation
        const aiPost = await generateBlogPost(item);
        if (!aiPost) continue;

        // 3.5. Social Media Repurposing
        const socialContent = await generateSocialPost(aiPost.title, aiPost.content);
        if (socialContent) {
            console.log(`📱 Generated Social Content for ${slug}:`);
            console.log(`   LI: ${socialContent.linkedin?.substring(0, 50)}...`);
            console.log(`   TW: ${socialContent.twitter?.substring(0, 50)}...`);
            // In a future version, we would save this to a 'social_posts' table or column.
        }

        // 4. Upsert to Supabase
        const { error } = await supabase
          .from('posts')
          .upsert({
            slug: slug,
            title: aiPost.title,
            excerpt: item.contentSnippet?.substring(0, 150) + '...',
            content: aiPost.content,
            is_published: true,
            source_url: item.link,
            tags: ['AI News', 'Automation'],
            cover_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000" // Default AI image
          }, { onConflict: 'slug' });

        if (error) {
          console.error(`Failed to save ${slug}:`, error.message);
        } else {
          console.log(`✅ Published: ${slug}`);
          newPostsCount++;
          
          // Rate limit protection: sleep a bit between gens
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // Limit to 2 posts per run per feed to save tokens/spam
        if (newPostsCount >= 5) break; 
      }
    } catch (err) {
      console.error(`Error processing feed ${feedUrl}:`, err);
    }
    if (newPostsCount >= 5) break;
  }

  console.log(`Agent Finished. Generated ${newPostsCount} new posts.`);
}

runAgent();
