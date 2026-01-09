import { useEffect } from 'react';

const SCRIPT_ID = 'structured-data-json-ld';

/**
 * Hook to inject JSON-LD structured data into the document head.
 * Automatically cleans up on unmount or when schema changes.
 *
 * @param schema - The structured data object(s) to inject
 * @param id - Optional unique identifier for multiple schemas on same page
 */
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
