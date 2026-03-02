import { createClient } from '@supabase/supabase-js';

// Use proxy URL if configured (for regions where Supabase is blocked)
// The proxy URL should point to your Cloudflare Worker
const supabaseProxyUrl = import.meta.env.VITE_SUPABASE_PROXY_URL;
const supabaseDirectUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL - must start with https://
const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.startsWith('https://') && trimmed.length > 10;
};

// Use proxy if configured and valid, otherwise fall back to direct URL
const validProxyUrl = isValidUrl(supabaseProxyUrl) ? supabaseProxyUrl.trim() : null;
const validDirectUrl = isValidUrl(supabaseDirectUrl) ? supabaseDirectUrl.trim() : null;
const supabaseUrl = validProxyUrl || validDirectUrl;

// Debug: Log which URL is being used (check browser console)
console.log('[Supabase Config]', {
  usingProxy: !!validProxyUrl,
  proxyUrl: validProxyUrl ? validProxyUrl.substring(0, 50) + '...' : 'NOT SET',
  directUrl: validDirectUrl ? validDirectUrl.substring(0, 50) + '...' : 'NOT SET',
  finalUrl: supabaseUrl ? supabaseUrl.substring(0, 50) + '...' : 'NOT SET',
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Course features will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://ldgtuzxzjrkloimayyid.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export default supabase;

