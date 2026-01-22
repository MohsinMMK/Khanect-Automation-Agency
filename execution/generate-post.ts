
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { parseArgs } from "util";

// Load env from project root
dotenv.config({ path: '.env.local' });

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  console.error("Error: OPENAI_API_KEY not found in .env.local");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: openaiApiKey });

// Parse CLI args
const { values } = parseArgs({
  args: Bun.argv,
  options: {
    title: { type: 'string' },
    content: { type: 'string' },
    link: { type: 'string' },
  },
  strict: true,
  allowPositionals: true,
});

if (!values.title) {
  console.error("Error: --title is required");
  process.exit(1);
}

// 1. Generate Blog Post
async function generateBlogPost(title: string, contentSnippet: string, link: string) {
  const prompt = `
    You are an expert Automation Consultant for Khanect.com.
    
    Article Source: ${title}
    Source Content: ${contentSnippet || ''}
    link: ${link}
    
    Task: Rewrite this news into a professional, engaging blog post for business owners.
    
    Structure:
    1. **Catchy Title** (relevant to business efficiency).
    2. **The Scoop**: What happened? (Concise summary).
    3. **Why It Matters**: How this impacts business, ROI, or workflows.
    4. **Khanect's Take**: A brief thought on how automation plays a role here.
    
    Format: standard Markdown.
    Tone: Professional, forward-thinking.
    
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

    return JSON.parse(completion.choices[0].message.content || '{}');
  } catch (error) {
    console.error(`Error generating blog post:`, error);
    return null;
  }
}

// 2. Generate Social Media Posts
async function generateSocialPost(postTitle: string, postContent: string) {
  const prompt = `
    You are a Social Media Manager for Khanect.com.
    
    Blog Post Title: ${postTitle}
    Excerpt: ${postContent.substring(0, 500)}...
    
    Task: Write a LinkedIn post and a Twitter/X thread starter.
    
    Format JSON: { "linkedin": "...", "twitter": "..." }
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
    console.error("Error generating social content", e);
    return null;
  }
}

async function run() {
  const { title, content, link } = values;
  
  // A. Generate Blog Content
  const blogPost = await generateBlogPost(title!, content || '', link || '');
  if (!blogPost) {
      process.exit(1);
  }

  // B. Generate Social Content
  const socialPost = await generateSocialPost(blogPost.title, blogPost.content);

  // Output Combined Result
  console.log(JSON.stringify({
      original_title: title,
      title: blogPost.title,
      content: blogPost.content,
      social: socialPost
  }, null, 2));
}

run();
