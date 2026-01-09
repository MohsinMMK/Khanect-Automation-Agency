# SEO & Google Indexing Checklist for New Websites

A comprehensive guide for setting up SEO, structured data, and Google indexing for any new website project.

---

## Phase 1: Foundation (Before Launch)

### 1.1 Meta Tags in `index.html`

```html
<head>
  <!-- Primary Meta Tags -->
  <title>Brand Name - Description</title>
  <meta name="title" content="Brand Name - Description" />
  <meta name="description" content="150-160 character description" />
  <meta name="keywords" content="keyword1, keyword2, keyword3" />
  <meta name="author" content="Brand Name" />
  <meta name="robots" content="index, follow" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://yourdomain.com/" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://yourdomain.com/" />
  <meta property="og:title" content="Brand Name - Description" />
  <meta property="og:description" content="Short description" />
  <meta property="og:image" content="https://yourdomain.com/og-image.jpg" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://yourdomain.com/" />
  <meta property="twitter:title" content="Brand Name - Description" />
  <meta property="twitter:description" content="Short description" />
  <meta property="twitter:image" content="https://yourdomain.com/og-image.jpg" />
</head>
```

### 1.2 Create `robots.txt`

Place in `public/robots.txt`:

```txt
# robots.txt
User-agent: *
Allow: /

# Block private/authenticated pages
Disallow: /admin
Disallow: /dashboard
Disallow: /api/

# Sitemap location
Sitemap: https://yourdomain.com/sitemap.xml
```

### 1.3 Create `sitemap.xml`

Place in `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>2026-01-10</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yourdomain.com/about</loc>
    <lastmod>2026-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add all public pages -->
</urlset>
```

**Priority Guidelines:**
- Homepage: `1.0`
- Main pages (pricing, about): `0.9`
- Content pages (services, blog): `0.8`
- Detail pages: `0.7`

### 1.4 Server Redirects

#### Apache (`.htaccess`)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Force HTTPS
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # Redirect www to non-www (pick one as canonical)
  RewriteCond %{HTTP_HOST} ^www\.yourdomain\.com$ [NC]
  RewriteRule ^(.*)$ https://yourdomain.com/$1 [L,R=301]

  # SPA routing (for React/Vue/Angular)
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-XSS-Protection "1; mode=block"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json image/svg+xml
</IfModule>
```

#### Nginx

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

server {
    listen 443 ssl;
    server_name www.yourdomain.com;
    return 301 https://yourdomain.com$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL config here

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Vercel (`vercel.json`)

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "www.yourdomain.com" }],
      "destination": "https://yourdomain.com/$1",
      "permanent": true
    }
  ]
}
```

#### Netlify (`netlify.toml`)

```toml
[[redirects]]
  from = "https://www.yourdomain.com/*"
  to = "https://yourdomain.com/:splat"
  status = 301
  force = true
```

---

## Phase 2: Structured Data (JSON-LD)

### 2.1 Organization Schema (All Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "description": "What your company does",
  "foundingDate": "2024",
  "areaServed": "Worldwide",
  "knowsAbout": ["Topic 1", "Topic 2", "Topic 3"],
  "sameAs": [
    "https://twitter.com/yourhandle",
    "https://linkedin.com/company/yourcompany",
    "https://github.com/yourcompany"
  ]
}
```

### 2.2 WebSite Schema (Homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your Company",
  "url": "https://yourdomain.com",
  "description": "Site description",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://yourdomain.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### 2.3 FAQPage Schema (FAQ Sections)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is your question?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Your detailed answer here."
      }
    },
    {
      "@type": "Question",
      "name": "Another question?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Another answer."
      }
    }
  ]
}
```

### 2.4 Product/Offer Schema (Pricing Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Pro Plan - Your Company",
  "description": "Plan description and target audience",
  "brand": {
    "@type": "Organization",
    "name": "Your Company"
  },
  "offers": {
    "@type": "Offer",
    "price": "99",
    "priceCurrency": "USD",
    "priceValidUntil": "2026-12-31",
    "availability": "https://schema.org/InStock",
    "url": "https://yourdomain.com/pricing"
  }
}
```

### 2.5 Service Schema (Service Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Service Name",
  "description": "What this service does",
  "provider": {
    "@type": "Organization",
    "name": "Your Company",
    "url": "https://yourdomain.com"
  },
  "areaServed": "Worldwide",
  "url": "https://yourdomain.com/services/service-slug"
}
```

### 2.6 BreadcrumbList Schema (All Inner Pages)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://yourdomain.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://yourdomain.com/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Service Name",
      "item": "https://yourdomain.com/services/service-slug"
    }
  ]
}
```

### 2.7 HowTo Schema (Process/Steps Sections)

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Do Something",
  "description": "Step-by-step guide description",
  "totalTime": "PT30M",
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Step 1 Title",
      "text": "Step 1 description"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Step 2 Title",
      "text": "Step 2 description"
    }
  ]
}
```

### 2.8 LocalBusiness Schema (If Physical Location)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Your Company",
  "image": "https://yourdomain.com/logo.png",
  "url": "https://yourdomain.com",
  "telephone": "+1-555-555-5555",
  "email": "contact@yourdomain.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "openingHours": "Mo-Fr 09:00-17:00"
}
```

---

## Phase 3: React/SPA Implementation

### 3.1 Hook: `useStructuredData.ts`

```typescript
import { useEffect } from 'react';

const SCRIPT_ID = 'structured-data-json-ld';

export function useStructuredData(schema: object | object[] | null, id?: string): void {
  useEffect(() => {
    if (!schema) return;

    const scriptId = id ? `${SCRIPT_ID}-${id}` : SCRIPT_ID;

    // Remove existing script if present
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);

    // Append to head
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema, id]);
}

export default useStructuredData;
```

### 3.2 Hook: `useCanonicalUrl.ts`

```typescript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://yourdomain.com';

export function useCanonicalUrl(): void {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const canonicalUrl = path === '/' ? BASE_URL + '/' : BASE_URL + path;

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.href = canonicalUrl;

    // Also update OG URL meta tag
    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (ogUrl) {
      ogUrl.content = canonicalUrl;
    }
  }, [location.pathname]);
}

export default useCanonicalUrl;
```

### 3.3 Utility: `structuredData.ts`

```typescript
const BASE_URL = 'https://yourdomain.com';
const ORG_NAME = 'Your Company';

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Your company description',
    sameAs: []
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

export function combineSchemas(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map((schema) => {
      const { '@context': _, ...rest } = schema as { '@context'?: string };
      return rest;
    })
  };
}
```

### 3.4 Usage in Components

```tsx
// In App.tsx or layout component
import { useCanonicalUrl } from './hooks/useCanonicalUrl';

function App() {
  useCanonicalUrl(); // Updates canonical on every route change
  return <Routes>...</Routes>;
}

// In a page component
import { useStructuredData } from './hooks/useStructuredData';
import { generateOrganizationSchema, generateFAQSchema, combineSchemas } from './utils/structuredData';

function HomePage() {
  useStructuredData(
    combineSchemas(
      generateOrganizationSchema(),
      generateFAQSchema(faqs)
    ),
    'home-page'
  );

  return <div>...</div>;
}
```

---

## Phase 4: Google Search Console Setup

### 4.1 Verify Domain Ownership

1. Go to https://search.google.com/search-console
2. Click **Add property**
3. Enter `https://yourdomain.com`
4. Choose verification method:
   - **HTML file** (recommended) - Upload to site root
   - **DNS TXT record** - Add to domain DNS
   - **Google Analytics** - If already installed
   - **Google Tag Manager** - If already installed

### 4.2 Submit Sitemap

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter `sitemap.xml` in the input field
3. Click **Submit**
4. Wait 24-72 hours for Google to process

### 4.3 Request Indexing for Key Pages

1. Go to **URL Inspection** (top search bar)
2. Enter each important URL:
   - `https://yourdomain.com/`
   - `https://yourdomain.com/pricing`
   - `https://yourdomain.com/about`
3. Click **Request Indexing** for each

### 4.4 Set Preferred Domain (if needed)

If you have both www and non-www:
1. Go to **Settings** → **Property settings**
2. Set your preferred domain version

---

## Phase 5: Testing & Validation

### 5.1 Testing Tools

| Tool | URL | Purpose |
|------|-----|---------|
| Rich Results Test | https://search.google.com/test/rich-results | Validate structured data for rich snippets |
| Schema Validator | https://validator.schema.org | Debug schema.org markup errors |
| PageSpeed Insights | https://pagespeed.web.dev | Performance & Core Web Vitals |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly | Mobile usability |
| SSL Test | https://www.ssllabs.com/ssltest | HTTPS configuration |

### 5.2 Manual Checks

```bash
# Check robots.txt is accessible
curl https://yourdomain.com/robots.txt

# Check sitemap.xml is valid
curl https://yourdomain.com/sitemap.xml

# Check HTTP to HTTPS redirect
curl -I http://yourdomain.com/

# Check www to non-www redirect
curl -I https://www.yourdomain.com/

# Check canonical tag
curl -s https://yourdomain.com/ | grep canonical
```

---

## Phase 6: Pre-Launch Checklist

```
Foundation
□ Meta tags (title, description, keywords) in index.html
□ OG meta tags for social sharing
□ Twitter card meta tags
□ Canonical tag in index.html
□ Dynamic canonical for SPA routes (useCanonicalUrl hook)
□ robots.txt created and accessible
□ sitemap.xml with all public pages
□ Favicon and OG image files

Server Configuration
□ HTTPS enforced (HTTP redirects to HTTPS)
□ www/non-www redirect configured (pick one)
□ SPA routing configured (if applicable)
□ Security headers added
□ Caching headers for static assets
□ Gzip/Brotli compression enabled

Structured Data
□ Organization schema (all pages)
□ WebSite schema (homepage)
□ FAQPage schema (if you have FAQs)
□ Product/Offer schema (if pricing page)
□ Service schema (if service pages)
□ BreadcrumbList schema (inner pages)
□ LocalBusiness schema (if physical location)

Google Search Console
□ Site verified in Search Console
□ Sitemap submitted
□ Key pages requested for indexing
□ No crawl errors in Coverage report

Testing
□ Rich Results Test passed
□ Mobile-friendly test passed
□ PageSpeed score acceptable (>50)
□ All redirects working correctly
□ No broken links (404s)
```

---

## Phase 7: Post-Launch Monitoring

### Weekly (First Month)

- Check **Coverage** report for indexing errors
- Monitor **Discovered pages** count in sitemap
- Review **Core Web Vitals** scores
- Check for any **Manual Actions**

### Monthly (Ongoing)

- Review search performance trends
- Check for new crawl errors
- Update sitemap when adding new pages
- Fix any structured data errors
- Monitor backlinks in **Links** report

### Quarterly

- Audit all structured data for accuracy
- Review and update meta descriptions
- Check competitor SEO strategies
- Update content for freshness signals

---

## Quick Reference: File Structure

```
project/
├── public/
│   ├── robots.txt              # Crawler directives
│   ├── sitemap.xml             # Page listing for Google
│   ├── .htaccess               # Server redirects (Apache)
│   ├── favicon.svg             # Site icon
│   └── og-image.jpg            # Social sharing image (1200x630)
│
├── src/
│   ├── hooks/
│   │   ├── useCanonicalUrl.ts  # Dynamic canonical URLs
│   │   └── useStructuredData.ts # JSON-LD injection
│   │
│   ├── utils/
│   │   └── structuredData.ts   # Schema generator functions
│   │
│   └── components/
│       └── [pages].tsx         # Use hooks in each page
│
└── index.html                  # Meta tags, static canonical
```

---

## Timeline Template

| Day | Task |
|-----|------|
| Day 1 | Set up meta tags, robots.txt, sitemap.xml |
| Day 1 | Configure server redirects (.htaccess) |
| Day 2 | Implement structured data schemas |
| Day 2 | Create useStructuredData and useCanonicalUrl hooks |
| Day 2 | Add schemas to all pages |
| Day 3 | Verify site in Google Search Console |
| Day 3 | Submit sitemap |
| Day 3 | Request indexing for key pages |
| Day 3 | Run all validation tests |
| Day 4-7 | Monitor indexing progress |
| Week 2 | Check coverage report, fix any errors |
| Week 3-4 | Monitor search performance |
| Monthly | Ongoing maintenance and updates |

---

## Common Issues & Fixes

### "URL is not available to Google"
- Verify site ownership in Search Console
- Check robots.txt isn't blocking
- Ensure HTTPS is working
- Try again after 24 hours

### "Discovered pages: 1" in sitemap
- Normal for new sitemaps, wait 24-72 hours
- Ensure all URLs in sitemap return 200 status
- Check for redirect chains

### Structured data not detected
- For SPAs, Google needs to render JavaScript
- Use Rich Results Test (renders JS)
- Ensure JSON-LD is valid JSON

### Duplicate content warning
- Add canonical tags to all pages
- Ensure only one domain version (www or non-www)
- Check for HTTP/HTTPS duplicates

---

*Last updated: January 2026*
*Based on implementation for khanect.com*
