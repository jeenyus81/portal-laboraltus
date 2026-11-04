import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const apiProxy = {
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
      includeAssets: ['favicon.svg', 'laboraltus-mark.png'],
      manifest: {
        name: 'portal-laboraltus',
        short_name: 'LaboralTus',
        description: 'Portal LaboralTus',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#172b45',
        icons: [
          { src: '/laboraltus-pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/laboraltus-pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,ico,png,svg,webmanifest,woff2}'],
        navigateFallbackDenylist: [/^\/api(?:\/|$)/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
    }),
  ],
  server: { host: '0.0.0.0', proxy: apiProxy },
  preview: { host: '0.0.0.0', proxy: apiProxy },
})