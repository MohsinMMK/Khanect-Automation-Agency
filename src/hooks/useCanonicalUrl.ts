import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://khanect.com';

/**
 * Hook to dynamically update the canonical URL based on the current route.
 * This helps prevent duplicate content issues in search engines.
 */
export function useCanonicalUrl(): void {
  const location = useLocation();

  useEffect(() => {
    // Construct the canonical URL (without trailing slash except for homepage)
    const path = location.pathname;
    const canonicalUrl = path === '/' ? BASE_URL + '/' : BASE_URL + path;

    // Find existing canonical link or create one
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }

    canonicalLink.href = canonicalUrl;

    // Also update OG URL meta tag for social sharing consistency
    const ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (ogUrl) {
      ogUrl.content = canonicalUrl;
    }

    const twitterUrl = document.querySelector('meta[property="twitter:url"]') as HTMLMetaElement | null;
    if (twitterUrl) {
      twitterUrl.content = canonicalUrl;
    }
  }, [location.pathname]);
}

export default useCanonicalUrl;
