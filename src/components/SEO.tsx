import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  name?: string;
  type?: string;
  image?: string;
  noindex?: boolean;
}

export default function SEO({ 
  title, 
  description, 
  canonical,
  name = 'Khanect AI',
  type = 'website',
  image = 'https://khanect.com/og-image.png',
  noindex = false
}: SEOProps) {
  // Use the canonical URL if provided, otherwise default to a safe value or don't set it (Helmet handles duplicates well)
  // For canonical, we usually want the exact URL.
  // Note: We'll let the parent pass in the full canonical URL, or calculate it.
  
  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={name} />
      {image && <meta property="og:image" content={image} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      {canonical && <meta property="twitter:url" content={canonical} />}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {image && <meta property="twitter:image" content={image} />}
    </Helmet>
  );
}
