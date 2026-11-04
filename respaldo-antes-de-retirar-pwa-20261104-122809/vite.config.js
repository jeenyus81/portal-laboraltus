import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const localApiProxy = {
  '/api': {
    target: 'https://portal-laboraltus.onrender.com',
    changeOrigin: true,
    secure: true,
  },
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      devOptions: { enabled: false },
      includeAssets: [
        'favicon.svg',
        'laboraltus-pwa-192.png',
        'laboraltus-pwa-512.png',
        'apple-touch-icon.png',
      ],
      manifest: {
        id: '/',
        name: 'portal-laboraltus',
        short_name: 'portal-laboraltus',
        description: 'Portal LaboralTus',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone'],
        orientation: 'any',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
          { src: '/laboraltus-pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/laboraltus-pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/laboraltus-pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico,png,svg,webmanifest,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    proxy: localApiProxy,
  },
  preview: {
    host: '0.0.0.0',
    proxy: localApiProxy,
  },
})
