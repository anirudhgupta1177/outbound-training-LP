import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy /api requests to the production Vercel API for local development
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
})
