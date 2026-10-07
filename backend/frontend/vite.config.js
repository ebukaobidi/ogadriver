import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: null,
      workbox: {
        navigateFallbackDenylist: [/^\/admin/, /^\/api/],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        // Force service worker update on every build
        runtimeCaching: [
          {
            urlPattern: /\/api\/jobs\/.*\/complete/,
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'job-completion-queue',
                options: {
                  maxRetentionTime: 24 * 60 // Retry for max 24 Hours
                }
              }
            }
          },
          {
            urlPattern: /^https?:\/\/.*\/.*(?:\.html|\/)?$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-pages',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          },
          {
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|ico|woff2?)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60 // 24 hours
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'OgaDriver',
        short_name: 'OgaDriver',
        description: 'Professional Driver Services',
        theme_color: '#020617',
        background_color: '#020617',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'en',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/ogadriver.ng/public/index.php',
        changeOrigin: true,
        secure: false,
      },
      '/sanctum': {
        target: 'http://localhost/ogadriver.ng/public/index.php',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'http://localhost/ogadriver.ng',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __APP_NAME__: JSON.stringify('OgaDriver'),
    __APP_TITLE__: JSON.stringify('OgaDriver - Professional Driver Services'),
  },
})
