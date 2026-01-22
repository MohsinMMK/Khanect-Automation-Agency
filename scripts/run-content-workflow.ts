
import { spawn } from "bun";

// Configuration (Mirroring the Directive)
const RSS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
  'https://openai.com/blog/rss.xml'
];

const KEYWORDS = ['agent', 'automation', 'llm', 'gpt', 'business', 'workflow', 'productivity'];

async function runCommand(cmd: string[], input?: any): Promise<any> {
  const proc = spawn(cmd, {
    stdin: input ? "pipe" : "ignore",
    stdout: "pipe",
    stderr: "inherit", 
  });

  if (input) {
      const stdin = proc.stdin; // stream
      stdin.write(JSON.stringify(input));
      stdin.end();
  }

  const output = await new Response(proc.stdout).text();
  await proc.exited;

  if (proc.exitCode !== 0) {
    throw new Error(`Command failed with exit code ${proc.exitCode}: ${cmd.join(' ')}`);
  }

  try {
      return JSON.parse(output);
  } catch (e) {
      return output; // Return raw text if not JSON
  }
}

async function main() {
  console.log("🚀 Starting Daily Content Workflow...");

  let newPosts = 0;

  for (const feedUrl of RSS_FEEDS) {
    console.log(`\n📡 Fetching Feed: ${feedUrl}`);
    
    try {
        // Step 1: Fetch
        const items = await runCommand(["bun", "execution/fetch-rss.ts", "--url", feedUrl]);
        
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
                 const generated = await runCommand([
                     "bun", "execution/generate-post.ts",
                     "--title", item.title,
                     "--content", item.contentSnippet || '',
                     "--link", item.link || ''
                 ]);
                 
                 // Step 3: Publish
                 console.log("      💾 Publishing to Supabase...");
                 const result = await runCommand(["bun", "execution/publish-supabase.ts"], generated);
                 
                 console.log(`      ✅ Published! Slug: ${result.slug}`);
                 newPosts++;

                 // Rate Limit Pause
                 await new Promise(r => setTimeout(r, 2000));

                 if (newPosts >= 2) break; // Limit for testing
             } catch (err) {
                 console.error(`      ❌ Failed to process item: ${err}`);
             }
        }

    } catch (err) {
        console.error(`❌ Failed feed ${feedUrl}: ${err}`);
    }
  }

  console.log(`\n🎉 Workflow Complete. Published ${newPosts} new posts.`);
}

main();
