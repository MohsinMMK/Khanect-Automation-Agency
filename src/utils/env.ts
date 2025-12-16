export const getEnv = (key: string): string | undefined => {
  // Check process.env (Node.js / defined by bundler)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  // Check import.meta.env (Vite / ESM)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {}
  
  return undefined;
};

export const getApiKey = (): string => {
    // Check for API_KEY or VITE_API_KEY
    const key = getEnv('API_KEY') || getEnv('VITE_API_KEY');

    if (!key) {
        console.warn('⚠️ Missing API key (API_KEY or VITE_API_KEY). AI features will not work properly.');
    }

    return key || '';
};