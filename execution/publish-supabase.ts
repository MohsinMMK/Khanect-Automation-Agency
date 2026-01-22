
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { parseArgs } from "util";

// Load env
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read JSON from Stdin or File? 
// For simplicity in this workflow, let's accept a JSON string as an arg, 
// OR simpler: read from stdin if no args provided. 
// Let's us Bun.stdin.stream() or just `await Bun.stdin.text()`

async function run() {
  try {
    const inputData = await Bun.stdin.json();
    
    if (!inputData.title || !inputData.content) {
        throw new Error("Missing title or content in input JSON");
    }

    // Slug generation
    const slug = inputData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Upsert
    const { error } = await supabase
        .from('posts')
        .upsert({
            slug: slug,
            title: inputData.title,
            excerpt: inputData.content.substring(0, 150) + '...',
            content: inputData.content,
            is_published: true,
            source_url: inputData.source_url || '',
            tags: ['AI News', 'Automation'],
            cover_image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=2000"
        }, { onConflict: 'slug' });

    if (error) {
        console.error(`Supabase Error: ${error.message}`);
        process.exit(1);
    }

    console.log(JSON.stringify({ status: "success", slug: slug }));

  } catch (err) {
    console.error(`Error publishing to Supabase: ${err}`);
    process.exit(1);
  }
}

run();
