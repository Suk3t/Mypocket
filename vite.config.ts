import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import manifest from './manifest.config'

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        library: resolve(__dirname, 'library.html'),
      },
    },
  },
})
