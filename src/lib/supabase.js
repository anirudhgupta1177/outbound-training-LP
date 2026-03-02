import { createClient } from '@supabase/supabase-js';

// Use proxy URL if configured (for regions where Supabase is blocked)
// The proxy URL should point to your Cloudflare Worker
const supabaseProxyUrl = import.meta.env.VITE_SUPABASE_PROXY_URL;
const supabaseDirectUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use proxy if configured, otherwise fall back to direct URL
const supabaseUrl = supabaseProxyUrl || supabaseDirectUrl;

// Debug: Log which URL is being used (check browser console)
console.log('[Supabase Config]', {
  usingProxy: !!supabaseProxyUrl,
  proxyUrl: supabaseProxyUrl ? supabaseProxyUrl.substring(0, 50) + '...' : 'NOT SET',
  directUrl: supabaseDirectUrl ? supabaseDirectUrl.substring(0, 50) + '...' : 'NOT SET',
  finalUrl: supabaseUrl ? supabaseUrl.substring(0, 50) + '...' : 'NOT SET',
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Course features will not work.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export default supabase;

