import { useEffect } from 'react';

/**
 * Hook to manage body overflow (lock/unlock scrolling).
 * Useful for modals, mobile menus, and overlays.
 * @param isLocked - Whether to lock body scroll
 */
export function useBodyOverflow(isLocked: boolean): void {
  useEffect(() => {
    if (isLocked) {
      // Store current overflow value
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);
}
