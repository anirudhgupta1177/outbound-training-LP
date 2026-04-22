import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Local-dev plugin: routes /api/chat and /api/leads to the Vercel-style
// serverless handlers in ./api/ instead of proxying them to production.
// Every other /api/* call keeps its existing proxy behavior.
function chatbotDevApiPlugin() {
  const routes = {
    '/api/chat': './api/chat.js',
    '/api/leads': './api/leads.js',
  };

  return {
    name: 'chatbot-dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = (req.url || '').split('?')[0];
        const handlerPath = routes[url];
        if (!handlerPath) return next();

        try {
          const mod = await server.ssrLoadModule(handlerPath);
          const handler = mod.default;

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
