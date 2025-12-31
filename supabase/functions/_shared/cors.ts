/**
 * Shared CORS and Security headers for Supabase Edge Functions
 * These headers allow the frontend to call edge functions securely
 */

// Allowed origins for CORS - localhost for dev, production domains
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'https://khanect.com',
  'https://www.khanect.com',
];

/**
 * Security headers to protect against common attacks
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 * Get CORS headers based on the request origin
 * Only allows requests from whitelisted origins
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is in allowed list
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]; // Default to first allowed origin

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    ...securityHeaders,
  };
}

/**
 * Legacy corsHeaders export for backwards compatibility
 * @deprecated Use getCorsHeaders(origin) instead for proper origin validation
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  ...securityHeaders,
};

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    return new Response('ok', { headers: getCorsHeaders(origin) });
  }
  return null;
}

/**
 * Create a JSON response with CORS and security headers
 */
export function jsonResponse(data: unknown, status = 200, req?: Request): Response {
  const origin = req?.headers.get('origin') ?? null;
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create an error response with CORS and security headers
 */
export function errorResponse(message: string, status = 500, req?: Request): Response {
  return jsonResponse({ error: message }, status, req);
}
