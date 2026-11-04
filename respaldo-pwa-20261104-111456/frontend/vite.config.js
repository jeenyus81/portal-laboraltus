import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Proxy solo para pruebas locales: evita CORS desde Safari/iPad.
// No afecta al backend ni a la configuración de producción.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://portal-laboraltus.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
