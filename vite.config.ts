import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    host: true
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'logo.png', 'MD Writer logo.png'],
      manifest: {
        name: 'MD Writer — Markdown Editor',
        short_name: 'MD Writer',
        description: 'A clean, fast, and distraction-free Markdown editor and workspace.',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/logo.png',
            sizes: '192x192 512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      injectRegister: null,
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,woff,ttf}'],
        globIgnores: [
          '**/vendor-mermaid*',
          '**/vendor-pdf*',
          '**/vendor-docx*',
          '**/vendor-katex*',
          '**/clipRender.worker*',
          '**/*KaTeX_*',
          '**/*.map'
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: /.*(vendor-(mermaid|pdf|docx|media-encoders|katex)|KaTeX_).*\.(js|woff2|woff|ttf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'heavy-dynamic-chunks',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react/') ||
              id.includes('react-dom/') ||
              id.includes('react-router/') ||
              id.includes('react-router-dom/') ||
              id.includes('scheduler/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('mermaid')) {
              return 'vendor-mermaid';
            }
            if (id.includes('katex')) {
              return 'vendor-katex';
            }
            if (id.includes('@codemirror') || id.includes('codemirror')) {
              return 'vendor-codemirror';
            }
            if (id.includes('mp4-muxer') || id.includes('gifenc')) {
              return 'vendor-media-encoders';
            }
            if (
              id.includes('react-markdown') ||
              id.includes('remark') ||
              id.includes('rehype') ||
              id.includes('micromark') ||
              id.includes('unist') ||
              id.includes('vfile') ||
              id.includes('mdast') ||
              id.includes('hast')
            ) {
              return 'vendor-markdown';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            if (id.includes('dexie')) {
              return 'vendor-dexie';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            if (id.includes('docx')) {
              return 'vendor-docx';
            }
            if (id.includes('html2pdf.js') || id.includes('jspdf') || id.includes('html2canvas')) {
              return 'vendor-pdf';
            }
            if (id.includes('lucide-react') || id.includes('zustand') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-ui';
            }
          }
        }
      }
    }
  }
});
