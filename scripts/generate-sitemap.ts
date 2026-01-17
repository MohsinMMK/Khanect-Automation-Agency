
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SITE_URL = 'https://khanect.com';

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables. Skipping dynamic sitemap generation.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Static Routes - Manual definitions to ensure control
interface Route {
  path: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

const STATIC_ROUTES: Route[] = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/pricing', priority: '0.9', changefreq: 'monthly' },
  { path: '/contact', priority: '0.9', changefreq: 'monthly' },
  // Services
  { path: '/services/n8n-workflow-automation', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/ai-powered-chatbots', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/crm-integrations', priority: '0.8', changefreq: 'monthly' },
  { path: '/services/lead-generation-automation', priority: '0.8', changefreq: 'monthly' },
  // Industries
  { path: '/industries/healthcare-automation', priority: '0.8', changefreq: 'monthly' },
  { path: '/industries/automobile-industry-automation', priority: '0.8', changefreq: 'monthly' },
  { path: '/industries/ecommerce-automation', priority: '0.8', changefreq: 'monthly' },
  { path: '/industries/real-estate-automation', priority: '0.8', changefreq: 'monthly' },
  { path: '/industries/coaching-consulting-automation', priority: '0.8', changefreq: 'monthly' },
  { path: '/industries/agency-automation', priority: '0.8', changefreq: 'monthly' },
  // Blog Index
  { path: '/blog', priority: '0.9', changefreq: 'daily' },
];

async function generateSitemap() {
  console.log('🗺️ Generating Sitemap...');

  let routes = [...STATIC_ROUTES];

  // Fetch Dynamic Blog Posts
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, created_at')
      .eq('is_published', true);

    if (error) throw error;

    if (posts && posts.length > 0) {
      console.log(`📝 Found ${posts.length} blog posts.`);
      const blogRoutes = posts.map(post => ({
        path: `/blog/${post.slug}`,
        priority: '0.7',
        changefreq: 'weekly',
        lastmod: (post.updated_at || post.created_at || new Date().toISOString()).split('T')[0]
      }));
      routes = [...routes, ...blogRoutes];
    }
  } catch (err) {
    console.warn('⚠️ Failed to fetch blog posts for sitemap. Using static routes only.', err);
  }

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(route => {
    return `  <url>
    <loc>${SITE_URL}${route.path}</loc>
    ${route.lastmod ? `<lastmod>${route.lastmod}</lastmod>` : `<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>`}
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  // Write to public/sitemap.xml
  const publicDir = path.resolve(__dirname, '../public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
  console.log(`✅ Sitemap generated at ${path.join(publicDir, 'sitemap.xml')} with ${routes.length} URLs.`);
}

generateSitemap();
