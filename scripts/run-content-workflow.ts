
import { fetchRSS } from "../execution/fetch-rss";
import { generateBlogPost, generateSocialPost } from "../execution/generate-post";
import { publishToSupabase } from "../execution/publish-supabase";

// Configuration (Mirroring the Directive)
const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'https://openai.com/blog/rss.xml'
];

const KEYWORDS = ['agent', 'automation', 'llm', 'gpt', 'business', 'workflow', 'productivity'];

async function main() {
  console.log("🚀 Starting Daily Content Workflow...");

  let newPosts = 0;

  for (const feedUrl of RSS_FEEDS) {
    console.log(`\n📡 Fetching Feed: ${feedUrl}`);
    
    try {
        // Step 1: Fetch
        const items = await fetchRSS(feedUrl);
        
        if (!Array.isArray(items)) {
            console.error("Invalid feed output");
            continue;
        }

        console.log(`   Found ${items.length} items. Filtering...`);

        // Filter Loop
        for (const item of items) {
             const lowerTitle = (item.title || '').toLowerCase();
             const lowerContent = (item.contentSnippet || '').toLowerCase();
             
             const matches = KEYWORDS.some(k => lowerTitle.includes(k) || lowerContent.includes(k));
             if (!matches) continue; 

             console.log(`   ✨ Processing: ${item.title}`);

             // Step 2: Generate
             try {
                 const blogPost = await generateBlogPost(item.title!, item.contentSnippet || '', item.link || '');
                 if (!blogPost) {
                     console.error("      ❌ Failed to generate blog post.");
                     continue;
                 }

                 const socialPost = await generateSocialPost(blogPost.title, blogPost.content);

                 const generatedData = {
                     original_title: item.title,
                     title: blogPost.title,
                     content: blogPost.content,
                     is_published: true,
                     source_url: item.link || '',
                     social: socialPost
                 };
                 
                 // Step 3: Publish
                 console.log("      💾 Publishing to Supabase...");
                 const result = await publishToSupabase(generatedData);
                 
                 console.log(`      ✅ Published! Slug: ${result.slug}`);
                 newPosts++;

                 // Rate Limit Pause
                 await new Promise(r => setTimeout(r, 2000));

                 if (newPosts >= 2) break; // Limit for testing
             } catch (err) {
                 console.error(`      ❌ Failed to process item: ${err}`);
             }
        }
        if (newPosts >= 2) break;

    } catch (err) {
        console.error(`❌ Failed feed ${feedUrl}: ${err}`);
    }
  }

  console.log(`\n🎉 Workflow Complete. Published ${newPosts} new posts.`);
}

main();
