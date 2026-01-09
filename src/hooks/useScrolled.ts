import { useState, useEffect } from 'react';

/**
 * Hook to detect scroll position with throttled updates using requestAnimationFrame.
 * @param threshold - Scroll position threshold to trigger isScrolled (default: 20)
 * @returns boolean indicating if page has scrolled past threshold
 */
export function useScrolled(threshold = 20): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > threshold);
          ticking = false;
        });
        ticking = true;
      }
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}
