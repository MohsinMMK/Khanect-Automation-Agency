import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to trap focus within a container element.
 * Essential for accessibility in modals and menus.
 * @param isActive - Whether focus trap is active
 * @param onEscape - Optional callback when Escape key is pressed
 * @returns ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  isActive: boolean,
  onEscape?: () => void
): RefObject<T> {
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store currently focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement;

    const container = containerRef.current;

    // Get all focusable elements
    const getFocusableElements = () => {
      return container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      // Refresh focusable elements in case DOM changed
      const currentFocusable = getFocusableElements();
      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if on first element, go to last
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, onEscape]);

  return containerRef;
}
