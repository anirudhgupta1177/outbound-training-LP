import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local-dev plugin: routes selected endpoints to the Vercel-style serverless
// handlers in ./api/ instead of proxying them to production. Every other
// /api/* call keeps its existing proxy behavior.
function chatbotDevApiPlugin() {
  const routes = {
    '/api/chat': './api/chat.js',
    '/api/leads': './api/leads.js',
  };

  // Everything below needs a service-role key to talk to Supabase. Without one
  // the local handler would only ever return "Supabase not configured", so we
  // leave the route unregistered and let it proxy to production instead.
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (hasServiceKey) {
    routes['/api/offers'] = './api/offers.js';
  }

  // Admin endpoints normally proxy to production. Set ADMIN_EMAIL/ADMIN_PASSWORD
  // in .env.local to run the whole admin API locally instead — tokens minted by
  // the local /api/admin-auth are signed with the local JWT_SECRET, which
  // production would reject, so the two halves have to stay together.
  const localAdmin = hasServiceKey && !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
  if (localAdmin) {
    routes['/api/admin-auth'] = './api/admin-auth.js';
  }

  const resolveHandler = (url) => {
    if (routes[url]) return routes[url];
    // /api/admin/members -> ./api/admin/members.js (dev only, creds required)
    if (localAdmin && /^\/api\/admin\/[a-z0-9/-]+$/.test(url)) {
      return `.${url}.js`;
    }
    return null;
  };

  return {
    name: 'chatbot-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const [url, search] = (req.url || '').split('?');
        const handlerPath = resolveHandler(url);
        if (!handlerPath) return next();

        try {
          const mod = await server.ssrLoadModule(handlerPath);
          const handler = mod.default;

          // Vercel populates req.query from the query string; Node does not.
          req.query = Object.fromEntries(new URLSearchParams(search || ''));

          // Collect the body (Vite leaves `req` as a raw Node IncomingMessage).
          let raw = '';
          for await (const chunk of req) raw += chunk;
          if (raw) {
            try {
              req.body = JSON.parse(raw);
            } catch {
              req.body = raw;
            }
          }

          // Shim Vercel's `res.status(n).json(obj)` helpers onto the Node res.
          if (typeof res.status !== 'function') {
            res.status = (code) => {
              res.statusCode = code;
              return res;
            };
          }
          if (typeof res.json !== 'function') {
            res.json = (obj) => {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(obj));
              return res;
            };
          }

          await handler(req, res);
        } catch (err) {
          server.config.logger.error(`[chatbot-dev-api] ${url}: ${err.stack || err.message}`);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Dev middleware error' }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env.local into process.env so the serverless handlers can read
  // CLAUDE_VPS_URL / CLAUDE_VPS_API_KEY / CHATBOT_SUPABASE_* in dev.
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of Object.keys(env)) {
    if (process.env[key] === undefined) process.env[key] = env[key];
  }

  return {
  plugins: [react(), tailwindcss(), chatbotDevApiPlugin()],
  server: {
    proxy: {
      // Proxy /api requests to the production Vercel API for local development.
      // The chatbotDevApiPlugin above intercepts /api/chat and /api/leads first,
      // so only the OTHER /api/* paths hit production.
      '/api': {
        target: 'https://www.theorganicbuzz.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  build: {
    // Optimize chunk splitting for faster loading
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React bundle - loaded first
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Animation library - can load after initial render
          'framer-motion': ['framer-motion'],
          // Swiper carousel - only needed for testimonials section
          'swiper': ['swiper'],
          // Supabase - only needed for auth/course pages
          'supabase': ['@supabase/supabase-js'],
        }
      }
    },
    // Use esbuild for minification (default, fast)
    minify: 'esbuild',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600
  },
  // Optimize esbuild settings
  esbuild: {
    drop: ['console', 'debugger'], // Remove console.logs in production
  }
  }
})
