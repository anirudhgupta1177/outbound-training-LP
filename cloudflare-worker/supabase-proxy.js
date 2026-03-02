/**
 * Cloudflare Worker - Supabase Proxy
 * 
 * This worker proxies requests to Supabase, allowing users in regions
 * where Supabase is blocked to access the service through Cloudflare's
 * global network.
 * 
 * Deploy this to Cloudflare Workers and update your app to use the
 * Worker URL instead of the direct Supabase URL.
 */

// Your Supabase project URL (without trailing slash)
const SUPABASE_URL = 'https://ldgtuzxzjrkloimayyid.supabase.co';

// CORS headers to allow requests from your domain
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your domain: 'https://theorganicbuzz.com'
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
  'Access-Control-Max-Age': '86400',
};

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    try {
      // Get the URL and replace the worker URL with Supabase URL
      const url = new URL(request.url);
      const supabaseUrl = new URL(SUPABASE_URL);
      
      // Construct the target URL
      const targetUrl = new URL(url.pathname + url.search, supabaseUrl);

      // Clone the request headers
      const headers = new Headers(request.headers);
      
      // Remove headers that might cause issues
      headers.delete('host');
      headers.delete('cf-connecting-ip');
      headers.delete('cf-ipcountry');
      headers.delete('cf-ray');
      headers.delete('cf-visitor');
      
      // Create the proxied request
      const proxyRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: headers,
        body: request.body,
        redirect: 'follow',
      });

      // Fetch from Supabase
      const response = await fetch(proxyRequest);

      // Clone the response and add CORS headers
      const responseHeaders = new Headers(response.headers);
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        responseHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      // Return error response with CORS headers
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...CORS_HEADERS,
        },
      });
    }
  },
};
