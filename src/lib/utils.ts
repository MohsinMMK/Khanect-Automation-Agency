/**
 * Utility function to merge class names
 * Simple implementation that filters falsy values and joins classes
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
