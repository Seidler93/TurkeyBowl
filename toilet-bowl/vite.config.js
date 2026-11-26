import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    // Update activation is automatic in src/pwa.js, but waits for open forms to close.
    registerType: 'prompt',
    injectRegister: false,
    includeAssets: ['apple-touch-icon.png', 'tb3.png'],
    manifest: {
      id: '/',
      name: 'Toilet Bowl',
      short_name: 'Toilet Bowl',
      description: 'Toilet Bowl game details, RSVPs, photos, and The Record Book.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#111111',
      theme_color: '#111111',
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      navigateFallback: '/index.html',
      globPatterns: ['**/*.{js,css,html,svg,ico}', 'pwa-*.png', 'apple-touch-icon.png', 'tb3.png', 'pregame-dinner.jpg', 'shop-pics-2027-v2.jpg', 'shop-beets-2027-v2.png'],
    },
  })],
})
